'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  CheckCircle,
  Clock3,
  Copy,
  Filter,
  Flame,
  LocateFixed,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Tag,
  TicketPercent,
} from 'lucide-react'
import { promotionApi } from '@/lib/api'
import { useCityName } from '@/hooks/use-city-name'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { BreadcrumbListSchema } from '@/components/seo/breadcrumb-schema'
import { CollectionPageSchema } from '@/components/seo/collection-page-schema'

interface Vendor {
  id: number | string
  slug?: string
  name: string
  rating?: number
  displayImageUrl?: string
  address?: string
  cuisine?: string
}

interface Promotion {
  id: number | string
  vendor?: Vendor
  title: string
  description?: string
  discountType: string
  discountValue: number
  promoCode: string
  startDate?: string
  endDate?: string
  isActive?: boolean
  maxUses?: number
  currentUses?: number
  minOrderValue?: number
}

type PromotionCardModel = Promotion & {
  isNearCity: boolean
  expiryLabel: string
  urgencyLabel: string
  urgencyTone: 'critical' | 'warning' | 'calm' | 'expired'
  expirySortValue: number
  locationLabel: string
}

function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? ''
}

function getDiscountText(promo: Promotion) {
  if (promo.discountType === 'PERCENTAGE') {
    return `${promo.discountValue}% OFF`
  }

  if (promo.discountType === 'FIXED_AMOUNT' || promo.discountType === 'FIXED') {
    return `₹${promo.discountValue} OFF`
  }

  return 'SPECIAL OFFER'
}

function getLocationLabel(address?: string) {
  if (!address?.trim()) {
    return 'Street food pickup'
  }

  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length >= 2) {
    return parts.slice(-2).join(', ')
  }

  return parts[0]
}

function getExpiryMeta(endDate?: string) {
  if (!endDate) {
    return {
      expiryLabel: 'No expiry',
      urgencyLabel: 'Ongoing deal',
      urgencyTone: 'calm' as const,
      expirySortValue: Number.MAX_SAFE_INTEGER,
    }
  }

  const expiryTime = new Date(endDate).getTime()
  if (Number.isNaN(expiryTime)) {
    return {
      expiryLabel: 'Date unavailable',
      urgencyLabel: 'Check vendor details',
      urgencyTone: 'calm' as const,
      expirySortValue: Number.MAX_SAFE_INTEGER,
    }
  }

  const diffMs = expiryTime - Date.now()
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60))
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffMs <= 0) {
    return {
      expiryLabel: 'Expired',
      urgencyLabel: 'Offer ended',
      urgencyTone: 'expired' as const,
      expirySortValue: Number.MAX_SAFE_INTEGER - 1,
    }
  }

  if (diffHours <= 6) {
    return {
      expiryLabel: `${diffHours}h left`,
      urgencyLabel: 'Use this soon',
      urgencyTone: 'critical' as const,
      expirySortValue: diffMs,
    }
  }

  if (diffHours <= 24) {
    return {
      expiryLabel: 'Ends today',
      urgencyLabel: 'Best redeemed today',
      urgencyTone: 'critical' as const,
      expirySortValue: diffMs,
    }
  }

  if (diffDays <= 3) {
    return {
      expiryLabel: `${diffDays} day${diffDays > 1 ? 's' : ''} left`,
      urgencyLabel: 'Limited-time offer',
      urgencyTone: 'warning' as const,
      expirySortValue: diffMs,
    }
  }

  return {
    expiryLabel: `Ends in ${diffDays} days`,
    urgencyLabel: 'Still active',
    urgencyTone: 'calm' as const,
    expirySortValue: diffMs,
  }
}

function matchesSelectedType(promo: Promotion, filterType: 'all' | 'percentage' | 'fixed') {
  if (filterType === 'all') return true
  if (filterType === 'percentage') return promo.discountType === 'PERCENTAGE'
  return promo.discountType === 'FIXED_AMOUNT' || promo.discountType === 'FIXED'
}

function PromotionCard({
  promo,
  copiedCode,
  onCopy,
}: {
  promo: PromotionCardModel
  copiedCode: string | number | null
  onCopy: (code: string, id: string | number) => void
}) {
  const urgencyStyles =
    promo.urgencyTone === 'critical'
      ? 'border-red-500 bg-red-100 text-red-700'
      : promo.urgencyTone === 'warning'
        ? 'border-orange-500 bg-orange-100 text-orange-700'
        : promo.urgencyTone === 'expired'
          ? 'border-zinc-400 bg-zinc-100 text-zinc-500'
          : 'border-emerald-500 bg-emerald-100 text-emerald-700'

  return (
    <article className="group relative h-full">
      <div className="absolute inset-0 rounded-[2rem] bg-black translate-x-2 translate-y-2 transition-transform duration-200 group-hover:translate-x-3 group-hover:translate-y-3" />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border-4 border-black bg-white transition-transform duration-200 group-hover:-translate-y-1">
        <div className="border-b-4 border-black bg-[#fff8dd] p-5">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[1.1rem] border-4 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              {promo.vendor?.displayImageUrl ? (
                <img
                  src={promo.vendor.displayImageUrl}
                  alt={promo.vendor.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Store className="h-8 w-8 text-black" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {promo.isNearCity && (
                  <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-teal-300 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] text-black">
                    <LocateFixed className="h-3.5 w-3.5" />
                    Near you
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-[0.16em] ${urgencyStyles}`}>
                  <Clock3 className="h-3.5 w-3.5" />
                  {promo.expiryLabel}
                </span>
              </div>

              <h2 className="mt-3 line-clamp-1 text-xl font-black text-black md:text-2xl">
                {promo.vendor?.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-bold text-black/60">
                {promo.vendor?.rating ? (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {promo.vendor.rating.toFixed(1)}
                  </span>
                ) : null}
                {promo.vendor?.cuisine ? <span>{promo.vendor.cuisine}</span> : null}
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-black/55">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="line-clamp-1">{promo.locationLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border-3 border-black bg-black px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-yellow-300">
              <TicketPercent className="h-4 w-4" />
              {promo.discountType === 'PERCENTAGE' ? 'Percent deal' : 'Flat savings'}
            </span>
            {promo.minOrderValue ? (
              <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-black/70">
                Min order ₹{promo.minOrderValue}
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            <p className="text-[2rem] font-black leading-none text-black sm:text-[2.4rem]">
              {getDiscountText(promo)}
            </p>
            <h3 className="mt-3 line-clamp-2 text-lg font-black text-black">
              {promo.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-black/65">
              {promo.description || promo.urgencyLabel}
            </p>
          </div>

          <div className="mt-5 rounded-[1.3rem] border-3 border-dashed border-black/20 bg-black/[0.03] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-black/45">
                  Promo code
                </p>
                <code className="mt-1 block truncate text-lg font-black tracking-[0.2em] text-black">
                  {promo.promoCode}
                </code>
              </div>
              <button
                type="button"
                onClick={() => onCopy(promo.promoCode, promo.id)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-white text-black transition-transform hover:-translate-y-0.5"
                aria-label={`Copy ${promo.promoCode}`}
              >
                {copiedCode === promo.id ? (
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 text-sm font-bold text-black/60">
            <span>{promo.currentUses ?? 0} used</span>
            {promo.maxUses ? <span>{Math.max(promo.maxUses - (promo.currentUses ?? 0), 0)} left</span> : null}
          </div>

          <div className="mt-5">
            {promo.vendor?.id ? (
              <Link href={`/vendors/${promo.vendor.slug || promo.vendor.id}`} className="block">
                <Button className="h-13 w-full rounded-2xl border-4 border-black bg-black text-sm font-black uppercase tracking-[0.16em] text-white shadow-[3px_3px_0px_0px_rgba(249,115,22,1)] transition-all hover:bg-primary hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                  Redeem now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                className="h-13 w-full rounded-2xl border-4 border-zinc-300 bg-zinc-100 font-black uppercase tracking-[0.16em] text-zinc-400"
              >
                Unavailable
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

export default function OffersPage() {
  const { cityName, loading: loadingCity } = useCityName()
  const [copiedCode, setCopiedCode] = useState<string | number | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed'>('all')
  const [sortBy, setSortBy] = useState<'best_match' | 'newest' | 'ending_soon' | 'highest_discount'>('best_match')
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
    return promotions.map((promo) => {
      const expiryMeta = getExpiryMeta(promo.endDate)
      const isNearCity = activeCity
        ? normalizeText(promo.vendor?.address).includes(normalizeText(activeCity))
        : false

      return {
        ...promo,
        isNearCity,
        locationLabel: getLocationLabel(promo.vendor?.address),
        ...expiryMeta,
      }
    })
  }, [activeCity, promotions])

  const cuisines = useMemo(
    () =>
      ['All', ...Array.from(new Set(promotionCards.map((promo) => promo.vendor?.cuisine).filter(Boolean)))] as string[],
    [promotionCards]
  )

  const filteredPromotions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return promotionCards.filter((promo) => {
      if (!matchesSelectedType(promo, filterType)) return false
      if (selectedCuisine !== 'All' && promo.vendor?.cuisine !== selectedCuisine) return false
      if (nearbyOnly && !promo.isNearCity) return false

      if (!query) return true

      return [
        promo.title,
        promo.description,
        promo.vendor?.name,
        promo.promoCode,
        promo.vendor?.address,
        promo.vendor?.cuisine,
      ]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(query))
    })
  }, [filterType, nearbyOnly, promotionCards, searchQuery, selectedCuisine])

  const sortedPromotions = useMemo(() => {
    const items = [...filteredPromotions]

    items.sort((a, b) => {
      if (sortBy === 'highest_discount') {
        if (b.discountValue !== a.discountValue) return b.discountValue - a.discountValue
      } else if (sortBy === 'ending_soon') {
        if (a.expirySortValue !== b.expirySortValue) return a.expirySortValue - b.expirySortValue
      } else if (sortBy === 'newest') {
        if (b.id !== a.id) return Number(b.id) - Number(a.id)
      } else {
        if (a.isNearCity !== b.isNearCity) return a.isNearCity ? -1 : 1
        if (a.expirySortValue !== b.expirySortValue) return a.expirySortValue - b.expirySortValue
        if (b.discountValue !== a.discountValue) return b.discountValue - a.discountValue
      }

      if (a.isNearCity !== b.isNearCity) return a.isNearCity ? -1 : 1
      if (a.expirySortValue !== b.expirySortValue) return a.expirySortValue - b.expirySortValue
      if (b.discountValue !== a.discountValue) return b.discountValue - a.discountValue
      return Number(b.id) - Number(a.id)
    })

    return items
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

      <section className="relative overflow-hidden px-4 pb-12 pt-24">
        <div className="absolute right-0 top-20 -z-10 h-[420px] w-[420px] rounded-full bg-orange-400/35 blur-[90px]" />
        <div className="absolute left-0 top-40 -z-10 h-[300px] w-[300px] rounded-full bg-yellow-300/40 blur-[90px]" />

        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-yellow-400 bg-black px-5 py-2 text-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Flame className="h-5 w-5 fill-yellow-400" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Fresh drops and limited codes</span>
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.9] tracking-[-0.06em] text-black md:text-7xl lg:text-8xl">
              STREET FOOD
              <br />
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                OFFERS THAT HIT
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg font-bold leading-8 text-black/72 md:text-2xl">
              {activeCity
                ? `Curated deals in ${activeCity}, with expiring offers pushed to the front.`
                : 'Save on local favorites, catch expiring promo codes, and find the deals worth using today.'}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border-3 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[var(--shadow-soft)]">
                <MapPin className="h-4 w-4 text-primary" />
                {loadingCity ? 'Locating your city' : activeCity ? activeCity : 'All cities'}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border-3 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[var(--shadow-soft)]">
                <Clock3 className="h-4 w-4 text-primary" />
                {urgentCount} ending soon
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border-3 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[var(--shadow-soft)]">
                <Sparkles className="h-4 w-4 text-primary" />
                {promotionCards.length} active offers
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.8rem] border-4 border-black bg-white px-5 py-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-black/45">Near you</p>
              <p className="mt-3 text-3xl font-black text-black">{activeCity ? nearYouPromotions.length + (featuredDeal?.isNearCity ? 1 : 0) : 0}</p>
              <p className="mt-2 text-sm font-semibold text-black/65">
                {activeCity ? `Offers matching ${activeCity}` : 'Enable a city to see local offers first'}
              </p>
            </div>
            <div className="rounded-[1.8rem] border-4 border-black bg-white px-5 py-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:-translate-y-2">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-black/45">Use first</p>
              <p className="mt-3 text-3xl font-black text-black">{urgentCount}</p>
              <p className="mt-2 text-sm font-semibold text-black/65">
                Deals closing in the next three days
              </p>
            </div>
            <div className="rounded-[1.8rem] border-4 border-black bg-white px-5 py-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-black/45">Filter mode</p>
              <p className="mt-3 text-3xl font-black text-black">
                {nearbyOnly ? 'Nearby' : 'All'}
              </p>
              <p className="mt-2 text-sm font-semibold text-black/65">
                Switch between local-first and broader discovery
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-7xl">
          {featuredDeal && (
            <div className="relative mb-12">
              <div className="absolute inset-0 rounded-[2.4rem] bg-black translate-x-3 translate-y-3" />
              <div className="relative overflow-hidden rounded-[2.4rem] border-4 border-black bg-orange-500">
                <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="relative p-6 md:p-10">
                    <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-yellow-300 px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Star className="h-4 w-4 fill-black text-black" />
                      Featured right now
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {featuredDeal.isNearCity && (
                        <span className="rounded-full border-2 border-black bg-teal-300 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-black">
                          Near {activeCity}
                        </span>
                      )}
                      <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-black">
                        {featuredDeal.expiryLabel}
                      </span>
                    </div>

                    <p className="mt-6 text-5xl font-black leading-none text-white drop-shadow-[3px_3px_0px_rgba(0,0,0,0.5)] md:text-7xl">
                      {getDiscountText(featuredDeal)}
                    </p>
                    <h2 className="mt-4 max-w-3xl text-3xl font-black text-black md:text-4xl">
                      {featuredDeal.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-base font-bold leading-7 text-black/72 md:text-lg">
                      {featuredDeal.description}
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm font-bold text-black/72">
                      <span>{featuredDeal.vendor?.name}</span>
                      <span>{featuredDeal.locationLabel}</span>
                      {featuredDeal.vendor?.cuisine ? <span>{featuredDeal.vendor.cuisine}</span> : null}
                    </div>

                    <div className="mt-7 flex max-w-xl items-center justify-between gap-4 rounded-[1.4rem] border-4 border-black bg-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                      <div className="min-w-0">
                        <p className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-black/45">
                          Use this code
                        </p>
                        <code className="mt-1 block truncate text-2xl font-black tracking-[0.24em] text-black md:text-3xl">
                          {featuredDeal.promoCode}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(featuredDeal.promoCode, featuredDeal.id)}
                        className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-black text-yellow-300 transition-transform hover:-translate-y-0.5"
                        aria-label={`Copy ${featuredDeal.promoCode}`}
                      >
                        {copiedCode === featuredDeal.id ? <CheckCircle className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                      </button>
                    </div>
                  </div>

                  <div className="relative min-h-[260px] border-t-4 border-black lg:border-l-4 lg:border-t-0">
                    {featuredDeal.vendor?.displayImageUrl ? (
                      <img
                        src={featuredDeal.vendor.displayImageUrl}
                        alt={featuredDeal.vendor.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-[260px] items-center justify-center bg-black/10">
                        <Store className="h-20 w-20 text-black/30" />
                      </div>
                    )}

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-5">
                      <Link href={`/vendors/${featuredDeal.vendor?.slug || featuredDeal.vendor?.id}`}>
                        <Button className="h-14 w-full rounded-2xl border-4 border-black bg-yellow-300 font-black uppercase tracking-[0.16em] text-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-yellow-200">
                          Redeem featured offer
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mb-10 rounded-[2rem] border-4 border-black bg-white p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_220px]">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Filter className="h-5 w-5 text-black" />
                </div>
                <input
                  type="text"
                  className="h-14 w-full rounded-2xl border-4 border-black bg-[#fffaf0] pl-12 pr-4 text-base font-bold text-black placeholder:text-black/35 focus:outline-none"
                  placeholder="Search vendors, promo codes, or dishes"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>

              <div className="flex items-center rounded-2xl border-4 border-black bg-[#fffaf0] px-4">
                <SlidersHorizontal className="mr-2 h-5 w-5 text-black" />
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                  className="h-14 w-full cursor-pointer bg-transparent text-base font-black text-black focus:outline-none"
                >
                  <option value="best_match">Best match</option>
                  <option value="ending_soon">Ending soon</option>
                  <option value="highest_discount">Highest discount</option>
                  <option value="newest">Newest added</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border-2 border-black bg-black px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.2em] text-yellow-300">
                Offer type
              </span>
              {(['all', 'percentage', 'fixed'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  className={`rounded-full border-3 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5 ${
                    filterType === type
                      ? 'border-black bg-orange-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                      : 'border-black bg-white text-black'
                  }`}
                >
                  {type === 'all' ? 'All offers' : type === 'percentage' ? 'Percent deals' : 'Flat savings'}
                </button>
              ))}

              <button
                type="button"
                onClick={() => activeCity && setNearbyOnly((value) => !value)}
                disabled={!activeCity}
                className={`rounded-full border-3 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] transition-transform ${
                  nearbyOnly
                    ? 'border-black bg-teal-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                    : 'border-black bg-white text-black'
                } ${!activeCity ? 'cursor-not-allowed opacity-50' : 'hover:-translate-y-0.5'}`}
              >
                Near me
              </button>
            </div>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-2">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`whitespace-nowrap rounded-full border-3 px-4 py-2 text-sm font-black uppercase tracking-[0.14em] transition-transform hover:-translate-y-0.5 ${
                    selectedCuisine === cuisine
                      ? 'border-black bg-black text-yellow-300 shadow-[3px_3px_0px_0px_rgba(251,191,36,1)]'
                      : 'border-black bg-[#fffaf0] text-black'
                  }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-black/15 pt-4">
              <p className="text-sm font-bold text-black/65">
                {sortedPromotions.length} offer{sortedPromotions.length === 1 ? '' : 's'} ready to use
                {activeCity ? ` in and around ${activeCity}` : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {(filterType !== 'all' || selectedCuisine !== 'All' || searchQuery || nearbyOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setFilterType('all')
                      setSelectedCuisine('All')
                      setSearchQuery('')
                      setNearbyOnly(false)
                    }}
                    className="rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-black"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-8 border-black border-t-yellow-400" />
              <p className="text-2xl font-black uppercase text-black">Hunting for fresh deals...</p>
            </div>
          ) : sortedPromotions.length === 0 ? (
            <div className="rounded-[2rem] border-4 border-dashed border-black bg-white px-6 py-16 text-center">
              <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-black bg-[#fff8dd]">
                <Tag className="h-10 w-10 text-black/35" />
              </div>
              <h3 className="text-3xl font-black uppercase text-black">No matching deals</h3>
              <p className="mx-auto mt-3 max-w-xl text-lg font-semibold text-black/60">
                Try switching city filters, clearing the search, or broadening the offer type.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('all')
                    setSelectedCuisine('All')
                    setSearchQuery('')
                    setNearbyOnly(false)
                  }}
                  className="rounded-full border-4 border-black bg-black px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-white"
                >
                  Reset all filters
                </button>
                <Link href="/explore">
                  <Button className="rounded-full border-4 border-black bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black hover:bg-yellow-200">
                    Browse vendors
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-14">
              {activeCity && nearYouPromotions.length > 0 && (
                <section>
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-black/45">City-first picks</p>
                      <h2 className="mt-2 text-3xl font-black text-black md:text-4xl">
                        Near {activeCity}
                      </h2>
                      <p className="mt-2 text-base font-semibold text-black/65">
                        Local deals that match your city first, with expiring codes pushed up.
                      </p>
                    </div>
                    <div className="rounded-full border-3 border-black bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.16em] text-black shadow-[var(--shadow-soft)]">
                      {nearYouPromotions.length} nearby offer{nearYouPromotions.length === 1 ? '' : 's'}
                    </div>
                  </div>
                  {renderGrid(nearYouPromotions)}
                </section>
              )}

              {morePromotions.length > 0 && (
                <section>
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-black/45">
                        {activeCity ? 'More to explore' : 'All live offers'}
                      </p>
                      <h2 className="mt-2 text-3xl font-black text-black md:text-4xl">
                        {activeCity ? 'Worth traveling for' : 'Fresh promo codes'}
                      </h2>
                      <p className="mt-2 text-base font-semibold text-black/65">
                        {activeCity
                          ? 'Broader street-food offers outside your current city match.'
                          : 'Sorted by urgency and value so the best offers stay visible first.'}
                      </p>
                    </div>
                  </div>
                  {renderGrid(morePromotions)}
                </section>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
