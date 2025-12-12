import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

// Register Firebase messaging service worker with config params
async function registerFirebaseMessagingSW(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return null;
    }

    // Build query string with Firebase config for service worker
    const swParams = new URLSearchParams({
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId,
        measurementId: firebaseConfig.measurementId
    });

    try {
        const registration = await navigator.serviceWorker.register(
            `/firebase-messaging-sw.js?${swParams.toString()}`
        );
        console.log('Firebase messaging service worker registered');
        return registration;
    } catch (err) {
        console.error('Failed to register firebase messaging service worker:', err);
        return null;
    }
}

// Initialize Firebase Cloud Messaging (only in browser)
let messaging: ReturnType<typeof getMessaging> | null = null
if (typeof window !== 'undefined') {
    isSupported().then(async (supported) => {
        if (supported) {
            // Register SW first, then get messaging instance
            await registerFirebaseMessagingSW();
            messaging = getMessaging(app)
        }
    }).catch(err => console.error('FCM not supported:', err))
}

export { messaging, app, db, analytics }
