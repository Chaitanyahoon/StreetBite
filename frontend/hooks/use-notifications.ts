import { useEffect, useState } from 'react'
import { getToken } from 'firebase/messaging'
import { isPushMessagingEnabled, pushMessaging } from '@/lib/realtime'

/**
 * Custom hook to manage Firebase Cloud Messaging (FCM) notifications.
 * Handles permission requests and token retrieval.
 * @returns {Object} Notification permission, token, and utility functions.
 */
export function useNotifications() {
    const [permission, setPermission] = useState<NotificationPermission>('default')
    const [token, setToken] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (typeof window === 'undefined' || !isPushMessagingEnabled()) {
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
        if (!isPushMessagingEnabled()) {
            console.error('Firebase messaging not supported')
            return null
        }

        try {
            const permission = await Notification.requestPermission()

            setPermission(permission)

            if (permission === 'granted') {
                if (!pushMessaging) {
                    return null
                }

                // Get FCM token
                const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
                const currentToken = await getToken(pushMessaging, { vapidKey })
                if (currentToken) {
                    setToken(currentToken)

                    const response = await fetch('/api/notifications/token', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                        body: JSON.stringify({
                            fcmToken: currentToken,
                            deviceType: 'web'
                        })
                    })

                    if (!response.ok) {
                        throw new Error('Failed to save token')
                    }
                }
            }
            return permission
        } catch (err) {
            console.error('An error occurred while retrieving token.', err)
            return null
        }
    }

    return {
        permission,
        token,
        loading,
        requestPermission,
        isSupported: isPushMessagingEnabled()
    }
}
