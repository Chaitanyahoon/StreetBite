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
      } catch (error: any) {
        // Suppress 401 errors (expected if token expired)
        if (error.response?.status !== 401) {
          console.error('Error fetching favorites:', error)
        }
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
    <div className="min-h-screen bg-[#FADFA1] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-sm font-black tracking-wider mb-8 shadow-[4px_4px_0px_0px_rgba(234,179,8,1)] border-2 border-black transform hover:-translate-y-1 transition-transform">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              EXPLORE THE STREETS
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-black mb-8 leading-[0.9] tracking-tighter">
              Discover Local <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                Street Flavors
              </span>
            </h1>
            <p className="text-2xl text-black font-bold max-w-2xl mx-auto leading-relaxed">
              Find <span className="inline-block px-2 bg-yellow-300 border-2 border-black rounded transform -rotate-2">{vendors.length}+</span> authentic vendors serving happiness near you!
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-16 animate-scale-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-black rounded-full translate-x-2 translate-y-2"></div>
              <div className="relative flex items-center bg-white rounded-full border-4 border-black p-2 transition-transform group-hover:-translate-y-1">
                <Search className="ml-4 w-8 h-8 text-black" strokeWidth={3} />
                <Input
                  placeholder="Search for tacos, pani puri, burgers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-none text-xl font-bold placeholder:text-gray-400 focus-visible:ring-0 h-14 bg-transparent"
                />
                <Button className="rounded-full px-8 h-14 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg border-l-4 border-black rounded-l-none">
                  SEARCH
                </Button>
              </div>
            </div>
          </div>

          {/* View Toggle and Filters */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="bg-white p-2 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <MapListToggle onViewChange={setViewMode} />
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {cuisineFilters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-6 py-3 rounded-xl font-black border-4 border-black transition-all transform hover:-translate-y-1 ${selectedFilter === filter.id
                      ? 'bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(200,200,200,1)]'
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vendors Grid */}
      <section className="py-12 px-4 pb-32">
        <div className="max-w-7xl mx-auto">

          {/* Favorites Section */}
          {favorites.length > 0 && !searchTerm && selectedFilter === 'all' && (
            <div className="mb-20">
              <h2 className="text-4xl font-black text-black flex items-center gap-4 mb-10 transform -rotate-1">
                <div className="bg-red-500 p-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Heart className="text-white fill-white w-8 h-8" />
                </div>
                Your Favorites
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {favorites.map((vendor, index) => (
                  <div key={vendor.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <VendorCard id={vendor.id} {...vendor} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-4xl font-black text-black flex items-center gap-4">
              <div className="bg-orange-500 p-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Flame className="text-white w-8 h-8 animate-bounce-slow" />
              </div>
              Top Spots
            </h2>
            <div className="hidden md:block px-4 py-2 bg-black text-white font-bold rounded-lg transform rotate-2">
              {filteredVendors.length} results found
            </div>
          </div>

          {viewMode === 'map' ? (
            <div className="rounded-3xl overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black h-[600px] bg-white">
              <VendorMap vendors={filteredVendors} onVendorSelect={(v) => setSelectedVendor(v)} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredVendors.map((vendor, index) => (
                <div key={vendor.id} className="hover:z-10 transition-all duration-300">
                  <VendorCard id={vendor.id} {...vendor} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {/* Vendor Details Sheet */}
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
