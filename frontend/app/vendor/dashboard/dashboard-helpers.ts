'use client'

import { Settings, TrendingUp, type LucideIcon, Tag, UtensilsCrossed } from 'lucide-react'
import type { VendorStatus } from '@/lib/api'

export interface VendorSummary {
  id: string | number
  name: string
  status?: VendorStatus
}

export interface VendorQuickAction {
  href: string
  title: string
  description: string
  accentClassName: string
  icon: LucideIcon
}

export interface VendorTip {
  step: number
  title: string
  description: string
  cardClassName: string
  badgeClassName: string
}

export const VENDOR_QUICK_ACTIONS: VendorQuickAction[] = [
  {
    href: '/vendor/menu',
    title: 'Menu',
    description: 'Manage items',
    accentClassName: 'orange',
    icon: UtensilsCrossed,
  },
  {
    href: '/vendor/analytics',
    title: 'Analytics',
    description: 'View insights',
    accentClassName: 'blue',
    icon: TrendingUp,
  },
  {
    href: '/vendor/promotions',
    title: 'Promotions',
    description: 'Create offers',
    accentClassName: 'emerald',
    icon: Tag,
  },
]

export const VENDOR_TIPS: VendorTip[] = [
  {
    step: 1,
    title: 'Update Your Status',
    description: "Let customers know if you're Available, Busy, or Unavailable in Settings",
    cardClassName: 'bg-orange-50',
    badgeClassName: 'bg-orange-600 text-white',
  },
  {
    step: 2,
    title: 'Keep Menu Fresh',
    description: 'Toggle item availability as your stock changes throughout the day',
    cardClassName: 'bg-blue-50',
    badgeClassName: 'bg-blue-600 text-white',
  },
  {
    step: 3,
    title: 'Complete Your Profile',
    description: 'Add banner and logo images to make your stall stand out',
    cardClassName: 'bg-emerald-50',
    badgeClassName: 'bg-emerald-600 text-white',
  },
  {
    step: 4,
    title: 'Run Promotions',
    description: 'Attract more customers with limited-time offers and discounts',
    cardClassName: 'bg-green-50',
    badgeClassName: 'bg-green-600 text-white',
  },
]

export function getVendorStatusPillClassName(status?: VendorStatus) {
  if (status === 'AVAILABLE') return 'bg-green-100 text-green-700'
  if (status === 'BUSY') return 'bg-orange-100 text-orange-700'
  return 'bg-red-100 text-red-700'
}

export function getQuickActionClasses(accentClassName: string) {
  if (accentClassName === 'orange') {
    return {
      card: 'hover:border-orange-500 hover:shadow-md',
      iconWrap: 'bg-orange-100 group-hover:bg-orange-500',
      icon: 'text-orange-600 group-hover:text-white',
    }
  }

  if (accentClassName === 'blue') {
    return {
      card: 'hover:border-blue-500 hover:shadow-md',
      iconWrap: 'bg-blue-100 group-hover:bg-blue-500',
      icon: 'text-blue-600 group-hover:text-white',
    }
  }

  return {
    card: 'hover:border-emerald-500 hover:shadow-md',
    iconWrap: 'bg-emerald-100 group-hover:bg-emerald-500',
    icon: 'text-emerald-600 group-hover:text-white',
  }
}

export const SETTINGS_ACTION = {
  href: '/vendor/settings',
  label: 'Settings',
  icon: Settings,
}
