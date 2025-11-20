# Backend Setup - Firebase Configuration

## Error: Firestore database is null

If you're seeing this error:
```
Cannot invoke "com.google.cloud.firestore.Firestore.collection(String)" because "this.db" is null
```

It means the backend cannot connect to Firebase Firestore.

## Quick Fix

### 1. Download Firebase Service Account Key

1. Go to https://console.firebase.google.com/
2. Select your project: **street-bite-v1**
3. Click ⚙️ **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the file (e.g., `firebase-key.json`)

### 2. Update the Startup Script

Edit `start-backend.ps1` and update this line with your actual path:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Users\CDAC\Downloads\firebase-key.json"
```

### 3. Run the Backend

```powershell
cd backend
.\start-backend.ps1
```

## Alternative: Manual Start

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\your\firebase-key.json"
$env:JAVA_HOME="C:\Program Files\Java\jdk-17"
.\mvnw.cmd spring-boot:run
```

## Verify It's Working

Once the backend starts successfully, you should see:
```
✓ Firebase initialized successfully
✓ Firestore connected
```

And NO warnings about "GOOGLE_APPLICATION_CREDENTIALS not set".

## Security Note

⚠️ **NEVER commit `firebase-key.json` to Git!**

It's already in `.gitignore`, but double-check before pushing code.
