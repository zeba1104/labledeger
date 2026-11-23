import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export let isConnectedToAtlas = false;
export let dbMode = 'local'; // 'atlas' or 'local-storage'

export async function connectDB() {
  const uri = process.env.MONGODB_URI || '';
  
  if (uri && !uri.includes('<db_password>') && uri.includes('mongodb')) {
    try {
      console.log('🔄 Attempting connection to MongoDB Atlas...');
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnectedToAtlas = true;
      dbMode = 'atlas';
      console.log('✅ Connected successfully to MongoDB Atlas Cluster!');
      return;
    } catch (err) {
      console.warn('⚠️ MongoDB Atlas connection attempt failed:', err.message);
      console.warn('👉 Switching to resilient local persistent JSON store to maintain full application functionality.');
    }
  } else {
    console.log('ℹ️ MONGODB_URI contains placeholder <db_password> or is not set.');
    console.log('👉 Tip: Update server/.env with your MongoDB Atlas password to connect to the cloud database.');
    console.log('🚀 Running with resilient local persistent storage engine with full CRUD & Audit capabilities.');
  }

  dbMode = 'local-storage';
  const dataDir = path.join(__dirname, '..', '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}
