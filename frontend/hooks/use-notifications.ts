import { useEffect, useState } from 'react'
import { messaging } from '@/lib/firebase-client'
import { getToken, onMessage } from 'firebase/messaging'

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
        setPermission(Notification.permission)
        setLoading(false)
    }, [])

    const requestPermission = async (): Promise<NotificationPermission | null> => {
        if (!messaging) {
            console.error('Firebase messaging not supported')
            return null
        }

        try {
            console.log('🔔 useNotifications: Requesting permission...')
            const permission = await Notification.requestPermission()
            console.log('🔔 useNotifications: Permission result:', permission)
            setPermission(permission)

            if (permission === 'granted') {
                // Get FCM token
                const vapidKey = "G10L_5paf5oCTUr_DaxXSeKfx46nslgW-3Im9beWsOc";
                console.log('🔔 useNotifications: VAPID Key available:', !!vapidKey)

                const currentToken = await getToken(messaging, { vapidKey });
                if (currentToken) {
                    setToken(currentToken);
                    console.log('🔔 useNotifications: Token retrieved:', currentToken);

                    const response = await fetch('http://localhost:8080/api/notifications/token', {
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
                    console.log('No registration token available. Request permission to generate one.');
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
