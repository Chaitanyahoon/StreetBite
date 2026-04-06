'use client'

import { useEffect, useState } from 'react'
import { GOOGLE_MAPS_API_KEY } from '@/lib/maps-config'
import { useUserLocation } from '@/lib/useUserLocation'

type GoogleGeocodeResult = {
  address_components?: Array<{
    long_name: string
    types: string[]
  }>
}

function extractCityName(results: GoogleGeocodeResult[]): string | null {
  const preferredTypes = [
    'locality',
    'administrative_area_level_2',
    'administrative_area_level_3',
    'sublocality_level_1',
    'administrative_area_level_1',
  ]

  for (const type of preferredTypes) {
    for (const result of results) {
      const component = result.address_components?.find((item) => item.types.includes(type))
      if (component?.long_name?.trim()) {
        return component.long_name
      }
    }
  }

  return null
}

export function useCityName() {
  const {
    location,
    cityName: cachedCityName,
    isManualLocation,
    loading: locationLoading,
    error,
    requestGeolocation,
    setUserLocation,
    setManualLocationByCity,
    clearUserLocation,
  } = useUserLocation()
  const [cityName, setCityName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!location) {
      setCityName('')
      setLoading(false)
      return
    }

    if (cachedCityName.trim()) {
      setCityName(cachedCityName)
      setLoading(false)
      return
    }

    const fetchCity = async () => {
      setLoading(true)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      try {
        const apiKey = GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          console.warn('Google Maps API key not found')
          setLoading(false)
          return
        }

        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${apiKey}`,
          { signal: controller.signal }
        )

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Geocoding API error: ${response.status} ${response.statusText} - ${errorText}`)
        }

        const data = await response.json()
        const resolvedCityName = extractCityName(data.results ?? [])

        if (resolvedCityName) {
          setCityName(resolvedCityName)
          setUserLocation(
            { lat: location.lat, lng: location.lng },
            { cityName: resolvedCityName, manual: isManualLocation }
          )
        }
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.error('Geocoding request timed out after 10 seconds')
        } else {
          console.error('Error fetching city name:', fetchError)
        }
      } finally {
        clearTimeout(timeoutId)
        setLoading(false)
      }
    }

    fetchCity()
  }, [cachedCityName, isManualLocation, location, setUserLocation])

  return {
    cityName,
    loading: loading || locationLoading,
    error,
    isManualLocation,
    setManualLocationByCity,
    clearUserLocation,
    requestGeolocation,
  }
}
