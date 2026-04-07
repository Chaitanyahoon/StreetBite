'use client'

export interface Promotion {
  id: string
  code: string
  description: string
  discount: string
  minSpend: number
  expiryDate: string
  usageCount: number
  maxUsage: number
  active: boolean
}

export interface PromotionFormData {
  code: string
  description: string
  discount: string
  minSpend: string
  maxUsage: string
  expiryDate: string
  active: boolean
}

export interface ApiPromotion {
  id?: string
  promotionId?: string
  promoCode: string
  title: string
  discountValue: number
  discountType: string
  minOrderValue?: number
  endDate: string
  currentUses?: number
  maxUses?: number
  active?: boolean
  isActive?: boolean
}

export const EMPTY_PROMOTION_FORM: PromotionFormData = {
  code: '',
  description: '',
  discount: '',
  minSpend: '',
  maxUsage: '100',
  expiryDate: '',
  active: true,
}

export function normalizePromotion(promotion: ApiPromotion): Promotion {
  const isPercentage = promotion.discountType === 'PERCENTAGE'
  const active = promotion.active !== undefined ? promotion.active : Boolean(promotion.isActive)

  return {
    id: promotion.id || promotion.promotionId || '',
    code: promotion.promoCode,
    description: promotion.title,
    discount: `${promotion.discountValue}${isPercentage ? '%' : '₹'}`,
    minSpend: promotion.minOrderValue || 0,
    expiryDate: promotion.endDate,
    usageCount: promotion.currentUses || 0,
    maxUsage: promotion.maxUses || 100,
    active,
  }
}

export function buildPromotionPayload(formData: PromotionFormData) {
  const isPercentage = formData.discount.includes('%')
  const discountValue = parseFloat(formData.discount.replace(/[%₹]/g, ''))

  return {
    title: formData.description,
    description: formData.description,
    discountType: isPercentage ? 'PERCENTAGE' : 'FIXED',
    discountValue,
    minOrderValue: formData.minSpend ? parseFloat(formData.minSpend) : 0,
    promoCode: formData.code,
    endDate: formData.expiryDate || null,
    isActive: formData.active,
    maxUses: formData.maxUsage ? parseInt(formData.maxUsage, 10) : 100,
  }
}

export function buildPromotionFormData(promotion: Promotion): PromotionFormData {
  return {
    code: promotion.code,
    description: promotion.description,
    discount: promotion.discount,
    minSpend: promotion.minSpend.toString(),
    maxUsage: promotion.maxUsage.toString(),
    expiryDate: promotion.expiryDate ? promotion.expiryDate.split('T')[0] : '',
    active: promotion.active,
  }
}

export function getPromotionStatusClassName(active: boolean) {
  return active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
}

export function getPromotionUsagePercent(usageCount: number, maxUsage: number) {
  if (maxUsage <= 0) return 0
  return Math.round((usageCount / maxUsage) * 100)
}
