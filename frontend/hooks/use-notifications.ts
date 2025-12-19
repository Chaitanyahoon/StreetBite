import { useEffect, useState } from 'react'
import { messaging } from '@/lib/firebase-client'
import { getToken, onMessage } from 'firebase/messaging'

/**
 * Custom hook to manage Firebase Cloud Messaging (FCM) notifications.
 * Handles permission requests and token retrieval.
 * @param {number} [userId] - Optional User ID to associate with the FCM token.
 * @returns {Object} Notification permission, token, and utility functions.
 */
export function useNotifications(userId?: number) {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (typeof window === 'undefined' || !messaging) {
            setLoading(false)
            return
        }

        // Check current permission status
        if (typeof Notification !== 'undefined') {
            setPermission(Notification.permission)
        }
        setLoading(false)
    }, [])

    const requestPermission = async (): Promise<NotificationPermission | null> => {
        if (!messaging) {
            console.error('Firebase messaging not supported')
            return null
        }

        try {

            const permission = await Notification.requestPermission()

            setPermission(permission)

            if (permission === 'granted') {
                // Get FCM token
                const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;


                const currentToken = await getToken(messaging, { vapidKey });
                if (currentToken) {
                    setToken(currentToken);


                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api';
                    const response = await fetch(`${backendUrl}/notifications/token`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId,
                            fcmToken: currentToken,
                            deviceType: 'web'
                        })
                    })

                    if (!response.ok) {
                        throw new Error('Failed to save token')
                    }
                } else {

                }
            }
            return permission
        } catch (err) {
            console.log('An error occurred while retrieving token. ', err);
            return null
        }
    }

    return {
        permission,
        token,
        loading,
        requestPermission,
        isSupported: !!messaging
    }
}
