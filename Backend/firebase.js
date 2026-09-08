// firebase.js - Resilient database manager with local persistence and automatic cloud sync
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let serviceAccount = { project_id: 'neuro-tech-01' };
if (fs.existsSync(serviceAccountPath)) {
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (e) {}
}
const dbFile = path.join(__dirname, 'local_db.json');

// Default seed data for immediate offline functionality
const defaultStore = {
  authorities: {
    auth_01: {
      id: 'auth_01',
      fullName: 'Dr. Admin Counselor',
      email: 'admin@neurotech.com',
      phone: '9876543210',
      password: 'admin123',
      role: 'authority',
      createdAt: new Date().toISOString()
    }
  },
  users: {
    NT1001: {
      uid: 'NT1001',
      pin: '1234',
      fullName: 'Aarav Sharma',
      email: 'aarav.sharma@college.edu',
      phone: '9123456780',
      age: 20,
      gender: 'Male',
      role: 'user',
      latestRiskLevel: 'LOW',
      latestScore: 28,
      createdAt: new Date().toISOString()
    }
  },
  assessments: {},
  liveData: {},
  sensorHistory: {}
};

// Load persistent local database file so data survives restarts
let memoryStore = defaultStore;
try {
  if (fs.existsSync(dbFile)) {
    const raw = fs.readFileSync(dbFile, 'utf8');
    memoryStore = JSON.parse(raw);
    if (!memoryStore.users) memoryStore.users = defaultStore.users;
    if (!memoryStore.authorities) memoryStore.authorities = defaultStore.authorities;
  } else {
    fs.writeFileSync(dbFile, JSON.stringify(defaultStore, null, 2));
  }
} catch (e) {
  memoryStore = defaultStore;
}

function persistLocal() {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(memoryStore, null, 2));
  } catch (e) {}
}

// Initialize Firebase Admin if credentials are present
if (!admin.apps.length && serviceAccount.private_key) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (e) {}
}

let db = null;
let isFirebaseOnline = false;

const databaseURL = process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`;

// Probes the database URL before attaching the SDK client
function probeFirebase(urlStr) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(urlStr);
      const req = https.request({
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: '/.json?shallow=true',
        method: 'HEAD',
        timeout: 1500
      }, (res) => {
        // Status 200, 401 (auth), 403 (security rules) indicate an active database instance
        if (res.statusCode === 200 || res.statusCode === 401 || res.statusCode === 403) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
      req.on('error', () => resolve(false));
      req.on('timeout', () => { req.destroy(); resolve(false); });
      req.end();
    } catch (e) {
      resolve(false);
    }
  });
}

// Perform safe non-blocking probe on boot
probeFirebase(databaseURL).then((exists) => {
  if (exists) {
    try {
      db = admin.app().database(databaseURL);
      isFirebaseOnline = true;
      console.log('Database: Connected to Firebase Realtime Database (Online)');
    } catch (e) {
      isFirebaseOnline = false;
      console.log('Database: Local Persistent Storage active (local_db.json)');
    }
  } else {
    isFirebaseOnline = false;
    console.log('Database: Local Persistent Storage active (local_db.json)');
  }
});

// Resilient DB helper providing transparent get/set for both local and cloud stores
const dbHelper = {
  // Get data at path
  async get(path) {
    if (isFirebaseOnline && db) {
      try {
        const snap = await Promise.race([
          db.ref(path).once('value'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500))
        ]);
        if (snap && snap.exists()) return snap.val();
      } catch (e) {
        // Fallback to local store
      }
    }
    const parts = path.split('/').filter(Boolean);
    let curr = memoryStore;
    for (const p of parts) {
      if (!curr || typeof curr !== 'object') return null;
      curr = curr[p];
    }
    return curr || null;
  },

  // Set data at path
  async set(path, data) {
    // Save to local cache immediately
    const parts = path.split('/').filter(Boolean);
    let curr = memoryStore;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]]) curr[parts[i]] = {};
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = data;
    persistLocal();

    // Sync with Firebase in background if online
    if (isFirebaseOnline && db) {
      try {
        db.ref(path).set(data).catch(() => {});
      } catch (e) {}
    }
    return true;
  }
};

module.exports = { admin, db, dbHelper };
