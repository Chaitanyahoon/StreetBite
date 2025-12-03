'use client'

import { useEffect, useState, useCallback } from 'react'

/**
 * User location type
 */
export type UserLocation = { lat: number; lng: number } | null

/**
 * Cookie configuration
 */
const COOKIE_NAME = 'userLocation'
const COOKIE_EXPIRES_HOURS = 24 // 24 hours expiration

/**
 * Cookie helper functions using native browser cookies
 * Works in both App Router and Pages Router
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find(row => row.startsWith(name + '='))
  if (!match) return null
  const value = match.split('=').slice(1).join('=')
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function setCookie(name: string, value: string, hours: number) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + hours * 3600 * 1000).toUTCString()
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`
}

/**
 * React hook for managing user location with cookie-based caching
 * 
 * Behavior:
 * 1. First checks cookie for existing location (24h expiration)
 * 2. If cookie exists → use it immediately (NO geolocation API call)
 * 3. If no cookie → request geolocation ONCE → store in cookie
 * 4. Never calls geolocation API again within 24 hours
 * 
 * @returns { location, loading, error, setUserLocation }
 */
export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Read location from cookie
   * Returns null if cookie doesn't exist or is invalid
   */
  const readCookie = useCallback((): UserLocation => {
    const raw = getCookie(COOKIE_NAME)
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw)
      // Validate structure: { lat: number, lng: number }
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
      // Invalid JSON or structure - ignore
      console.warn('Invalid location cookie format:', e)
    }
    return null
  }, [])

  /**
   * Store location in cookie with 24-hour expiration
   */
  const storeCookie = useCallback((loc: { lat: number; lng: number }) => {
    try {
      const jsonValue = JSON.stringify({ lat: loc.lat, lng: loc.lng })
      setCookie(COOKIE_NAME, jsonValue, COOKIE_EXPIRES_HOURS)
      setLocation(loc)
    } catch (e) {
      console.error('Failed to store location cookie:', e)
    }
  }, [])

  /**
   * Request geolocation from browser (only called once if no cookie)
   */
  /**
   * Request geolocation from browser (only called once if no cookie)
   */
  const requestGeolocation = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        const msg = 'Geolocation not available in this browser'
        setError(msg)
        setLoading(false)
        resolve(msg)
        return
      }

      const options: PositionOptions = {
        enableHighAccuracy: false, // Use less accurate but faster method
        maximumAge: 0, // Don't use cached position
        timeout: 10000 // 10 second timeout
      }

      const onSuccess = (pos: GeolocationPosition) => {
        const loc = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
        // Store in cookie immediately to avoid future API calls
        storeCookie(loc)
        setLoading(false)
        setError(null)
        resolve(null) // Success (no error)
      }

      const onError = (err: GeolocationPositionError) => {
        let errorMessage = 'Failed to get location'
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location permission denied'
            break
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case err.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        setError(errorMessage)
        setLoading(false)
        resolve(errorMessage)
      }

      navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
    })
  }, [storeCookie])

  /**
   * Initialize location on mount
   * Priority: Cookie → Geolocation API
   */
  useEffect(() => {
    setLoading(true)
    setError(null)

    // Step 1: Check cookie first (avoids geolocation API call)
    // const existing = readCookie()
    // if (existing) {
    //   // Cookie exists and is valid - use it immediately
    //   setLocation(existing)
    //   setLoading(false)
    //   return
    // }

    // Step 2: No cookie - request geolocation ONCE
    requestGeolocation()
  }, [readCookie, requestGeolocation])

  /**
   * Manually set user location (e.g., from map click)
   * This will also store in cookie
   */
  const setUserLocation = useCallback((loc: { lat: number; lng: number }) => {
    storeCookie(loc)
  }, [storeCookie])

  return {
    location,
    loading,
    error,
    setUserLocation,
    requestGeolocation
  }
}
