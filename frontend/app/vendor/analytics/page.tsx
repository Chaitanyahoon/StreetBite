'use client'

import { useState, useEffect } from 'react'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Calendar } from 'lucide-react'
import { getVendorAnalytics, getVendorMenu } from '@/lib/api'

export default function Analytics() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        if (typeof window === 'undefined') return
        
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          setError('Please sign in to view analytics')
          setLoading(false)
          return
        }

        const user = JSON.parse(userStr)
        const vendorId = user.userId

        // Fetch analytics and menu items
        const [analyticsData, menuData] = await Promise.all([
          getVendorAnalytics(vendorId),
          getVendorMenu(vendorId)
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
  }, [])

  const handleExport = () => {
    if (!analytics) return

    // Create CSV content
    const csvData = [
      ['Metric', 'Value'],
      ['Total Revenue', `₹${analytics.totalRevenue}`],
      ['Total Orders', analytics.totalOrders],
      ['Average Rating', analytics.averageRating],
      ['Active Customers', analytics.activeCustomers],
      ['Menu Items', menuItems.length],
      [''],
      ['Top Items', 'Sales', 'Revenue'],
      ...(analytics.topItems || []).map((item: any) => [
        item.name,
        item.sales,
        `₹${item.revenue}`
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

  // Calculate category breakdown from menu items
  const categoryBreakdown = menuItems.reduce((acc: any, item: any) => {
    const category = item.category || 'Other'
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += item.totalOrders || 0
    return acc
  }, {})


  const totalCategoryOrders = Object.values(categoryBreakdown).reduce((a: any, b: any) => a + b, 0) || 1
  const categoryData = Object.entries(categoryBreakdown).map(([name, value]: any, idx) => ({
    name,
    value: Math.round((Number(value) / totalCategoryOrders) * 100),
    color: ['#FF7A32', '#FFA45C', '#FFD6B3', '#FFE5D0', '#FFF0E5'][idx % 5]
  }))

  const customerMetrics = [
    { metric: 'Total Revenue', value: `₹${analytics.totalRevenue.toFixed(0)}`, change: 'All time' },
    { metric: 'Total Orders', value: analytics.totalOrders, change: 'All time' },
    { metric: 'Average Rating', value: `${analytics.averageRating.toFixed(1)}/5`, change: 'Menu items' },
    { metric: 'Active Customers', value: analytics.activeCustomers, change: 'Estimated' },
  ]

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
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>Best performing menu items</CardDescription>
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
                          <p className="text-xs text-muted-foreground">{item.sales} sales</p>
                        </div>
                      </div>
                      <p className="font-bold text-orange-600">₹{item.revenue}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No sales data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-lg bg-white/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>Distribution of orders</CardDescription>
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
                ₹{menuItems.length > 0 ? (menuItems.reduce((sum, item) => sum + (item.price || 0), 0) / menuItems.length).toFixed(0) : 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
