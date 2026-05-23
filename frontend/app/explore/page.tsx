'use client'

import dynamic from 'next/dynamic'
import Form from 'next/form'
import { Suspense } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useDeferredValue, useEffect, useRef, useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { VendorCard } from '@/components/vendor-card'
import { VendorCardSkeleton } from '@/components/vendor-card-skeleton'
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
  ChevronDown,
  Flame,
  Heart,
  LoaderCircle,
  MapPin,
  Search,
  SlidersHorizontal,
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
      <div className="flex h-[350px] sm:h-[450px] md:h-[600px] w-full items-center justify-center rounded-[1.75rem] border border-black/10 bg-white/70">
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
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

  const activeFilterCount = [
    searchTerm.length > 0,
    selectedCuisine !== 'all',
    selectedQuickFilter !== 'all',
    selectedSort !== 'recommended',
  ].filter(Boolean).length

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
    setShowAdvancedFilters(false)
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

      <section className="relative overflow-hidden px-4 pb-16 pt-20 md:px-6 md:pb-24 md:pt-28">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-8%] top-8 h-56 w-56 rounded-[4rem] border-4 border-black/12 bg-orange-300/20 blur-2xl md:h-72 md:w-72" />
          <div className="absolute right-[6%] top-14 h-28 w-28 rotate-12 rounded-[2rem] border-4 border-black/12 bg-yellow-300/35 shadow-[var(--shadow-soft)] md:h-40 md:w-40" />
          <div className="absolute bottom-20 left-[8%] h-20 w-20 -rotate-12 rounded-full border-4 border-black/10 bg-teal-200/45 shadow-[var(--shadow-soft)] md:h-28 md:w-28" />
          <div className="absolute bottom-6 right-[-4%] h-60 w-60 rounded-full bg-orange-200/25 blur-3xl md:h-80 md:w-80" />
          <div className="absolute inset-x-0 top-0 h-px bg-black/10" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="text-center animate-slide-up">
            <div className="mt-8 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border-2 border-black bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-[0.62rem] sm:text-[0.72rem] font-black uppercase tracking-[0.2em] sm:tracking-[0.24em] text-black shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              Explore the streets
            </div>
            <h1 className="mt-6 sm:mt-8 text-[2rem] xs:text-4xl leading-[1.0] sm:leading-[0.9] font-black tracking-[-0.06em] text-black sm:text-6xl md:text-8xl lg:text-9xl">
              FIND YOUR
              <br />
              <span className="relative inline-block mt-2 text-primary drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                NEXT BITE
              </span>
            </h1>
            <p className="mx-auto mt-4 sm:mt-8 max-w-2xl text-xs xs:text-sm sm:text-lg md:text-2xl font-bold leading-relaxed sm:leading-8 text-black/72">
              Search with intent, sort by what matters, and keep the best nearby vendors in view without losing the street-food energy.
            </p>
            <div className="mt-6 sm:mt-10 flex justify-center px-2">
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/recommend')}
                className="group h-11 sm:h-16 w-full max-w-md rounded-xl sm:rounded-[2rem] border-[2.5px] sm:border-4 border-black bg-yellow-300 text-xs sm:text-lg font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:bg-black hover:text-white"
              >
                <Flame className="mr-1.5 sm:mr-3 h-4 w-4 sm:h-6 sm:w-6 text-orange-500 group-hover:animate-pulse" />
                Can't decide? Try the AI Quiz
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="-mt-6 sm:-mt-10 px-3 sm:px-6 pb-10">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl sm:rounded-[2rem] border-[2.5px] sm:border-4 border-black bg-[#fff8ef] p-3 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <Form
              action={pathname}
              onSubmit={() => {
                setViewMode('list')
                resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="flex flex-col gap-2.5 sm:gap-3 lg:flex-row lg:items-center"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 sm:left-4 top-1/2 h-4 w-4 sm:h-5 sm:w-5 -translate-y-1/2 text-black/45" />
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
                  className="h-11 sm:h-13 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black bg-white pl-8 sm:pl-12 pr-8 sm:pr-11 text-xs sm:text-base font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
                    className="absolute right-2 sm:right-3 top-1/2 flex h-7 w-7 sm:h-8 sm:w-8 -translate-y-1/2 items-center justify-center rounded-full text-black/45 hover:bg-black/5 hover:text-black"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>

              <div className="flex flex-row gap-2 w-full lg:w-auto items-center justify-between sm:justify-start">
                <Button type="submit" size="lg" className="h-11 sm:h-13 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black bg-black px-4 sm:px-6 text-xs sm:text-sm font-black uppercase tracking-[0.14em] text-white shadow-[2px_2px_0px_0px_var(--primary)] sm:shadow-[4px_4px_0px_0px_var(--primary)] hover:bg-primary flex-1 sm:flex-initial shrink-0 hover:translate-y-[-2px] active:translate-y-[2px] active:shadow-none transition-all">
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

            <div className="mt-3.5 flex flex-col gap-3.5 border-t-2 border-black/15 pt-3.5">
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-1.5 text-[9px] xs:text-xs font-bold uppercase tracking-[0.16em] text-black/60">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  {locationSummary}
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFilters((value) => !value)}
                    className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] xs:text-xs font-black uppercase tracking-[0.16em] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {showAdvancedFilters ? 'Hide filters' : 'Filters'}
                    {activeFilterCount > 0 ? (
                      <span className="inline-flex min-w-5 h-5 items-center justify-center rounded-full bg-yellow-300 px-1 py-0.5 text-[0.6rem] text-black font-black">
                        {activeFilterCount}
                      </span>
                    ) : null}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                  </button>

                  <div className="flex items-center gap-1 sm:gap-1.5 rounded-full border-2 border-black bg-white px-2.5 py-1 sm:px-3 sm:py-2 text-[10px] xs:text-xs font-black uppercase tracking-[0.16em] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none">
                    <ArrowUpDown className="h-3.5 w-3.5 text-black" />
                    <select
                      className="bg-transparent text-[10px] xs:text-xs font-black uppercase tracking-[0.16em] text-black outline-none cursor-pointer"
                      value={selectedSort}
                      onChange={(event) => {
                        const nextSort = event.target.value as SortMode
                        setSelectedSort(nextSort)
                        replaceExploreQuery({ sort: nextSort })
                      }}
                    >
                      {SORT_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id} className="bg-white text-black font-semibold">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {hasActiveFilters ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleResetFilters}
                      className="h-8 sm:h-10 rounded-full border-2 border-black px-3 sm:px-4 text-[9px] xs:text-[10px] sm:text-[0.68rem] font-black uppercase tracking-[0.16em] shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 active:translate-y-[2px] active:translate-x-[2px] active:shadow-none"
                    >
                      Reset
                    </Button>
                  ) : null}
                </div>
              </div>

              {showAdvancedFilters ? (
                <div className="rounded-xl sm:rounded-2xl border-2 sm:border-3 border-black bg-white p-3.5 sm:p-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <div className="flex flex-col gap-3.5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-[0.18em] text-black/70">
                        <ArrowUpDown className="h-3.5 w-3.5" />
                        Sort by
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none snap-x">
                        {SORT_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setSelectedSort(option.id)
                              replaceExploreQuery({ sort: option.id })
                            }}
                            className={`rounded-full px-3 py-1 sm:px-4 sm:py-2 text-[9px] xs:text-xs font-black uppercase tracking-[0.16em] transition-all shrink-0 whitespace-nowrap snap-center ${
                              selectedSort === option.id
                                ? 'border-2 border-black bg-black text-white shadow-[2px_2px_0px_0px_var(--primary)] sm:shadow-[3px_3px_0px_0px_var(--primary)]'
                                : 'border-2 border-black bg-white text-black/70 hover:bg-orange-50 hover:text-black hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-[0.18em] text-black/70">
                        <Flame className="h-3.5 w-3.5" />
                        Quick filters
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none snap-x">
                        {QUICK_FILTERS.map((filter) => (
                          <button
                            key={filter.id}
                            type="button"
                            onClick={() => {
                              setSelectedQuickFilter(filter.id)
                              replaceExploreQuery({ filter: filter.id })
                            }}
                            className={`rounded-full px-3 py-1 sm:px-4 sm:py-2 text-[9px] xs:text-xs font-black uppercase tracking-[0.16em] transition-all shrink-0 whitespace-nowrap snap-center ${
                              selectedQuickFilter === filter.id
                                ? 'border-2 border-black bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                : 'border-2 border-black bg-white text-black/70 hover:bg-orange-50 hover:text-black hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[0.62rem] sm:text-[0.68rem] font-black uppercase tracking-[0.18em] text-black/70">
                        <Sparkles className="h-3.5 w-3.5" />
                        Cuisines
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none snap-x">
                        {cuisineFilters.map((filter) => (
                          <button
                            key={filter}
                            type="button"
                            onClick={() => {
                              setSelectedCuisine(filter)
                              replaceExploreQuery({ cuisine: filter })
                            }}
                            className={`rounded-full px-3 py-1 sm:px-4 sm:py-2 text-[9px] xs:text-xs font-black uppercase tracking-[0.16em] transition-all shrink-0 whitespace-nowrap snap-center ${
                              selectedCuisine === filter
                                ? 'border-2 border-black bg-black text-yellow-300 shadow-[2px_2px_0px_0px_rgba(251,191,36,1)] sm:shadow-[3px_3px_0px_0px_rgba(251,191,36,1)]'
                                : 'border-2 border-black bg-white text-black/70 hover:bg-orange-50 hover:text-black hover:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:translate-y-[1px] active:translate-x-[1px] active:shadow-none'
                            }`}
                          >
                            {filter === 'all' ? 'All cuisines' : filter}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section ref={resultsRef} className="px-3 sm:px-6 pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl">
          {showFavoritesPreview ? (
            <div className="mb-10 sm:mb-14">
              <div className="mb-6 sm:mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 sm:gap-4">
                  <div className="rounded-xl sm:rounded-2xl bg-red-500 p-1.5 sm:p-3 text-white shadow-[var(--shadow-soft)] shrink-0">
                    <Heart className="h-4.5 w-4.5 sm:h-6 sm:w-6 fill-white" />
                  </div>
                  <div>
                    <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-black leading-tight">Your favorites</h2>
                    <p className="mt-0.5 sm:mt-1 text-[9px] xs:text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-black/55 leading-tight">
                      Quick access to the stalls you keep coming back to
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
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

          <div className="mb-6 sm:mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-xl xs:text-2xl sm:text-3xl font-black text-black md:text-4xl flex flex-wrap items-center gap-1.5 sm:gap-2 leading-tight">
                Top spots
                <span className="rounded-full border-2 border-black bg-black px-2 py-0.5 text-[0.62rem] xs:text-[0.68rem] sm:text-xs font-black uppercase tracking-[0.14em] sm:tracking-[0.18em] text-white shadow-[1.5px_1.5px_0px_0px_rgba(251,191,36,1)] sm:shadow-[3px_3px_0px_0px_rgba(251,191,36,1)] inline-flex items-center shrink-0">
                  {sortedVendors.length} results
                </span>
              </h2>
              <p className="mt-1 sm:mt-2 text-[10px] xs:text-xs sm:text-sm font-semibold uppercase tracking-[0.12em] sm:tracking-[0.14em] text-black/55 leading-tight">
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
                className="h-9 rounded-full px-4 text-xs font-black uppercase tracking-[0.16em]"
              >
                Reset filters
              </Button>
            ) : null}
          </div>

          {viewMode === 'map' ? (
            <div className="overflow-hidden rounded-[1.75rem] border-[3px] sm:border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <VendorMap vendors={sortedVendors} onVendorSelect={(vendor) => setSelectedVendor(vendor as ExploreVendor)} />
            </div>
          ) : loadingVendors ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <VendorCardSkeleton key={index} />
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
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
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
