'use client'

import { AlertCircle, Bell, CheckCircle2, Shield, XCircle, type LucideIcon } from 'lucide-react'
import type { VendorStatus } from '@/lib/api'

export interface VendorSettingsFormState {
  name: string
  address: string
  phone: string
  hours: string
  description: string
  cuisine: string
  latitude: string
  longitude: string
  bannerImageUrl: string
  displayImageUrl: string
  status: VendorStatus | string
}

export interface VendorPreferenceState {
  notifications: boolean
  weeklyReports: boolean
  emailPromos: boolean
}

export interface VendorStatusOption {
  value: VendorStatus
  label: string
  activeClassName: string
  icon: LucideIcon
}

export interface VendorPreferenceOption {
  key: keyof VendorPreferenceState
  title: string
  description: string
}

export interface VendorSecurityAction {
  label: string
  toastMessage: string
}

export const EMPTY_VENDOR_SETTINGS_FORM: VendorSettingsFormState = {
  name: '',
  address: '',
  phone: '',
  hours: '',
  description: '',
  cuisine: '',
  latitude: '',
  longitude: '',
  bannerImageUrl: '',
  displayImageUrl: '',
  status: 'AVAILABLE',
}

export const DEFAULT_VENDOR_PREFERENCES: VendorPreferenceState = {
  notifications: true,
  weeklyReports: true,
  emailPromos: false,
}

export const VENDOR_STATUS_OPTIONS: VendorStatusOption[] = [
  {
    value: 'AVAILABLE',
    label: 'Open',
    activeClassName: 'bg-green-500 text-white shadow-sm',
    icon: CheckCircle2,
  },
  {
    value: 'BUSY',
    label: 'Busy',
    activeClassName: 'bg-orange-500 text-white shadow-sm',
    icon: AlertCircle,
  },
  {
    value: 'UNAVAILABLE',
    label: 'Closed',
    activeClassName: 'bg-red-500 text-white shadow-sm',
    icon: XCircle,
  },
]

export const VENDOR_PREFERENCE_OPTIONS: VendorPreferenceOption[] = [
  {
    key: 'notifications',
    title: 'Notifications',
    description: 'Receive review & engagement alerts',
  },
  {
    key: 'weeklyReports',
    title: 'Weekly Reports',
    description: 'Performance summary',
  },
]

export const VENDOR_SECURITY_ACTIONS: VendorSecurityAction[] = [
  {
    label: 'Change Password',
    toastMessage: 'Password change feature coming soon!',
  },
  {
    label: 'Two-Factor Auth',
    toastMessage: 'Two-factor authentication coming soon!',
  },
  {
    label: 'Active Sessions',
    toastMessage: 'Session management coming soon!',
  },
]

export const SETTINGS_CARD_ICONS = {
  preferences: Bell,
  security: Shield,
}

export function buildVendorSettingsForm(vendor: {
  name?: string
  address?: string
  phone?: string
  hours?: string
  description?: string
  cuisine?: string
  latitude?: string | number | null
  longitude?: string | number | null
  bannerImageUrl?: string
  displayImageUrl?: string
  status?: VendorStatus | string
}): VendorSettingsFormState {
  return {
    name: vendor.name || '',
    address: vendor.address || '',
    phone: vendor.phone || '',
    hours: vendor.hours || '',
    description: vendor.description || '',
    cuisine: vendor.cuisine || '',
    latitude: vendor.latitude?.toString() || '',
    longitude: vendor.longitude?.toString() || '',
    bannerImageUrl: vendor.bannerImageUrl || '',
    displayImageUrl: vendor.displayImageUrl || '',
    status: vendor.status || 'AVAILABLE',
  }
}

export function hasValidCoordinates(latitude: string, longitude: string) {
  return latitude && longitude && !Number.isNaN(parseFloat(latitude)) && !Number.isNaN(parseFloat(longitude))
}

export function formatCoordinatePair(latitude: string, longitude: string) {
  return `${parseFloat(latitude).toFixed(6)}, ${parseFloat(longitude).toFixed(6)}`
}
