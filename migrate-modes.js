/**
 * Migration: Change SEMI_AUTO/FULL_AUTO modes to new AUTO/MANUAL system.
 * 
 * New modes:
 *   AUTO   - Automatically assigns tables to booked customers, AI chat can create bookings
 *   MANUAL - No automatic table assignment, AI chat can answer questions but cannot create bookings
 * 
 * All existing SEMI_AUTO and FULL_AUTO restaurants are changed to AUTO.
 * 
 * Usage: node migrate-modes.js
 * Requires: FIREBASE_SERVICE_ACCOUNT_PATH env var pointing to service account JSON.
 */

const admin = require('firebase-admin');

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
  console.error('Error: FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set.');
  console.error('Usage: FIREBASE_SERVICE_ACCOUNT_PATH=./serviceAccount.json node migrate-modes.js');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function migrate() {
  const snapshot = await db.collection('restaurants').get();
  
  let updated = 0;
  let skipped = 0;
  
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const currentMode = data.mode;
    
    if (currentMode === 'AUTO' || currentMode === 'MANUAL') {
      skipped++;
      continue;
    }
    
    // SEMI_AUTO, FULL_AUTO, or any other value -> AUTO
    await doc.ref.update({
      mode: 'AUTO',
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`Updated "${data.name}" (${doc.id}): ${currentMode} -> AUTO`);
    updated++;
  }
  
  console.log(`\nMigration complete: ${updated} updated, ${skipped} already correct.`);
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
