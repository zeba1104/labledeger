import express from 'express';
import { getCollection, updateCollection } from '../models/dbAdapter.js';
import { authenticate, authorizeRoles, forbidViewer } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET full storage tree hierarchy (Rooms -> Freezers -> Shelves -> Racks -> Boxes)
router.get('/tree', authenticate, (req, res) => {
  const nodes = getCollection('storageNodes');
  const samples = getCollection('samples');

  // Helper to build hierarchy
  const buildTree = (parentId = null) => {
    return nodes
      .filter(n => n.parentId === parentId)
      .map(node => {
        const children = buildTree(node._id);
        // Calculate sample count in this branch
        let sampleCount = 0;
        if (node.type === 'box') {
          sampleCount = samples.filter(s => s.storageLocation?.boxId === node._id && s.status === 'Stored').length;
        } else {
          sampleCount = children.reduce((sum, c) => sum + (c.sampleCount || 0), 0);
        }
        return {
          ...node,
          sampleCount,
          children
        };
      });
  };

  const tree = buildTree(null);
  res.json({ tree, allNodes: nodes });
});

// GET box grid view with position matrix (A1 to I9 or A1 to H12)
router.get('/box/:boxId', authenticate, (req, res) => {
  const nodes = getCollection('storageNodes');
  const box = nodes.find(n => n._id === req.params.boxId);

  if (!box) {
    return res.status(404).json({ message: 'Storage box not found.' });
  }

  const samples = getCollection('samples');
  const boxSamples = samples.filter(s => s.storageLocation?.boxId === box._id && s.status === 'Stored');

  // Matrix generation: default 9x9 (Rows A..I, Cols 1..9)
  const rows = box.gridRows || 9;
  const cols = box.gridCols || 9;
  const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].slice(0, rows);

  const grid = [];
  for (let r = 0; r < rows; r++) {
    const rowName = rowLetters[r];
    const cells = [];
    for (let c = 1; c <= cols; c++) {
      const pos = `${rowName}${c}`;
      const sample = boxSamples.find(s => s.storageLocation?.position?.toUpperCase() === pos.toUpperCase());
      cells.push({
        position: pos,
        isOccupied: !!sample,
        sample: sample ? {
          _id: sample._id,
          sampleId: sample.sampleId,
          name: sample.name,
          type: sample.type,
          quantity: sample.quantity,
          unit: sample.unit,
          registeredBy: sample.registeredBy,
          createdAt: sample.createdAt
        } : null
      });
    }
    grid.push({ rowName, cells });
  }

  res.json({
    box,
    dimensions: { rows, cols, totalSlots: rows * cols, occupiedSlots: boxSamples.length },
    grid,
    samples: boxSamples
  });
});

// POST create storage node (Admin only: Lab owner / PI builds the storage structure)
router.post('/nodes', authenticate, forbidViewer, authorizeRoles('Admin'), (req, res) => {
  const { name, type, parentId, temperature, notes, gridRows, gridCols } = req.body;

  if (!name || !type) {
    return res.status(400).json({ message: 'Name and Type are required for storage element.' });
  }

  const validTypes = ['room', 'freezer', 'shelf', 'rack', 'box'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: 'Invalid storage node type.' });
  }

  const nodes = getCollection('storageNodes');
  let pathStr = name;

  if (parentId) {
    const parent = nodes.find(n => n._id === parentId);
    if (parent) {
      pathStr = `${parent.path || parent.name} > ${name}`;
    }
  }

  const prefixMap = { room: 'ROOM', freezer: 'FRZ', shelf: 'SHLF', rack: 'RCK', box: 'BOX' };
  const newNode = {
    _id: `${prefixMap[type] || 'NODE'}-${Date.now().toString(36).toUpperCase()}`,
    name,
    type,
    parentId: parentId || null,
    temperature: temperature || 'Room Temp',
    notes: notes || '',
    path: pathStr,
    gridRows: type === 'box' ? (Number(gridRows) || 9) : undefined,
    gridCols: type === 'box' ? (Number(gridCols) || 9) : undefined,
    capacity: type === 'box' ? (Number(gridRows || 9) * Number(gridCols || 9)) : undefined,
    createdAt: new Date().toISOString()
  };

  nodes.push(newNode);
  updateCollection('storageNodes', nodes);

  logAudit({
    action: 'CREATE_STORAGE_NODE',
    performedBy: req.user.name,
    performedRole: req.user.role,
    entityType: 'StorageNode',
    entityId: newNode._id,
    details: `${req.user.name} created new ${type}: ${name} (${newNode.path})`,
    newData: newNode,
    ip: req.ip
  });

  res.status(201).json({ message: 'Storage node created successfully', node: newNode });
});

// DELETE storage node (Admin only)
router.delete('/nodes/:id', authenticate, forbidViewer, authorizeRoles('Admin'), (req, res) => {
  const nodes = getCollection('storageNodes');
  const samples = getCollection('samples');

  // Check if box has active samples
  const hasSamples = samples.some(s => s.storageLocation?.boxId === req.params.id && s.status === 'Stored');
  if (hasSamples) {
    return res.status(400).json({
      message: 'Cannot delete storage box while active samples are stored inside. Move samples first.'
    });
  }

  // Check if node has children
  const hasChildren = nodes.some(n => n.parentId === req.params.id);
  if (hasChildren) {
    return res.status(400).json({
      message: 'Cannot delete node that contains child storage elements. Remove inner elements first.'
    });
  }

  const index = nodes.findIndex(n => n._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Storage node not found.' });
  }

  const removed = nodes.splice(index, 1)[0];
  updateCollection('storageNodes', nodes);

  logAudit({
    action: 'DELETE_STORAGE_NODE',
    performedBy: req.user.name,
    performedRole: req.user.role,
    entityType: 'StorageNode',
    entityId: removed._id,
    details: `${req.user.name} removed storage node ${removed.name} (${removed.type})`,
    ip: req.ip
  });

  res.json({ message: 'Storage node removed successfully' });
});

export default router;
