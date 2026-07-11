const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

const credentialsPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!credentialsPath) {
  console.error('[firebase] FIREBASE_SERVICE_ACCOUNT_PATH not set in .env');
  process.exit(1);
}

if (admin.getApps().length === 0) {
  const resolvedPath = path.resolve(__dirname, '..', '..', credentialsPath);
  let serviceAccount;
  try {
    serviceAccount = require(resolvedPath);
  } catch (e) {
    console.error(`[firebase] Failed to load service account from ${resolvedPath}:`, e.message);
    process.exit(1);
  }
  admin.initializeApp({
    credential: admin.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log('[firebase] Admin SDK initialized successfully');
}

const db = getFirestore();

module.exports = { db };
