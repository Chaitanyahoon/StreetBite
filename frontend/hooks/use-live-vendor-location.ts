import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { realtimeDb, REALTIME_COLLECTIONS } from '@/lib/realtime'

interface VendorLocation {
    latitude: number
    longitude: number
    address?: string
    lastUpdated: number
}

/**
 * Custom hook to track a vendor's real-time location.
 * @param {string|number} vendorId - The ID of the vendor to track.
 * @returns {Object} Location object containing latitude, longitude, address, and loading state.
 */
export function useLiveVendorLocation(vendorId: string | number) {
    const [location, setLocation] = useState<VendorLocation | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!vendorId) {
            setLoading(false)
            return
        }

        if (!realtimeDb) {
            setLoading(false)
            return
        }

        const vendorDocRef = doc(realtimeDb, REALTIME_COLLECTIONS.vendorStatusAndLocation, String(vendorId))

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
