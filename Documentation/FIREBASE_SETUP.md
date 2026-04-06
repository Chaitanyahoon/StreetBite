# Firebase Setup Guide

> [!NOTE]
> MySQL is the primary database.
> Firebase is optional and used only for:
> 1. Firestore realtime mirrors for vendor/menu UI updates
> 2. FCM push notifications

## What Firebase Does In StreetBite

- Backend writes normal application data to MySQL first.
- The backend may then mirror selected live state into Firestore:
  - `live_vendors`
  - `live_menu_items`
- The frontend listens to those Firestore collections for realtime updates.
- Firebase is not used as the source of truth for vendors, menu items, auth, or users.

Relevant app files:
- `backend/src/main/java/com/streetbite/service/RealTimeSyncService.java`
- `frontend/lib/firebase-client.ts`
- `frontend/lib/realtime.ts`
- `Documentation/DATA_STORAGE_AND_REALTIME.md`

## Frontend Firebase Configuration

The frontend uses Firebase web config from environment variables. These values are public client config, not service account secrets.

Typical frontend variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_VAPID_KEY=
```

The frontend Firebase entry points are:
- `frontend/lib/firebase-client.ts`
- `frontend/lib/realtime.ts`

If these values are missing, the app should still work for normal API-backed flows, but realtime listeners and push notifications will be unavailable.

## Backend Service Account Setup

The backend uses Firebase Admin SDK only when you want Firestore mirror writes or FCM notifications.

### Step 1: Create a Service Account Key

1. Open [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Go to Project Settings.
4. Open the Service Accounts tab.
5. Generate a new private key.
6. Store the downloaded JSON file outside the repo.

Example safe local path:

```powershell
C:\Users\patil\secrets\streetbite-firebase-admin.json
```

### Step 2: Expose the Credentials Path

Set `GOOGLE_APPLICATION_CREDENTIALS` to the absolute path of the JSON file.

PowerShell:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\patil\secrets\streetbite-firebase-admin.json"
```

Permanent user-level PowerShell:

```powershell
[System.Environment]::SetEnvironmentVariable('GOOGLE_APPLICATION_CREDENTIALS', 'C:\Users\patil\secrets\streetbite-firebase-admin.json', 'User')
```

The backend reads:

```env
GOOGLE_APPLICATION_CREDENTIALS=./firebase-key.json
```

from `application.properties`, but in production you should provide the real path through the environment instead of committing or copying secrets into the repo.

## Optional Google Geocoding Setup

Geocoding is separate from Firebase, but often configured at the same time for vendor address/location flows.

Required variable:

```env
GOOGLE_GEOCODING_API_KEY=
```

The backend reads `GOOGLE_GEOCODING_API_KEY` directly from the environment.

## Local Verification

1. Start the backend.
2. Create or update a vendor or menu item.
3. Confirm MySQL remains the authoritative store.
4. Confirm Firestore documents appear in:
   - `live_vendors`
   - `live_menu_items`
5. Open the frontend and verify realtime updates are reflected without a full refresh.

## Security Notes

- Never commit the Firebase service account JSON.
- Never treat Firestore documents as authoritative business data.
- Rotate keys if a service account key is exposed.
- Keep Firebase optional in production if you only need core CRUD flows.

## Troubleshooting

### Backend starts without Firebase features

Check:
- `GOOGLE_APPLICATION_CREDENTIALS` points to a real file
- the service account belongs to the correct Firebase project
- Firestore is enabled for that project

### Frontend does not receive realtime updates

Check:
- `NEXT_PUBLIC_FIREBASE_*` variables are set in Vercel
- the frontend is building with the expected Firebase project
- Firestore has `live_vendors` / `live_menu_items` documents
- backend writes are reaching `RealTimeSyncService`

### Push notifications do not work

Check:
- FCM web config is present
- `NEXT_PUBLIC_FIREBASE_VAPID_KEY` is set
- browser notification permission is granted

## References

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
