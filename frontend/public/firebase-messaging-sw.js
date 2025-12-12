// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// Firebase config is passed via URL search params during service worker registration
// This avoids hardcoding sensitive values
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
    apiKey: urlParams.get('apiKey') || '',
    authDomain: urlParams.get('authDomain') || '',
    projectId: urlParams.get('projectId') || '',
    storageBucket: urlParams.get('storageBucket') || '',
    messagingSenderId: urlParams.get('messagingSenderId') || '',
    appId: urlParams.get('appId') || '',
    measurementId: urlParams.get('measurementId') || ''
};

let messaging = null;

// Initialize Firebase only if we have the config
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    try {
        firebase.initializeApp(firebaseConfig);
        messaging = firebase.messaging();
        console.log('[firebase-messaging-sw.js] Firebase initialized successfully');
    } catch (error) {
        console.error('[firebase-messaging-sw.js] Failed to initialize Firebase:', error);
    }
} else {
    console.warn('[firebase-messaging-sw.js] Firebase config not provided via URL params - push notifications will not work until page is reloaded');
}

// Handle background messages only if messaging is initialized
if (messaging) {
    messaging.onBackgroundMessage((payload) => {
        console.log('[firebase-messaging-sw.js] Received background message', payload)

        const notificationTitle = payload.notification?.title || 'StreetBite Notification'
        const notificationOptions = {
            body: payload.notification?.body || 'You have a new notification',
            icon: '/logo.png',
            badge: '/logo.png',
            data: payload.data,
            tag: payload.data?.type || 'general',
            requireInteraction: false
        }

        self.registration.showNotification(notificationTitle, notificationOptions)
    });
}

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification clicked', event)

    event.notification.close()

    // Navigate to the appropriate page based on notification data
    const data = event.notification.data
    let url = '/'

    if (data?.type === 'new_order' && data?.orderId) {
        url = `/vendor/orders/${data.orderId}`
    } else if (data?.type === 'order_update' && data?.orderId) {
        url = `/orders/${data.orderId}`
    }

    event.waitUntil(
        clients.openWindow(url)
    )
})

