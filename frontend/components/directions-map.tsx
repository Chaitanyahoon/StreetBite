'use client'

import React, { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'

interface DirectionsMapProps {
    origin: { lat: number; lng: number }
    destination: { lat: number; lng: number }
}

export function DirectionsMap({ origin, destination }: DirectionsMapProps) {
    const mapRef = useRef<HTMLDivElement | null>(null)
    const mapInstance = useRef<any>(null)
    const directionsRenderer = useRef<any>(null)
    const directionsService = useRef<any>(null)

    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null)

    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

        if (!key) {
            setError('Google Maps API key not configured')
            return
        }

        if ((window as any).google && (window as any).google.maps) {
            setLoaded(true)
            return
        }

        const id = 'gmaps-sdk'
        if (!document.getElementById(id)) {
            const script = document.createElement('script')
            script.id = id
            script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`
            script.async = true
            script.defer = true
            script.onload = () => setLoaded(true)
            script.onerror = () => setError('Failed to load Google Maps')
            document.head.appendChild(script)
        } else {
            setLoaded(true)
        }
    }, [])

    useEffect(() => {
        if (!loaded || !mapRef.current) return

        const gm = (window as any).google?.maps
        if (!gm) return

        if (!mapInstance.current) {
            mapInstance.current = new gm.Map(mapRef.current, {
                center: origin,
                zoom: 14,
                // Disable controls for cleaner look
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: true, // Keep zoom buttons
                // Disable interactions for steady map
                gestureHandling: 'none', // Disables all gestures
                draggable: false, // Disable dragging
                scrollwheel: false, // Disable scroll to zoom
                disableDoubleClickZoom: true, // Disable double-click zoom
                keyboardShortcuts: false, // Disable keyboard controls
            })

            directionsService.current = new gm.DirectionsService()
            directionsRenderer.current = new gm.DirectionsRenderer({
                map: mapInstance.current,
                suppressMarkers: false,
            })
        }

        // Calculate Route
        if (directionsService.current && directionsRenderer.current) {
            // Check if we already requested directions for these coordinates
            const last = (mapInstance.current as any).lastRequest
            if (last &&
                last.origin.lat === origin.lat && last.origin.lng === origin.lng &&
                last.destination.lat === destination.lat && last.destination.lng === destination.lng) {
                return
            }

            directionsService.current.route(
                {
                    origin: origin,
                    destination: destination,
                    travelMode: gm.TravelMode.DRIVING,
                },
                (result: any, status: any) => {
                    if (status === gm.DirectionsStatus.OK) {
                        directionsRenderer.current.setDirections(result)

                            // Store last request to prevent loops
                            ; (mapInstance.current as any).lastRequest = { origin, destination }

                        // Extract distance and duration
                        const leg = result.routes[0].legs[0]
                        setRouteInfo({
                            distance: leg.distance.text,
                            duration: leg.duration.text,
                        })
                    } else if (status === gm.DirectionsStatus.OVER_QUERY_LIMIT) {
                        setError('Too many requests. Please try again later.')
                    } else {
                        console.error('Directions request failed due to ' + status)
                        setError(`Could not calculate directions: ${status}`)
                    }
                }
            )
        }

    }, [loaded, origin.lat, origin.lng, destination.lat, destination.lng])

    return (
        <div className="relative w-full h-full">
            {error ? (
                <div className="flex flex-col items-center justify-center h-full bg-gray-100 text-gray-500 p-4 text-center">
                    <MapPin className="h-8 w-8 mb-2 opacity-50" />
                    <p className="mb-4">{error}</p>
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                        Open in Google Maps
                    </a>
                </div>
            ) : (
                <>
                    <div ref={mapRef} className="w-full h-full min-h-[400px]" />

                    {routeInfo && (
                        <div className="absolute bottom-4 left-4 right-4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between z-10">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Estimated Travel</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-gray-900">{routeInfo.duration}</span>
                                    <span className="text-sm font-medium text-gray-600">({routeInfo.distance})</span>
                                </div>
                            </div>
                            <div className="bg-primary/10 p-3 rounded-full">
                                <Navigation className="text-primary h-6 w-6" />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
