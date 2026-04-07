'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Users, Heart, AlertCircle, ShieldCheck, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { analyticsApi, vendorApi, announcementApi } from '@/lib/api'
import { toast } from 'sonner'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({
    totalUsers: 0,
    totalVendors: 0,
    totalFavorites: 0,
    totalReviews: 0,
    recentActivity: []
  })
  const [recentVendors, setRecentVendors] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [platformData, vendorsData, announcementsData] = await Promise.all([
          analyticsApi.getPlatformAnalytics(),
          vendorApi.getAll(),
          announcementApi.getAll()
        ])

        setStats(platformData)
        setAnnouncements(announcementsData || [])

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
    return (
      <div className="min-h-screen p-8 flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-2 animate-pulse">
          <ShieldCheck className="w-8 h-8 text-primary opacity-50" />
          <p className="text-muted-foreground font-medium">Loading Dashboard...</p>
        </div>
      </div>
    )
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
    <div className="p-8 space-y-8 min-h-screen bg-gray-50/30">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Admin</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Here's what's happening on <span className="font-semibold text-foreground">StreetBite</span> today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            className="bg-white hover:bg-gray-50 text-foreground border shadow-sm hover:shadow transition-all"
            onClick={() => {
              const element = document.getElementById('system-status');
              if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            System Health
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
            onClick={() => {
              // Generate CSV content with proper escaping and BOM for Excel
              const escapeCsv = (str: string) => `"${String(str).replace(/"/g, '""')}"`;

              const csvHeader = ["Metric", "Value"];
              const csvRows = [
                ["Total Vendors", stats.totalVendors],
                ["Total Users", stats.totalUsers],
                ["Total Reviews", stats.totalReviews],
                ["Total Favorites", stats.totalFavorites],
                [], // Empty row for spacer
                ["Recent Vendors"],
                ["Name", "Cuisine", "Status", "Date"]
              ];

              // Add vendor rows
              recentVendors.forEach(v => {
                csvRows.push([
                  v.name,
                  v.cuisine,
                  v.status,
                  new Date(v.createdAt).toLocaleDateString()
                ]);
              });

              // Construct CSV string
              const csvString = [
                csvHeader.join(","),
                ...csvRows.map(row => row.map(cell => escapeCsv(cell)).join(","))
              ].join("\n");

              // Create Blob with BOM for Excel UTF-8 compatibility
              const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);

              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `streetbite_report_${new Date().toISOString().split('T')[0]}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Platform Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Vendors</p>
                <p className="text-3xl font-black mt-2 text-foreground">{stats.totalVendors}</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                  <span className="text-xs font-semibold">+{stats.vendorsGrowth || 0} New this week</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-inner">
                <Users className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-3xl font-black mt-2 text-foreground">{stats.totalUsers}</p>
                <div className="flex items-center gap-1 mt-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                  <span className="text-xs font-semibold">+{stats.usersGrowth || 0} this week</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-inner">
                <Users className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-emerald-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Reviews</p>
                <p className="text-3xl font-black mt-2 text-foreground">{stats.totalReviews || 0}</p>
                <div className="flex items-center gap-1 mt-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">
                  <span className="text-xs font-semibold">+{stats.reviewsGrowth || 0} Recent</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl shadow-inner">
                <TrendingUp className="w-6 h-6 text-emerald-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-green-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Favorites</p>
                {/* Replaced outdated Orders metric with Favorites for consistency with Analytics */}
                <p className="text-3xl font-black mt-2 text-foreground">{stats.totalFavorites || 0}</p>
                <div className="flex items-center gap-1 mt-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit">
                  <span className="text-xs font-semibold">+{stats.favoritesGrowth || 0} New</span>
                </div>
              </div>
              <div className="p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-inner">
                <Heart className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className=" text-xl font-bold">Platform Activity</CardTitle>
            <CardDescription>User registrations and engagement over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#F97316', strokeWidth: 1 }}
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="users" stroke="#F97316" strokeWidth={3} dot={{ r: 4, fill: '#F97316', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} name="New Users" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className=" text-xl font-bold">Growth Metrics</CardTitle>
            <CardDescription>Engagement volume comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#FFF7ED' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="users" fill="#F97316" radius={[4, 4, 0, 0]} name="Engagement" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals */}
      {recentVendors.some(v => v.status === 'PENDING') && (
        <Card className="border-orange-200 bg-orange-50/30 overflow-hidden shadow-md">
          <CardHeader className="bg-orange-100/50 border-b border-orange-100">
            <CardTitle className="text-orange-800 flex items-center gap-2 text-lg">
              <AlertCircle className="w-5 h-5" />
              Pending Approvals
            </CardTitle>
            <CardDescription>New vendors waiting for verification</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {recentVendors.filter(v => v.status === 'PENDING').map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-orange-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex-1">
                    <p className="font-bold text-lg text-foreground">{vendor.name}</p>
                    <p className="text-sm text-muted-foreground">{vendor.cuisine} • {vendor.address}</p>
                    <p className="text-xs text-orange-600 mt-1 font-medium bg-orange-50 w-fit px-2 py-0.5 rounded">Applied: {new Date(vendor.createdAt).toLocaleDateString()}</p>
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
                      className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow"
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

      {/* Recent Vendor Applications Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Recent Vendors</CardTitle>
            <CardDescription>Latest vendor registrations on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVendors.map((vendor) => (
                <div key={vendor.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-gray-100 transition-all duration-200 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">{vendor.cuisine}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">{vendor.rating} ★</p>
                      <p className="text-xs text-muted-foreground">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap shadow-sm ${vendor.status === 'APPROVED' || vendor.status === 'AVAILABLE'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : vendor.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-700 border border-amber-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                      {vendor.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 hover:bg-gray-50 border-dashed">
              View All Vendors
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions & System */}
        <div className="space-y-6">
          <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Announcement Center</CardTitle>
              <CardDescription>Manage platform-wide broadcasts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Active Announcements List */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Active Broadcasts</h4>
                {announcements.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No active announcements</p>
                ) : (
                  announcements.filter((a: any) => a.active).map((announcement: any) => (
                    <div key={announcement.id} className={`p-3 rounded-lg border flex items-center justify-between group ${announcement.type === 'WARNING' ? 'bg-red-50 border-red-100' :
                      announcement.type === 'ALERT' ? 'bg-yellow-50 border-yellow-100' :
                        'bg-blue-50 border-blue-100'
                      }`}>
                      <div className="flex-1 min-w-0 mr-2">
                        <p className="text-sm font-medium truncate">{announcement.message}</p>
                        <p className="text-xs opacity-70">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-100/50"
                        onClick={async () => {
                          try {
                            await announcementApi.delete(announcement.id)
                            window.location.reload()
                          } catch (e) { console.error(e) }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-muted-foreground mb-3">Create New</h4>
                <form onSubmit={async (e) => {
                  e.preventDefault()
                  const form = e.target as HTMLFormElement
                  const message = (form.elements.namedItem('message') as HTMLInputElement).value
                  const type = (form.elements.namedItem('type') as HTMLSelectElement).value

                  if (!message) return

                  try {
                    await announcementApi.create({ message, type, isActive: true })
                    form.reset()
                    const updated = await announcementApi.getAll()
                    setAnnouncements(updated)
                    toast.success('Announcement posted')
                  } catch (err) {
                    console.error(err)
                    toast.error('Failed to post announcement')
                  }
                }} className="space-y-4">
                  <textarea
                    name="message"
                    placeholder="What's happening?"
                    className="flex min-h-[80px] w-full rounded-xl border border-input bg-white p-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 resize-none"
                    required
                  />
                  <div className="flex gap-2">
                    <select
                      name="type"
                      className="flex h-10 w-full rounded-lg border border-input bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                      <option value="INFO">Info (Blue)</option>
                      <option value="WARNING">Warning (Red)</option>
                      <option value="ALERT">Alert (Yellow)</option>
                    </select>
                    <Button type="submit" size="sm" className="shadow-md hover:shadow-lg transition-all">Post</Button>
                  </div>
                </form>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg" id="system-status">
            <CardHeader>
              <CardTitle className="text-lg font-bold">System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="font-medium text-sm text-emerald-900">API Gateway</span>
                  </div>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    </div>
                    <span className="font-medium text-sm text-emerald-900">Database</span>
                  </div>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
