'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Calendar } from 'lucide-react'
import { analyticsApi, menuApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  buildCategoryData,
  buildCustomerMetrics,
  getAverageMenuPrice,
} from './analytics-helpers'

export default function Analytics() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!user) {
          setError('Please sign in to view analytics')
          setLoading(false)
          return
        }

        if (!user.vendorId && user.role === 'VENDOR') {
          setError('Vendor ID not found. Please sign out and sign in again.')
          setLoading(false)
          return
        }

        const vendorId = user.vendorId
        if (!vendorId) {
          setError('You need to be a vendor to view analytics')
          setLoading(false)
          return
        }

        const [analyticsData, menuData] = await Promise.all([
          analyticsApi.getVendorAnalytics(String(vendorId)),
          menuApi.getByVendor(String(vendorId))
        ])

        setAnalytics(analyticsData)
        setMenuItems(menuData)
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  const handleExport = () => {
    if (!analytics) return

    // Create CSV content
    const csvData = [
      ['Metric', 'Value'],
      ['Profile Views', analytics.profileViews],
      ['Direction Clicks', analytics.directionClicks],
      ['Average Rating', analytics.averageRating],
      ['Total Reviews', analytics.totalReviews],
      ['Menu Items', menuItems.length],
      [''],
      ['Top Items', 'Views', 'Clicks'],
      ...(analytics.topItems || []).map((item: any) => [
        item.name,
        item.views,
        item.clicks
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="p-8">
        <div className="bg-red-50/50 backdrop-blur-sm border border-red-200 text-red-700 px-6 py-4 rounded-2xl shadow-sm">
          {error || 'Failed to load analytics'}
        </div>
      </div>
    )
  }

  const categoryData = buildCategoryData(menuItems)
  const customerMetrics = buildCustomerMetrics(analytics)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" disabled>
            <Calendar className="w-4 h-4" />
            All Time
          </Button>
          <Button
            variant="outline"
            className="gap-2 bg-orange-600 text-white hover:bg-orange-700 hover:text-white"
            onClick={handleExport}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {customerMetrics.map((item, idx) => (
          <Card key={idx} className="border-none shadow-lg bg-white/40 backdrop-blur-xl">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{item.metric}</p>
              <p className="text-2xl font-bold mt-2">{item.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-none shadow-lg bg-white/40 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>Most Popular Items</CardTitle>
              <CardDescription>Items with most engagement</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topItems && analytics.topItems.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topItems.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-white/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.views} views</p>
                        </div>
                      </div>
                      <p className="font-bold text-orange-600">{item.clicks} clicks</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No engagement data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-lg bg-white/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Menu by Category</CardTitle>
            <CardDescription>Distribution of menu items</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {categoryData.map((item, idx) => (
                        <Cell key={`cell-${idx}`} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No category data yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Menu Items Summary */}
      <Card className="border-none shadow-lg bg-white/40 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Menu Items Summary</CardTitle>
          <CardDescription>Overview of your menu performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/50 rounded-xl">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold mt-1">{menuItems.length}</p>
            </div>
            <div className="p-4 bg-white/50 rounded-xl">
              <p className="text-sm text-muted-foreground">Available Items</p>
              <p className="text-2xl font-bold mt-1">{menuItems.filter(i => i.isAvailable).length}</p>
            </div>
            <div className="p-4 bg-white/50 rounded-xl">
              <p className="text-sm text-muted-foreground">Avg Price</p>
              <p className="text-2xl font-bold mt-1">
                ₹{getAverageMenuPrice(menuItems)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
