'use client'

export interface SupportFormState {
  subject: string
  description: string
  category: string
  priority: string
}

export const EMPTY_SUPPORT_FORM: SupportFormState = {
  subject: '',
  description: '',
  category: 'TECHNICAL',
  priority: 'NORMAL',
}

export const SUPPORT_CATEGORY_OPTIONS = [
  { value: 'TECHNICAL', label: 'Technical Issue' },
  { value: 'BILLING', label: 'Billing/Payments' },
  { value: 'ACCOUNT', label: 'Account Support' },
  { value: 'OTHER', label: 'Other' },
] as const

export const SUPPORT_PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
] as const

export const SUPPORT_QUICK_TIPS = [
  'Check your menu items for accuracy before publishing.',
  'Keep your business hours updated.',
  'Respond to reviews to build trust.',
] as const

export function getTicketStatusClassName(status?: string) {
  if (status === 'RESOLVED') return 'bg-green-100 text-green-700'
  if (status === 'PENDING') return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-700'
}
