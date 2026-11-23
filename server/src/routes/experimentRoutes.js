import express from 'express';
import { getCollection, updateCollection } from '../models/dbAdapter.js';
import { authenticate, authorizeRoles, forbidViewer } from '../middleware/auth.js';
import { logAudit } from '../services/auditService.js';

const router = express.Router();

// GET all experiment notes
router.get('/', authenticate, (req, res) => {
  const { sampleId, search, status } = req.query;
  let experiments = getCollection('experiments');

  if (sampleId) {
    experiments = experiments.filter(e => e.sampleIds && e.sampleIds.includes(sampleId.toUpperCase()));
  }

  if (search) {
    const s = search.toLowerCase();
    experiments = experiments.filter(e =>
      e.title?.toLowerCase().includes(s) ||
      e.protocolName?.toLowerCase().includes(s) ||
      e.notes?.toLowerCase().includes(s) ||
      e.results?.toLowerCase().includes(s) ||
      e.author?.toLowerCase().includes(s)
    );
  }

  if (status) {
    experiments = experiments.filter(e => e.status === status);
  }

  experiments = [...experiments].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(experiments);
});

// GET single experiment note
router.get('/:id', authenticate, (req, res) => {
  const experiments = getCollection('experiments');
  const experiment = experiments.find(e => e._id === req.params.id);

  if (!experiment) {
    return res.status(404).json({ message: 'Experiment note not found.' });
  }

  // Also fetch details of linked samples
  const samples = getCollection('samples');
  const linkedSamples = samples.filter(s => experiment.sampleIds?.includes(s.sampleId));

  res.json({ experiment, linkedSamples });
});

// POST create experiment note (Admin, Researcher)
router.post('/', authenticate, forbidViewer, authorizeRoles('Admin', 'Researcher'), (req, res) => {
  const { title, protocolName, sampleIds, samplesUsed, notes, results, tags, status, date } = req.body;

  if (!title || !notes) {
    return res.status(400).json({ message: 'Experiment Title and Notes/Procedure are required.' });
  }

  const experiments = getCollection('experiments');
  const samples = getCollection('samples');

  // Verify and sanitize linked sampleIds
  const cleanSampleIds = (sampleIds || []).map(id => id.trim().toUpperCase());
  const foundSamples = samples.filter(s => cleanSampleIds.includes(s.sampleId));

  const newExperiment = {
    _id: 'EXP-' + Date.now().toString(36).toUpperCase(),
    title,
    protocolName: protocolName || 'General Laboratory Protocol',
    author: req.user.name,
    authorRole: req.user.role,
    date: date || new Date().toISOString().split('T')[0],
    sampleIds: cleanSampleIds,
    samplesUsed: samplesUsed || foundSamples.map(s => ({
      sampleId: s.sampleId,
      name: s.name,
      amountUsed: 'Standard aliquot'
    })),
    notes,
    results: results || 'Pending final analysis',
    tags: tags || ['Molecular Biology'],
    status: status || 'Completed',
    createdAt: new Date().toISOString()
  };

  experiments.unshift(newExperiment);
  updateCollection('experiments', experiments);

  // Exact PDF style example: "Anita logged experiment note: Used samples 0001 and 0002 for PCR test, results attached"
  const sampleSummary = cleanSampleIds.length > 0 ? ` linked to samples ${cleanSampleIds.join(', ')}` : '';
  const detail = `${req.user.name} recorded experiment note: "${title}"${sampleSummary}`;

  logAudit({
    action: 'CREATE_NOTE',
    performedBy: req.user.name,
    performedRole: req.user.role,
    entityType: 'Experiment',
    entityId: newExperiment._id,
    details: detail,
    newData: { title, sampleIds: cleanSampleIds },
    ip: req.ip
  });

  res.status(201).json({
    message: 'Experiment note recorded and linked to samples successfully.',
    experiment: newExperiment
  });
});

// PUT edit experiment note (Admin, or author Researcher)
// PDF: Technician "Cannot edit others' experiment notes", Viewer cannot edit anything
router.put('/:id', authenticate, forbidViewer, (req, res) => {
  const experiments = getCollection('experiments');
  const index = experiments.findIndex(e => e._id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Experiment note not found.' });
  }

  const existing = experiments[index];

  // Authorization check
  if (req.user.role !== 'Admin' && existing.author !== req.user.name) {
    return res.status(403).json({
      message: 'Access denied: You can only edit experiment notes that you authored.'
    });
  }

  const { title, protocolName, sampleIds, samplesUsed, notes, results, tags, status, date } = req.body;

  if (title) existing.title = title;
  if (protocolName) existing.protocolName = protocolName;
  if (sampleIds) existing.sampleIds = sampleIds.map(id => id.trim().toUpperCase());
  if (samplesUsed) existing.samplesUsed = samplesUsed;
  if (notes) existing.notes = notes;
  if (results !== undefined) existing.results = results;
  if (tags) existing.tags = tags;
  if (status) existing.status = status;
  if (date) existing.date = date;
  existing.updatedAt = new Date().toISOString();

  experiments[index] = existing;
  updateCollection('experiments', experiments);

  logAudit({
    action: 'UPDATE_NOTE',
    performedBy: req.user.name,
    performedRole: req.user.role,
    entityType: 'Experiment',
    entityId: existing._id,
    details: `${req.user.name} modified experiment note "${existing.title}"`,
    ip: req.ip
  });

  res.json({ message: 'Experiment note updated successfully', experiment: existing });
});

// DELETE experiment note (Admin only)
router.delete('/:id', authenticate, authorizeRoles('Admin'), (req, res) => {
  const experiments = getCollection('experiments');
  const index = experiments.findIndex(e => e._id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Experiment note not found.' });
  }

  const removed = experiments.splice(index, 1)[0];
  updateCollection('experiments', experiments);

  logAudit({
    action: 'DELETE_NOTE',
    performedBy: req.user.name,
    performedRole: req.user.role,
    entityType: 'Experiment',
    entityId: removed._id,
    details: `Admin ${req.user.name} deleted experiment note "${removed.title}"`,
    ip: req.ip
  });

  res.json({ message: 'Experiment note deleted.' });
});

export default router;
