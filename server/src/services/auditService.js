import { getCollection, updateCollection } from '../models/dbAdapter.js';

export function logAudit({ action, performedBy, performedRole, entityType, entityId, details, oldData = null, newData = null, ip = '127.0.0.1' }) {
  const auditLogs = getCollection('auditLogs');
  
  const entry = {
    _id: 'AUD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    action, // CREATE, UPDATE, MOVE, DELETE, APPROVE, EXPORT, LOGIN
    performedBy: performedBy || 'System',
    performedRole: performedRole || 'System',
    entityType, // Sample, StorageNode, Transfer, Experiment, User, Settings
    entityId: entityId || '',
    details, // Human-readable log string: "Ravi edited the quantity of sample 0005 on 10 Nov"
    changes: oldData && newData ? { old: oldData, new: newData } : null,
    timestamp: new Date().toISOString(),
    ipAddress: ip
  };

  auditLogs.unshift(entry); // Most recent first
  updateCollection('auditLogs', auditLogs);
  return entry;
}
