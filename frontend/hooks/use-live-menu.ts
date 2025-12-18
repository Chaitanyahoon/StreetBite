import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';

/**
 * Custom hook to subscribe to real-time availability updates for a menu item.
 * Uses Firestore real-time listeners.
 * @param {number|undefined} itemId - The ID of the menu item to track.
 * @param {boolean|undefined} initialAvailability - Initial availability state.
 * @returns {boolean|undefined} Current availability status.
 */
export function useLiveMenuItem(itemId: number | undefined, initialAvailability: boolean | undefined) {
    const [isAvailable, setIsAvailable] = useState(initialAvailability);

    useEffect(() => {
        // Update local state if initial prop changes (e.g. after a re-fetch)
        setIsAvailable(initialAvailability);
    }, [initialAvailability]);

    useEffect(() => {
        if (!itemId) return;

        // Listen to "live_menu_items" collection for real-time updates
        // The document ID is the menu item ID (stringified)
        const unsub = onSnapshot(doc(db, "live_menu_items", String(itemId)), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                if (data && typeof data.isAvailable === 'boolean') {
                    setIsAvailable(data.isAvailable);
                }
            }
        }, (error) => {
            console.error("Error listening to live menu item:", error);
        });

        return () => unsub();
    }, [itemId]);

    return isAvailable;
}
