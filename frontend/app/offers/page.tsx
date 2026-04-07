'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Flame,
  Clock3,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { promotionApi } from '@/lib/api'
import { useCityName } from '@/hooks/use-city-name'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { BreadcrumbListSchema } from '@/components/seo/breadcrumb-schema'
import { CollectionPageSchema } from '@/components/seo/collection-page-schema'
import {
  buildPromotionCards,
  filterPromotions,
  getCuisineOptions,
  sortPromotions,
  type Promotion,
  type PromotionCardModel,
  type PromotionFilterType,
  type PromotionSort,
} from './offers-helpers'
import {
  FeaturedDealSection,
  OffersFiltersPanel,
  OffersHeroStats,
  OffersResults,
  PromotionCard,
} from './offers-sections'

export default function OffersPage() {
  const { cityName, loading: loadingCity } = useCityName()
  const [copiedCode, setCopiedCode] = useState<string | number | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<PromotionFilterType>('all')
  const [sortBy, setSortBy] = useState<PromotionSort>('best_match')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('All')
  const [nearbyOnly, setNearbyOnly] = useState(false)

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await promotionApi.getAllActive()
        setPromotions(data || [])
      } catch (fetchError) {
        console.error('Error fetching promotions:', fetchError)
        setPromotions([])
      } finally {
        setLoading(false)
      }
    }

    fetchPromotions()
  }, [])

  useEffect(() => {
    if (!cityName.trim()) {
      setNearbyOnly(false)
    }
  }, [cityName])

  const activeCity = cityName.trim()

  const promotionCards = useMemo<PromotionCardModel[]>(() => {
    return buildPromotionCards(promotions, activeCity)
  }, [activeCity, promotions])

  const cuisines = useMemo(() => getCuisineOptions(promotionCards), [promotionCards])

  const filteredPromotions = useMemo(() => {
    return filterPromotions(promotionCards, filterType, selectedCuisine, nearbyOnly, searchQuery)
  }, [filterType, nearbyOnly, promotionCards, searchQuery, selectedCuisine])

  const sortedPromotions = useMemo(() => {
    return sortPromotions(filteredPromotions, sortBy)
  }, [filteredPromotions, sortBy])

  const featuredDeal =
    !loading && !searchQuery && selectedCuisine === 'All' && filterType === 'all' && sortedPromotions.length > 0
      ? sortedPromotions[0]
      : null

  const visiblePromotions = featuredDeal
    ? sortedPromotions.filter((promo) => promo.id !== featuredDeal.id)
    : sortedPromotions

  const nearYouPromotions = activeCity
    ? visiblePromotions.filter((promo) => promo.isNearCity)
    : []

  const morePromotions = activeCity
    ? visiblePromotions.filter((promo) => !promo.isNearCity)
    : visiblePromotions

  const urgentCount = promotionCards.filter(
    (promo) => promo.urgencyTone === 'critical' || promo.urgencyTone === 'warning'
  ).length

  const copyToClipboard = async (code: string, id: string | number) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (copyError) {
      console.error('Failed to copy promo code:', copyError)
    }
  }

  const renderGrid = (items: PromotionCardModel[]) => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {items.map((promo) => (
        <PromotionCard
          key={promo.id}
          promo={promo}
          copiedCode={copiedCode}
          onCopy={copyToClipboard}
        />
      ))}
    </div>
  )

  return (
    <div className="min-h-screen">
      <BreadcrumbListSchema
        items={[
          { name: 'Home', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streetbitego.vercel.app'}` },
          { name: 'Offers', item: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://streetbitego.vercel.app'}/offers` },
        ]}
      />
      <CollectionPageSchema
        name="StreetBite Offers"
        description="Browse active local street food deals, promo codes, and limited-time vendor offers on StreetBite."
        url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://streetbitego.vercel.app'}/offers`}
      />
      <Navbar />

      <OffersHeroStats
        activeCity={activeCity}
        loadingCity={loadingCity}
        promotionCount={promotionCards.length}
        urgentCount={urgentCount}
        nearbyCount={nearYouPromotions.length + (featuredDeal?.isNearCity ? 1 : 0)}
        nearbyOnly={nearbyOnly}
      />

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl">
          <FeaturedDealSection
            activeCity={activeCity}
            copiedCode={copiedCode}
            featuredDeal={featuredDeal}
            onCopy={copyToClipboard}
          />

          <OffersFiltersPanel
            activeCity={activeCity}
            cuisines={cuisines}
            filterType={filterType}
            nearbyOnly={nearbyOnly}
            searchQuery={searchQuery}
            selectedCuisine={selectedCuisine}
            sortBy={sortBy}
            sortedCount={sortedPromotions.length}
            onClear={() => {
              setFilterType('all')
              setSelectedCuisine('All')
              setSearchQuery('')
              setNearbyOnly(false)
            }}
            onFilterTypeChange={setFilterType}
            onNearbyToggle={() => activeCity && setNearbyOnly((value) => !value)}
            onSearchChange={setSearchQuery}
            onSelectedCuisineChange={setSelectedCuisine}
            onSortChange={setSortBy}
          />

          <OffersResults
            activeCity={activeCity}
            loading={loading}
            morePromotions={morePromotions}
            nearYouPromotions={nearYouPromotions}
            renderGrid={renderGrid}
            onResetFilters={() => {
              setFilterType('all')
              setSelectedCuisine('All')
              setSearchQuery('')
              setNearbyOnly(false)
            }}
          />
        </div>
      </section>

      <Footer />
    </div>
  )
}
