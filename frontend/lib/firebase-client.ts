import { initializeApp, getApps } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAKDqyaU7Jvk49urkUuj69dv929sI3ADto",
    authDomain: "streetbite-go.firebaseapp.com",
    projectId: "streetbite-go",
    storageBucket: "streetbite-go.firebasestorage.app",
    messagingSenderId: "683361671426",
    appId: "1:683361671426:web:76a5505163d225b0f8ca1b",
    measurementId: "G-K3KTYWTLB2"
};

// Initialize Firebase only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
const db = getFirestore(app)
let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
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

export { messaging, app, db, analytics }
