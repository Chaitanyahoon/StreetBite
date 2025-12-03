'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Flame, Tag, Calendar, MapPin, Copy, Store, Star, ArrowRight, Filter, SlidersHorizontal } from 'lucide-react'
import { useState, useEffect } from 'react'
import { promotionApi } from '@/lib/api'
import { Footer } from '@/components/footer'
import Link from 'next/link'

interface Vendor {
  id: number
  name: string
  rating: number
  displayImageUrl?: string
  address?: string
  cuisine?: string
}

interface Promotion {
  id: number
  vendor: Vendor
  title: string
  description: string
  discountType: string
  discountValue: number
  promoCode: string
  startDate?: string
  endDate: string
  isActive: boolean
  maxUses: number
  currentUses?: number
  minOrderValue?: number
}

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<number | null>(null)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  // Filter & Sort State
  const [filterType, setFilterType] = useState<'all' | 'percentage' | 'fixed'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'ending_soon' | 'highest_discount'>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCuisine, setSelectedCuisine] = useState('All')

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await promotionApi.getAllActive()
        console.log('Offers Page - Received Promotions:', data)
        setPromotions(data || [])
      } catch (error) {
        console.error('Error fetching promotions:', error)
        setPromotions([])
      } finally {
        setLoading(false)
      }
    }

    fetchPromotions()
  }, [])

  // Derived State
  const cuisines = ['All', ...Array.from(new Set(promotions.map(p => p.vendor?.cuisine).filter(Boolean)))] as string[]

  const featuredDeal = promotions.reduce((prev, current) => {
    return (prev.discountValue > current.discountValue) ? prev : current
  }, promotions[0])

  const filteredPromotions = promotions
    .filter(p => {
      // Type Filter
      if (filterType === 'percentage' && p.discountType !== 'PERCENTAGE') return false
      if (filterType === 'fixed' && (p.discountType !== 'FIXED_AMOUNT' && p.discountType !== 'FIXED')) return false

      // Cuisine Filter
      if (selectedCuisine !== 'All' && p.vendor?.cuisine !== selectedCuisine) return false

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim()
        if (!query) return true

        const titleMatch = p.title?.toLowerCase().includes(query) || false
        const descMatch = p.description?.toLowerCase().includes(query) || false
        const vendorMatch = p.vendor?.name?.toLowerCase().includes(query) || false
        const codeMatch = p.promoCode?.toLowerCase().includes(query) || false

        return titleMatch || descMatch || vendorMatch || codeMatch
      }

      return true
    })
    .sort((a, b) => {
      if (sortBy === 'highest_discount') return b.discountValue - a.discountValue
      if (sortBy === 'ending_soon') {
        if (!a.endDate) return 1
        if (!b.endDate) return -1
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      }
      // Newest (using ID as proxy)
      return b.id - a.id
    })

  const getDiscountText = (promo: Promotion) => {
    if (promo.discountType === 'PERCENTAGE') {
      return `${promo.discountValue}% OFF`
    } else if (promo.discountType === 'FIXED_AMOUNT') {
      return `₹${promo.discountValue} OFF`
    } else {
      return 'SPECIAL OFFER'
    }
  }

  const daysUntilExpiry = (date: string) => {
    if (!date) return 'No Expiry'
    const today = new Date()
    const expiry = new Date(date)
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 'Expired'
  }

  const copyToClipboard = (code: string, id: number) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-white border-b border-gray-200 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 mb-6 animate-fade-in">
            <Flame size={16} className="text-orange-500 fill-orange-500" />
            <span className="text-sm font-bold text-orange-700">Hot Deals This Week</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
            Discover the Best <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Street Food Offers</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Save big on your favorite local flavors. Grab these exclusive deals before they expire!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Featured Deal Section */}
          {featuredDeal && !loading && !searchQuery && selectedCuisine === 'All' && filterType === 'all' && (
            <div className="mb-12 relative overflow-hidden rounded-3xl bg-gray-900 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-600/20 to-transparent"></div>
              <div className="grid md:grid-cols-2 gap-8 p-8 md:p-12 relative z-10">
                <div className="flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-400/20 text-yellow-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                    <Star size={12} className="fill-yellow-300" />
                    Deal of the Day
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                    {getDiscountText(featuredDeal)} <br />
                    <span className="text-gray-400 text-2xl md:text-3xl font-bold">at {featuredDeal.vendor?.name}</span>
                  </h2>
                  <p className="text-gray-400 mb-8 text-lg max-w-md">{featuredDeal.description}</p>

                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-white/10">
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Use Code</p>
                      <div className="flex items-center gap-3">
                        <code className="text-xl font-mono font-bold text-yellow-400">{featuredDeal.promoCode}</code>
                        <button onClick={() => copyToClipboard(featuredDeal.promoCode, featuredDeal.id)} className="text-gray-400 hover:text-white transition-colors">
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    {featuredDeal.vendor?.id && (
                      <Link href={`/vendors/${featuredDeal.vendor.id}`} className="flex-1 sm:flex-none">
                        <Button className="w-full h-full bg-white text-gray-900 hover:bg-gray-100 font-bold px-8 rounded-xl text-lg">
                          Claim Now
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
                  {featuredDeal.vendor?.displayImageUrl && (
                    <img
                      src={featuredDeal.vendor.displayImageUrl}
                      alt="Featured Deal"
                      className="rounded-2xl shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500 max-w-sm object-cover h-80 w-full"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-col gap-6 mb-10">
            {/* Search and Sort Row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm shadow-sm transition-all"
                  placeholder="Search for food, vendors, or deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <SlidersHorizontal size={18} className="text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-primary focus:border-primary block w-full p-3 font-medium shadow-sm cursor-pointer"
                >
                  <option value="newest">Newest Added</option>
                  <option value="highest_discount">Highest Discount</option>
                  <option value="ending_soon">Ending Soon</option>
                </select>
              </div>
            </div>

            {/* Cuisine Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {cuisines.map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setSelectedCuisine(cuisine)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${selectedCuisine === cuisine
                    ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {cuisine}
                </button>
              ))}
            </div>

            {/* Type Filters */}
            <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2">Filter By:</span>
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'all' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                All Types
              </button>
              <button
                onClick={() => setFilterType('percentage')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'percentage' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                % Discount
              </button>
              <button
                onClick={() => setFilterType('fixed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterType === 'fixed' ? 'bg-orange-100 text-orange-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Flat Savings
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Hunting for the best deals...</p>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Tag className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Active Offers Found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {filterType !== 'all' ? 'Try changing your filters to see more results.' : 'Check back later for new deals from our vendors!'}
              </p>
              {filterType !== 'all' && (
                <button
                  onClick={() => setFilterType('all')}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPromotions.map((promo) => (
                <div key={promo.id} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">

                  {/* Vendor Header */}
                  <div className="p-4 border-b border-gray-50 flex items-center gap-3 bg-gray-50/50">
                    <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                      {promo.vendor?.displayImageUrl ? (
                        <img src={promo.vendor.displayImageUrl} alt={promo.vendor.name} className="h-full w-full object-cover" />
                      ) : (
                        <Store className="h-5 w-5 text-gray-400 m-2.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{promo.vendor?.name || 'Unknown Vendor'}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span>{promo.vendor?.rating?.toFixed(1) || 'New'}</span>
                        <span>•</span>
                        <span className="truncate">{promo.vendor?.address || 'Street Food'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Offer Content */}
                  <div className="p-6 flex-1 flex flex-col relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-100 to-transparent rounded-bl-full opacity-50 -mr-8 -mt-8"></div>

                    <div className="flex items-start justify-between mb-4 relative z-10">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${promo.discountType === 'PERCENTAGE' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                        {promo.discountType === 'PERCENTAGE' ? 'Deal' : 'Save Flat'}
                      </span>
                      {promo.endDate && (
                        <span className={`text-xs font-bold flex items-center gap-1 ${daysUntilExpiry(promo.endDate) === 'Expired' ? 'text-gray-400' :
                          typeof daysUntilExpiry(promo.endDate) === 'number' && (daysUntilExpiry(promo.endDate) as number) <= 3 ? 'text-red-500 animate-pulse' : 'text-orange-500'
                          }`}>
                          <Calendar size={12} />
                          {daysUntilExpiry(promo.endDate) === 'Expired' ? 'Expired' : `${daysUntilExpiry(promo.endDate)} days left`}
                        </span>
                      )}
                    </div>

                    <h2 className="text-2xl font-black text-gray-900 mb-2 leading-tight">
                      {getDiscountText(promo)}
                    </h2>
                    <h4 className="font-semibold text-gray-700 mb-2">{promo.title}</h4>
                    <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-1">{promo.description}</p>

                    {/* Promo Code Box */}
                    <div className="bg-gray-50 rounded-xl p-1 pr-1.5 flex items-center justify-between border border-dashed border-gray-300 mb-4 group-hover:border-primary/30 transition-colors">
                      <div className="px-3 py-2 font-mono font-bold text-gray-700 tracking-wider">
                        {promo.promoCode}
                      </div>
                      <button
                        onClick={() => copyToClipboard(promo.promoCode, promo.id)}
                        className="bg-white hover:bg-gray-100 text-gray-600 p-2 rounded-lg shadow-sm border border-gray-100 transition-all active:scale-95 flex items-center gap-2"
                        title="Copy Code"
                      >
                        {copiedCode === promo.id ? (
                          <span className="text-xs font-bold text-green-600 px-1">Copied!</span>
                        ) : (
                          <>
                            <span className="text-xs font-semibold hidden sm:inline">Copy</span>
                            <Copy size={14} />
                          </>
                        )}
                      </button>
                    </div>

                    {/* Action Button */}
                    {promo.vendor?.id ? (
                      <Link href={`/vendors/${promo.vendor.id}`} className="block">
                        <Button className="w-full bg-gray-900 hover:bg-primary text-white font-bold py-6 rounded-xl transition-all shadow-lg shadow-gray-200 hover:shadow-orange-200 group-hover:scale-[1.02]">
                          Visit Vendor & Redeem
                          <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="w-full bg-gray-200 text-gray-400 font-bold py-6 rounded-xl cursor-not-allowed">
                        Vendor Unavailable
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
