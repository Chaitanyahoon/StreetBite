'use client'

import { useState, useEffect, useMemo } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { realtimeDb, REALTIME_COLLECTIONS } from '@/lib/realtime'

interface MenuAvailability {
    [itemId: string]: boolean
}

interface LiveMenuItem {
    id?: string | number
    itemId?: string | number
    isAvailable?: boolean
}

/**
 * Custom hook to track real-time availability of multiple menu items.
 * @param {any[]} menuItems - List of menu items to monitor.
 * @returns {Object} Availability map and lookup function.
 */
export function useLiveMenuAvailability(menuItems: LiveMenuItem[]) {
    const baselineAvailability = useMemo(() => {
        const nextAvailability: MenuAvailability = {}
        menuItems.forEach(item => {
            const id = item.id ?? item.itemId
            if (id != null) {
                nextAvailability[String(id)] = item.isAvailable ?? true
            }
        })
        return nextAvailability
    }, [menuItems])

    const [availability, setAvailability] = useState<MenuAvailability>(baselineAvailability)

    useEffect(() => {
        if (!realtimeDb || !menuItems || menuItems.length === 0) return
        const firestore = realtimeDb

        const itemIds = menuItems
            .map(item => item.id ?? item.itemId)
            .filter((id): id is string | number => id != null)
            .map(id => String(id))

        if (itemIds.length === 0) return

        const unsubscribers: (() => void)[] = []

        itemIds.forEach(itemId => {
            const unsubscribe = onSnapshot(
                doc(firestore, REALTIME_COLLECTIONS.menuAvailability, itemId),
                (snapshot) => {
                    if (!snapshot.exists()) {
                        return
                    }

                    const data = snapshot.data()
                    if (typeof data.isAvailable === 'boolean') {
                        setAvailability(prev => ({
                            ...prev,
                            [itemId]: data.isAvailable
                        }))
                    }
                },
                (error) => {
                    console.error('Error listening to menu availability:', error)
                }
            )
            unsubscribers.push(unsubscribe)
        })

        return () => {
            unsubscribers.forEach(unsub => unsub())
        }
    }, [menuItems])

    const getAvailability = (itemId: string | number): boolean => {
        return availability[String(itemId)] ?? baselineAvailability[String(itemId)] ?? true
    }

    return { availability: { ...baselineAvailability, ...availability }, getAvailability }
}
