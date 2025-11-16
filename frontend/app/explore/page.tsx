'use client'

import { Navbar } from '@/components/navbar'
import { VendorCard } from '@/components/vendor-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapListToggle } from '@/components/map-list-toggle'
import { VendorMap } from '@/components/vendor-map'
import { MapPin, Search, ChefHat, Flame, Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useUserLocation } from '@/lib/useUserLocation'

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null)

  const [vendors, setVendors] = useState<any[]>([])
  const [loadingVendors, setLoadingVendors] = useState<boolean>(true)

  // use location hook
  const { location, loading: loadingLocation, error: locationError } = useUserLocation()

  useEffect(() => {
    let mounted = true
    const fetchNearby = async (lat: number, lng: number, radiusMeters = 2000) => {
      setLoadingVendors(true)
      try {
        const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
        const url = `${backendBase.replace(/\/$/, '')}/api/vendors/search?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius=${encodeURIComponent(radiusMeters)}`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`Search failed: ${res.status}`)
        const data = await res.json()
        // handle both shapes: { vendors: [...] } or [...] or { source, vendors }
        const vendorsList = Array.isArray(data) ? data : (data.vendors || data || data?.vendors)
        if (mounted) setVendors(vendorsList || [])
      } catch (err) {
        console.error('Error fetching nearby vendors:', err)
        // Fallback: try to fetch all vendors if location search fails
        try {
          const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
          const res = await fetch(`${backendBase}/api/vendors/all`)
          if (res.ok) {
            const data = await res.json()
            const vendorsList = Array.isArray(data) ? data : []
            if (mounted) setVendors(vendorsList)
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr)
        if (mounted) setVendors([])
        }
      } finally {
        if (mounted) setLoadingVendors(false)
      }
    }

    // Only call backend search when we have a location (cookie or freshly obtained)
    if (!loadingLocation && location) {
      fetchNearby(location.lat, location.lng)
    } else if (!loadingLocation && !location) {
      // If no location, fetch all vendors
      const fetchAll = async () => {
        setLoadingVendors(true)
        try {
          const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
          const res = await fetch(`${backendBase}/api/vendors/all`)
          if (res.ok) {
            const data = await res.json()
            const vendorsList = Array.isArray(data) ? data : []
            if (mounted) setVendors(vendorsList)
          }
        } catch (err) {
          console.error('Error fetching all vendors:', err)
          if (mounted) setVendors([])
        } finally {
          if (mounted) setLoadingVendors(false)
        }
      }
      fetchAll()
    }

    return () => { mounted = false }
  }, [location, loadingLocation, locationError])

  const cuisineFilters = [
    { id: 'all', label: 'All Cuisines' },
    { id: 'mexican', label: 'Mexican' },
    { id: 'indian', label: 'Indian' },
    { id: 'asian', label: 'Asian' },
    { id: 'middle-east', label: 'Middle Eastern' },
  ]

  // filter from Firestore-backed vendors
  const filteredVendors = vendors.filter(vendor =>
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vendor.cuisine || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Browse Vendors</p>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4 text-balance">
              Explore Street Food <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Near You</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Discover {vendors.length}+ amazing street food vendors in your area</p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Input
                placeholder="Search vendors or cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 text-base border-2 border-primary/20 focus:border-primary rounded-xl"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" size={20} />
            </div>
          </div>

          {/* View Toggle and Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="mb-6">
              <MapListToggle onViewChange={setViewMode} />
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-end">
              {cuisineFilters.map((filter) => (
                <Button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  variant={selectedFilter === filter.id ? 'default' : 'outline'}
                  className={selectedFilter === filter.id ? 'bg-primary text-white font-semibold' : 'border-primary/20 text-foreground hover:border-primary/40'}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Results</h2>
              <p className="text-muted-foreground">{filteredVendors.length} vendors found</p>
            </div>
          </div>
          
          {viewMode === 'map' ? (
            // use filtered vendors on the map (search + filters apply)
            <VendorMap vendors={filteredVendors} onVendorSelect={(v) => setSelectedVendor(v)} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredVendors.map((vendor) => (
                <VendorCard key={vendor.id} {...vendor} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-background/70">
          <p>&copy; 2025 StreetBite. Celebrating street food culture worldwide.</p>
        </div>
      </footer>
    </div>
  )
}
