import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { loadDatabase, getDbData, updateCollection } from './models/dbAdapter.js';
import { getInitialSeedData } from './data/seedData.js';

import authRoutes from './routes/authRoutes.js';
import sampleRoutes from './routes/sampleRoutes.js';
import storageRoutes from './routes/storageRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import experimentRoutes from './routes/experimentRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString().split('T')[1].slice(0, 8)} | ${req.method} ${req.originalUrl}`);
  next();
});

// Seed function to populate rich laboratory data on first run
async function initDatabase() {
  await connectDB();
  loadDatabase();

  const data = getDbData();
  if (!data.users || data.users.length === 0) {
    console.log('🧪 Seeding initial LabLedger research data...');
    const seed = await getInitialSeedData();
    data.users = seed.users;
    data.storageNodes = seed.storageNodes;
    data.samples = seed.samples;
    data.transfers = seed.transfers;
    data.experiments = seed.experiments;
    data.auditLogs = seed.auditLogs;
    data.settings = seed.settings;
    updateCollection('users', data.users);
    console.log('✅ Seed completed: 4 roles, storage hierarchy, specimens, transfer chain & immutable audit logs ready!');
  } else {
    console.log(`📦 Loaded existing registry: ${data.samples?.length || 0} samples, ${data.storageNodes?.length || 0} storage nodes.`);
  }
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/samples', sampleRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/experiments', experimentRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/stats', statsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    app: 'LabLedger API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   🔬 LABLEDGER BACKEND 🔬                     ║
║           Digital Logbook & Research Sample Tracker           ║
╠═══════════════════════════════════════════════════════════════╣
║  • Server running on: http://localhost:${PORT}                  ║
║  • Health check:      http://localhost:${PORT}/api/health       ║
║  • Default Role Credentials:                                  ║
║    - Admin:      admin@labledger.com      / password123       ║
║    - Researcher: researcher@labledger.com / password123       ║
║    - Technician: tech@labledger.com       / password123       ║
║    - Auditor:    auditor@labledger.com    / password123       ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });
}).catch(err => {
  console.error('Fatal initialization error:', err);
});
