import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, Auth, browserLocalPersistence, setPersistence } from 'firebase/auth'

/**
 * Firebase configuration object containing keys and identifiers for the app.
 * @constant {Object}
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAKDqyaU7Jvk49urkUuj69dv929sI3ADto",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "streetbite-go.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "streetbite-go",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "streetbite-go.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "683361671426",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:683361671426:web:76a5505163d225b0f8ca1b",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-K3KTYWTLB2"
};

/**
 * VAPID Key for Firebase Cloud Messaging (FCM) push notifications.
 * @constant {string}
 */
export const VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || "";

// Initialize Firebase only once
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let analytics: Analytics | undefined;

const isPlaceholder = (val?: string) => {
    if (!val) return true;
    const lower = val.toLowerCase();
    return lower.startsWith('your_') || 
           lower.includes('your-project-id') || 
           lower === 'placeholder';
};

const isConfigured = firebaseConfig.apiKey && !isPlaceholder(firebaseConfig.apiKey);

if (!isConfigured) {
    if (typeof window !== 'undefined') {
        console.warn('⚠️ Firebase is disabled: API Key is either missing or contains placeholder values.');
    }
} else {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
        db = getFirestore(app)

        if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
            analytics = getAnalytics(app);
        }
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
    }
}

// Initialize Firebase Cloud Messaging (only in browser)
let messaging: ReturnType<typeof getMessaging> | null = null
if (typeof window !== 'undefined') {
    isSupported().then(supported => {
        if (supported && app) {
            messaging = getMessaging(app)
        }
    }).catch(err => console.error('FCM not supported:', err))
}

let auth: Auth | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (app) {
    auth = getAuth(app);
    // Explicitly enforce local storage persistence to prevent iframe tracking failures in privacy-focused browsers
    setPersistence(auth, browserLocalPersistence).catch(err => {
        console.warn("Failed to set Firebase local persistence:", err);
    });
    googleProvider = new GoogleAuthProvider();
}

/**
 * Exported Firebase service instances.
 * @property {Messaging|null} messaging - Firebase Cloud Messaging instance
 * @property {FirebaseApp} app - Initialized Firebase Application instance
 * @property {Firestore} db - Cloud Firestore database instance
 * @property {Analytics|undefined} analytics - Google Analytics instance
 * @property {Auth|null} auth - Firebase Authentication instance
 * @property {GoogleAuthProvider|null} googleProvider - Firebase Google Auth Provider
 */
export { messaging, app, db, analytics, auth, googleProvider }
