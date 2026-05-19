# Firebase Setup Guide for Yori Web App

## Prerequisites
- Google Account
- Node.js 18+

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `yori-web-app`
4. Disable Google Analytics if prompted (optional)
5. Click **Create project**
6. Wait for project to be created

---

## Step 2: Enable Firestore Database

1. In Firebase Console, go to **Build → Firestore Database** (left sidebar)
2. Click **Create database**
3. Choose **Start in test mode**
   - This allows read/write access for 30 days without authentication
4. Select a location (choose closest to your users):
   - `europe-west1` (Europe)
   - `us-central` (US)
   - etc.
5. Click **Done**

---

## Step 3: Get Firebase Configuration

1. Click the **gear icon** (Project Settings) in top left
2. Scroll down to **Your apps** section
3. Click **Web** icon (`</>`)
4. Register app:
   - Nickname: `yori-client`
   - Don't check "Also set up Firebase Hosting"
5. Click **Register app**
6. Copy the config object shown:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "yori-web-app.firebaseapp.com",
  projectId: "yori-web-app",
  storageBucket: "yori-web-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 4: Configure Server

1. Open `server/.env.example`
2. Replace the placeholder values with your Firebase config:

```
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=yori-web-app.firebaseapp.com
FIREBASE_PROJECT_ID=yori-web-app
FIREBASE_STORAGE_BUCKET=yori-web-app.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

3. Rename `.env.example` to `.env`:
   ```bash
   cd server
   mv .env.example .env
   ```

---

## Step 5: Update Firestore Rules (For Development)

For development, you can use test mode. For production, update rules:

1. Go to **Firestore → Rules** in Firebase Console
2. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Note:** For development without auth, keep test mode or use:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

## Step 6: Test Connection

Start the server:
```bash
cd server
npm run dev
```

You should see: `Server running on port 3001`

---

## Troubleshooting

### "Missing or insufficient permissions"
- Check Firestore rules allow your operations
- Verify `.env` file has correct credentials

### "Firebase App named '[DEFAULT]' already exists"
- This is fine for development
- Firebase SDK only initializes once

### "Failed to fetch" errors
- Check CORS is enabled (server uses `cors` package)
- Verify server is running on port 3001

---

## Next Steps

Once Firebase is connected, you can:
1. Create restaurants via the UI
2. Add CRUD for Tables
3. Add CRUD for Bookings
4. Add user authentication

---

## Firestore Collections Structure

| Collection | Purpose |
|------------|---------|
| `restaurants` | Restaurant configurations |
| `tables` | Table definitions per restaurant |
| `bookings` | Reservation records |
| `orders` | Order records |
| `menuItems` | Menu items per restaurant |
| `employees` | Staff accounts |
| `customers` | Customer data |
| `clockRecords` | Staff clock in/out |
| `announcements` | Staff announcements |