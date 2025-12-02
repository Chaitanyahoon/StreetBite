import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase-client'
import { doc, onSnapshot } from 'firebase/firestore'

interface VendorLocation {
    latitude: number
    longitude: number
    address?: string
    lastUpdated: number
}

export function useLiveVendorLocation(vendorId: string | number) {
    const [location, setLocation] = useState<VendorLocation | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!vendorId) {
            setLoading(false)
            return
        }

        const vendorDocRef = doc(db, 'live_vendors', String(vendorId))

        const unsubscribe = onSnapshot(
            vendorDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data()
                    if (data.latitude !== undefined && data.longitude !== undefined) {
                        setLocation({
                            latitude: data.latitude,
                            longitude: data.longitude,
                            address: data.address,
                            lastUpdated: data.lastUpdated || Date.now()
                        })
                    }
                } else {
                    // No real-time data yet
                    setLocation(null)
                }
                setLoading(false)
            },
            (error) => {
                console.error('Error listening to vendor location:', error)
                setLoading(false)
            }
        )

        return () => unsubscribe()
    }, [vendorId])

    return { location, loading }
}
