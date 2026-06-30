let db;

const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (credentialsPath) {
  try {
    const admin = require('firebase-admin');
    const { getFirestore } = require('firebase-admin/firestore');
    if (admin.getApps().length === 0) {
      const serviceAccountPath = require('path').resolve(__dirname, '..', '..', credentialsPath);
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
    db = getFirestore();
    console.log('[firebase] Using Admin SDK');
  } catch (e) {
    console.log('[firebase] Admin SDK init failed, falling back to Client SDK:', e.message);
  }
}

if (!db) {
  const { initializeApp } = require('firebase/app');
  const { getFirestore } = require('firebase/firestore');

  const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  };

  const firebase = initializeApp(firebaseConfig);
  db = getFirestore(firebase);
  console.log('[firebase] Using Client SDK');
}

module.exports = { db };
