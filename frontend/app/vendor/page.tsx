'use client'

import { useState, useEffect, useCallback } from 'react'
import { Eye, MapPin, Utensils, Star, UtensilsCrossed, TrendingUp, Tag, Settings, Sparkles } from 'lucide-react'
import { analyticsApi, vendorApi, type ApiVendor, type VendorStatus } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import Link from 'next/link'

export default function VendorDashboard() {
  const { user } = useAuth()
  const [vendor, setVendor] = useState<ApiVendor | null>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const loadData = useCallback(async () => {
    try {
      if (!user) {
        setLoading(false)
        return
      }

      const vendorId = user.vendorId
      if (!vendorId || String(vendorId) === 'undefined' || String(vendorId) === 'null') {
        console.warn('VendorId missing or invalid in user data')
        setLoading(false)
        return
      }

      const idStr = String(vendorId)
      
      // Fetch both vendor details and analytics in parallel
      const [vendorData, analyticsData] = await Promise.all([
        vendorApi.getById(idStr),
        analyticsApi.getVendorAnalytics(idStr)
      ])

      setVendor(vendorData)
      setAnalytics(analyticsData)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
      toast.error('Failed to load dashboard details')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handleStatusChange = async (newStatus: VendorStatus) => {
    if (!vendor) return
    setUpdatingStatus(true)
    try {
      const updated = await vendorApi.updateStatus(vendor.id, newStatus)
      setVendor(updated)
      toast.success(`Stall status updated to ${newStatus}`)
    } catch (err) {
      console.error('Failed to update vendor status:', err)
      toast.error('Failed to update status. Please try again.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-orange-500 mx-auto mb-4"></div>
          <p className="text-black font-black uppercase tracking-wider text-xs">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!vendor || !analytics) {
    return (
      <div className="rounded-3xl border-4 border-black bg-white p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-lg mx-auto mt-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-black bg-yellow-300 mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <Utensils className="h-8 w-8 text-black" />
        </div>
        <h3 className="text-xl font-black uppercase">No Dashboard Available</h3>
        <p className="mt-2 text-sm font-bold text-black/60">
          Make sure your account is registered as a Vendor or contact support.
        </p>
      </div>
    )
  }

  // Get status background color for neobrutalist dropdown
  const getStatusBgColor = (status?: VendorStatus) => {
    if (status === 'AVAILABLE') return 'bg-green-300'
    if (status === 'BUSY') return 'bg-orange-300'
    return 'bg-red-300'
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Welcome Banner (Neobrutalist Box) */}
      <div className="bg-[#fffaf4] rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-3 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-yellow-300 px-3 py-1 text-[10px] font-black uppercase tracking-wider mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="h-3.5 w-3.5 fill-current" />
            Vendor Portal
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight leading-none">
            Welcome, {vendor.name}!
          </h1>
          <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">
            Manage your street food business and track performance.
          </p>
        </div>

        {/* Real-time Status Controller */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
          <span className="text-[10px] font-black uppercase tracking-wider text-black/50 ml-1 block sm:hidden">Stall Status</span>
          <div className="relative w-full xs:w-44">
            <select
              value={vendor.status || 'UNAVAILABLE'}
              disabled={updatingStatus}
              onChange={(e) => handleStatusChange(e.target.value as VendorStatus)}
              className={`w-full h-11 px-3 border-3 border-black rounded-xl font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer outline-none ${getStatusBgColor(vendor.status)}`}
            >
              <option value="AVAILABLE" className="bg-white font-bold text-black">🟢 Open</option>
              <option value="BUSY" className="bg-white font-bold text-black">🟡 Busy</option>
              <option value="UNAVAILABLE" className="bg-white font-bold text-black">🔴 Closed</option>
            </select>
            {updatingStatus && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        </div>
      </div>

      {/* Analytics Bento Grid (2x2 on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Profile Views */}
        <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Profile Views</p>
              <p className="text-2xl sm:text-4xl font-black text-black leading-none">{analytics.profileViews || 0}</p>
            </div>
            <div className="p-2 bg-sky-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Eye className="w-5 h-5 text-sky-600" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-black/40 mt-3">Views in last 7 days</p>
        </div>

        {/* Direction Clicks */}
        <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Directions</p>
              <p className="text-2xl sm:text-4xl font-black text-black leading-none">{analytics.directionClicks || 0}</p>
            </div>
            <div className="p-2 bg-green-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-green-600 mt-3">High intent navigation</p>
        </div>

        {/* Menu Interactions */}
        <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Menu Clicks</p>
              <p className="text-2xl sm:text-4xl font-black text-black leading-none">{analytics.menuInteractions || 0}</p>
            </div>
            <div className="p-2 bg-orange-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Utensils className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-black/40 mt-3">Dish details interactions</p>
        </div>

        {/* Average Rating */}
        <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-[10px] sm:text-xs font-black uppercase text-black/50 tracking-wider">Rating</p>
              <p className="text-2xl sm:text-4xl font-black text-black leading-none">
                {analytics.averageRating?.toFixed(1) || '0.0'}
              </p>
            </div>
            <div className="p-2 bg-yellow-100 border-2 border-black rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-black/40 mt-3">
            From {analytics.totalReviews || 0} reviews
          </p>
        </div>
      </div>

      {/* Quick Toolbar Links */}
      <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <h3 className="text-sm sm:text-base font-black uppercase text-black tracking-wider mb-3">Live Actions Panel</h3>
        <div className="grid grid-cols-3 gap-3">
          <Link href="/vendor/menu" className="w-full">
            <button className="w-full h-11 xs:h-12 border-3 border-black rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-wider bg-orange-300 hover:bg-orange-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
              <UtensilsCrossed className="w-4.5 h-4.5 text-black" />
              Menu
            </button>
          </Link>
          <Link href="/vendor/promotions" className="w-full">
            <button className="w-full h-11 xs:h-12 border-3 border-black rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-wider bg-emerald-300 hover:bg-emerald-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
              <Tag className="w-4.5 h-4.5 text-black" />
              Offers
            </button>
          </Link>
          <Link href="/vendor/settings" className="w-full">
            <button className="w-full h-11 xs:h-12 border-3 border-black rounded-xl font-black uppercase text-[10px] sm:text-xs tracking-wider bg-sky-200 hover:bg-sky-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] cursor-pointer">
              <Settings className="w-4.5 h-4.5 text-black" />
              Settings
            </button>
          </Link>
        </div>
      </div>

      {/* Top Performing Items List */}
      {analytics.topItems && analytics.topItems.length > 0 && (
        <div className="bg-[#fffaf4] rounded-2xl border-3 border-black p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-4 border-b-2 border-black/10 pb-2">
            <TrendingUp className="w-5.5 h-5.5 text-orange-500 stroke-[2.5]" />
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-black">Most Popular Dishes</h3>
          </div>
          <div className="space-y-3">
            {analytics.topItems.map((item: any, idx: number) => (
              <div
                key={idx}
                className="bg-white border-2 border-black rounded-xl p-3 flex flex-row items-center justify-between shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                <div>
                  <p className="font-black text-xs sm:text-sm text-black uppercase tracking-tight">{item.name}</p>
                  <p className="text-[10px] font-bold text-black/50 mt-0.5">{item.views || 0} page views</p>
                </div>
                <div className="bg-orange-100 border-2 border-black px-2.5 py-1 rounded-lg text-[10px] font-black text-orange-800 uppercase shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                  {item.clicks || 0} clicks
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
