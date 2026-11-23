import express from 'express';
import { getCollection, getDbData, updateCollection } from '../models/dbAdapter.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET high level lab dashboard metrics
router.get('/', authenticate, (req, res) => {
  const samples = getCollection('samples');
  const storageNodes = getCollection('storageNodes');
  const transfers = getCollection('transfers');
  const experiments = getCollection('experiments');
  const auditLogs = getCollection('auditLogs');
  const users = getCollection('users');

  // Counts by type
  const typeCounts = {};
  samples.forEach(s => {
    typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;
  });

  // Storage boxes and slots
  const boxes = storageNodes.filter(n => n.type === 'box');
  const totalSlots = boxes.reduce((acc, b) => acc + (b.capacity || (b.gridRows || 9) * (b.gridCols || 9)), 0);
  const storedSamplesCount = samples.filter(s => s.status === 'Stored').length;
  const occupancyRate = totalSlots > 0 ? Math.round((storedSamplesCount / totalSlots) * 100) : 0;

  // Temperature distribution
  const tempDistribution = {};
  samples.forEach(s => {
    const temp = s.temperatureReq || '-80°C';
    tempDistribution[temp] = (tempDistribution[temp] || 0) + 1;
  });

  res.json({
    metrics: {
      totalSamples: samples.length,
      activeStoredSamples: storedSamplesCount,
      totalTransfers: transfers.length,
      totalExperiments: experiments.length,
      totalAuditEntries: auditLogs.length,
      teamMembersCount: users.length,
      storageBoxesCount: boxes.length,
      totalStorageSlots: totalSlots,
      occupancyRate
    },
    typeCounts,
    tempDistribution,
    recentTransfers: transfers.slice(0, 5),
    recentAudit: auditLogs.slice(0, 6)
  });
});

// Settings endpoints
router.get('/settings', authenticate, (req, res) => {
  const dbData = getDbData();
  res.json(dbData.settings || {});
});

router.put('/settings', authenticate, authorizeRoles('Admin'), (req, res) => {
  const dbData = getDbData();
  const { idPrefix, sampleTypes, labName, piName } = req.body;

  if (idPrefix) dbData.settings.idPrefix = idPrefix;
  if (sampleTypes && Array.isArray(sampleTypes)) dbData.settings.sampleTypes = sampleTypes;
  if (labName) dbData.settings.labName = labName;
  if (piName) dbData.settings.piName = piName;

  logAudit({
    action: 'UPDATE_SETTINGS',
    performedBy: req.user.name,
    performedRole: req.user.role,
    entityType: 'Settings',
    entityId: 'SYSTEM',
    details: `Admin ${req.user.name} updated laboratory settings (ID prefix: ${idPrefix || dbData.settings.idPrefix})`,
    newData: dbData.settings,
    ip: req.ip
  });

  res.json({ message: 'Lab settings updated successfully', settings: dbData.settings });
});

export default router;
