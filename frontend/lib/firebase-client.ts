import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'
import { getAnalytics, Analytics } from "firebase/analytics";

/**
 * Firebase configuration object containing keys and identifiers for the app.
 * @constant {Object}
 */
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
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

if (!firebaseConfig.apiKey) {
    if (typeof window !== 'undefined') {
        console.error('❌ Firebase API Key is missing! Check your Vercel/Environment variables.');
    }
} else {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
        db = getFirestore(app)

        if (typeof window !== 'undefined') {
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
        if (supported) {
            messaging = getMessaging(app)
        }
    }).catch(err => console.error('FCM not supported:', err))
}

/**
 * Exported Firebase service instances.
 * @property {Messaging|null} messaging - Firebase Cloud Messaging instance
 * @property {FirebaseApp} app - Initialized Firebase Application instance
 * @property {Firestore} db - Cloud Firestore database instance
 * @property {Analytics|undefined} analytics - Google Analytics instance
 */
export { messaging, app, db, analytics }
