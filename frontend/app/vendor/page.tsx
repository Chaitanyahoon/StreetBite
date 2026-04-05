'use client'

import { useState, useEffect } from 'react'
import { Eye, MapPin, Utensils, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { analyticsApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function VendorDashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        if (!user) {
          setLoading(false)
          return
        }

        if (!user.vendorId && user.role === 'VENDOR') {
          console.warn('VendorId missing from user data')
          setLoading(false)
          return
        }

        const vendorId = user.vendorId
        if (!vendorId) {
          setLoading(false)
          return
        }

        const data = await analyticsApi.getVendorAnalytics(String(vendorId))
        setAnalytics(data)
      } catch (err) {
        console.error('Failed to load analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">No analytics data available</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
        <p className="text-muted-foreground">Track your engagement and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profile Views</p>
                <p className="text-2xl font-bold mt-2">{analytics.profileViews || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Direction Clicks</p>
                <p className="text-2xl font-bold mt-2">{analytics.directionClicks || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">High intent</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menu Interactions</p>
                <p className="text-2xl font-bold mt-2">{analytics.menuInteractions || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Clicks & views</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Utensils className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold mt-2">{analytics.averageRating?.toFixed(1) || '0.0'}</p>
                <p className="text-xs text-muted-foreground mt-1">{analytics.totalReviews || 0} reviews</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Items */}
      {analytics.topItems && analytics.topItems.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Most Viewed Items</h2>
            <div className="space-y-3">
              {analytics.topItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.views || 0} views</p>
                  </div>
                  <p className="text-sm font-semibold text-orange-600">{item.clicks || 0} clicks</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
