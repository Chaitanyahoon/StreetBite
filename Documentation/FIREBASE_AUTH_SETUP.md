# 🔐 Firebase Authentication Setup Guide

## ⚠️ Important: Enable Firebase Authentication

The error `auth/configuration-not-found` means **Firebase Authentication is not enabled** in your Firebase project.

---

## ✅ Quick Fix: Enable Email/Password Authentication

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select your project: **street-bite-v1**

### Step 2: Enable Authentication
1. Click on **Authentication** in the left sidebar
2. Click **Get Started** (if you haven't enabled it yet)
3. Go to the **Sign-in method** tab
4. Click on **Email/Password**
5. **Enable** the first toggle (Email/Password)
6. Click **Save**

### Step 3: Verify
- You should see "Email/Password" listed as an enabled sign-in provider
- Status should show as "Enabled"

---

## 🔧 What Was Fixed

### 1. **Firebase Package Installation** ✅
- Installed `firebase` package (was missing)
- Now includes: `firebase/app`, `firebase/auth`, `firebase/firestore`

### 2. **Client-Side Initialization** ✅
- Firebase now only initializes on the client side (browser)
- Prevents server-side rendering errors
- Added proper error handling

### 3. **Better Error Messages** ✅
- Added specific error message for `auth/configuration-not-found`
- Clear instructions on what to do

---

## 🧪 Test After Setup

1. **Enable Email/Password** in Firebase Console (see above)
2. **Restart your frontend** (if it's running):
   ```powershell
   # Stop the frontend (Ctrl+C)
   # Then restart:
   cd frontend
   npm run dev
   ```
3. **Try signing up again** at `/signup`

---

## 📋 Firebase Configuration

Your Firebase config is already set in `lib/firebase.ts`:
```javascript
{
  apiKey: "AIzaSyDSGZMx__OvhECxf3mq69oi_2oUU5TbmbA",
  authDomain: "street-bite-v1.firebaseapp.com",
  projectId: "street-bite-v1",
  // ... other config
}
```

This is correct - you just need to **enable Authentication** in the Firebase Console.

---

## ✅ After Enabling Auth

Once you enable Email/Password authentication:

1. ✅ Sign up will work
2. ✅ Sign in will work
3. ✅ Users will be created in Firebase Auth
4. ✅ User profiles will be saved to Firestore
5. ✅ Authentication will persist across sessions

---

## 🐛 Troubleshooting

### Still getting `auth/configuration-not-found`?
1. ✅ Make sure you enabled **Email/Password** (not just Email link)
2. ✅ Wait 1-2 minutes after enabling (propagation delay)
3. ✅ Clear browser cache and reload
4. ✅ Restart the frontend dev server

### Other errors?
- `auth/email-already-in-use` → User already exists, use sign in
- `auth/weak-password` → Password must be 6+ characters
- `auth/invalid-email` → Check email format

---

## 🎯 Summary

**The code is fixed!** You just need to:
1. ✅ Enable Email/Password in Firebase Console
2. ✅ Restart frontend
3. ✅ Try signing up again

**That's it!** 🚀

