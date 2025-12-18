'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase-client'

interface MenuAvailability {
    [itemId: string]: boolean
}

/**
 * Custom hook to track real-time availability of multiple menu items.
 * @param {any[]} menuItems - List of menu items to monitor.
 * @returns {Object} Availability map and lookup function.
 */
export function useLiveMenuAvailability(menuItems: any[]) {
    const [availability, setAvailability] = useState<MenuAvailability>({})

    useEffect(() => {
        if (!menuItems || menuItems.length === 0) return

        // Create initial availability map from menu items
        const initialAvailability: MenuAvailability = {}
        menuItems.forEach(item => {
            const id = item.id || item.itemId
            if (id) {
                initialAvailability[String(id)] = item.isAvailable ?? true
            }
        })
        setAvailability(initialAvailability)

        // Listen to Firebase for real-time updates on all menu items
        const itemIds = menuItems.map(item => String(item.id || item.itemId)).filter(Boolean)

        if (itemIds.length === 0) return

        // Listen to each document for changes
        const unsubscribers: (() => void)[] = []

        itemIds.forEach(itemId => {
            const unsubscribe = onSnapshot(
                collection(db, 'live_menu_items'),
                (snapshot) => {
                    snapshot.docs.forEach(doc => {
                        if (doc.id === itemId) {
                            const data = doc.data()
                            if (data && typeof data.isAvailable === 'boolean') {
                                setAvailability(prev => ({
                                    ...prev,
                                    [itemId]: data.isAvailable
                                }))
                            }
                        }
                    })
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

    // Helper function to get availability for a specific item
    const getAvailability = (itemId: string | number): boolean => {
        return availability[String(itemId)] ?? true
    }

    return { availability, getAvailability }
}
