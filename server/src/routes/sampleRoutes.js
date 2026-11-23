import express from 'express';
import QRCode from 'qrcode';
import { getCollection, updateCollection } from '../models/dbAdapter.js';
import { authenticate, authorizeRoles, forbidViewer } from '../middleware/auth.js';
import { generateSampleId } from '../services/sampleIdService.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET all samples (with filters: search, type, status, boxId)
router.get('/', authenticate, (req, res) => {
  const { search, type, status, boxId, limit } = req.query;
  let samples = getCollection('samples');

  if (search) {
    const s = search.toLowerCase();
    samples = samples.filter(item =>
      item.sampleId?.toLowerCase().includes(s) ||
      item.name?.toLowerCase().includes(s) ||
      item.donorId?.toLowerCase().includes(s) ||
      item.type?.toLowerCase().includes(s) ||
      item.storagePath?.toLowerCase().includes(s)
    );
  }

  if (type) {
    samples = samples.filter(item => item.type === type);
  }

  if (status) {
    samples = samples.filter(item => item.status === status);
  }

  if (boxId) {
    samples = samples.filter(item => item.storageLocation?.boxId === boxId);
  }

  // Sort newest first
  samples = [...samples].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (limit) {
    samples = samples.slice(0, parseInt(limit, 10));
  }

  res.json(samples);
});

// GET sample by sampleId (for QR code scanner quick lookup: e.g. /api/samples/by-id/LAB-2026-0001)
router.get('/by-id/:sampleId', authenticate, (req, res) => {
  const targetId = req.params.sampleId.trim().toUpperCase();
  const samples = getCollection('samples');
  const sample = samples.find(s => s.sampleId?.toUpperCase() === targetId);

  if (!sample) {
    return res.status(404).json({ message: `Sample with ID ${targetId} not found in repository.` });
  }

  res.json(sample);
});

// GET single sample with full chain / story:
// identity, location, movements (transfers), experiments, and audit changes!
router.get('/:id', authenticate, (req, res) => {
  const samples = getCollection('samples');
  const sample = samples.find(s => s._id === req.params.id || s.sampleId === req.params.id);

  if (!sample) {
    return res.status(404).json({ message: 'Sample record not found.' });
  }

  // Related transfers
  const transfers = getCollection('transfers')
    .filter(t => t.sampleId === sample.sampleId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Related experiment notes
  const experiments = getCollection('experiments')
    .filter(e => e.sampleIds && e.sampleIds.includes(sample.sampleId))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Related audit logs
  const auditLogs = getCollection('auditLogs')
    .filter(a => a.entityId === sample.sampleId || a.entityId === sample._id || (a.details && a.details.includes(sample.sampleId)))
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  res.json({
    sample,
    transfers,
    experiments,
    auditLogs
  });
});

// POST create / register sample (Admin, Researcher)
router.post('/', authenticate, forbidViewer, authorizeRoles('Admin', 'Researcher', 'Technician'), async (req, res) => {
  try {
    const {
      name,
      type,
      quantity,
      unit,
      concentration,
      donorId,
      temperatureReq,
      storageLocation, // { roomId, freezerId, shelfId, rackId, boxId, position }
      storagePath,
      notes,
      customSampleId
    } = req.body;

    // Validations
    if (!name || !type || quantity === undefined || !unit) {
      return res.status(400).json({
        message: 'Validation failed: Sample Name, Type, Quantity, and Unit are required.'
      });
    }

    if (Number(quantity) <= 0) {
      return res.status(400).json({
        message: 'Validation failed: Quantity must be a positive number greater than 0.'
      });
    }

    const samples = getCollection('samples');

    // Generate unique Sample ID: e.g. LAB-2026-0001
    const sampleId = customSampleId ? customSampleId.trim().toUpperCase() : generateSampleId();

    // Collision check for ID
    if (samples.some(s => s.sampleId === sampleId)) {
      return res.status(400).json({ message: `Sample ID ${sampleId} already exists in registry.` });
    }

    // Check position collision in the same box
    if (storageLocation?.boxId && storageLocation?.position) {
      const occupied = samples.find(
        s => s.storageLocation?.boxId === storageLocation.boxId &&
             s.storageLocation?.position?.toUpperCase() === storageLocation.position.toUpperCase() &&
             s.status === 'Stored'
      );
      if (occupied) {
        return res.status(400).json({
          message: `Position conflict: Box slot ${storageLocation.position} is already occupied by ${occupied.sampleId} (${occupied.name}).`
        });
      }
    }

    // Generate QR Code data URL containing instant lookup URL / payload
    const qrPayload = JSON.stringify({
      id: sampleId,
      name,
      type,
      loc: storagePath || 'Unassigned',
      pos: storageLocation?.position || 'N/A'
    });

    const qrCodeData = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      width: 320,
      margin: 2,
      color: {
        dark: '#991B1B', // Lab crimson color
        light: '#FFFFFF'
      }
    });

    const newSample = {
      _id: 'SMP-' + Date.now().toString(36).toUpperCase(),
      sampleId,
      name,
      type,
      quantity: Number(quantity),
      unit,
      concentration: concentration || 'N/A',
      donorId: donorId || 'N/A',
      temperatureReq: temperatureReq || '-80°C',
      storageLocation: storageLocation || {},
      storagePath: storagePath || 'Unassigned',
      status: 'Stored',
      notes: notes || '',
      registeredBy: req.user.name,
      registeredRole: req.user.role,
      qrCodeData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    samples.push(newSample);
    updateCollection('samples', samples);

    // Audit Log
    logAudit({
      action: 'CREATE_SAMPLE',
      performedBy: req.user.name,
      performedRole: req.user.role,
      entityType: 'Sample',
      entityId: sampleId,
      details: `${req.user.name} registered sample ${sampleId} (${name}) at ${storagePath || 'Unassigned'}`,
      newData: { sampleId, name, type, quantity, unit, position: storageLocation?.position },
      ip: req.ip
    });

    res.status(201).json({
      message: `Sample ${sampleId} registered successfully`,
      sample: newSample
    });
  } catch (err) {
    console.error('Error creating sample:', err);
    res.status(500).json({ message: 'Internal server error creating sample: ' + err.message });
  }
});

// PUT update sample details or quantity/status
// Roles: Admin, Researcher, Technician (Technician can update quantity and status)
router.put('/:id', authenticate, forbidViewer, authorizeRoles('Admin', 'Researcher', 'Technician'), async (req, res) => {
  const samples = getCollection('samples');
  const index = samples.findIndex(s => s._id === req.params.id || s.sampleId === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Sample not found.' });
  }

  const existing = samples[index];
  const oldData = { ...existing };
  const { name, type, quantity, unit, concentration, donorId, temperatureReq, status, notes, storageLocation, storagePath } = req.body;

  // Technician restrictions: Can update quantity, status, notes, but not change name or type if not allowed
  if (req.user.role === 'Technician') {
    if (quantity !== undefined) existing.quantity = Number(quantity);
    if (status !== undefined) existing.status = status;
    if (notes !== undefined) existing.notes = notes;
  } else {
    // Admin & Researcher
    if (name) existing.name = name;
    if (type) existing.type = type;
    if (quantity !== undefined) existing.quantity = Number(quantity);
    if (unit) existing.unit = unit;
    if (concentration !== undefined) existing.concentration = concentration;
    if (donorId !== undefined) existing.donorId = donorId;
    if (temperatureReq !== undefined) existing.temperatureReq = temperatureReq;
    if (status !== undefined) existing.status = status;
    if (notes !== undefined) existing.notes = notes;
    if (storageLocation) existing.storageLocation = storageLocation;
    if (storagePath) existing.storagePath = storagePath;
  }

  existing.updatedAt = new Date().toISOString();
  samples[index] = existing;
  updateCollection('samples', samples);

  // Formulate clear audit details matching PDF example: "Ravi edited the quantity of sample 0005 on 10 Nov"
  let detailMsg = `${req.user.name} updated sample ${existing.sampleId}`;
  if (oldData.quantity !== existing.quantity) {
    detailMsg = `${req.user.name} edited the quantity of sample ${existing.sampleId} from ${oldData.quantity} to ${existing.quantity} ${existing.unit}`;
  } else if (oldData.status !== existing.status) {
    detailMsg = `${req.user.name} changed status of ${existing.sampleId} to ${existing.status}`;
  }

  logAudit({
    action: 'UPDATE_SAMPLE',
    performedBy: req.user.name,
    performedRole: req.user.role,
    entityType: 'Sample',
    entityId: existing.sampleId,
    details: detailMsg,
    oldData: { quantity: oldData.quantity, status: oldData.status },
    newData: { quantity: existing.quantity, status: existing.status },
    ip: req.ip
  });

  res.json({ message: 'Sample updated successfully', sample: existing });
});

// DELETE sample (Admin only! As per PDF, Technician & Researcher & Viewer cannot delete)
router.delete('/:id', authenticate, authorizeRoles('Admin'), (req, res) => {
  const samples = getCollection('samples');
  const index = samples.findIndex(s => s._id === req.params.id || s.sampleId === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Sample not found.' });
  }

  const removed = samples.splice(index, 1)[0];
  updateCollection('samples', samples);

  logAudit({
    action: 'DELETE_SAMPLE',
    performedBy: req.user.name,
    performedRole: req.user.role,
    entityType: 'Sample',
    entityId: removed.sampleId,
    details: `Admin ${req.user.name} deleted sample ${removed.sampleId} (${removed.name})`,
    oldData: { sampleId: removed.sampleId, name: removed.name },
    ip: req.ip
  });

  res.json({ message: `Sample ${removed.sampleId} deleted permanently.` });
});

export default router;
