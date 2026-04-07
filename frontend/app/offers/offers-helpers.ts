'use client'

export interface Vendor {
  id: number | string
  slug?: string
  name: string
  rating?: number
  displayImageUrl?: string
  address?: string
  cuisine?: string
}

export interface Promotion {
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

export type PromotionFilterType = 'all' | 'percentage' | 'fixed'
export type PromotionSort = 'best_match' | 'newest' | 'ending_soon' | 'highest_discount'

export type PromotionCardModel = Promotion & {
  isNearCity: boolean
  expiryLabel: string
  urgencyLabel: string
  urgencyTone: 'critical' | 'warning' | 'calm' | 'expired'
  expirySortValue: number
  locationLabel: string
}

export const PROMOTION_TYPE_OPTIONS: Array<{ id: PromotionFilterType; label: string }> = [
  { id: 'all', label: 'All offers' },
  { id: 'percentage', label: 'Percent deals' },
  { id: 'fixed', label: 'Flat savings' },
]

export const PROMOTION_SORT_OPTIONS: Array<{ id: PromotionSort; label: string }> = [
  { id: 'best_match', label: 'Best match' },
  { id: 'ending_soon', label: 'Ending soon' },
  { id: 'highest_discount', label: 'Highest discount' },
  { id: 'newest', label: 'Newest added' },
]

export function normalizeText(value?: string | null) {
  return value?.trim().toLowerCase() ?? ''
}

export function getDiscountText(promo: Promotion) {
  if (promo.discountType === 'PERCENTAGE') {
    return `${promo.discountValue}% OFF`
  }

  if (promo.discountType === 'FIXED_AMOUNT' || promo.discountType === 'FIXED') {
    return `₹${promo.discountValue} OFF`
  }

  return 'SPECIAL OFFER'
}

export function getLocationLabel(address?: string) {
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

export function getExpiryMeta(endDate?: string) {
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

export function matchesSelectedType(promo: Promotion, filterType: PromotionFilterType) {
  if (filterType === 'all') return true
  if (filterType === 'percentage') return promo.discountType === 'PERCENTAGE'
  return promo.discountType === 'FIXED_AMOUNT' || promo.discountType === 'FIXED'
}

export function buildPromotionCards(promotions: Promotion[], activeCity: string): PromotionCardModel[] {
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
}

export function getCuisineOptions(promotionCards: PromotionCardModel[]): string[] {
  return ['All', ...Array.from(new Set(promotionCards.map((promo) => promo.vendor?.cuisine).filter(Boolean)))] as string[]
}

export function filterPromotions(
  promotions: PromotionCardModel[],
  filterType: PromotionFilterType,
  selectedCuisine: string,
  nearbyOnly: boolean,
  searchQuery: string
) {
  const query = searchQuery.trim().toLowerCase()

  return promotions.filter((promo) => {
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
}

export function sortPromotions(items: PromotionCardModel[], sortBy: PromotionSort): PromotionCardModel[] {
  const sortedItems = [...items]

  sortedItems.sort((a, b) => {
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

  return sortedItems
}
