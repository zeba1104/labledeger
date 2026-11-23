import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { isConnectedToAtlas } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'labledger_db.json');

// Memory cache
let inMemoryData = {
  users: [],
  samples: [],
  storageNodes: [],
  transfers: [],
  experiments: [],
  auditLogs: [],
  settings: {
    idPrefix: 'LAB-',
    sampleTypes: ['Blood', 'Serum', 'Tissue', 'DNA', 'RNA', 'Cell Culture', 'Enzyme', 'Plasma', 'Saliva', 'Urine', 'Proteins'],
    idFormat: 'LAB-YYYY-XXXX',
    currentSequence: 1005
  }
};

export function loadDatabase() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      inMemoryData = JSON.parse(raw);
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error('Error loading database file, keeping memory state:', err.message);
  }
}

export function saveDatabase() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(inMemoryData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err.message);
  }
}

// Background sync to MongoDB Atlas
async function syncToAtlas(collectionName, data) {
  try {
    if (isConnectedToAtlas && mongoose.connection.readyState === 1) {
      const db = mongoose.connection.db;
      if (Array.isArray(data)) {
        await db.collection(collectionName).deleteMany({});
        if (data.length > 0) {
          await db.collection(collectionName).insertMany(data);
        }
      } else if (typeof data === 'object') {
        await db.collection(collectionName).deleteMany({});
        await db.collection(collectionName).insertOne(data);
      }
    }
  } catch (err) {
    console.warn(`Atlas sync notice for ${collectionName}:`, err.message);
  }
}

export function getCollection(collectionName) {
  loadDatabase();
  if (!inMemoryData[collectionName]) {
    inMemoryData[collectionName] = [];
  }
  return inMemoryData[collectionName];
}

export function updateCollection(collectionName, newArray) {
  loadDatabase();
  inMemoryData[collectionName] = newArray;
  saveDatabase();
  syncToAtlas(collectionName, newArray);
}

export function getDbData() {
  loadDatabase();
  return inMemoryData;
}
