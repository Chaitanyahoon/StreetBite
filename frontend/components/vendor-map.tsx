'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useUserLocation } from '@/lib/useUserLocation'
import { MapPin } from 'lucide-react'

type Vendor = {
  id: string | number
  name: string
  latitude?: number
  longitude?: number
  cuisine?: string
  description?: string
  image?: string
}

export function VendorMap({ vendors = [], onVendorSelect }: { vendors: Vendor[], onVendorSelect?: (v: Vendor) => void }) {
  const { location: userLocation } = useUserLocation()
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const infoWindowRef = useRef<any>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for API key
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!key) {
      setError('Google Maps API key not configured')
      console.warn('Google Maps API key is not set. Map functionality disabled.')
      return
    }

    // If already loaded
    if ((window as any).google && (window as any).google.maps) {
      setLoaded(true)
      return
    }

    // Add script
    const id = 'gmaps-sdk'
    if (!document.getElementById(id)) {
      const script = document.createElement('script')
      script.id = id
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}`
      script.async = true
      script.defer = true
      script.onload = () => {
        setLoaded(true)
        setError(null)
      }
      script.onerror = () => {
        setError('Failed to load Google Maps. Please check your API key.')
        console.error('Failed to load Google Maps script - API key may be invalid or expired')
      }
      document.head.appendChild(script)
    } else {
      // script exists but may not be loaded yet
      setTimeout(() => {
        if ((window as any).google && (window as any).google.maps) {
          setLoaded(true)
        }
      }, 500)
    }
  }, [])

  // initialize map when SDK loaded and container ready
  useEffect(() => {
    if (!loaded || !mapRef.current) return

    const gm = (window as any).google?.maps
    if (!gm) {
      console.error('google.maps not available after load')
      return
    }

    // Only create map if it doesn't exist
    if (!mapInstance.current) {
      // determine center - prioritize user location, then first vendor, then default
      let center = { lat: 40.7128, lng: -74.0060 } // Default: New York
      
      if (userLocation) {
        // Use user's current location as center
        center = { lat: userLocation.lat, lng: userLocation.lng }
      } else if (vendors && vendors.length > 0 && vendors[0].latitude && vendors[0].longitude) {
        // Fallback to first vendor location
        center = { lat: Number(vendors[0].latitude), lng: Number(vendors[0].longitude) }
      }

    // create map instance
    mapInstance.current = new gm.Map(mapRef.current, {
        center: center,
        zoom: userLocation ? 14 : 13, // Zoom in more if we have user location
    })

    infoWindowRef.current = new gm.InfoWindow()
    }

    return () => {
      // Don't cleanup on every render, only on unmount
    }
  }, [loaded])

  // Update map center when user location changes
  useEffect(() => {
    if (!mapInstance.current || !userLocation) return
    
    const gm = (window as any).google?.maps
    if (!gm) return

    // Update map center to user location
    mapInstance.current.setCenter({ lat: userLocation.lat, lng: userLocation.lng })
    mapInstance.current.setZoom(14)
  }, [userLocation])

  // update markers when vendors or map change
  useEffect(() => {
    const gm = (window as any).google?.maps
    if (!gm || !mapInstance.current) return

    // remove previous markers (except user marker if we want to keep it)
    markersRef.current.forEach(m => {
      try { m.setMap(null) } catch (e) {}
    })
    markersRef.current = []

    // Add user location marker first (so it's on top)
    if (userLocation) {
      const userMarker = new gm.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map: mapInstance.current,
        title: 'Your Location',
        icon: {
          path: gm.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2,
        },
        zIndex: 1000, // Ensure user marker is on top
      })
      markersRef.current.push(userMarker)
    }

    vendors.forEach((v) => {
      if (v.latitude == null || v.longitude == null) return
      const position = { lat: Number(v.latitude), lng: Number(v.longitude) }
      const marker = new gm.Marker({
        position,
        map: mapInstance.current,
        title: v.name,
      })

      marker.addListener('click', () => {
        // build simple info window content
        const content = `
          <div style="max-width:240px;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
            <strong style="font-size:14px">${escapeHtml(String(v.name))}</strong>
            ${v.cuisine ? `<div style="font-size:12px;color:#666;margin-top:4px">${escapeHtml(String(v.cuisine))}</div>` : ''}
            ${v.description ? `<div style="font-size:12px;color:#444;margin-top:6px">${escapeHtml(String(v.description))}</div>` : ''}
          </div>
        `
        try {
          infoWindowRef.current && infoWindowRef.current.setContent(content)
          infoWindowRef.current && infoWindowRef.current.open({ map: mapInstance.current, anchor: marker })
        } catch (e) {}
        onVendorSelect && onVendorSelect(v)
      })

      markersRef.current.push(marker)
    })

    // Adjust bounds to fit markers (and user location if available)
    if (markersRef.current.length > 0) {
      const bounds = new gm.LatLngBounds()
      markersRef.current.forEach(m => {
        try {
          bounds.extend(m.getPosition())
        } catch (e) {
          // Ignore errors
        }
      })
      // Also include user location in bounds if available
      if (userLocation) {
        bounds.extend({ lat: userLocation.lat, lng: userLocation.lng })
      }
      mapInstance.current.fitBounds(bounds)
      // Add padding to bounds
      mapInstance.current.fitBounds(bounds, { padding: 50 })
    } else if (userLocation) {
      // If no vendors but we have user location, center on user
      mapInstance.current.setCenter({ lat: userLocation.lat, lng: userLocation.lng })
      mapInstance.current.setZoom(14)
    }
  }, [vendors, loaded, onVendorSelect, userLocation])

  return (
    <div>
      {error ? (
        <div className="flex flex-col items-center justify-center h-[600px] bg-muted/30 rounded-lg border-2 border-dashed border-border">
          <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-semibold text-foreground mb-2">Map Unavailable</p>
          <p className="text-sm text-muted-foreground max-w-md text-center px-4">
            {error}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Please configure a valid Google Maps API key in your environment variables.
          </p>
        </div>
      ) : (
        <>
          <div ref={mapRef} style={{ width: '100%', height: 600 }} className="rounded-lg overflow-hidden border border-border" />
          {!loaded && <div className="text-center text-sm text-muted-foreground mt-2">Loading map...</div>}
        </>
      )}
    </div>
  )
}

// utility to avoid injection in InfoWindow content
function escapeHtml(str: string) {
  return str.replace(/[&<>"'`=\/]/g, function (s) {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    } as any)[s]
  })
}

export default VendorMap
