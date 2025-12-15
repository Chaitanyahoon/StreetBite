'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Flame, Tag, Calendar, MapPin, Copy, Store, Star, ArrowRight, Filter, SlidersHorizontal, CheckCircle } from 'lucide-react'
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
    <div className="min-h-screen bg-[#FADFA1] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-orange-400 rounded-full blur-[80px] opacity-40 animate-blob -z-10"></div>
        <div className="absolute top-40 left-0 w-[300px] h-[300px] bg-yellow-400 rounded-full blur-[80px] opacity-40 animate-blob animation-delay-2000 -z-10"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-black text-yellow-400 rounded-full border-2 border-yellow-400 mb-8 transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-0 transition-transform">
            <Flame size={20} className="fill-yellow-400 animate-pulse" />
            <span className="text-sm font-black uppercase tracking-widest">Hot Deals Dropping Daily</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-black mb-6 tracking-tighter leading-[0.9]">
            GRAB THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">BEST BITES</span>
          </h1>
          <p className="text-2xl text-black font-bold max-w-2xl mx-auto leading-relaxed border-b-4 border-black pb-8 inline-block">
            Save big on your favorite local flavors. Don't let these deals go stale!
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Featured Deal Section */}
          {featuredDeal && !loading && !searchQuery && selectedCuisine === 'All' && filterType === 'all' && (
            <div className="mb-16 relative group">
              <div className="absolute inset-0 bg-black rounded-[2.5rem] transform translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
              <div className="relative bg-orange-500 rounded-[2.5rem] border-4 border-black overflow-hidden flex flex-col md:flex-row">
                <div className="p-8 md:p-12 flex-1 relative overflow-hidden">
                  {/* Pattern Overlay */}
                  <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1 bg-yellow-300 text-black border-2 border-black rounded-full text-xs font-black uppercase tracking-wider mb-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <Star size={14} className="fill-black" />
                      Deal of the Day
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-4 leading-none drop-shadow-md">
                      {getDiscountText(featuredDeal)}
                    </h2>
                    <h3 className="text-3xl font-black text-black mb-8">
                      at {featuredDeal.vendor?.name}
                    </h3>

                    <div className="bg-white p-6 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-md transform rotate-1 group-hover:rotate-0 transition-transform">
                      <p className="text-sm font-black text-gray-500 uppercase tracking-widest mb-2">Use This Code</p>
                      <div className="flex items-center gap-4 justify-between">
                        <code className="text-4xl font-black text-black tracking-widest">{featuredDeal.promoCode}</code>
                        <button onClick={() => copyToClipboard(featuredDeal.promoCode, featuredDeal.id)} className="w-12 h-12 bg-black text-yellow-400 rounded-xl flex items-center justify-center hover:scale-110 transition-transform">
                          {copiedCode === featuredDeal.id ? <CheckCircle size={24} /> : <Copy size={24} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative md:w-2/5 min-h-[300px]">
                  <div className="absolute inset-0 bg-black/20"></div>
                  {featuredDeal.vendor?.displayImageUrl ? (
                    <img
                      src={featuredDeal.vendor.displayImageUrl}
                      alt="Featured Deal"
                      className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Store size={64} className="text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                    <Link href={`/vendors/${featuredDeal.vendor?.id}`}>
                      <Button className="w-full h-16 bg-yellow-400 hover:bg-yellow-300 text-black border-4 border-black font-black text-xl rounded-xl shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-1 transition-all">
                        CLAIM NOW
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls Bar */}
          <div className="flex flex-col gap-8 mb-16">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2 group-focus-within:translate-x-3 group-focus-within:translate-y-3 transition-transform"></div>
                <div className="relative z-10">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Filter className="h-6 w-6 text-black" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 border-4 border-black rounded-xl text-lg font-bold bg-white placeholder-gray-400 focus:outline-none focus:ring-0 transition-all"
                    placeholder="Search for food, vendors, or deals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="relative w-full md:w-64 group">
                <div className="absolute inset-0 bg-black rounded-xl translate-x-2 translate-y-2 group-hover:translate-x-3 group-focus-within:translate-y-3 transition-transform"></div>
                <div className="relative z-10 flex items-center bg-white border-4 border-black rounded-xl px-4 h-full">
                  <SlidersHorizontal size={24} className="text-black mr-2" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full bg-transparent font-bold text-lg focus:outline-none cursor-pointer appearance-none py-4"
                  >
                    <option value="newest">Newest Added</option>
                    <option value="highest_discount">Highest Discount</option>
                    <option value="ending_soon">Ending Soon</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                {cuisines.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => setSelectedCuisine(cuisine)}
                    className={`px-6 py-2 rounded-full text-base font-black uppercase tracking-wide transition-all border-4 whitespace-nowrap ${selectedCuisine === cuisine
                      ? 'bg-orange-500 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                      : 'bg-white text-black border-black hover:bg-orange-100 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
                      }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="text-sm font-black text-black uppercase tracking-wider mr-2 bg-white px-3 py-1 border-2 border-black rounded self-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Filter:</span>
                {['all', 'percentage', 'fixed'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-black uppercase transition-all border-2 ${filterType === type
                      ? 'bg-black text-yellow-400 border-black shadow-[3px_3px_0px_0px_#fbbf24]'
                      : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'
                      }`}
                  >
                    {type === 'all' ? 'All Types' : type === 'percentage' ? '% Discount' : 'Flat Savings'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin w-16 h-16 border-8 border-black border-t-yellow-400 rounded-full mx-auto mb-6"></div>
              <p className="text-2xl font-black text-black uppercase">Hunting for Deals...</p>
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border-4 border-black border-dashed">
              <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black">
                <Tag className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-3xl font-black text-black mb-2 uppercase">No Deals Found</h3>
              <p className="text-xl font-bold text-gray-500 max-w-md mx-auto">
                The streets are quiet right now. Try adjusting your filters.
              </p>
              {filterType !== 'all' && (
                <button
                  onClick={() => setFilterType('all')}
                  className="mt-6 text-orange-600 font-black hover:underline uppercase tracking-wider text-lg"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPromotions.map((promo) => (
                <div key={promo.id} className="group relative">
                  {/* Card Shadow */}
                  <div className="absolute inset-0 bg-black rounded-3xl translate-x-3 translate-y-3 transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>

                  {/* Card Content */}
                  <div className="relative bg-white rounded-3xl border-4 border-black overflow-hidden flex flex-col h-full hover:-translate-y-2 transition-transform duration-300">

                    {/* Ticket "Cutout" Effect */}
                    <div className="absolute top-1/2 left-0 w-6 h-6 bg-[#FADFA1] rounded-full -ml-3 border-r-4 border-black z-10"></div>
                    <div className="absolute top-1/2 right-0 w-6 h-6 bg-[#FADFA1] rounded-full -mr-3 border-l-4 border-black z-10"></div>
                    <div className="absolute top-1/2 left-4 right-4 border-t-4 border-dashed border-gray-300"></div>

                    {/* Top Half: Vendor Info */}
                    <div className="p-6 bg-yellow-50 flex items-center gap-4 pb-12">
                      <div className="h-16 w-16 rounded-2xl bg-white border-4 border-black overflow-hidden flex-shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {promo.vendor?.displayImageUrl ? (
                          <img src={promo.vendor.displayImageUrl} alt={promo.vendor.name} className="h-full w-full object-cover" />
                        ) : (
                          <Store className="h-8 w-8 text-black m-3" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-xl text-black truncate">{promo.vendor?.name}</h3>
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-500">
                          <MapPin size={14} />
                          <span className="truncate">{promo.vendor?.address || 'Street Food'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Half: Deal Info */}
                    <div className="p-6 pt-8 flex-1 flex flex-col items-center text-center bg-white">
                      <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider border-2 border-black mb-4 ${promo.discountType === 'PERCENTAGE' ? 'bg-pink-200' : 'bg-green-200'
                        }`}>
                        {promo.discountType === 'PERCENTAGE' ? 'Deal' : 'Flat Off'}
                      </span>

                      <h2 className="text-4xl font-black text-black mb-2 leading-none">
                        {getDiscountText(promo)}
                      </h2>
                      <p className="text-gray-500 font-bold mb-6 line-clamp-2">{promo.title}</p>

                      <div className="w-full mt-auto space-y-4">
                        <div className="bg-black/5 p-3 rounded-xl border-2 border-dashed border-black/20 flex items-center justify-between group-hover:bg-yellow-50 transition-colors">
                          <code className="text-lg font-black text-black tracking-widest">{promo.promoCode}</code>
                          <button onClick={() => copyToClipboard(promo.promoCode, promo.id)} className="text-gray-400 hover:text-black transition-colors">
                            {copiedCode === promo.id ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}
                          </button>
                        </div>

                        {promo.vendor?.id ? (
                          <Link href={`/vendors/${promo.vendor.id}`} className="block">
                            <Button className="w-full h-12 bg-black text-white hover:bg-orange-500 border-4 border-black font-black uppercase tracking-wide rounded-xl shadow-[2px_2px_0px_0px_#9ca3af] hover:shadow-[4px_4px_0px_0px_#000000] transition-all">
                              Redeem Now
                            </Button>
                          </Link>
                        ) : (
                          <Button disabled className="w-full bg-gray-200 text-gray-400 font-bold border-4 border-gray-300 rounded-xl cursor-not-allowed">
                            Unavailable
                          </Button>
                        )}
                      </div>
                    </div>
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
