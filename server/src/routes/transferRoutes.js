import express from 'express';
import { getCollection, updateCollection } from '../models/dbAdapter.js';
import { authenticate, authorizeRoles, forbidViewer } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET all transfers
router.get('/', authenticate, (req, res) => {
  const { sampleId, status } = req.query;
  let transfers = getCollection('transfers');

  if (sampleId) {
    transfers = transfers.filter(t => t.sampleId?.toUpperCase() === sampleId.toUpperCase());
  }

  if (status) {
    transfers = transfers.filter(t => t.status === status);
  }

  transfers = [...transfers].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(transfers);
});

// POST record new transfer (Admin, Researcher, Technician)
router.post('/', authenticate, forbidViewer, authorizeRoles('Admin', 'Researcher', 'Technician'), (req, res) => {
  const {
    sampleId,
    targetLocation,
    newStorageLocation, // optional updated { roomId, freezerId, shelfId, rackId, boxId, position }
    newStoragePath,
    reason,
    custodian
  } = req.body;

  if (!sampleId || !targetLocation || !reason) {
    return res.status(400).json({
      message: 'Validation failed: Sample ID, Destination Location, and Transfer Reason are required.'
    });
  }

  const samples = getCollection('samples');
  const sample = samples.find(s => s.sampleId === sampleId || s._id === sampleId);

  if (!sample) {
    return res.status(404).json({ message: `Sample ${sampleId} not found.` });
  }

  // Check collision if moving to a specific box position
  if (newStorageLocation?.boxId && newStorageLocation?.position) {
    const conflict = samples.find(
      s => s._id !== sample._id &&
           s.storageLocation?.boxId === newStorageLocation.boxId &&
           s.storageLocation?.position?.toUpperCase() === newStorageLocation.position.toUpperCase() &&
           s.status === 'Stored'
    );
    if (conflict) {
      return res.status(400).json({
        message: `Destination position ${newStorageLocation.position} is already occupied by ${conflict.sampleId} (${conflict.name}).`
      });
    }
  }

  const sourceLocation = sample.storagePath || 'Previous Location';
  const transfers = getCollection('transfers');

  const newTransfer = {
    _id: 'TRF-' + Date.now().toString(36).toUpperCase(),
    sampleId: sample.sampleId,
    sampleName: sample.name,
    sourceLocation,
    targetLocation: newStoragePath || targetLocation,
    movedBy: req.user.name,
    movedRole: req.user.role,
    custodian: custodian || req.user.name,
    reason,
    date: new Date().toISOString(),
    status: req.user.role === 'Admin' ? 'Completed' : 'Completed', // Can also support 'Pending Approval' if configured
    approvedBy: req.user.role === 'Admin' ? req.user.name : 'Dr. Sarah Chen (Auto-Logged)'
  };

  transfers.unshift(newTransfer);
  updateCollection('transfers', transfers);

  // Update sample's location
  const oldLoc = sample.storagePath;
  if (newStorageLocation) {
    sample.storageLocation = newStorageLocation;
  }
  if (newStoragePath) {
    sample.storagePath = newStoragePath;
  } else {
    sample.storagePath = targetLocation;
  }
  sample.updatedAt = new Date().toISOString();
  updateCollection('samples', samples);

  // Format exact audit string as per PDF example:
  // "Sample 0001 moved from Freezer 1 to Freezer 2 by Anita on 5 Nov, reason: experiment"
  const humanDetail = `Sample ${sample.sampleId} moved from ${sourceLocation} to ${newTransfer.targetLocation} by ${req.user.name}, reason: ${reason}`;

  logAudit({
    action: 'TRANSFER_SAMPLE',
    performedBy: req.user.name,
    performedRole: req.user.role,
    entityType: 'Transfer',
    entityId: newTransfer._id,
    details: humanDetail,
    oldData: { location: oldLoc },
    newData: { location: sample.storagePath, custodian: newTransfer.custodian },
    ip: req.ip
  });

  res.status(201).json({
    message: 'Transfer logged successfully and sample location updated.',
    transfer: newTransfer,
    updatedSample: sample
  });
});

// PUT approve transfer (Admin only)
router.put('/:id/approve', authenticate, authorizeRoles('Admin'), (req, res) => {
  const transfers = getCollection('transfers');
  const transfer = transfers.find(t => t._id === req.params.id);

  if (!transfer) {
    return res.status(404).json({ message: 'Transfer record not found.' });
  }

  transfer.status = 'Completed';
  transfer.approvedBy = req.user.name;
  updateCollection('transfers', transfers);

  logAudit({
    action: 'APPROVE_TRANSFER',
    performedBy: req.user.name,
    performedRole: req.user.role,
    entityType: 'Transfer',
    entityId: transfer._id,
    details: `Admin ${req.user.name} approved transfer ${transfer._id} for sample ${transfer.sampleId}`,
    ip: req.ip
  });

  res.json({ message: 'Transfer approved', transfer });
});

export default router;
