import express from 'express';
import { getCollection } from '../models/dbAdapter.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// GET all audit logs (with filters)
router.get('/', authenticate, (req, res) => {
  const { search, action, entityType, user, limit } = req.query;
  let logs = getCollection('auditLogs');

  if (search) {
    const s = search.toLowerCase();
    logs = logs.filter(l =>
      l.details?.toLowerCase().includes(s) ||
      l.performedBy?.toLowerCase().includes(s) ||
      l.entityId?.toLowerCase().includes(s) ||
      l.action?.toLowerCase().includes(s)
    );
  }

  if (action) {
    logs = logs.filter(l => l.action === action);
  }

  if (entityType) {
    logs = logs.filter(l => l.entityType === entityType);
  }

  if (user) {
    logs = logs.filter(l => l.performedBy?.toLowerCase().includes(user.toLowerCase()));
  }

  // Sort chronologically newest first
  logs = [...logs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (limit) {
    logs = logs.slice(0, parseInt(limit, 10));
  }

  res.json(logs);
});

// GET export audit log data (CSV or JSON report - perfect for Viewer / Auditor role)
router.get('/export', authenticate, (req, res) => {
  const { format } = req.query;
  const logs = getCollection('auditLogs');

  if (format === 'csv') {
    const headers = ['Log_ID', 'Timestamp', 'User', 'Role', 'Action', 'Entity_Type', 'Entity_ID', 'Details', 'IP_Address'];
    const rows = logs.map(l => [
      `"${l._id}"`,
      `"${l.timestamp}"`,
      `"${(l.performedBy || '').replace(/"/g, '""')}"`,
      `"${l.performedRole || ''}"`,
      `"${l.action || ''}"`,
      `"${l.entityType || ''}"`,
      `"${l.entityId || ''}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ipAddress || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="LabLedger_Audit_Report.csv"');
    return res.send(csvContent);
  }

  res.json({
    exportDate: new Date().toISOString(),
    totalEntries: logs.length,
    auditedBy: req.user.name,
    logs
  });
});

export default router;
