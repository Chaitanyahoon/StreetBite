import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { realtimeDb, REALTIME_COLLECTIONS } from '@/lib/realtime'

interface VendorStatus {
    status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
    lastUpdated: number
}

/**
 * Custom hook to track a vendor's real-time availability status.
 * @param {string|number} vendorId - The ID of the vendor to track.
 * @returns {Object} Status string ('AVAILABLE' | 'BUSY' | 'UNAVAILABLE') and loading state.
 */
export function useLiveVendorStatus(vendorId: string | number) {
    const hasRealtimeSource = Boolean(vendorId && realtimeDb)
    const [status, setStatus] = useState<'AVAILABLE' | 'BUSY' | 'UNAVAILABLE' | null>(null)
    const [loading, setLoading] = useState(() => hasRealtimeSource)

    useEffect(() => {
        if (!vendorId || !realtimeDb) {
            return
        }

        const vendorDocRef = doc(realtimeDb, REALTIME_COLLECTIONS.vendorStatusAndLocation, String(vendorId))

        const unsubscribe = onSnapshot(
            vendorDocRef,
            (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data() as VendorStatus
                    setStatus(data.status)
                } else {
                    // No real-time data yet, status will come from initial API call
                    setStatus(null)
                }
                setLoading(false)
            },
            (error) => {
                console.error('Error listening to vendor status:', error)
                setLoading(false)
            }
        )

        return () => unsubscribe()
    }, [vendorId])

    return { status: vendorId ? status : null, loading: hasRealtimeSource ? loading : false }
}
