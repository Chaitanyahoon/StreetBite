# Firebase Setup Guide (Auxiliary Services)

> [!NOTE]
> **Primary Database is MySQL.** Firebase is used ONLY for:
> 1. Possible Authentication flows (if enabled)
> 2. Push Notifications (FCM)
> 3. Auxiliary Storage (if configured)
>
> If you are just running the app locally for basic testing, you might not need this unless you hit specific features.

## ✅ Frontend Configuration
Your frontend Firebase config is already set up in `final_project/frontend/lib/firebase.ts` with:
- Project ID: `street-bite-v1`
- All necessary configuration values

## 🔐 Enabling Authentication (If Needed)
If you encounter `auth/configuration-not-found` on the frontend:
1. Go to Firebase Console -> Authentication -> Sign-in method.
2. Enable **Email/Password**.
3. This is only required if you are using the client-side Firebase Auth SDK.

## 🔑 Backend Service Account Key Setup

The backend needs a **Service Account Key** for admin operations. Here's how to get it:

### Step 1: Get Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **street-bite-v1**
3. Click the **Settings gear icon** (⚙️) → **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. A JSON file will download (e.g., `street-bite-v1-firebase-adminsdk-xxxxx.json`)
7. **Save this file** in a secure location (e.g., `C:\Users\patil\Downloads\final_project\firebase-key.json`)

### Step 2: Set Environment Variable

**Windows PowerShell:**
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\patil\Downloads\final_project\firebase-key.json"
```

**Windows CMD:**
```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\Users\patil\Downloads\final_project\firebase-key.json
```

**Permanent (PowerShell - User level):**
```powershell
[System.Environment]::SetEnvironmentVariable('GOOGLE_APPLICATION_CREDENTIALS', 'C:\Users\patil\Downloads\final_project\firebase-key.json', 'User')
```

### Step 3: Get Google Maps API Key (Optional but Recommended)

For geocoding features:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **street-bite-v1**
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **API Key**
5. Copy the API key
6. Enable **Geocoding API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Geocoding API"
   - Click **Enable**

**Set the API key:**
```powershell
$env:GOOGLE_GEOCODING_API_KEY="your-api-key-here"
```

Or add to `backend/src/main/resources/application.properties`:
```properties
google.geocoding.api.key=your-api-key-here
```

## 🚀 Quick Start Script

I've created a PowerShell script to help you set these up. See `setup-backend.ps1`

## 📝 Important Notes

1. **Never commit the service account key to Git!**
   - Add `firebase-key.json` to `.gitignore`
   - The key gives full access to your Firebase project

2. **Service Account Key vs Frontend Config:**
   - **Frontend**: Uses the config you provided (for client-side operations)
   - **Backend**: Needs service account key (for admin/server-side operations)

3. **Security:**
   - Keep the service account key file secure
   - Don't share it publicly
   - Rotate keys if compromised

## ✅ Verify Setup

After setting up, test the backend:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

If you see the Spring Boot banner and no Firebase errors, you're good to go!

## 🔍 Troubleshooting

### "FileNotFoundException" or "Cannot find credentials"
- Check the path in `GOOGLE_APPLICATION_CREDENTIALS`
- Ensure the file exists at that location
- Use absolute path (not relative)

### "Permission denied" errors
- Ensure Firestore is enabled in Firebase Console
- Check service account has proper permissions
- Verify the key is for the correct project

### Geocoding errors
- Verify Google Maps API key is set
- Check Geocoding API is enabled
- Ensure billing is enabled (if required)

## 📚 Resources

- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Service Account Keys](https://cloud.google.com/iam/docs/service-accounts)
- [Google Maps Geocoding API](https://developers.google.com/maps/documentation/geocoding)

