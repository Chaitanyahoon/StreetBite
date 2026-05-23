'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  CheckCircle,
  Clock3,
  Copy,
  Filter,
  LocateFixed,
  MapPin,
  SlidersHorizontal,
  Sparkles,
  Star,
  Store,
  Tag,
  TicketPercent,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  PROMOTION_SORT_OPTIONS,
  PROMOTION_TYPE_OPTIONS,
  getDiscountText,
  type PromotionCardModel,
  type PromotionFilterType,
  type PromotionSort,
} from './offers-helpers'

export function PromotionCard({
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
      <div className="absolute inset-0 rounded-[1rem] sm:rounded-[2rem] bg-black translate-x-1 translate-y-1 sm:translate-x-1.5 sm:translate-y-1.5 transition-transform duration-200 group-hover:translate-x-2 group-hover:translate-y-2" />
      <div className="relative flex h-full flex-col overflow-hidden rounded-[1rem] sm:rounded-[2rem] border-2 sm:border-4 border-black bg-white transition-transform duration-200 group-hover:-translate-y-1">
        <div className="border-b-2 sm:border-b-4 border-black bg-[#fff8dd] p-3 sm:p-5">
          <div className="flex items-start gap-2.5 sm:gap-4">
            <div className="h-10 w-10 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-[0.6rem] sm:rounded-[1.1rem] border-2 sm:border-4 border-black bg-white shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              {promo.vendor?.displayImageUrl ? (
                <Image
                  src={promo.vendor.displayImageUrl}
                  alt={promo.vendor.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Store className="h-5 w-5 sm:h-8 sm:w-8 text-black" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                {promo.isNearCity && (
                  <span className="inline-flex items-center gap-0.5 rounded-full border-1.5 sm:border-2 border-black bg-teal-300 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[0.55rem] sm:text-[0.65rem] font-black uppercase tracking-[0.1em] sm:tracking-[0.16em] text-black">
                    <LocateFixed className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                    Near you
                  </span>
                )}
                <span className={`inline-flex items-center gap-0.5 rounded-full border-1.5 sm:border-2 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[0.55rem] sm:text-[0.65rem] font-black uppercase tracking-[0.1em] sm:tracking-[0.16em] ${urgencyStyles}`}>
                  <Clock3 className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5" />
                  {promo.expiryLabel}
                </span>
              </div>

              <h2 className="mt-1 sm:mt-3 line-clamp-1 text-sm sm:text-xl font-black text-black md:text-2xl">
                {promo.vendor?.name}
              </h2>
              <div className="mt-0.5 sm:mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] sm:text-sm font-bold text-black/60">
                {promo.vendor?.rating ? (
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {promo.vendor.rating.toFixed(1)}
                  </span>
                ) : null}
                {promo.vendor?.cuisine ? <span>{promo.vendor.cuisine}</span> : null}
              </div>
              <div className="mt-0.5 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-sm font-semibold text-black/55">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                <span className="line-clamp-1">{promo.locationLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-5">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
            <span className="inline-flex items-center gap-1 rounded-full border-2 border-black bg-black px-2 py-0.5 sm:px-3 sm:py-1.5 text-[0.55rem] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.18em] text-yellow-300">
              <TicketPercent className="h-3 w-3 sm:h-4 sm:w-4" />
              {promo.discountType === 'PERCENTAGE' ? 'Percent deal' : 'Flat savings'}
            </span>
            {promo.minOrderValue ? (
              <span className="rounded-full border-1.5 sm:border-2 border-black bg-white px-2 py-0.5 sm:px-3 sm:py-1 text-[0.55rem] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.16em] text-black/70">
                Min ₹{promo.minOrderValue}
              </span>
            ) : null}
          </div>

          <div className="mt-2.5 sm:mt-4">
            <p className="text-xl sm:text-[2rem] md:text-[2.4rem] font-black leading-none text-black">
              {getDiscountText(promo)}
            </p>
            <h3 className="mt-1.5 sm:mt-3 line-clamp-2 text-sm sm:text-lg font-black text-black">
              {promo.title}
            </h3>
            <p className="mt-1 sm:mt-2 line-clamp-2 text-[11px] sm:text-sm font-semibold leading-4 sm:leading-6 text-black/65">
              {promo.description || promo.urgencyLabel}
            </p>
          </div>

          <div className="mt-3 sm:mt-5 rounded-[0.7rem] sm:rounded-[1.3rem] border-2 border-dashed border-black/20 bg-black/[0.03] p-2 sm:p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[0.5rem] sm:text-[0.62rem] font-black uppercase tracking-[0.1em] sm:tracking-[0.18em] text-black/45">
                  Promo code
                </p>
                <code className="mt-0.5 block truncate text-sm sm:text-lg font-black tracking-[0.12em] sm:tracking-[0.2em] text-black">
                  {promo.promoCode}
                </code>
              </div>
              <button
                type="button"
                onClick={() => onCopy(promo.promoCode, promo.id)}
                className="inline-flex h-8 w-8 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-lg sm:rounded-2xl border-2 border-black bg-white text-black transition-all hover:-translate-y-0.5 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                aria-label={`Copy ${promo.promoCode}`}
              >
                {copiedCode === promo.id ? (
                  <CheckCircle className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-emerald-600" />
                ) : (
                  <Copy className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="mt-3 sm:mt-5 flex items-center justify-between gap-2 text-[10px] sm:text-sm font-bold text-black/60">
            <span>{promo.currentUses ?? 0} used</span>
            {promo.maxUses ? <span>{Math.max(promo.maxUses - (promo.currentUses ?? 0), 0)} left</span> : null}
          </div>

          <div className="mt-3 sm:mt-5">
            {promo.vendor?.id ? (
              <Link href={`/vendors/${promo.vendor.slug || promo.vendor.id}`} className="block">
                <Button className="h-9 sm:h-13 w-full rounded-lg sm:rounded-2xl border-2 sm:border-4 border-black bg-black text-[10px] sm:text-sm font-black uppercase tracking-[0.1em] sm:tracking-[0.16em] text-white shadow-[1.5px_1.5px_0px_0px_rgba(249,115,22,1)] sm:shadow-[3px_3px_0px_0px_rgba(249,115,22,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-100">
                  Redeem now
                  <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </Link>
            ) : (
              <Button
                disabled
                className="h-9 sm:h-13 w-full rounded-lg sm:rounded-2xl border-2 sm:border-4 border-zinc-300 bg-zinc-100 text-[10px] sm:text-sm font-black uppercase tracking-[0.1em] sm:tracking-[0.16em] text-zinc-400"
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

export function OffersHeroStats({
  activeCity,
  loadingCity,
  promotionCount,
  urgentCount,
  nearbyCount,
  nearbyOnly,
}: {
  activeCity: string
  loadingCity: boolean
  promotionCount: number
  urgentCount: number
  nearbyCount: number
  nearbyOnly: boolean
}) {
  return (
    <section className="relative overflow-hidden px-4 pb-8 pt-16 sm:pb-12 sm:pt-24">
      <div className="absolute right-0 top-20 -z-10 h-[280px] w-[280px] sm:h-[420px] sm:w-[420px] rounded-full bg-orange-400/35 blur-[60px] sm:blur-[90px]" />
      <div className="absolute left-0 top-40 -z-10 h-[200px] w-[200px] sm:h-[300px] sm:w-[300px] rounded-full bg-yellow-300/40 blur-[60px] sm:blur-[90px]" />

      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border-2 border-yellow-400 bg-black px-4 py-1.5 sm:px-5 sm:py-2 text-yellow-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400" />
            <span className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em]">Fresh drops and limited codes</span>
          </div>

          <h1 className="mt-5 sm:mt-8 text-[2.25rem] sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[1.05] sm:leading-[0.9] tracking-[-0.04em] sm:tracking-[-0.06em] text-black">
            STREET FOOD
            <br />
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              OFFERS THAT HIT
            </span>
          </h1>

          <p className="mx-auto mt-4 sm:mt-6 max-w-3xl text-sm sm:text-lg md:text-2xl font-bold leading-relaxed sm:leading-8 text-black/72">
            {activeCity
              ? `Curated deals in ${activeCity}, with expiring offers pushed to the front.`
              : 'Save on local favorites, catch expiring promo codes, and find the deals worth using today.'}
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border-2 sm:border-3 border-black bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-black shadow-[var(--shadow-soft)]">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              {loadingCity ? 'Locating your city' : activeCity ? activeCity : 'All cities'}
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border-2 sm:border-3 border-black bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-black shadow-[var(--shadow-soft)]">
              <Clock3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              {urgentCount} ending soon
            </div>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border-2 sm:border-3 border-black bg-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-black shadow-[var(--shadow-soft)]">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              {promotionCount} active offers
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-12 grid gap-1.5 sm:gap-4 grid-cols-3">
          <div className="rounded-[0.8rem] sm:rounded-[1.8rem] border-2 sm:border-4 border-black bg-white px-2 py-2.5 sm:px-5 sm:py-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[0.5rem] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.24em] text-black/45">Near you</p>
            <p className="mt-1 sm:mt-3 text-lg sm:text-3xl font-black text-black">{activeCity ? nearbyCount : 0}</p>
            <p className="mt-1.5 text-xs sm:text-sm font-semibold text-black/65 hidden sm:block">
              {activeCity ? `Offers matching ${activeCity}` : 'Enable a city to see local offers first'}
            </p>
          </div>
          <div className="rounded-[0.8rem] sm:rounded-[1.8rem] border-2 sm:border-4 border-black bg-white px-2 py-2.5 sm:px-5 sm:py-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:-translate-y-2">
            <p className="text-[0.5rem] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.24em] text-black/45">Use first</p>
            <p className="mt-1 sm:mt-3 text-lg sm:text-3xl font-black text-black">{urgentCount}</p>
            <p className="mt-1.5 text-xs sm:text-sm font-semibold text-black/65 hidden sm:block">Deals closing in the next three days</p>
          </div>
          <div className="rounded-[0.8rem] sm:rounded-[1.8rem] border-2 sm:border-4 border-black bg-white px-2 py-2.5 sm:px-5 sm:py-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[0.5rem] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.24em] text-black/45">Filter mode</p>
            <p className="mt-1 sm:mt-3 text-lg sm:text-3xl font-black text-black">{nearbyOnly ? 'Nearby' : 'All'}</p>
            <p className="mt-1.5 text-xs sm:text-sm font-semibold text-black/65 hidden sm:block">
              Switch between local-first and broader discovery
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FeaturedDealSection({
  activeCity,
  copiedCode,
  featuredDeal,
  onCopy,
}: {
  activeCity: string
  copiedCode: string | number | null
  featuredDeal: PromotionCardModel | null
  onCopy: (code: string, id: string | number) => void
}) {
  if (!featuredDeal) return null

  return (
    <div className="relative mb-6 sm:mb-12">
      <div className="absolute inset-0 rounded-[1rem] sm:rounded-[2.4rem] bg-black translate-x-1 translate-y-1 sm:translate-x-3 sm:translate-y-3" />
      <div className="relative overflow-hidden rounded-[1rem] sm:rounded-[2.4rem] border-2 sm:border-4 border-black bg-orange-500">
        <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative p-3.5 sm:p-8 md:p-10">
            <div className="inline-flex items-center gap-1 sm:gap-2 rounded-full border border-black bg-yellow-300 px-2 py-0.5 sm:px-4 sm:py-1.5 text-[0.55rem] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.18em] text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-black text-black" />
              Featured right now
            </div>

            <div className="mt-2.5 sm:mt-6 flex flex-wrap gap-1 sm:gap-2">
              {featuredDeal.isNearCity && (
                <span className="rounded-full border-2 border-black bg-teal-300 px-2 py-0.5 sm:px-3 sm:py-1 text-[0.55rem] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.18em] text-black">
                  Near {activeCity}
                </span>
              )}
              <span className="rounded-full border-2 border-black bg-white px-2 py-0.5 sm:px-3 sm:py-1 text-[0.55rem] sm:text-xs font-black uppercase tracking-[0.1em] sm:tracking-[0.18em] text-black">
                {featuredDeal.expiryLabel}
              </span>
            </div>

            <p className="mt-3 sm:mt-6 text-3xl sm:text-6xl md:text-7xl font-black leading-none text-white drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.5)] sm:drop-shadow-[3px_3px_0px_rgba(0,0,0,0.5)]">
              {getDiscountText(featuredDeal)}
            </p>
            <h2 className="mt-2 sm:mt-4 max-w-3xl text-lg sm:text-3xl md:text-4xl font-black text-black">
              {featuredDeal.title}
            </h2>
            <p className="mt-1.5 sm:mt-3 max-w-2xl line-clamp-2 text-[0.7rem] sm:text-base md:text-lg font-bold leading-4 sm:leading-7 text-black/72">
              {featuredDeal.description}
            </p>

            <div className="mt-2.5 sm:mt-6 flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-sm font-bold text-black/72">
              <span>{featuredDeal.vendor?.name}</span>
              <span>•</span>
              <span>{featuredDeal.locationLabel}</span>
              {featuredDeal.vendor?.cuisine ? (
                <>
                  <span>•</span>
                  <span>{featuredDeal.vendor.cuisine}</span>
                </>
              ) : null}
            </div>

            <div className="mt-3.5 sm:mt-7 flex max-w-xl items-center justify-between gap-2.5 sm:gap-4 rounded-[0.7rem] sm:rounded-[1.4rem] border-2 sm:border-4 border-black bg-white p-2.5 sm:p-4 shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="min-w-0">
                <p className="text-[0.5rem] sm:text-[0.62rem] font-black uppercase tracking-[0.1em] sm:tracking-[0.18em] text-black/45">
                  Use this code
                </p>
                <code className="mt-0.5 block truncate text-base sm:text-2xl md:text-3xl font-black tracking-[0.12em] sm:tracking-[0.24em] text-black">
                  {featuredDeal.promoCode}
                </code>
              </div>
              <button
                type="button"
                onClick={() => onCopy(featuredDeal.promoCode, featuredDeal.id)}
                className="inline-flex h-8 w-8 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg sm:rounded-2xl border border-black bg-black text-yellow-300 transition-all hover:-translate-y-0.5 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,0.2)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)]"
                aria-label={`Copy ${featuredDeal.promoCode}`}
              >
                {copiedCode === featuredDeal.id ? <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6" /> : <Copy className="h-4 w-4 sm:h-6 sm:w-6" />}
              </button>
            </div>

            {featuredDeal.vendor?.id && (
              <Link href={`/vendors/${featuredDeal.vendor.slug || featuredDeal.vendor.id}`} className="mt-3.5 block lg:hidden">
                <Button className="h-9 w-full rounded-lg border-2 border-black bg-yellow-300 text-[10px] font-black uppercase tracking-[0.1em] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-200 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all">
                  Redeem featured offer
                </Button>
              </Link>
            )}
          </div>

          <div className="relative min-h-[100px] lg:min-h-full border-t-2 lg:border-l-3 lg:border-t-0 border-black bg-black/5">
            {featuredDeal.vendor?.displayImageUrl ? (
              <Image
                src={featuredDeal.vendor.displayImageUrl}
                alt={featuredDeal.vendor.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="absolute inset-0 h-full w-full object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full min-h-[100px] items-center justify-center bg-black/10">
                <Store className="h-10 w-10 text-black/30" />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-5 hidden lg:block">
              <Link href={`/vendors/${featuredDeal.vendor?.slug || featuredDeal.vendor?.id}`}>
                <Button className="h-11 sm:h-14 w-full rounded-xl sm:rounded-2xl border-3 sm:border-4 border-black bg-yellow-300 font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] sm:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:bg-yellow-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
                  Redeem featured offer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function OffersFiltersPanel({
  activeCity,
  cuisines,
  filterType,
  nearbyOnly,
  searchQuery,
  selectedCuisine,
  sortBy,
  sortedCount,
  onClear,
  onFilterTypeChange,
  onNearbyToggle,
  onSearchChange,
  onSelectedCuisineChange,
  onSortChange,
}: {
  activeCity: string
  cuisines: string[]
  filterType: PromotionFilterType
  nearbyOnly: boolean
  searchQuery: string
  selectedCuisine: string
  sortBy: PromotionSort
  sortedCount: number
  onClear: () => void
  onFilterTypeChange: (value: PromotionFilterType) => void
  onNearbyToggle: () => void
  onSearchChange: (value: string) => void
  onSelectedCuisineChange: (value: string) => void
  onSortChange: (value: PromotionSort) => void
}) {
  return (
    <div className="mb-6 sm:mb-10 rounded-[1rem] sm:rounded-[2rem] border-2 sm:border-4 border-black bg-white p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="grid grid-cols-[1fr_105px] sm:grid-cols-[1.2fr_220px] gap-3 sm:gap-5">
        {/* Neobrutalist Search Bar */}
        <div className="group relative">
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black translate-x-0.5 translate-y-0.5 sm:translate-x-1 sm:translate-y-1 transition-transform duration-200 group-focus-within:translate-x-1 group-focus-within:translate-y-1 sm:group-focus-within:translate-x-1.5 sm:group-focus-within:translate-y-1.5" />
          <div className="relative flex h-10 sm:h-14 items-center rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black bg-[#fffaf0] transition-all duration-200 group-focus-within:-translate-x-0.5 group-focus-within:-translate-y-0.5 group-focus-within:bg-white">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-4">
              <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-black" />
            </div>
            <input
              type="text"
              className="h-full w-full rounded-xl sm:rounded-2xl bg-transparent pl-8 sm:pl-12 pr-2 text-xs sm:text-base font-bold text-black placeholder:text-black/35 focus:outline-none"
              placeholder="Search offers..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        </div>

        {/* Neobrutalist Sort Select */}
        <div className="group relative">
          <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-black translate-x-0.5 translate-y-0.5 sm:translate-x-1 sm:translate-y-1 transition-transform duration-200 group-focus-within:translate-x-1 group-focus-within:translate-y-1 sm:group-focus-within:translate-x-1.5 sm:group-focus-within:translate-y-1.5" />
          <div className="relative flex h-10 sm:h-14 items-center rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black bg-[#fffaf0] px-2 sm:px-4 transition-all duration-200 group-focus-within:-translate-x-0.5 group-focus-within:-translate-y-0.5 group-focus-within:bg-white">
            <SlidersHorizontal className="mr-1.5 h-4 w-4 sm:h-5 sm:w-5 text-black shrink-0 hidden sm:block" />
            <select
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value as PromotionSort)}
              className="h-full w-full cursor-pointer bg-transparent text-xs sm:text-base font-black text-black focus:outline-none"
            >
              {PROMOTION_SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="rounded-full border-2 border-black bg-black px-2.5 py-1 text-[0.65rem] sm:text-[0.68rem] font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] text-yellow-300">
          Offer type
        </span>
        {PROMOTION_TYPE_OPTIONS.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onFilterTypeChange(type.id)}
            className={`rounded-full border-2 sm:border-3 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-[0.1em] sm:tracking-[0.14em] transition-all duration-100 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none hover:-translate-y-0.5 ${
              filterType === type.id
                ? 'border-black bg-orange-500 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                : 'border-black bg-white text-black'
            }`}
          >
            {type.label}
          </button>
        ))}

        <button
          type="button"
          onClick={onNearbyToggle}
          disabled={!activeCity}
          className={`rounded-full border-2 sm:border-3 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-[0.1em] sm:tracking-[0.14em] transition-all duration-100 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none ${
            nearbyOnly
              ? 'border-black bg-teal-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'border-black bg-white text-black'
          } ${!activeCity ? 'cursor-not-allowed opacity-50' : 'hover:-translate-y-0.5'}`}
        >
          Near me
        </button>
      </div>

      <div className="mt-4 sm:mt-5 flex gap-2 sm:gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
        {cuisines.map((cuisine) => (
          <button
            key={cuisine}
            type="button"
            onClick={() => onSelectedCuisineChange(cuisine)}
            className={`whitespace-nowrap rounded-full border-2 sm:border-3 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-[0.1em] sm:tracking-[0.14em] transition-all duration-100 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none hover:-translate-y-0.5 ${
              selectedCuisine === cuisine
                ? 'border-black bg-black text-yellow-300 shadow-[2px_2px_0px_0px_rgba(251,191,36,1)] sm:shadow-[3px_3px_0px_0px_rgba(251,191,36,1)]'
                : 'border-black bg-[#fffaf0] text-black'
            }`}
          >
            {cuisine}
          </button>
        ))}
      </div>

      <div className="mt-4 sm:mt-5 flex flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-black/15 pt-3.5 sm:pt-4">
        <p className="text-xs sm:text-sm font-bold text-black/65">
          {sortedCount} offer{sortedCount === 1 ? '' : 's'} ready to use
          {activeCity ? ` in and around ${activeCity}` : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          {(filterType !== 'all' || selectedCuisine !== 'All' || searchQuery || nearbyOnly) && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-full border-2 border-black bg-white px-2.5 py-1 text-xs font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-black active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all duration-100"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function OffersResults({
  activeCity,
  loading,
  morePromotions,
  nearYouPromotions,
  renderGrid,
  onResetFilters,
}: {
  activeCity: string
  loading: boolean
  morePromotions: PromotionCardModel[]
  nearYouPromotions: PromotionCardModel[]
  renderGrid: (items: PromotionCardModel[]) => React.ReactNode
  onResetFilters: () => void
}) {
  const totalResults = nearYouPromotions.length + morePromotions.length

  if (loading) {
    return (
      <div className="py-12 sm:py-20 text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-8 border-black border-t-yellow-400" />
        <p className="text-xl sm:text-2xl font-black uppercase text-black">Hunting for fresh deals...</p>
      </div>
    )
  }

  if (totalResults === 0) {
    return (
      <div className="rounded-[1.2rem] sm:rounded-[2rem] border-3 sm:border-4 border-dashed border-black bg-white px-4 py-10 sm:px-6 sm:py-16 text-center">
        <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full border-3 sm:border-4 border-black bg-[#fff8dd] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <Tag className="h-7 w-7 sm:h-10 sm:w-10 text-black/35" />
        </div>
        <h3 className="text-xl sm:text-3xl font-black uppercase text-black">No matching deals</h3>
        <p className="mx-auto mt-2 sm:mt-3 max-w-xl text-sm sm:text-lg font-semibold text-black/60">
          Try switching city filters, clearing the search, or broadening the offer type.
        </p>
        <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-full border-3 sm:border-4 border-black bg-black px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all shadow-[2px_2px_0px_0px_rgba(249,115,22,1)]"
          >
            Reset all filters
          </button>
          <Link href="/explore">
            <Button className="rounded-full border-3 sm:border-4 border-black bg-white px-4 py-2.5 sm:px-5 sm:py-3 text-xs sm:text-sm font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-black hover:bg-yellow-200 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              Browse vendors
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 sm:space-y-14">
      {activeCity && nearYouPromotions.length > 0 && (
        <section>
          <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.24em] text-black/45">City-first picks</p>
              <h2 className="mt-1 sm:mt-2 text-xl sm:text-3xl md:text-4xl font-black text-black">
                Near {activeCity}
              </h2>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-base font-semibold leading-relaxed text-black/65">
                Local deals that match your city first, with expiring codes pushed up.
              </p>
            </div>
            <div className="inline-flex self-start sm:self-auto rounded-full border-2 sm:border-3 border-black bg-white px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-[0.12em] sm:tracking-[0.16em] text-black shadow-[var(--shadow-soft)]">
              {nearYouPromotions.length} nearby offer{nearYouPromotions.length === 1 ? '' : 's'}
            </div>
          </div>
          {renderGrid(nearYouPromotions)}
        </section>
      )}

      {morePromotions.length > 0 && (
        <section>
          <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.24em] text-black/45">
                {activeCity ? 'More to explore' : 'All live offers'}
              </p>
              <h2 className="mt-1 sm:mt-2 text-xl sm:text-3xl md:text-4xl font-black text-black">
                {activeCity ? 'Worth traveling for' : 'Fresh promo codes'}
              </h2>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-base font-semibold leading-relaxed text-black/65">
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
  )
}
