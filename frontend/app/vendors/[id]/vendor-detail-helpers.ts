export interface Vendor {
  id: string
  name: string
  description: string
  cuisine: string
  address: string
  latitude: number
  longitude: number
  rating: number
  imageUrl?: string
  bannerImageUrl?: string
  displayImageUrl?: string
  phone?: string
  hours?: string
  galleryImages?: string[]
  status?: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE' | 'SUSPENDED' | 'APPROVED' | 'PENDING' | 'REJECTED'
  location?: string
  openingHours?: string
  isOpen?: boolean
}

export interface MenuItem {
  itemId: string
  name: string
  description: string
  price: number
  imageUrl?: string
  category: string
  isAvailable: boolean
  rating?: number
}

export interface Review {
  id: number
  rating: number
  comment: string
  createdAt: string
  user: {
    id: number
    displayName: string
  }
}

export interface VendorPromotion {
  id: number
  title: string
  description?: string
  promoCode: string
  discountType: 'PERCENTAGE' | 'FIXED' | string
  discountValue: number
  minOrderValue: number
  maxUses: number
  currentUses?: number
  endDate?: string
}

export type OfferFilter = 'all' | 'percentage' | 'fixed'
export type OfferSort = 'discount' | 'ending' | 'popular'

export type PromotionBadge = {
  text: string
  color: string
}

export type VendorStatusMeta = {
  label: string
  badgeClassName: string
  dotClassName: string
}

export const statusMeta: Record<string, VendorStatusMeta> = {
  AVAILABLE: {
    label: 'Open now',
    badgeClassName: 'bg-emerald-500/90 text-white',
    dotClassName: 'bg-white animate-pulse',
  },
  BUSY: {
    label: 'Busy right now',
    badgeClassName: 'bg-amber-500/90 text-white',
    dotClassName: 'bg-white',
  },
  APPROVED: {
    label: 'Verified vendor',
    badgeClassName: 'bg-sky-500/90 text-white',
    dotClassName: 'bg-white',
  },
  PENDING: {
    label: 'Pending review',
    badgeClassName: 'bg-slate-500/90 text-white',
    dotClassName: 'bg-white/80',
  },
  REJECTED: {
    label: 'Unavailable',
    badgeClassName: 'bg-rose-500/90 text-white',
    dotClassName: 'bg-white/80',
  },
  UNAVAILABLE: {
    label: 'Closed for now',
    badgeClassName: 'bg-gray-700/90 text-white',
    dotClassName: 'bg-white/70',
  },
  SUSPENDED: {
    label: 'Temporarily unavailable',
    badgeClassName: 'bg-gray-700/90 text-white',
    dotClassName: 'bg-white/70',
  },
}

export function groupMenuItemsByCategory(menuItems: MenuItem[]): Record<string, MenuItem[]> {
  return menuItems.reduce((acc, item) => {
    const category = item.category || 'Other'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)
}

export function filterAndSortPromotions(
  promotions: VendorPromotion[],
  offerFilter: OfferFilter,
  offerSort: OfferSort,
): VendorPromotion[] {
  const filtered = promotions.filter((promo) => {
    if (offerFilter === 'all') return true
    if (offerFilter === 'percentage') return promo.discountType === 'PERCENTAGE'
    if (offerFilter === 'fixed') return promo.discountType === 'FIXED'
    return true
  })

  return [...filtered].sort((a, b) => {
    if (offerSort === 'discount') {
      return b.discountValue - a.discountValue
    }
    if (offerSort === 'ending') {
      if (!a.endDate) return 1
      if (!b.endDate) return -1
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
    }
    return b.id - a.id
  })
}

export function getPromotionBadges(promo: VendorPromotion): PromotionBadge[] {
  const badges: PromotionBadge[] = []

  if (promo.discountValue >= 30) {
    badges.push({ text: '🔥 HOT DEAL', color: 'bg-red-500' })
  }

  if (promo.endDate) {
    const daysLeft = Math.ceil((new Date(promo.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysLeft <= 7 && daysLeft > 0) {
      badges.push({ text: `⏰ ${daysLeft}d LEFT`, color: 'bg-yellow-500' })
    }
  }

  if (promo.minOrderValue < 200) {
    badges.push({ text: '💰 LOW MIN', color: 'bg-green-500' })
  }

  return badges
}

export function buildPromotionShareText(vendorName: string | undefined, promo: VendorPromotion) {
  return `Check out this amazing offer at ${vendorName || 'this vendor'}!\n\n${promo.title}\nCode: ${promo.promoCode}\n${promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}\n\nFound on StreetBite 🍔`
}
