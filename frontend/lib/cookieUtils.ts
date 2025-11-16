/**
 * Cookie utility functions for Next.js App Router
 * Uses next/headers cookies() for server-side, document.cookie for client-side
 */

import { cookies } from 'next/headers'

/**
 * Cookie name for user location
 */
export const USER_LOCATION_COOKIE = 'userLocation'

/**
 * Cookie expiration: 24 hours
 */
export const COOKIE_EXPIRES_HOURS = 24

/**
 * User location type
 */
export type LocationCookie = {
  lat: number
  lng: number
}

/**
 * Server-side: Get user location from cookie
 * Use this in Server Components or API routes
 */
export async function getLocationCookie(): Promise<LocationCookie | null> {
  try {
    const cookieStore = await cookies()
    const locationCookie = cookieStore.get(USER_LOCATION_COOKIE)
    
    if (!locationCookie?.value) {
      return null
    }

    const parsed = JSON.parse(locationCookie.value)
    
    // Validate structure
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.lat === 'number' &&
      typeof parsed.lng === 'number' &&
      !isNaN(parsed.lat) &&
      !isNaN(parsed.lng) &&
      parsed.lat >= -90 && parsed.lat <= 90 &&
      parsed.lng >= -180 && parsed.lng <= 180
    ) {
      return { lat: parsed.lat, lng: parsed.lng }
    }
  } catch (e) {
    // Invalid cookie - return null
    console.warn('Invalid location cookie:', e)
  }
  
  return null
}

/**
 * Server-side: Set user location cookie
 * Use this in API routes or Server Actions
 */
export async function setLocationCookie(location: LocationCookie): Promise<void> {
  try {
    const cookieStore = await cookies()
    const expires = new Date(Date.now() + COOKIE_EXPIRES_HOURS * 3600 * 1000)
    
    cookieStore.set(USER_LOCATION_COOKIE, JSON.stringify(location), {
      expires,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false // Allow client-side access
    })
  } catch (e) {
    console.error('Failed to set location cookie:', e)
    throw e
  }
}

/**
 * Client-side: Get user location from cookie
 * Use this in Client Components
 */
export function getLocationCookieClient(): LocationCookie | null {
  if (typeof document === 'undefined') return null
  
  const match = document.cookie.split('; ').find(row => row.startsWith(USER_LOCATION_COOKIE + '='))
  if (!match) return null
  
  const value = match.split('=').slice(1).join('=')
  try {
    const parsed = JSON.parse(decodeURIComponent(value))
    
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      typeof parsed.lat === 'number' &&
      typeof parsed.lng === 'number' &&
      !isNaN(parsed.lat) &&
      !isNaN(parsed.lng) &&
      parsed.lat >= -90 && parsed.lat <= 90 &&
      parsed.lng >= -180 && parsed.lng <= 180
    ) {
      return { lat: parsed.lat, lng: parsed.lng }
    }
  } catch (e) {
    // Invalid cookie
  }
  
  return null
}

/**
 * Client-side: Set user location cookie
 * Use this in Client Components
 */
export function setLocationCookieClient(location: LocationCookie): void {
  if (typeof document === 'undefined') return
  
  const expires = new Date(Date.now() + COOKIE_EXPIRES_HOURS * 3600 * 1000).toUTCString()
  const value = JSON.stringify(location)
  
  document.cookie = `${USER_LOCATION_COOKIE}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
}

