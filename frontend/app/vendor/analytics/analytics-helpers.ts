'use client'

export interface AnalyticsMetricCard {
  metric: string
  value: string | number
  change: string
}

export interface CategoryChartItem {
  [key: string]: string | number
  name: string
  value: number
  color: string
}

export function buildCategoryData(menuItems: Array<{ category?: string }>) {
  const categoryBreakdown = menuItems.reduce((acc: Record<string, number>, item) => {
    const category = item.category || 'Other'
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += 1
    return acc
  }, {})

  const totalCategoryItems =
    Object.values(categoryBreakdown).reduce((total, count) => total + count, 0) || 1

  return Object.entries(categoryBreakdown).map(([name, value], idx): CategoryChartItem => ({
    name,
    value: Math.round((value / totalCategoryItems) * 100),
    color: ['#FF7A32', '#FFA45C', '#FFD6B3', '#FFE5D0', '#FFF0E5'][idx % 5],
  }))
}

export function buildCustomerMetrics(analytics: any): AnalyticsMetricCard[] {
  return [
    {
      metric: 'Profile Views',
      value: analytics?.profileViews ?? 0,
      change: 'Last 7 days',
    },
    {
      metric: 'Direction Clicks',
      value: analytics?.directionClicks ?? 0,
      change: 'Last 7 days',
    },
    {
      metric: 'Average Rating',
      value: `${(analytics?.averageRating ?? 0).toFixed(1)}/5`,
      change: `${analytics?.totalReviews ?? 0} reviews`,
    },
    {
      metric: 'Menu Interactions',
      value: analytics?.menuInteractions ?? 0,
      change: 'Last 7 days',
    },
  ]
}

export function getAverageMenuPrice(menuItems: Array<{ price?: number }>) {
  if (menuItems.length === 0) return 0

  const total = menuItems.reduce((sum, item) => sum + (item.price || 0), 0)
  return (total / menuItems.length).toFixed(0)
}
