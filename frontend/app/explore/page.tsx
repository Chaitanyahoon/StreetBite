'use client'

import dynamic from 'next/dynamic'
import Form from 'next/form'
import { Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { VendorCard } from '@/components/vendor-card'
import { MapListToggle } from '@/components/map-list-toggle'
import { BreadcrumbListSchema } from '@/components/seo/breadcrumb-schema'
import { CollectionPageSchema } from '@/components/seo/collection-page-schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { favoriteApi, vendorApi } from '@/lib/api'
import { useUserLocation } from '@/lib/useUserLocation'
import { useAuth } from '@/context/AuthContext'
import {
  ArrowUpDown,
  Flame,
  Heart,
  LoaderCircle,
  MapPin,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react'
import {
  OPEN_VENDOR_STATUSES,
  PUBLIC_VENDOR_STATUSES,
  QUICK_FILTERS,
  SORT_OPTIONS,
  filterVendors,
  getCuisineFilters,
  getLocationSummary,
  normalizeVendor,
  sortVendors,
  type ExploreVendor,
  type QuickFilter,
  type SortMode,
  type ViewMode,
} from './explore-helpers'

const VendorMap = dynamic(
  () => import('@/components/vendor-map').then((m) => m.VendorMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[70vh] w-full items-center justify-center rounded-[1.75rem] border border-black/10 bg-white/70">
        <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.16em] text-black/55">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          Loading map
        </div>
      </div>
    ),
  },
)

const VendorDetailsSheet = dynamic(
  () => import('@/components/vendor-details-sheet').then((m) => m.VendorDetailsSheet),
  { ssr: false },
)

function ExplorePageContent() {
  const { isLoggedIn } = useAuth()
  const { location, loading: loadingLocation, error: locationError } = useUserLocation()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const resultsRef = useRef<HTMLElement | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const deferredSearchTerm = useDeferredValue(searchTerm)
  const [selectedCuisine, setSelectedCuisine] = useState('all')
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<QuickFilter>('all')
  const [selectedSort, setSelectedSort] = useState<SortMode>('recommended')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedVendor, setSelectedVendor] = useState<ExploreVendor | null>(null)
  const [vendors, setVendors] = useState<ExploreVendor[]>([])
  const [favorites, setFavorites] = useState<ExploreVendor[]>([])
  const [loadingVendors, setLoadingVendors] = useState(true)

  useEffect(() => {
    const query = searchParams.get('q')?.trim() ?? ''
    const cuisine = searchParams.get('cuisine')?.trim() ?? 'all'
    const filter = searchParams.get('filter')
    const sort = searchParams.get('sort')
    const view = searchParams.get('view')

    setSearchInput(query)
    setSearchTerm(query)
    setSelectedCuisine(cuisine || 'all')
    setSelectedQuickFilter(
      filter && QUICK_FILTERS.some((option) => option.id === filter)
        ? (filter as QuickFilter)
        : 'all',
    )
    setSelectedSort(
      sort && SORT_OPTIONS.some((option) => option.id === sort)
        ? (sort as SortMode)
        : 'recommended',
    )
    setViewMode(
      view === 'map' || view === 'list'
        ? view
        : 'list',
    )
  }, [searchParams])

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) {
        setFavorites([])
        return
      }

      try {
        const data = await favoriteApi.getUserFavorites()
        if (Array.isArray(data)) {
          setFavorites(data.map((vendor) => normalizeVendor(vendor, location)))
        }
      } catch (error: any) {
        if (error.response?.status !== 401) {
          console.error('Error fetching favorites:', error)
        }
      }
    }

    fetchFavorites()
  }, [isLoggedIn, location])

  useEffect(() => {
    let mounted = true

    const fetchVendors = async () => {
      setLoadingVendors(true)
      try {
        const data = await vendorApi.getAll()
        const vendorList = Array.isArray(data) ? data : []

        const publicVendors = vendorList
          .filter((vendor) => PUBLIC_VENDOR_STATUSES.has(vendor.status || ''))
          .map((vendor) => normalizeVendor(vendor, location))

        if (mounted) {
          setVendors(publicVendors)
        }
      } catch (error) {
        console.error('Error fetching vendors:', error)
        if (mounted) {
          setVendors([])
        }
      } finally {
        if (mounted) {
          setLoadingVendors(false)
        }
      }
    }

    fetchVendors()

    return () => {
      mounted = false
    }
  }, [location])

  const favoriteIds = new Set(favorites.map((vendor) => String(vendor.id)))

  const cuisineFilters = getCuisineFilters(vendors)

  const filteredVendors = filterVendors(
    vendors,
    deferredSearchTerm,
    selectedCuisine,
    selectedQuickFilter,
    favoriteIds
  )

  const sortedVendors = sortVendors(filteredVendors, selectedSort, favoriteIds)

  const favoritesPreview = favorites
    .filter((vendor) => PUBLIC_VENDOR_STATUSES.has(vendor.status || 'APPROVED'))
    .slice(0, 4)

  const hasActiveFilters =
    searchTerm.length > 0 || selectedCuisine !== 'all' || selectedQuickFilter !== 'all' || selectedSort !== 'recommended'

  const locationSummary = getLocationSummary(loadingLocation, location, locationError)

  const replaceExploreQuery = (updates: Record<string, string | undefined>) => {
    const nextParams = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(updates)) {
      if (!value || value === 'all' || value === 'recommended' || value === 'list') {
        nextParams.delete(key)
      } else {
        nextParams.set(key, value)
      }
    }

    const nextQuery = nextParams.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false })
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setSelectedCuisine('all')
    setSelectedQuickFilter('all')
    setSelectedSort('recommended')
    setViewMode('list')
    router.replace(pathname, { scroll: false })
  }

  const showFavoritesPreview =
    favoritesPreview.length > 0 &&
    !hasActiveFilters &&
    viewMode === 'list'

  return (
    <div className="min-h-screen">
      <BreadcrumbListSchema
        items={[
          { name: 'Home', item: 'https://streetbitego.vercel.app' },
          { name: 'Explore', item: 'https://streetbitego.vercel.app/explore' },
        ]}
      />
      <CollectionPageSchema
        name="StreetBite Explore"
        description="Explore nearby street food vendors by cuisine, rating, distance, and live stall status."
        url="https://streetbitego.vercel.app/explore"
      />
      <Navbar />

      <section className="relative overflow-hidden px-4 py-24 md:px-6 md:py-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-8%] top-8 h-56 w-56 rounded-[4rem] border-4 border-black/12 bg-orange-300/20 blur-2xl md:h-72 md:w-72" />
          <div className="absolute right-[6%] top-14 h-28 w-28 rotate-12 rounded-[2rem] border-4 border-black/12 bg-yellow-300/35 shadow-[var(--shadow-soft)] md:h-40 md:w-40" />
          <div className="absolute bottom-20 left-[8%] h-20 w-20 -rotate-12 rounded-full border-4 border-black/10 bg-teal-200/45 shadow-[var(--shadow-soft)] md:h-28 md:w-28" />
          <div className="absolute bottom-6 right-[-4%] h-60 w-60 rounded-full bg-orange-200/25 blur-3xl md:h-80 md:w-80" />
          <div className="absolute inset-x-0 top-0 h-px bg-black/10" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              Explore the streets
            </div>
            <h1 className="mt-8 text-5xl leading-[0.9] font-black tracking-[-0.06em] text-black sm:text-6xl md:text-8xl lg:text-9xl">
              FIND YOUR
              <br />
              <span className="relative inline-block mt-2 text-primary drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                NEXT BITE
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg font-bold leading-8 text-black/72 md:text-2xl">
              Search with intent, sort by what matters, and keep the best nearby vendors in view without losing the street-food energy.
            </p>
          </div>
        </div>
      </section>

      <section className="sticky top-16 z-30 -mt-10 px-4 pb-8 md:top-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] border-4 border-black bg-[#fff8ef] p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-5">
            <Form
              action={pathname}
              onSubmit={() => {
                setViewMode('list')
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="flex flex-col gap-3 lg:flex-row lg:items-center"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-black/45" />
                <Input
                  name="q"
                  placeholder="Search vendors, cuisines, or tags"
                  value={searchInput}
                  onChange={(event) => {
                    const nextValue = event.target.value
                    setSearchInput(nextValue)
                    if (nextValue.trim().length === 0) {
                      setSearchTerm('')
                      replaceExploreQuery({ q: undefined })
                    }
                  }}
                  className="h-13 rounded-2xl border-4 border-black bg-white pl-12 pr-11 text-base font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
                <input type="hidden" name="cuisine" value={selectedCuisine === 'all' ? '' : selectedCuisine} />
                <input type="hidden" name="filter" value={selectedQuickFilter === 'all' ? '' : selectedQuickFilter} />
                <input type="hidden" name="sort" value={selectedSort === 'recommended' ? '' : selectedSort} />
                <input type="hidden" name="view" value="" />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('')
                      setSearchTerm('')
                      replaceExploreQuery({ q: undefined })
                    }}
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-black/45 hover:bg-black/5 hover:text-black"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button type="submit" size="lg" className="h-13 rounded-2xl border-4 border-black bg-black px-6 font-black uppercase tracking-[0.14em] text-white shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] hover:bg-primary">
                  Search
                </Button>
                <MapListToggle
                  value={viewMode}
                  onViewChange={(nextView) => {
                    setViewMode(nextView)
                    replaceExploreQuery({ view: nextView })
                  }}
                />
              </div>
            </Form>

            <div className="mt-4 flex flex-col gap-4 border-t-2 border-black/15 pt-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-black px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[3px_3px_0px_0px_rgba(251,191,36,1)]">
                    <Flame className="h-4 w-4 text-primary" />
                    {sortedVendors.length} results
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-black/60">
                    <MapPin className="h-4 w-4 text-primary" />
                    {locationSummary}
                  </div>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-black/55">
                    <ArrowUpDown className="h-4 w-4" />
                    Sort
                  </div>
                  {SORT_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        setSelectedSort(option.id)
                        replaceExploreQuery({ sort: option.id })
                      }}
                      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-all ${
                        selectedSort === option.id
                          ? 'border-2 border-black bg-black text-white shadow-[3px_3px_0px_0px_rgba(249,115,22,1)]'
                          : 'border-2 border-black bg-white text-black/60 hover:bg-yellow-100 hover:text-black'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {QUICK_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => {
                        setSelectedQuickFilter(filter.id)
                        replaceExploreQuery({ filter: filter.id })
                      }}
                      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-all ${
                        selectedQuickFilter === filter.id
                          ? 'border-2 border-black bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                          : 'border-2 border-black bg-white text-black/60 hover:bg-yellow-100'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {cuisineFilters.map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => {
                        setSelectedCuisine(filter)
                        replaceExploreQuery({ cuisine: filter })
                      }}
                      className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition-all ${
                        selectedCuisine === filter
                          ? 'border-2 border-black bg-black text-yellow-300 shadow-[3px_3px_0px_0px_rgba(251,191,36,1)]'
                          : 'border-2 border-black bg-white text-black/55 hover:bg-white hover:text-black'
                      }`}
                    >
                      {filter === 'all' ? 'All cuisines' : filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section ref={resultsRef} className="px-4 pb-32 md:px-6">
        <div className="mx-auto max-w-7xl">
          {showFavoritesPreview ? (
            <div className="mb-14">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-red-500 p-3 text-white shadow-[var(--shadow-soft)]">
                    <Heart className="h-6 w-6 fill-white" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-black">Your favorites</h2>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-black/55">
                      Quick access to the stalls you keep coming back to
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {favoritesPreview.map((vendor, index) => (
                  <div key={vendor.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.06}s` }}>
                    <VendorCard
                      id={String(vendor.id)}
                      slug={vendor.slug}
                      name={vendor.name}
                      cuisine={vendor.cuisine || 'Street Food'}
                      rating={vendor.rating || 0}
                      distance={typeof vendor.distance === 'number' ? vendor.distance.toFixed(1) : 'Nearby'}
                      image={vendor.image}
                      displayImageUrl={vendor.displayImageUrl}
                      reviews={vendor.reviews || 0}
                      tags={vendor.tags || []}
                      priority={index < 2}
                      status={vendor.status}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-3xl font-black text-black md:text-4xl">Top spots</h2>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-black/55">
                {selectedSort === 'recommended'
                  ? 'Balanced by favorites, open status, rating, and proof'
                  : `Sorted by ${selectedSort.replace('-', ' ')}`}
              </p>
            </div>

            {hasActiveFilters ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
                className="h-11 rounded-full px-5 text-xs font-black uppercase tracking-[0.16em]"
              >
                Reset filters
              </Button>
            ) : null}
          </div>

          {viewMode === 'map' ? (
            <div className="overflow-hidden rounded-[1.75rem] border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <VendorMap vendors={sortedVendors} onVendorSelect={(vendor) => setSelectedVendor(vendor as ExploreVendor)} />
            </div>
          ) : loadingVendors ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="h-80 rounded-[1.75rem] border border-black/8 bg-white/60 animate-pulse"
                  style={{ animationDelay: `${index * 0.08}s` }}
                />
              ))}
            </div>
          ) : sortedVendors.length === 0 ? (
            <div className="rounded-[2rem] border-4 border-black bg-white px-6 py-12 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-4 border-black bg-yellow-300 text-black">
                <Search className="h-9 w-9" />
              </div>
              <h3 className="mt-6 text-2xl font-black text-black">No vendors match this setup</h3>
              <p className="mx-auto mt-3 max-w-md text-base font-medium leading-7 text-black/60">
                Broaden the search, switch the sort, or clear the filters to see more live street-food options.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button type="button" onClick={handleResetFilters} className="rounded-full px-6 text-xs font-black uppercase tracking-[0.16em]">
                  Clear all filters
                </Button>
                {!location && selectedQuickFilter === 'nearby' ? (
                  <Button type="button" variant="outline" onClick={() => setSelectedQuickFilter('all')} className="rounded-full px-6 text-xs font-black uppercase tracking-[0.16em]">
                    Remove nearby filter
                  </Button>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              {sortedVendors.map((vendor, index) => (
                <div
                  key={vendor.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.04}s` }}
                >
                  <VendorCard
                    id={String(vendor.id)}
                    slug={vendor.slug}
                    name={vendor.name}
                    cuisine={vendor.cuisine || 'Street Food'}
                    rating={vendor.rating || 0}
                    distance={typeof vendor.distance === 'number' ? vendor.distance.toFixed(1) : 'Nearby'}
                    image={vendor.image}
                    displayImageUrl={vendor.displayImageUrl}
                    reviews={vendor.reviews || 0}
                    tags={vendor.tags || []}
                    priority={index < 4}
                    status={vendor.status}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />

      {selectedVendor ? (
        <VendorDetailsSheet
          vendor={selectedVendor}
          open={Boolean(selectedVendor)}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedVendor(null)
            }
          }}
          onFavoriteToggle={(vendorId, isFavorite) => {
            if (isFavorite) {
              favoriteApi.getUserFavorites().then((data) => {
                const nextFavorites = Array.isArray(data)
                  ? data.map((vendor) => normalizeVendor(vendor, location))
                  : []
                setFavorites(nextFavorites)
              })
            } else {
              setFavorites((prev) => prev.filter((vendor) => String(vendor.id) !== String(vendorId)))
            }
          }}
        />
      ) : null}
    </div>
  )
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <Navbar />
          <main className="px-4 py-28 md:px-6">
            <div className="mx-auto max-w-7xl animate-pulse space-y-6">
              <div className="h-12 w-64 rounded-full bg-white/70" />
              <div className="h-40 rounded-[2rem] bg-white/60" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-80 rounded-[1.75rem] border border-black/8 bg-white/60"
                  />
                ))}
              </div>
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <ExplorePageContent />
    </Suspense>
  )
}
