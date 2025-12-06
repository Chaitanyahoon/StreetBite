'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, ShoppingCart, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { analyticsApi, vendorApi } from '@/lib/api'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentActivity: []
  })
  const [recentVendors, setRecentVendors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [platformData, vendorsData] = await Promise.all([
          analyticsApi.getPlatformAnalytics(),
          vendorApi.getAll()
        ])

        setStats(platformData)

        // Get 5 most recent vendors
        const vendors = Array.isArray(vendorsData) ? vendorsData : []
        const sortedVendors = vendors
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)

        setRecentVendors(sortedVendors)
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-8 flex justify-center">Loading dashboard...</div>
  }

  const handleStatusUpdate = async (vendorId: number, newStatus: string) => {
    try {
      await vendorApi.updateStatus(vendorId, newStatus)
      // Refresh data
      const vendorsData = await vendorApi.getAll()
      const vendors = Array.isArray(vendorsData) ? vendorsData : []

      const sortedVendors = vendors
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      setRecentVendors(sortedVendors)

      // Update stats if needed (re-fetch platform analytics)
      const platformData = await analyticsApi.getPlatformAnalytics()
      setStats(platformData)

    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Vendors</p>
                <p className="text-2xl font-bold mt-2">{stats.totalVendors}</p>
                <p className="text-xs text-emerald-600 mt-1">Active on platform</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold mt-2">{stats.totalUsers}</p>
                <p className="text-xs text-emerald-600 mt-1">Registered accounts</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold mt-2">{stats.totalOrders}</p>
                <p className="text-xs text-emerald-600 mt-1">Lifetime orders</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Est. Revenue</p>
                <p className="text-2xl font-bold mt-2">₹{stats.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-emerald-600 mt-1">Based on order volume</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
            <CardDescription>Last 7 days overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#FF7A32" strokeWidth={2} name="Orders" />
                <Line type="monotone" dataKey="users" stroke="#FFA45C" strokeWidth={2} name="Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Growth</CardTitle>
            <CardDescription>Active vendors this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#FF7A32" name="Orders" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {recentVendors.some(v => v.status === 'PENDING') && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>New vendors waiting for verification</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentVendors.filter(v => v.status === 'PENDING').map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-orange-100 shadow-sm">
                  <div className="flex-1">
                    <p className="font-bold text-lg">{vendor.name}</p>
                    <p className="text-sm text-muted-foreground">{vendor.cuisine} • {vendor.address}</p>
                    <p className="text-xs text-muted-foreground mt-1">Applied: {new Date(vendor.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleStatusUpdate(vendor.id, 'REJECTED')}
                    >
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleStatusUpdate(vendor.id, 'APPROVED')}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Vendor Applications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Vendors</CardTitle>
          <CardDescription>Newest vendors on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentVendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{vendor.name}</p>
                  <p className="text-sm text-muted-foreground">{vendor.cuisine} • {vendor.address}</p>
                </div>
                <div className="text-right mr-4">
                  <p className="text-sm font-medium">{vendor.rating} ★</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(vendor.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${vendor.status === 'APPROVED' || vendor.status === 'AVAILABLE'
                  ? 'bg-emerald-100 text-emerald-700'
                  : vendor.status === 'PENDING'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-red-100 text-red-700'
                  }`}>
                  {vendor.status}
                </span>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-4">
            View All Vendors
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions & Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Recent platform notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">System Status</p>
                <p className="text-xs text-muted-foreground">All systems operational. Real-time data connected.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Post Announcement</CardTitle>
            <CardDescription>Broadcast a message to all users</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={async (e) => {
              e.preventDefault()
              const form = e.target as HTMLFormElement
              const message = (form.elements.namedItem('message') as HTMLInputElement).value
              const type = (form.elements.namedItem('type') as HTMLSelectElement).value

              if (!message) return

              try {
                const { announcementApi } = await import('@/lib/api')
                await announcementApi.create({ message, type, isActive: true })
                alert('Announcement posted!')
                form.reset()
                // Optionally refresh active announcement in navbar (requires page reload or context)
                window.location.reload()
              } catch (err) {
                console.error(err)
                alert('Failed to post announcement')
              }
            }} className="space-y-3">
              <input
                name="message"
                placeholder="Announcement message..."
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
              <div className="flex gap-2">
                <select
                  name="type"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="INFO">Info (Blue)</option>
                  <option value="WARNING">Warning (Red)</option>
                  <option value="ALERT">Alert (Yellow)</option>
                </select>
                <Button type="submit">Post</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
