'use client'

export interface MenuItem {
  id?: number
  name: string
  category: string
  price: number
  description?: string
  preparationTime?: number
  imageUrl?: string
  isAvailable?: boolean
}

export interface MenuFormState {
  name: string
  category: string
  price: string
  description: string
  preparationTime: string
  imageUrl: string
  isAvailable: boolean
}

export const MENU_CATEGORY_OPTIONS = [
  'Main Course',
  'Appetizers',
  'Breads',
  'Desserts',
  'Beverages',
  'Snacks',
] as const

export const EMPTY_MENU_FORM: MenuFormState = {
  name: '',
  category: MENU_CATEGORY_OPTIONS[0],
  price: '',
  description: '',
  preparationTime: '',
  imageUrl: '',
  isAvailable: true,
}

export function buildMenuFormState(item: MenuItem): MenuFormState {
  return {
    name: item.name,
    category: item.category,
    price: item.price?.toString() || '',
    description: item.description || '',
    preparationTime: item.preparationTime?.toString() || '',
    imageUrl: item.imageUrl || '',
    isAvailable: item.isAvailable ?? true,
  }
}

export function getMenuCategories(items: MenuItem[]) {
  return ['All', ...Array.from(new Set(items.map((item) => item.category)))]
}

export function filterMenuItems(items: MenuItem[], searchQuery: string, selectedCategory: string) {
  const normalizedQuery = searchQuery.toLowerCase()

  return items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.description?.toLowerCase().includes(normalizedQuery)

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return Boolean(matchesSearch && matchesCategory)
  })
}

export function getMenuAvailabilityBadgeClassName(isAvailable: boolean) {
  return isAvailable ? 'bg-green-500/90 text-white' : 'bg-gray-900/80 text-white'
}

export function getMenuAvailabilityTextClassName(isAvailable: boolean) {
  return isAvailable ? 'text-green-600' : 'text-red-600'
}

export function getMenuAvailabilityToggleClassName(isAvailable: boolean) {
  return isAvailable
    ? 'bg-green-500 focus:ring-green-500'
    : 'bg-gray-300 focus:ring-gray-400'
}

export function getMenuAvailabilityThumbClassName(isAvailable: boolean) {
  return isAvailable ? 'translate-x-6' : 'translate-x-1'
}
