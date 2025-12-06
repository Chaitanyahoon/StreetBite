'use client'

import { Navbar } from '@/components/navbar'
import { VendorCard } from '@/components/vendor-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapListToggle } from '@/components/map-list-toggle'
import { VendorMap } from '@/components/vendor-map'
import { VendorDetailsSheet } from '@/components/vendor-details-sheet'
import { MapPin, Search, ChefHat, Flame, Star, Sparkles, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useUserLocation } from '@/lib/useUserLocation'
import { vendorApi, favoriteApi } from '@/lib/api'
import { Footer } from '@/components/footer'

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedVendor, setSelectedVendor] = useState<any | null>(null)

  const [vendors, setVendors] = useState<any[]>([])
  const [loadingVendors, setLoadingVendors] = useState<boolean>(true)
  const [favorites, setFavorites] = useState<any[]>([])

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const data = await favoriteApi.getUserFavorites()
        if (Array.isArray(data)) {
          setFavorites(data)
        }
      } catch (error) {
        console.error('Error fetching favorites:', error)
      }
    }
    fetchFavorites()
  }, [])

  // use location hook
  const { location, loading: loadingLocation, error: locationError } = useUserLocation()

  // Helper for distance calculation
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    let mounted = true

    const fetchVendors = async () => {
      setLoadingVendors(true)
      try {
        // Always fetch all vendors to ensure visibility regardless of location
        const data = await vendorApi.getAll()
        let vendorsList = Array.isArray(data) ? data : (data.vendors || data || [])

        // Filter out non-public vendors (PENDING, REJECTED, SUSPENDED, UNAVAILABLE)
        vendorsList = vendorsList.filter((v: any) =>
          v.status === 'APPROVED' ||
          v.status === 'AVAILABLE' ||
          v.status === 'BUSY'
        )

        // If we have user location, sort by distance
        if (location && vendorsList.length > 0) {
          vendorsList = vendorsList.map((v: any) => {
            if (v.latitude && v.longitude) {
              const dist = calculateDistance(location.lat, location.lng, v.latitude, v.longitude)
              return { ...v, distance: dist }
            }
            return { ...v, distance: Infinity }
          }).sort((a: any, b: any) => a.distance - b.distance)
        }

        if (mounted) setVendors(vendorsList)
      } catch (err) {
        console.error('Error fetching vendors:', err)
        if (mounted) setVendors([])
      } finally {
        if (mounted) setLoadingVendors(false)
      }
    }

    fetchVendors()

    return () => { mounted = false }
  }, [location])

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
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float -z-10" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '1s' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6 animate-scale-in">
              <Sparkles className="w-4 h-4" />
              BROWSE VENDORS
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 text-balance">
              Explore Street Food <br />
              <span className="text-shine-amber">Near You</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover {vendors.length}+ amazing street food vendors serving authentic flavors in your area
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="relative group search-bar">
              <Input
                placeholder="Search vendors or cuisines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-4 py-6 text-lg border-2 border-primary/10 focus:border-primary rounded-full shadow-soft group-hover:shadow-elevated transition-all bg-white/80 backdrop-blur-sm"
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors" size={24} />
            </div>
          </div>

          {/* View Toggle and Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="mb-6">
              <MapListToggle onViewChange={setViewMode} />
            </div>

            <div className="flex flex-wrap gap-3 justify-center md:justify-end">
              {cuisineFilters.map((filter) => (
                <Button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  variant={selectedFilter === filter.id ? 'default' : 'outline'}
                  className={`rounded-full px-6 transition-all hover-lift ${selectedFilter === filter.id
                    ? 'btn-gradient border-none shadow-md'
                    : 'border-primary/20 text-foreground hover:border-primary/40 hover:bg-primary/5'
                    }`}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="py-12 px-6 bg-gradient-to-b from-transparent to-muted/20">
        <div className="max-w-7xl mx-auto">

          {/* Favorites Section */}
          {favorites.length > 0 && !searchTerm && selectedFilter === 'all' && (
            <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 mb-6">
                <Heart className="text-red-500 fill-red-500 w-6 h-6" />
                Your Favorites
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {favorites.map((vendor, index) => (
                  <div key={vendor.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <div className="card-tilt hover-lift h-full">
                      <VendorCard id={vendor.id} {...vendor} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-12 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Flame className="text-primary w-6 h-6" />
                Top Results
              </h2>
              <p className="text-muted-foreground">{filteredVendors.length} vendors found</p>
            </div>
          </div>

          {viewMode === 'map' ? (
            // use filtered vendors on the map (search + filters apply)
            <div className="rounded-3xl overflow-hidden shadow-elevated border-4 border-white">
              <VendorMap vendors={filteredVendors} onVendorSelect={(v) => setSelectedVendor(v)} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredVendors.map((vendor, index) => (
                <div key={vendor.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-tilt hover-lift h-full">
                    <VendorCard id={vendor.id} {...vendor} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Vendor Details Sheet - only render when selectedVendor exists */}
      {selectedVendor && (
        <VendorDetailsSheet
          vendor={selectedVendor}
          open={!!selectedVendor}
          onOpenChange={(open) => !open && setSelectedVendor(null)}
          onFavoriteToggle={(vendorId, isFavorite) => {
            if (isFavorite) {
              favoriteApi.getUserFavorites().then(data => setFavorites(data || []))
            } else {
              setFavorites(prev => prev.filter(v => String(v.id) !== String(vendorId)))
            }
          }}
        />
      )}
    </div>
  )
}
