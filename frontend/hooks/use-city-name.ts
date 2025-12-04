'use client'

import { useState, useEffect } from 'react'
import { useUserLocation } from '@/lib/useUserLocation'
import { GOOGLE_MAPS_API_KEY } from '@/lib/maps-config'

export function useCityName() {
    const { location } = useUserLocation()
    const [cityName, setCityName] = useState<string>('Nashik')
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (!location) return

        const fetchCity = async () => {
            setLoading(true)

            // Create AbortController for timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

            try {
                const apiKey = GOOGLE_MAPS_API_KEY
                if (!apiKey) {
                    console.warn('Google Maps API key not found')
                    setLoading(false) // Reset loading before early return
                    return
                }

                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.lat},${location.lng}&key=${apiKey}`,
                    { signal: controller.signal }
                )

                // Clear timeout on successful response
                clearTimeout(timeoutId)

                // Check HTTP status before parsing
                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(`Geocoding API error: ${response.status} ${response.statusText} - ${errorText}`)
                }

                const data = await response.json()

                if (data.results && data.results.length > 0) {
                    // Look for locality (city) or administrative_area_level_2 (district)
                    const addressComponents = data.results[0].address_components
                    const cityComponent = addressComponents.find((component: any) =>
                        component.types.includes('locality')
                    ) || addressComponents.find((component: any) =>
                        component.types.includes('administrative_area_level_2')
                    )

                    if (cityComponent) {
                        setCityName(cityComponent.long_name)
                    }
                }
            } catch (error) {
                // Handle abort/timeout separately
                if (error instanceof Error && error.name === 'AbortError') {
                    console.error('Geocoding request timed out after 10 seconds')
                } else {
                    console.error('Error fetching city name:', error)
                }
            } finally {
                clearTimeout(timeoutId) // Ensure timeout is always cleared
                setLoading(false)
            }
        }

        fetchCity()
    }, [location])

    return { cityName, loading }
}
