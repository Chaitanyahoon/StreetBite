# StreetBite Configuration Setup Guide

## ✅ Code Updates Complete

All configuration values are now read from environment variables - **no hardcoded values in code**.

### Files Updated:
- `frontend/lib/firebase-client.ts` - Reads Firebase config from env vars, registers SW with params
- `frontend/hooks/use-notifications.ts` - Reads VAPID key from env var
- `frontend/public/firebase-messaging-sw.js` - Receives config via URL params during registration
- `frontend/.env.example` - Updated with VAPID key template

---

## 📝 Manual Setup Required

The following files are gitignored for security. Create them manually.

---

### 1. Frontend Environment Variables

**Create file:** `frontend/.env.local`

Copy from `frontend/.env.example` and fill in your values:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>
NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-project>.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-app-id>
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=<your-measurement-id>
NEXT_PUBLIC_FIREBASE_VAPID_KEY=<your-vapid-key>
NEXT_PUBLIC_BACKEND_URL=http://localhost:8081/api
```

---

### 2. Backend Application Properties

**Create file:** `backend/src/main/resources/application.properties`

Copy from `application.properties.example` and fill in your values:

```properties
# Key configurations to update:
google.geocoding.api.key=<your-google-maps-api-key>
spring.datasource.username=<your-db-username>
spring.datasource.password=<your-db-password>
```

---

### 3. Firebase Service Account Key (for Backend)

**Create file:** `backend/firebase-key.json`

Download from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key

---

## 🔐 Security Notes

- All sensitive values are stored in gitignored files (`.env.local`, `application.properties`)
- Service worker receives Firebase config at runtime via URL parameters
- Never commit actual API keys or passwords to version control
