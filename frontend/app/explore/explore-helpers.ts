'use client'

import type { ApiVendor } from '@/lib/api'

export type ViewMode = 'list' | 'map'
export type QuickFilter = 'all' | 'open-now' | 'nearby' | 'favorites'
export type SortMode = 'recommended' | 'nearest' | 'top-rated' | 'most-reviewed'

export interface ExploreVendor {
  id: string | number
  slug?: string
  name: string
  cuisine?: string
  rating?: number
  distance?: number
  image?: string
  displayImageUrl?: string
  reviews?: number
  tags?: string[]
  latitude?: number
  longitude?: number
  description?: string
  status?: string
  isOnline?: boolean
  isAcceptingOrders?: boolean
}

export const QUICK_FILTERS: Array<{ id: QuickFilter; label: string }> = [
  { id: 'all', label: 'All spots' },
  { id: 'open-now', label: 'Open now' },
  { id: 'nearby', label: 'Nearby' },
  { id: 'favorites', label: 'Favorites' },
]

export const SORT_OPTIONS: Array<{ id: SortMode; label: string }> = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'nearest', label: 'Nearest' },
  { id: 'top-rated', label: 'Top rated' },
  { id: 'most-reviewed', label: 'Most reviewed' },
]

export const PUBLIC_VENDOR_STATUSES = new Set(['APPROVED', 'AVAILABLE', 'BUSY'])
export const OPEN_VENDOR_STATUSES = new Set(['AVAILABLE', 'BUSY'])

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return earthRadiusKm * c
}

export function normalizeVendor(vendor: ApiVendor, location?: { lat: number; lng: number } | null): ExploreVendor {
  const latitude = typeof vendor.latitude === 'number' ? vendor.latitude : Number(vendor.latitude)
  const longitude = typeof vendor.longitude === 'number' ? vendor.longitude : Number(vendor.longitude)
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude)
  const distance =
    location && hasCoordinates
      ? calculateDistance(location.lat, location.lng, latitude, longitude)
      : undefined

  return {
    id: vendor.id,
    slug: vendor.slug,
    name: vendor.name ?? 'Street food vendor',
    cuisine: vendor.cuisine ?? 'Street Food',
    rating: typeof vendor.rating === 'number' ? vendor.rating : Number(vendor.rating) || 0,
    distance,
    image: vendor.image,
    displayImageUrl: vendor.displayImageUrl,
    reviews: typeof vendor.reviews === 'number' ? vendor.reviews : Number(vendor.reviews) || 0,
    tags: Array.isArray(vendor.tags) ? vendor.tags : [],
    latitude: hasCoordinates ? latitude : undefined,
    longitude: hasCoordinates ? longitude : undefined,
    description: vendor.description,
    status: vendor.status,
    isOnline: OPEN_VENDOR_STATUSES.has(vendor.status || ''),
    isAcceptingOrders: vendor.status === 'AVAILABLE',
  }
}

export function getCuisineFilters(vendors: ExploreVendor[]) {
  return [
    'all',
    ...Array.from(
      new Set(
        vendors
          .map((vendor) => vendor.cuisine?.trim())
          .filter((cuisine): cuisine is string => Boolean(cuisine))
      )
    ).slice(0, 8),
  ]
}

export function filterVendors(
  vendors: ExploreVendor[],
  deferredSearchTerm: string,
  selectedCuisine: string,
  selectedQuickFilter: QuickFilter,
  favoriteIds: Set<string>
) {
  return vendors.filter((vendor) => {
    const query = deferredSearchTerm.toLowerCase().trim()
    const matchesSearch =
      query.length === 0 ||
      vendor.name.toLowerCase().includes(query) ||
      (vendor.cuisine || '').toLowerCase().includes(query) ||
      (vendor.tags || []).some((tag) => tag.toLowerCase().includes(query))

    const matchesCuisine =
      selectedCuisine === 'all' ||
      (vendor.cuisine || '').toLowerCase() === selectedCuisine.toLowerCase()

    const matchesQuickFilter =
      selectedQuickFilter === 'all' ||
      (selectedQuickFilter === 'open-now' && OPEN_VENDOR_STATUSES.has(vendor.status || '')) ||
      (selectedQuickFilter === 'nearby' &&
        typeof vendor.distance === 'number' &&
        Number.isFinite(vendor.distance) &&
        vendor.distance <= 3.5) ||
      (selectedQuickFilter === 'favorites' && favoriteIds.has(String(vendor.id)))

    return matchesSearch && matchesCuisine && matchesQuickFilter
  })
}

export function sortVendors(
  vendors: ExploreVendor[],
  selectedSort: SortMode,
  favoriteIds: Set<string>
) {
  return [...vendors].sort((a, b) => {
    if (selectedSort === 'nearest') {
      return (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY)
    }

    if (selectedSort === 'top-rated') {
      return (b.rating ?? 0) - (a.rating ?? 0)
    }

    if (selectedSort === 'most-reviewed') {
      return (b.reviews ?? 0) - (a.reviews ?? 0)
    }

    const favoriteScoreA = favoriteIds.has(String(a.id)) ? 1 : 0
    const favoriteScoreB = favoriteIds.has(String(b.id)) ? 1 : 0
    const openScoreA = OPEN_VENDOR_STATUSES.has(a.status || '') ? 1 : 0
    const openScoreB = OPEN_VENDOR_STATUSES.has(b.status || '') ? 1 : 0

    return (
      favoriteScoreB - favoriteScoreA ||
      openScoreB - openScoreA ||
      (b.rating ?? 0) - (a.rating ?? 0) ||
      (b.reviews ?? 0) - (a.reviews ?? 0) ||
      (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY)
    )
  })
}

export function getLocationSummary(
  loadingLocation: boolean,
  location: { lat: number; lng: number } | null,
  locationError: string | null | undefined
) {
  if (loadingLocation) return 'Checking your location'
  if (location) return 'Using your location for nearby sorting'
  if (locationError) return 'Location unavailable, showing all public vendors'
  return 'Location not shared, showing all public vendors'
}
