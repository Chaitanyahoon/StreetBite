'use client'

import { useCallback, useEffect, useState } from 'react'

export type UserLocation = { lat: number; lng: number } | null

type StoredLocation = {
  lat: number
  lng: number
  cityName?: string
  manual?: boolean
}

const COOKIE_NAME = 'userLocation'
const COOKIE_EXPIRES_HOURS = 24

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find((row) => row.startsWith(name + '='))
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
  const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secureAttribute}`
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax${secureAttribute}`
}

function normalizeCityInput(city: string) {
  return city.trim().replace(/\s+/g, ' ')
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation>(null)
  const [cityName, setCityName] = useState('')
  const [isManualLocation, setIsManualLocation] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const readCookie = useCallback((): StoredLocation | null => {
    const raw = getCookie(COOKIE_NAME)
    if (!raw) return null

    try {
      const parsed = JSON.parse(raw)
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        typeof parsed.lat === 'number' &&
        typeof parsed.lng === 'number' &&
        !isNaN(parsed.lat) &&
        !isNaN(parsed.lng) &&
        parsed.lat >= -90 &&
        parsed.lat <= 90 &&
        parsed.lng >= -180 &&
        parsed.lng <= 180
      ) {
        return {
          lat: parsed.lat,
          lng: parsed.lng,
          cityName: typeof parsed.cityName === 'string' ? parsed.cityName : undefined,
          manual: parsed.manual === true,
        }
      }
    } catch (readError) {
      console.warn('Invalid location cookie format:', readError)
    }

    return null
  }, [])

  const storeCookie = useCallback((nextLocation: StoredLocation) => {
    try {
      const payload: StoredLocation = {
        lat: nextLocation.lat,
        lng: nextLocation.lng,
        cityName: nextLocation.cityName?.trim() || undefined,
        manual: nextLocation.manual === true,
      }
      setCookie(COOKIE_NAME, JSON.stringify(payload), COOKIE_EXPIRES_HOURS)
      setLocation({ lat: payload.lat, lng: payload.lng })
      setCityName(payload.cityName || '')
      setIsManualLocation(payload.manual === true)
    } catch (writeError) {
      console.error('Failed to store location cookie:', writeError)
    }
  }, [])

  const requestGeolocation = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!('geolocation' in navigator)) {
        const message = 'Geolocation not available in this browser'
        setError(message)
        setLoading(false)
        resolve(message)
        return
      }

      const options: PositionOptions = {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: 10000,
      }

      const onSuccess = (position: GeolocationPosition) => {
        storeCookie({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          manual: false,
        })
        setLoading(false)
        setError(null)
        resolve(null)
      }

      const onError = (geoError: GeolocationPositionError) => {
        let message = 'Failed to get location'
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            message = 'Location permission denied'
            break
          case geoError.POSITION_UNAVAILABLE:
            message = 'Location information unavailable'
            break
          case geoError.TIMEOUT:
            message = 'Location request timed out'
            break
        }
        setError(message)
        setLoading(false)
        resolve(message)
      }

      navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
    })
  }, [storeCookie])

  const setUserLocation = useCallback(
    (
      nextLocation: { lat: number; lng: number },
      options?: { cityName?: string; manual?: boolean }
    ) => {
      storeCookie({
        lat: nextLocation.lat,
        lng: nextLocation.lng,
        cityName: options?.cityName,
        manual: options?.manual,
      })
      setError(null)
      setLoading(false)
    },
    [storeCookie]
  )

  const setManualLocationByCity = useCallback(
    async (cityInput: string): Promise<string | null> => {
      const normalizedCity = normalizeCityInput(cityInput)
      if (!normalizedCity) {
        return 'Enter a city name'
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
      if (!apiKey) {
        return 'Google Maps API key is missing'
      }

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(normalizedCity)}&key=${apiKey}`
        )

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Geocoding API error: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const data = await response.json()
        const result = data.results?.[0]
        const coordinates = result?.geometry?.location

        if (!coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
          return 'City not found'
        }

        const resolvedCityName = normalizedCity
        setUserLocation(
          { lat: coordinates.lat, lng: coordinates.lng },
          { cityName: resolvedCityName, manual: true }
        )

        return null
      } catch (fetchError) {
        console.error('Failed to set manual city:', fetchError)
        return 'Unable to set city right now'
      } finally {
        setLoading(false)
      }
    },
    [setUserLocation]
  )

  const clearUserLocation = useCallback(() => {
    deleteCookie(COOKIE_NAME)
    setLocation(null)
    setCityName('')
    setIsManualLocation(false)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)

    const existing = readCookie()
    if (existing) {
      setLocation({ lat: existing.lat, lng: existing.lng })
      setCityName(existing.cityName?.trim() || '')
      setIsManualLocation(existing.manual === true)
      setLoading(false)
      return
    }

    requestGeolocation()
  }, [readCookie, requestGeolocation])

  return {
    location,
    cityName,
    isManualLocation,
    loading,
    error,
    setUserLocation,
    setManualLocationByCity,
    clearUserLocation,
    requestGeolocation,
  }
}
