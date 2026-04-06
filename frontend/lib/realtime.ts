import { analytics, db, messaging } from '@/lib/firebase-client'

/**
 * StreetBite data ownership model:
 * - MySQL via the Spring Boot API is the source of truth for business data.
 * - Firestore is only used for realtime mirrors that improve live UX.
 * - Firebase Messaging is only used for browser push notifications.
 */
export const realtimeDb = db
export const realtimeAnalytics = analytics
export const pushMessaging = messaging

export const REALTIME_COLLECTIONS = {
  vendorStatusAndLocation: 'live_vendors',
  menuAvailability: 'live_menu_items',
} as const

export function isRealtimeEnabled() {
  return Boolean(realtimeDb)
}

export function isPushMessagingEnabled() {
  return Boolean(pushMessaging)
}
