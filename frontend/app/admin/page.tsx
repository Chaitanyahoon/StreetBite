'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Users, Heart, AlertCircle, ShieldCheck, Trash2, Sparkles, Plus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { analyticsApi, vendorApi, announcementApi } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const [postingAnnouncement, setPostingAnnouncement] = useState(false)
  const { logout } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchData = useCallback(async () => {
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
      setErrorMessage(null)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      const status = (error as any)?.response?.status
      if (status === 401 || status === 403) {
        setErrorMessage('Your admin session has expired. Please sign in again.')
        toast.error('Admin session required')
        if (status === 401) {
          await logout()
        }
      } else {
        setErrorMessage('Failed to load admin data. Please refresh and try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleStatusUpdate = async (vendorId: number, newStatus: string) => {
    try {
      await vendorApi.updateStatus(vendorId, newStatus)
      toast.success(`Stall status updated to ${newStatus}`)
      
      // Refresh data
      const vendorsData = await vendorApi.getAll()
      const vendors = Array.isArray(vendorsData) ? vendorsData : []

      const sortedVendors = vendors
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)

      setRecentVendors(sortedVendors)

      // Update stats
      const platformData = await analyticsApi.getPlatformAnalytics()
      setStats(platformData)
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-black font-black uppercase tracking-wider text-xs">Loading Admin Area...</p>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center bg-stone-50">
        <div className="rounded-3xl border-4 border-black bg-white p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-lg mx-auto">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-red-300 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <AlertCircle className="h-8 w-8 text-black" />
          </div>
          <h3 className="text-xl font-black uppercase">Admin Portal Error</h3>
          <p className="mt-2 text-sm font-bold text-black/60">{errorMessage}</p>
          <Button
            className="w-full mt-5 h-12 border-3 border-black rounded-xl font-black uppercase text-xs tracking-wider bg-black text-white hover:bg-gray-800 shadow-[3px_3px_0px_0px_rgba(251,191,36,1)] hover:-translate-y-0.5 transition-all cursor-pointer"
            onClick={() => window.location.href = '/signin'}
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-6">
      {/* Welcome Banner */}
      <div className="bg-[#fffaf4] rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-3 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-yellow-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Security Shielded
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight leading-none">
            Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">Admin</span>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
            Track metrics and manage the StreetBite ecosystem.
          </p>
        </div>

        {/* Generate CSV Report Button */}
        <button
          onClick={() => {
            const escapeCsv = (str: string) => `"${String(str).replace(/"/g, '""')}"`;
            const csvHeader = ["Metric", "Value"];
            const csvRows = [
              ["Total Vendors", stats.totalVendors],
              ["Total Users", stats.totalUsers],
              ["Total Reviews", stats.totalReviews],
              ["Total Favorites", stats.totalFavorites],
              [],
              ["Recent Vendors"],
              ["Name", "Cuisine", "Status", "Date"]
            ];
            recentVendors.forEach(v => {
              csvRows.push([
                v.name,
                v.cuisine,
                v.status,
                new Date(v.createdAt).toLocaleDateString()
              ]);
            });
            const csvString = [
              csvHeader.join(","),
              ...csvRows.map(row => row.map(cell => escapeCsv(cell)).join(","))
            ].join("\n");
            const blob = new Blob(["\ufeff" + csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `streetbite_report_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            toast.success("CSV Report generated");
          }}
          className="h-11 px-5 border-3 border-black rounded-xl font-black uppercase text-xs tracking-wider bg-yellow-300 hover:bg-yellow-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer w-full sm:w-auto text-center"
        >
          Generate Report
        </button>
      </div>

      {/* Platform Stats Bento Grid (2x2 on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Vendors */}
        <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Vendors</p>
              <p className="text-2xl sm:text-4xl font-black text-black leading-none">{stats.totalVendors}</p>
            </div>
            <div className="p-2 bg-orange-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-black rounded px-1.5 py-0.5">
              +{stats.vendorsGrowth || 0} Growth
            </span>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Users</p>
              <p className="text-2xl sm:text-4xl font-black text-black leading-none">{stats.totalUsers}</p>
            </div>
            <div className="p-2 bg-blue-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[9px] font-black uppercase bg-blue-100 text-blue-800 border border-black rounded px-1.5 py-0.5">
              +{stats.usersGrowth || 0} Growth
            </span>
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Reviews</p>
              <p className="text-2xl sm:text-4xl font-black text-black leading-none">{stats.totalReviews || 0}</p>
            </div>
            <div className="p-2 bg-emerald-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-black rounded px-1.5 py-0.5">
              +{stats.reviewsGrowth || 0} growth
            </span>
          </div>
        </div>

        {/* Active Favorites */}
        <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-3.5 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Favorites</p>
              <p className="text-2xl sm:text-4xl font-black text-black leading-none">{stats.totalFavorites || 0}</p>
            </div>
            <div className="p-2 bg-green-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
              <Heart className="w-5 h-5 text-green-600 fill-green-600" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[9px] font-black uppercase bg-green-100 text-green-800 border border-black rounded px-1.5 py-0.5">
              +{stats.favoritesGrowth || 0} Growth
            </span>
          </div>
        </div>
      </div>

      {/* Unified Toggleable Chart Widget */}
      <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 border-b-2 border-black/10 pb-3 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-black">Platform Trends</h3>
            <p className="text-[10px] sm:text-xs text-black/50 font-bold">Activity statistics over the last 7 days</p>
          </div>
          
          {/* Dashboard Segmented Toggler */}
          <div className="inline-flex bg-white border-2 border-black rounded-xl p-0.5 shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1.5 text-[9px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                chartType === 'line'
                  ? 'bg-orange-300 text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-black/50 hover:bg-black/5'
              }`}
            >
              Activity Line
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1.5 text-[9px] sm:text-xs font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-orange-300 text-black border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                  : 'text-black/50 hover:bg-black/5'
              }`}
            >
              Engagement Bar
            </button>
          </div>
        </div>

        <div className="w-full min-h-[220px] sm:min-h-[300px]">
          <ResponsiveContainer width="100%" height={isMobile ? 240 : 300}>
            {chartType === 'line' ? (
              <LineChart data={stats.recentActivity} margin={{ left: isMobile ? -20 : 0, right: 10 }}>
                {!isMobile && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />}
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: isMobile ? 8 : 10, fontWeight: 'bold' }} interval={isMobile ? 1 : 0} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: isMobile ? 8 : 10, fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ border: '2px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)', fontWeight: 'bold' }}
                />
                <Legend iconType="rect" formatter={(value) => <span className="font-bold text-black text-[9px] sm:text-xs uppercase">{value}</span>} />
                <Line type="monotone" dataKey="users" stroke="#F97316" strokeWidth={3} dot={{ r: 4, fill: '#F97316', strokeWidth: 2, stroke: '#000' }} activeDot={{ r: 6 }} name="New Registrations" />
              </LineChart>
            ) : (
              <BarChart data={stats.recentActivity} margin={{ left: isMobile ? -20 : 0, right: 10 }}>
                {!isMobile && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />}
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: isMobile ? 8 : 10, fontWeight: 'bold' }} interval={isMobile ? 1 : 0} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#000', fontSize: isMobile ? 8 : 10, fontWeight: 'bold' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ border: '2px solid black', borderRadius: '8px', boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)', fontWeight: 'bold' }}
                />
                <Legend iconType="rect" formatter={(value) => <span className="font-bold text-black text-[9px] sm:text-xs uppercase">{value}</span>} />
                <Bar dataKey="users" fill="#facc15" stroke="#000" strokeWidth={2} radius={[4, 4, 0, 0]} name="Active Engagement" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pending Approvals */}
      {recentVendors.some(v => v.status === 'PENDING') && (
        <div className="bg-[#fffaf4] rounded-2xl border-3 border-orange-400 p-4 sm:p-6 bg-orange-50/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-orange-400/20 pb-2">
            <AlertCircle className="w-5.5 h-5.5 text-orange-600 stroke-[2.5]" />
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-orange-800">Pending Approvals</h3>
          </div>
          <div className="space-y-3">
            {recentVendors.filter(v => v.status === 'PENDING').map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white border-2 border-black rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex-1">
                  <p className="font-black text-xs sm:text-base text-black uppercase tracking-tight">{vendor.name}</p>
                  <p className="text-[10px] sm:text-xs font-bold text-black/60 mt-0.5">
                    {vendor.cuisine} • {vendor.address}
                  </p>
                  <span className="text-[9px] font-black text-orange-700 bg-orange-100 border border-orange-200 rounded px-1.5 py-0.5 mt-1.5 inline-block uppercase tracking-wider">
                    Applied: {new Date(vendor.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    className="flex-1 sm:flex-initial h-9 border-2 border-black text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg px-4 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer text-center font-bold"
                    onClick={() => handleStatusUpdate(vendor.id, 'REJECTED')}
                  >
                    Reject
                  </button>
                  <button
                    className="flex-1 sm:flex-initial h-9 border-2 border-black bg-emerald-400 text-black hover:bg-emerald-500 rounded-lg px-4 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer text-center font-bold"
                    onClick={() => handleStatusUpdate(vendor.id, 'APPROVED')}
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lists Section: Recent Vendors & Announcements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Vendors list Card */}
        <div className="md:col-span-2 bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-black/10 pb-2">
            <Sparkles className="w-5.5 h-5.5 text-orange-500 stroke-[2.5]" />
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-black">Recent Vendor Signups</h3>
          </div>
          <div className="space-y-3">
            {recentVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white border-2 border-black rounded-xl p-3 flex flex-row items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 border-2 border-black flex items-center justify-center text-black font-black text-sm uppercase flex-shrink-0">
                    {vendor.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-xs sm:text-sm text-black uppercase tracking-tight">{vendor.name}</p>
                    <p className="text-[10px] font-bold text-black/50 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{vendor.cuisine}</span>
                      <span className="text-amber-600 font-extrabold">★ {vendor.rating || '0.0'}</span>
                      <span className="sm:hidden text-black/30">•</span>
                      <span className="sm:hidden font-medium text-black/40">{new Date(vendor.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-black">{vendor.rating} ★</p>
                    <p className="text-[9px] font-bold text-black/40 mt-0.5">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-0.5 border-2 border-black rounded-lg text-[9px] font-black uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                    vendor.status === 'APPROVED' || vendor.status === 'AVAILABLE'
                      ? 'bg-green-300 text-black'
                      : vendor.status === 'PENDING'
                        ? 'bg-yellow-300 text-black'
                        : 'bg-red-300 text-black'
                  }`}>
                    {vendor.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Announcement Center Card */}
        <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-black/10 pb-2">
            <Plus className="w-5.5 h-5.5 text-orange-500 stroke-[2.5]" />
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-black">Announcements</h3>
          </div>
          
          <div className="space-y-4">
            {/* Active Announcements List */}
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-wide text-black/40">Active Broadcasts</p>
              {announcements.length === 0 ? (
                <p className="text-xs text-black/40 font-bold italic pl-1">No active announcements</p>
              ) : (
                announcements.filter((a: any) => a.active).map((announcement: any) => (
                  <div
                    key={announcement.id}
                    className={`p-2.5 rounded-xl border-2 border-black flex items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      announcement.type === 'WARNING'
                        ? 'bg-red-200'
                        : announcement.type === 'ALERT'
                          ? 'bg-yellow-200'
                          : 'bg-blue-200'
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="text-xs font-bold text-black truncate">{announcement.message}</p>
                      <p className="text-[9px] font-bold text-black/50 mt-0.5">{new Date(announcement.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      className="h-7 w-7 border-2 border-black bg-red-100 hover:bg-red-300 rounded-lg flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:-translate-y-0.5 transition-all active:translate-y-0.5"
                      onClick={async () => {
                        try {
                          await announcementApi.delete(announcement.id)
                          setAnnouncements((prev) => prev.filter((item) => item.id !== announcement.id))
                          toast.success('Announcement deleted')
                        } catch (e) {
                          console.error(e)
                          toast.error('Failed to delete')
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-black" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Create Announcement */}
            <div className="border-t border-black/10 pt-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-black/40 mb-2">Create Announcement</p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (postingAnnouncement) return
                  const form = e.target as HTMLFormElement
                  const message = (form.elements.namedItem('message') as HTMLInputElement).value
                  const type = (form.elements.namedItem('type') as HTMLSelectElement).value

                  if (!message) return
                  setPostingAnnouncement(true)

                  try {
                    await announcementApi.create({ message, type, isActive: true })
                    form.reset()
                    const updated = await announcementApi.getAll()
                    setAnnouncements(updated)
                    toast.success('Announcement posted')
                  } catch (err) {
                    console.error(err)
                    toast.error('Failed to post')
                  } finally {
                    setPostingAnnouncement(false)
                  }
                }}
                className="space-y-3"
              >
                <textarea
                  name="message"
                  placeholder="What's happening on the platform?"
                  className="w-full border-3 border-black rounded-xl p-2.5 text-xs font-bold outline-none focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white transition-all resize-none min-h-[70px] placeholder:text-gray-400"
                  required
                  disabled={postingAnnouncement}
                />
                <div className="flex gap-2">
                  <select
                    name="type"
                    disabled={postingAnnouncement}
                    className="flex-1 h-10 border-3 border-black rounded-xl px-2 text-xs font-black uppercase bg-white cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                  >
                    <option value="INFO">Info (Blue)</option>
                    <option value="WARNING">Warning (Red)</option>
                    <option value="ALERT">Alert (Yellow)</option>
                  </select>
                  <button
                    type="submit"
                    disabled={postingAnnouncement}
                    className="h-10 border-3 border-black bg-black text-white hover:bg-gray-800 rounded-xl px-4 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(251,191,36,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center font-bold"
                  >
                    {postingAnnouncement ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
