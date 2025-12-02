import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase-client'
import { doc, onSnapshot } from 'firebase/firestore'

interface VendorStatus {
    status: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
    lastUpdated: number
}

export function useLiveVendorStatus(vendorId: string | number) {
    const [status, setStatus] = useState<'AVAILABLE' | 'BUSY' | 'UNAVAILABLE' | null>(null)
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

    return { status, loading }
}
