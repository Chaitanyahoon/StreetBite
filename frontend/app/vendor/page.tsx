'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, DollarSign, ShoppingCart } from 'lucide-react'
import { analyticsApi } from '@/lib/api'
import Link from 'next/link'

export default function VendorDashboard() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          setError('Please sign in to view dashboard')
          setLoading(false)
          return
        }

        const user = JSON.parse(userStr)
        const vendorId = user.vendorId || localStorage.getItem('vendorId') || user.id
        const data = await analyticsApi.getVendorAnalytics(vendorId)
        setAnalytics(data)
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  // Check if this is a new vendor with no data
  const isNewVendor = !analytics || analytics.totalOrders === 0

  if (isNewVendor) {
    return (
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <ShoppingCart className="w-10 h-10 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold">Welcome to Your Vendor Dashboard! 🎉</h1>
          <p className="text-muted-foreground text-lg">
            Let's get your street food business started on StreetBite
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Setup Guide</CardTitle>
            <CardDescription>Follow these steps to start receiving orders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-accent rounded-lg">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Add Your Menu Items</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Create your first menu items so customers can order from you
                </p>
                <Link href="/vendor/menu">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    Go to Menu Management
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-accent rounded-lg">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Complete Your Profile</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Add your business details, images, status, and operating hours
                </p>
                <Link href="/vendor/settings">
                  <Button variant="outline">
                    Update Profile Settings
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-accent rounded-lg">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Create Promotions (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Attract customers with special offers and discounts
                </p>
                <Link href="/vendor/promotions">
                  <Button variant="outline">
                    Create Promotion
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <p className="text-sm">Customers will discover your stall on the map</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <p className="text-sm">You'll receive order notifications in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <p className="text-sm">Track your sales and analytics right here</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
              <p className="text-sm">Build your reputation with customer reviews</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  // Generate mock daily data for visualization (in production, this would come from backend)
  const revenueData = [
    { date: 'Mon', revenue: analytics.totalRevenue * 0.1, orders: Math.floor(analytics.totalOrders * 0.1) },
    { date: 'Tue', revenue: analytics.totalRevenue * 0.12, orders: Math.floor(analytics.totalOrders * 0.12) },
    { date: 'Wed', revenue: analytics.totalRevenue * 0.15, orders: Math.floor(analytics.totalOrders * 0.15) },
    { date: 'Thu', revenue: analytics.totalRevenue * 0.13, orders: Math.floor(analytics.totalOrders * 0.13) },
    { date: 'Fri', revenue: analytics.totalRevenue * 0.18, orders: Math.floor(analytics.totalOrders * 0.18) },
    { date: 'Sat', revenue: analytics.totalRevenue * 0.20, orders: Math.floor(analytics.totalOrders * 0.20) },
    { date: 'Sun', revenue: analytics.totalRevenue * 0.12, orders: Math.floor(analytics.totalOrders * 0.12) },
  ]

  const topItems = analytics.topItems || []
  return (
    <div className="p-8 space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold mt-2">₹{analytics.totalRevenue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground mt-1">From {analytics.totalOrders} orders</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-2">{analytics.totalOrders}</p>
                <p className="text-xs text-muted-foreground mt-1">All time orders</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold mt-2">{analytics.averageRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground mt-1">Based on menu items</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Customers</p>
                <p className="text-2xl font-bold mt-2">{analytics.activeCustomers}</p>
                <p className="text-xs text-muted-foreground mt-1">Estimated customers</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Orders</CardTitle>
            <CardDescription>Last 7 days performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#FF7A32" name="Revenue (₹)" />
                <Bar dataKey="orders" fill="#FFA45C" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Items</CardTitle>
            <CardDescription>Most popular products this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topItems.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.sales} sales</p>
                  </div>
                  <p className="font-semibold text-orange-600">₹{item.revenue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/vendor/menu">
            <Button className="bg-orange-600 hover:bg-orange-700">
              Add New Item
            </Button>
          </Link>
          <Link href="/vendor/promotions">
            <Button variant="outline">
              Create Promotion
            </Button>
          </Link>
          <Link href="/vendor/settings">
            <Button variant="outline">
              Profile Settings
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
