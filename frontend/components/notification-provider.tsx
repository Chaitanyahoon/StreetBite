'use client'

import { useEffect } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { toast } from 'sonner'
import { messaging } from '@/lib/firebase-client'
if (Notification.permission === 'default') {
    // Wait a bit before asking (don't annoy users immediately)
    const timer = setTimeout(() => {
        toast('Enable Notifications', {
            description: 'Get notified about order updates and new messages',
            duration: 10000,
            action: {
                label: 'Enable',
                onClick: () => {
                    requestPermission()
                }
            }
        })
    }, 5000) // Ask after 5 seconds

    return () => clearTimeout(timer)
} else if (Notification.permission === 'granted') {
    // Silently get token if already granted
    requestPermission()
}
        }
    }, [isSupported, requestPermission])

return <>{children}</>
}
