// firebase.js - Primary Firebase Realtime Database Manager with Offline Emergency Fallback
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
let serviceAccount = { project_id: 'neuro-tech-01' };
if (fs.existsSync(serviceAccountPath)) {
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (e) {}
}

const rawUrl = process.env.FIREBASE_DATABASE_URL || `https://${serviceAccount.project_id}-default-rtdb.firebaseio.com`;
const databaseURL = rawUrl.replace(/\/+$/, '');
const dbFile = path.join(__dirname, 'local_db.json');

// Default seed data used strictly as emergency offline fallback
const defaultStore = {
  authorities: {
    auth_01: {
      id: 'auth_01',
      fullName: 'Dr. Admin Counselor',
      email: 'admin@neurotrack.com',
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

// Emergency offline fallback memory store
let memoryStore = defaultStore;
try {
  if (fs.existsSync(dbFile)) {
    const raw = fs.readFileSync(dbFile, 'utf8');
    memoryStore = JSON.parse(raw);
    if (!memoryStore.users) memoryStore.users = defaultStore.users;
    if (!memoryStore.authorities) memoryStore.authorities = defaultStore.authorities;
  }
} catch (e) {
  memoryStore = defaultStore;
}

function persistLocal() {
  try {
    fs.writeFileSync(dbFile, JSON.stringify(memoryStore, null, 2));
  } catch (e) {}
}

function updateLocalCache(pathStr, data) {
  try {
    const parts = pathStr.split('/').filter(Boolean);
    let curr = memoryStore;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]] || typeof curr[parts[i]] !== 'object') curr[parts[i]] = {};
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = data;
  } catch (e) {}
}

function readLocalCache(pathStr) {
  const parts = pathStr.split('/').filter(Boolean);
  let curr = memoryStore;
  for (const p of parts) {
    if (!curr || typeof curr !== 'object') return null;
    curr = curr[p];
  }
  return curr !== undefined ? curr : null;
}

// Initialize Firebase Admin SDK as PRIMARY database
let db = null;
let isFirebaseOnline = false;

if (serviceAccount.private_key) {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: databaseURL
      });
    }
    db = admin.database();
  } catch (err) {
    console.error('Firebase initialization error:', err.message);
  }
}

// Authenticate and verify live cloud connection on startup
if (db) {
  db.ref('.info/connected').on('value', (snap) => {
    isFirebaseOnline = (snap.val() === true);
  });

  // Verify authenticated read/write against Firebase
  db.ref('users').limitToFirst(1).once('value')
    .then(async (snap) => {
      isFirebaseOnline = true;
      console.log(`Firebase: Connected to Realtime Database (${databaseURL})`);
      console.log('Database: Firebase Realtime Database is PRIMARY (Cloud Connected)');

      // If cloud database is empty, seed initial baseline
      if (!snap.exists() || !snap.val()) {
        try {
          if (memoryStore.authorities) await db.ref('authorities').set(memoryStore.authorities);
          if (memoryStore.users) await db.ref('users').set(memoryStore.users);
          console.log('Firebase: Synced baseline users and authorities to cloud.');
        } catch (syncErr) {}
      }
    })
    .catch((err) => {
      isFirebaseOnline = false;
      console.warn(`[WARNING] Could not reach Firebase Realtime Database (${err.message}).`);
      console.warn('Database: Using Local Storage fallback (worst-case offline only).');
    });
} else {
  console.warn('Database: No Firebase credentials found. Running in offline fallback mode.');
}

// Resilient DB helper prioritizing Firebase as Primary and Local DB strictly as worst-case offline fallback
const dbHelper = {
  // Get data at path (Firebase Primary -> Local Fallback)
  async get(pathStr) {
    if (db && isFirebaseOnline !== false) {
      try {
        const snap = await Promise.race([
          db.ref(pathStr).once('value'),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase timeout')), 3500))
        ]);
        if (snap && snap.exists()) {
          const val = snap.val();
          updateLocalCache(pathStr, val);
          return val;
        }
      } catch (err) {
        // Fall through to local fallback only on network error/timeout
      }
    }
    // Worst-case offline fallback
    return readLocalCache(pathStr);
  },

  // Set data at path (Firebase Primary -> Local Backup)
  async set(pathStr, data) {
    // Primary: Write directly to Firebase
    if (db) {
      try {
        await db.ref(pathStr).set(data);
      } catch (err) {
        console.warn(`[Firebase Write Fallback] ${pathStr}:`, err.message);
      }
    }

    // Keep local cache updated as backup
    updateLocalCache(pathStr, data);
    persistLocal();
    return true;
  }
};

module.exports = {
  admin,
  db,
  get isFirebaseOnline() { return isFirebaseOnline; },
  databaseURL,
  dbHelper
};
