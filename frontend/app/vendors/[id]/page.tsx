'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Star, Phone, Share2, Navigation, ChevronLeft, Utensils, Heart, Send, CheckCircle2, Wifi, CreditCard, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DirectionsMap } from '@/components/directions-map'
import { vendorApi, menuApi, reviewApi, promotionApi, favoriteApi, analyticsApi } from '@/lib/api'
import { Footer } from '@/components/footer'
import { Textarea } from '@/components/ui/textarea'
import { useLiveVendorStatus } from '@/hooks/use-live-vendor-status'
import { useLiveMenuAvailability } from '@/hooks/use-live-menu-availability'
import { useToast } from '@/hooks/use-toast'
import { toast } from 'sonner'

interface Vendor {
    id: string
    name: string
    description: string
    cuisine: string
    address: string
    latitude: number
    longitude: number
    rating: number
    imageUrl?: string
    bannerImageUrl?: string
    displayImageUrl?: string
    phone?: string
    hours?: string
    galleryImages?: string[]
    status?: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'
    location?: string
    openingHours?: string
    isOpen?: boolean
}

interface MenuItem {
    itemId: string
    name: string
    description: string
    price: number
    imageUrl?: string
    category: string
    isAvailable: boolean
    rating?: number
}

interface Review {
    id: number
    rating: number
    comment: string
    createdAt: string
    user: {
        id: number
        displayName: string
    }
}

export default function VendorDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const vendorId = params?.id as string
    const { toast } = useToast()

    const [vendor, setVendor] = useState<Vendor | null>(null)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('menu')
    const [isFavorite, setIsFavorite] = useState(false)
    const [promotions, setPromotions] = useState<any[]>([])

    // Offers filter and sort state
    const [offerFilter, setOfferFilter] = useState<'all' | 'percentage' | 'fixed'>('all')
    const [offerSort, setOfferSort] = useState<'discount' | 'ending' | 'popular'>('discount')

    // Real-time vendor status from Firebase
    const { status: liveStatus } = useLiveVendorStatus(vendorId)

    // Real-time menu availability from Firebase
    const { getAvailability } = useLiveMenuAvailability(menuItems)

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)

    // Directions State
    const [showDirections, setShowDirections] = useState(false)
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

    // Merge live status with vendor data
    const displayVendor = vendor ? {
        ...vendor,
        status: liveStatus || vendor.status
    } : null

    useEffect(() => {
        if (!vendorId) return

        const fetchData = async () => {
            try {
                if (!vendorId || vendorId === 'undefined' || isNaN(Number(vendorId))) {
                    console.error('Invalid vendor ID:', vendorId)
                    setLoading(false)
                    return
                }

                // Log Profile View
                analyticsApi.logEvent(vendorId, 'VIEW_PROFILE').catch(console.error)

                // Fetch vendor details
                const vendorData = await vendorApi.getById(vendorId)
                setVendor(vendorData)

                // Fetch menu items
                const menuData = await menuApi.getByVendor(vendorId)
                setMenuItems(menuData || [])

                // Fetch active promotions
                try {
                    const promos = await promotionApi.getActiveByVendor(vendorId)
                    setPromotions(promos)
                } catch (err) {
                    console.error('Failed to fetch promotions:', err)
                }

                setLoading(false)
            } catch (error) {
                console.error('Error fetching vendor data:', error)
                setLoading(false)
            }
        }

        fetchData()

        // Check favorite status
        const checkFavoriteStatus = async () => {
            if (!vendorId) return
            try {
                const response = await favoriteApi.checkFavorite(vendorId)
                setIsFavorite(response.isFavorite)
            } catch (error) {
                console.error('Error checking favorite status:', error)
            }
        }
        checkFavoriteStatus()
    }, [vendorId])

    const handleGetDirections = () => {
        if (!displayVendor) return

        // Log Direction Click
        analyticsApi.logEvent(vendorId, 'CLICK_DIRECTION').catch(console.error)

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                    setShowDirections(true)
                },
                (error) => {
                    console.error('Error getting location:', error)
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${displayVendor.latitude},${displayVendor.longitude}`
                    window.open(url, '_blank')
                }
            )
        } else {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${displayVendor.latitude},${displayVendor.longitude}`
            window.open(url, '_blank')
        }
    }

    const handleShare = async () => {
        if (!displayVendor) return
        const shareData = {
            title: `Check out ${displayVendor.name} on StreetBite!`,
            text: `I found this amazing street food vendor: ${displayVendor.name}. Check them out!`,
            url: window.location.href,
        }

        try {
            if (navigator.share && navigator.canShare(shareData)) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(window.location.href)
                alert('Link copied to clipboard!')
            }
        } catch (err) {
            console.error('Error sharing:', err)
        }
    }

    const toggleFavorite = async () => {
        if (!vendorId) return

        try {
            if (isFavorite) {
                await favoriteApi.removeFavorite(vendorId)
                setIsFavorite(false)
                toast({
                    title: "Removed from Favorites",
                    description: `${vendor?.name || 'Vendor'} has been removed from your favorites.`,
                })
            } else {
                await favoriteApi.addFavorite(vendorId)
                setIsFavorite(true)
                toast({
                    title: "Added to Favorites",
                    description: `${vendor?.name || 'Vendor'} has been added to your favorites.`,
                })
            }
        } catch (error) {
            console.error('Error toggling favorite:', error)
            toast({
                title: "Error",
                description: "Failed to update favorite status. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleSubmitReview = async () => {
        if (!vendorId || !reviewComment.trim()) {
            alert('Please write a comment for your review')
            return
        }

        // Check if user is logged in
        const userStr = localStorage.getItem('user')
        if (!userStr) {
            toast({
                title: 'Please sign in to leave a review',
                description: 'You need to be logged in to submit reviews',
            })
            setTimeout(() => router.push('/signin'), 1500)
            return
        }

        const user = JSON.parse(userStr)

        setSubmittingReview(true)
        try {
            const reviewData = {
                vendor: { id: parseInt(vendorId) },
                user: { id: user.id },
                rating: reviewRating,
                comment: reviewComment
            }

            await reviewApi.create(reviewData)

            // Refresh reviews
            const updatedReviews = await reviewApi.getByVendor(vendorId)
            setReviews(updatedReviews || [])

            // Reset form
            setReviewComment('')
            setReviewRating(5)
            setShowReviewForm(false)
            alert('Review submitted successfully!')
        } catch (error) {
            console.error('Error submitting review:', error)
            alert('Failed to submit review. Please try again.')
        } finally {
            setSubmittingReview(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading vendor details...</p>
                </div>
            </div>
        )
    }

    if (!vendor) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 py-24 text-center">
                    <h1 className="text-3xl font-bold mb-4">Vendor Not Found</h1>
                    <p className="text-muted-foreground mb-6">The vendor you're looking for doesn't exist or has been removed.</p>
                    <Link href="/explore">
                        <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                            Back to Explore
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Group menu items by category
    const menuByCategory = menuItems.reduce((acc, item) => {
        const category = item.category || 'Other'
        if (!acc[category]) acc[category] = []
        acc[category].push(item)
        return acc
    }, {} as Record<string, MenuItem[]>)

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            {/* Directions Modal */}
            <Dialog open={showDirections} onOpenChange={setShowDirections}>
                <DialogContent className="sm:max-w-[700px] h-[85vh] p-0 overflow-hidden flex flex-col">
                    <DialogHeader className="p-6 pb-4 border-b">
                        <DialogTitle className="text-xl font-bold">Directions to {vendor.name}</DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 w-full relative">
                        {userLocation && (
                            <DirectionsMap
                                origin={userLocation}
                                destination={{ lat: vendor.latitude, lng: vendor.longitude }}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Enhanced Hero Section */}
            <div className="relative h-[400px] md:h-[500px] w-full bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
                <img
                    src={vendor.bannerImageUrl || vendor.imageUrl || "/placeholder-vendor.jpg"}
                    alt={vendor.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop'
                    }}
                />

                {/* Back Button - FIXED */}
                <div className="absolute top-6 left-6 z-20">
                    <Link href="/explore">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="rounded-full bg-white/90 hover:bg-white text-gray-900 backdrop-blur-md shadow-lg hover:scale-110 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </Button>
                    </Link>
                </div>

                {/* Favorite Button - FIXED */}
                <div className="absolute top-6 right-6 z-20">
                    <Button
                        variant="secondary"
                        size="icon"
                        className={`rounded-full backdrop-blur-md shadow-lg hover:scale-110 transition-all ${isFavorite ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-white/90 hover:bg-white text-gray-900'
                            }`}
                        onClick={toggleFavorite}
                    >
                        <Heart size={20} className={isFavorite ? 'fill-current' : ''} />
                    </Button>
                </div>

                {/* Vendor Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-20 text-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3 flex-wrap">
                                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                                        {vendor.cuisine || 'Street Food'}
                                    </span>
                                    {vendor.rating > 0 && (
                                        <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg">
                                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm font-bold">{vendor.rating.toFixed(1)}</span>
                                            <span className="text-xs text-white/80">/ 5.0</span>
                                        </div>
                                    )}
                                    {vendor.status && (
                                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full shadow-lg font-bold text-sm uppercase tracking-wider ${vendor.status === 'AVAILABLE' ? 'bg-green-500 text-white' :
                                            vendor.status === 'BUSY' ? 'bg-orange-500 text-white' :
                                                'bg-gray-500 text-white'
                                            }`}>
                                            <span className={`w-2 h-2 rounded-full ${vendor.status === 'AVAILABLE' ? 'bg-white animate-pulse' :
                                                vendor.status === 'BUSY' ? 'bg-white' :
                                                    'bg-white/60'
                                                }`}></span>
                                            {vendor.status === 'AVAILABLE' ? 'Open Now' :
                                                vendor.status === 'BUSY' ? 'Busy' :
                                                    'Closed'}
                                        </div>
                                    )}
                                    {promotions.length > 0 && (
                                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full shadow-lg font-bold text-sm uppercase tracking-wider bg-red-600 text-white animate-pulse">
                                            🔥 SALE!
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight">{vendor.name}</h1>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-sm md:text-base text-white/90">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={18} className="flex-shrink-0" />
                                        <span className="line-clamp-1">{vendor.address || 'Location available on map'}</span>
                                    </div>
                                    {vendor.hours && (
                                        <>
                                            <span className="hidden sm:block text-white/40">•</span>
                                            <div className="flex items-center gap-2">
                                                <Clock size={18} className="flex-shrink-0" />
                                                <span>{vendor.hours}</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 flex-wrap">
                                <Button
                                    onClick={handleGetDirections}
                                    className="bg-white text-gray-900 hover:bg-gray-100 font-semibold gap-2 shadow-lg hover:scale-105 transition-all"
                                >
                                    <Navigation size={18} />
                                    Get Directions
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleShare}
                                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-md gap-2 shadow-lg hover:scale-105 transition-all"
                                >
                                    <Share2 size={18} />
                                    Share
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Tabs */}
            <div className="sticky top-16 z-30 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex gap-8 overflow-x-auto no-scrollbar">
                        {['Menu', 'Offers', 'About', 'Reviews'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`relative py-4 px-2 text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.toLowerCase()
                                    ? 'text-primary'
                                    : 'text-gray-500 hover:text-gray-900'
                                    }`}
                            >
                                {tab}
                                {tab === 'Reviews' && reviews.length > 0 && (
                                    <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                        {reviews.length}
                                    </span>
                                )}
                                {tab === 'Offers' && promotions.length > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                                        {promotions.length}
                                    </span>
                                )}
                                {activeTab === tab.toLowerCase() && (
                                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-red-500" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {activeTab === 'menu' && (
                    <div className="space-y-10">
                        {menuItems.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <Utensils className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Menu Items Yet</h3>
                                <p className="text-gray-500">This vendor hasn't added their menu yet. Check back soon!</p>
                            </div>
                        ) : (
                            Object.entries(menuByCategory).map(([category, items]) => (
                                <div key={category} className="space-y-6">
                                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                                        <span className="h-1 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                                        {category}
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {items.map((item: any) => (
                                            <div key={item.id || item.itemId} className="group bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                                <div className="relative h-48 bg-gray-100 overflow-hidden">
                                                    <img
                                                        src={item.imageUrl || "/placeholder-food.jpg"}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=2080&auto=format&fit=crop'
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    {/* Availability Badge - uses real-time data */}
                                                    {(() => {
                                                        const itemId = item.id || item.itemId
                                                        const isAvailable = getAvailability(itemId)
                                                        return (
                                                            <>
                                                                <div className="absolute bottom-3 left-3">
                                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm shadow-sm ${isAvailable
                                                                        ? 'bg-green-500/90 text-white'
                                                                        : 'bg-red-500/90 text-white'
                                                                        }`}>
                                                                        {isAvailable ? '✓ In Stock' : '✕ Sold Out'}
                                                                    </span>
                                                                </div>
                                                                {!isAvailable && (
                                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                                        <span className="bg-gray-900/80 text-white px-4 py-2 rounded-full font-bold text-sm">
                                                                            Currently Unavailable
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )
                                                    })()}
                                                </div>
                                                <div className="p-5">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1 flex-1">{item.name}</h3>
                                                        <span className="font-black text-primary text-lg ml-2">₹{item.price}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[40px]">{item.description}</p>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-xs font-semibold bg-orange-50 text-orange-700 px-3 py-1.5 rounded-full uppercase tracking-wide">
                                                            {item.category}
                                                        </span>
                                                        <Button
                                                            size="sm"
                                                            disabled={!getAvailability(item.id || item.itemId)}
                                                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold hover:scale-105 transition-all disabled:opacity-50"
                                                        >
                                                            Add +
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'offers' && (
                    <div className="space-y-6">
                        {/* Filter and Sort Controls */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                <div className="flex-1">
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Filter by Type</label>
                                    <div className="flex gap-2 flex-wrap">
                                        <button
                                            onClick={() => setOfferFilter('all')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${offerFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            All Offers
                                        </button>
                                        <button
                                            onClick={() => setOfferFilter('percentage')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${offerFilter === 'percentage' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            % OFF
                                        </button>
                                        <button
                                            onClick={() => setOfferFilter('fixed')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${offerFilter === 'fixed' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                        >
                                            ₹ OFF
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Sort By</label>
                                    <select
                                        value={offerSort}
                                        onChange={(e) => setOfferSort(e.target.value as any)}
                                        className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium focus:ring-2 focus:ring-primary focus:border-primary"
                                    >
                                        <option value="discount">Highest Discount</option>
                                        <option value="ending">Ending Soon</option>
                                        <option value="popular">Most Popular</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {promotions.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="text-6xl mb-4">🎁</div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Offers</h3>
                                <p className="text-gray-500">Check back soon for exciting deals!</p>
                            </div>
                        ) : (() => {
                            // Filter promotions
                            let filtered = promotions.filter(promo => {
                                if (offerFilter === 'all') return true
                                if (offerFilter === 'percentage') return promo.discountType === 'PERCENTAGE'
                                if (offerFilter === 'fixed') return promo.discountType === 'FIXED'
                                return true
                            })

                            // Sort promotions
                            filtered = [...filtered].sort((a, b) => {
                                if (offerSort === 'discount') {
                                    return b.discountValue - a.discountValue
                                }
                                if (offerSort === 'ending') {
                                    if (!a.endDate) return 1
                                    if (!b.endDate) return -1
                                    return new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
                                }
                                // popular - use id as proxy for now
                                return b.id - a.id
                            })

                            const getBadges = (promo: any) => {
                                const badges = []

                                // Hot Deal Badge
                                if (promo.discountValue >= 30) {
                                    badges.push({ text: '🔥 HOT DEAL', color: 'bg-red-500' })
                                }

                                // Ending Soon Badge
                                if (promo.endDate) {
                                    const daysLeft = Math.ceil((new Date(promo.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                                    if (daysLeft <= 7 && daysLeft > 0) {
                                        badges.push({ text: `⏰ ${daysLeft}d LEFT`, color: 'bg-yellow-500' })
                                    }
                                }

                                // Best Value Badge
                                if (promo.minOrderValue < 200) {
                                    badges.push({ text: '💰 LOW MIN', color: 'bg-green-500' })
                                }

                                return badges
                            }

                            const handleGetDirections = () => {
                                if (vendor?.latitude && vendor?.longitude) {
                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${vendor.latitude},${vendor.longitude}`, '_blank')
                                }
                            }

                            const handleShare = (promo: any) => {
                                const shareText = `Check out this amazing offer at ${vendor?.name}!\n\n${promo.title}\nCode: ${promo.promoCode}\n${promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}\n\nFound on StreetBite 🍔`

                                if (navigator.share) {
                                    navigator.share({
                                        title: `Offer at ${vendor?.name}`,
                                        text: shareText,
                                        url: window.location.href
                                    }).catch(() => { })
                                } else {
                                    navigator.clipboard.writeText(shareText)
                                    alert('Offer details copied to clipboard!')
                                }
                            }

                            return (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filtered.map((promo) => {
                                        const badges = getBadges(promo)

                                        return (
                                            <div key={promo.id} className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden">
                                                {/* Decorative corner */}
                                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 opacity-10 rounded-bl-full"></div>

                                                <div className="flex items-start justify-between mb-4 relative z-10">
                                                    <div className="flex-1">
                                                        {/* Badges */}
                                                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                                                                {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `₹${promo.discountValue} OFF`}
                                                            </span>
                                                            {badges.map((badge, i) => (
                                                                <span key={i} className={`${badge.color} text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm`}>
                                                                    {badge.text}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{promo.title}</h3>
                                                        <p className="text-sm text-gray-600 mb-3">{promo.description}</p>
                                                    </div>
                                                </div>

                                                {/* Promo Code */}
                                                <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs text-gray-500 font-medium">Promo Code</span>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(promo.promoCode)
                                                                alert('Code copied!')
                                                            }}
                                                            className="text-xs text-primary font-bold hover:underline"
                                                        >
                                                            📋 Copy
                                                        </button>
                                                    </div>
                                                    <div className="font-mono font-bold text-lg tracking-wider text-primary border-2 border-dashed border-primary rounded px-3 py-2 text-center bg-orange-50">
                                                        {promo.promoCode}
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex gap-4 text-xs text-gray-600 mb-4">
                                                    {promo.minOrderValue > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-semibold">Min Order:</span>
                                                            <span>₹{promo.minOrderValue}</span>
                                                        </div>
                                                    )}
                                                    {promo.maxUses > 0 && (
                                                        <div className="flex items-center gap-1">
                                                            <span className="font-semibold">Used:</span>
                                                            <span>{promo.currentUses || 0}/{promo.maxUses}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {promo.endDate && (
                                                    <div className="text-xs text-gray-500 mb-4">
                                                        Valid till: {new Date(promo.endDate).toLocaleDateString()}
                                                    </div>
                                                )}

                                                {/* Action Buttons */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={handleGetDirections}
                                                        className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-colors"
                                                    >
                                                        <Navigation size={16} />
                                                        Directions
                                                    </button>
                                                    <button
                                                        onClick={() => handleShare(promo)}
                                                        className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-colors"
                                                    >
                                                        <Share2 size={16} />
                                                        Share
                                                    </button>
                                                </div>

                                                {/* How to Redeem */}
                                                <div className="mt-4 pt-4 border-t border-orange-200">
                                                    <p className="text-xs font-semibold text-gray-700 mb-2">📋 How to Redeem:</p>
                                                    <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                                                        <li>Visit {vendor?.name}</li>
                                                        <li>Show code: <span className="font-mono font-bold text-primary">{promo.promoCode}</span></li>
                                                        <li>Mention "StreetBite offer"</li>
                                                        <li>Enjoy your discount!</li>
                                                    </ol>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )
                        })()}
                    </div>
                )}

                {activeTab === 'about' && (
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                    <span className="h-8 w-1 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
                                    Our Story
                                </h3>
                                <div className="prose prose-lg text-gray-700 leading-relaxed">
                                    <p>
                                        {vendor.description || 'Welcome to our street food stall! We take pride in serving authentic, delicious, and hygienic food to our customers. Our recipes have been passed down through generations, ensuring you get the true taste of tradition in every bite.'}
                                    </p>
                                </div>
                            </div>

                            {/* Features Section */}
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 text-green-800">
                                        <ShieldCheck className="w-6 h-6" />
                                        <span className="font-semibold">Hygienic Preparation</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 text-blue-800">
                                        <CreditCard className="w-6 h-6" />
                                        <span className="font-semibold">Digital Payments</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50 text-orange-800">
                                        <Utensils className="w-6 h-6" />
                                        <span className="font-semibold">Fresh Ingredients</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 text-purple-800">
                                        <Star className="w-6 h-6" />
                                        <span className="font-semibold">Top Rated Vendor</span>
                                    </div>
                                </div>
                            </div>

                            {/* Gallery Section */}
                            {vendor.galleryImages && vendor.galleryImages.length > 0 && (
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                        <span className="h-8 w-1 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></span>
                                        Photo Gallery
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {vendor.galleryImages.map((imgUrl, i) => (
                                            <div key={i} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all">
                                                <img
                                                    src={imgUrl}
                                                    alt={`Gallery ${i + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/placeholder-food.jpg'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-white to-orange-50/30 rounded-2xl p-6 border border-orange-100 shadow-lg sticky top-24">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-orange-100">
                                    <h3 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                            <MapPin className="text-white" size={18} />
                                        </div>
                                        Contact & Location
                                    </h3>
                                </div>

                                <div className="space-y-6">
                                    {/* Interactive Google Map */}
                                    <div className="relative h-56 rounded-xl overflow-hidden shadow-md border-2 border-orange-100 group">
                                        {vendor.latitude && vendor.longitude ? (
                                            <iframe
                                                src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${vendor.latitude},${vendor.longitude}&zoom=15`}
                                                width="100%"
                                                height="100%"
                                                style={{ border: 0 }}
                                                allowFullScreen
                                                loading="lazy"
                                                referrerPolicy="no-referrer-when-downgrade"
                                                className="transition-opacity group-hover:opacity-95"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                                <div className="text-center space-y-2">
                                                    <div className="bg-white p-4 rounded-full shadow-md inline-block">
                                                        <MapPin className="text-orange-500 w-8 h-8" />
                                                    </div>
                                                    <p className="text-sm text-gray-500 font-medium">Location not available</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* View on Map Overlay Button */}
                                        {vendor.latitude && vendor.longitude && (
                                            <button
                                                onClick={handleGetDirections}
                                                className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2.5 rounded-lg shadow-lg font-semibold text-sm hover:bg-white transition-all hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                            >
                                                <Navigation size={16} />
                                                Open in Maps
                                            </button>
                                        )}
                                    </div>

                                    {/* Contact Details */}
                                    <div className="space-y-4">
                                        {/* Address */}
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all group">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                                <MapPin className="text-white" size={20} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-gray-900 mb-1.5">Address</p>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {vendor.address || vendor.location || 'View location on map'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Opening Hours */}
                                        <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                                <Clock className="text-white" size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm text-gray-900 mb-1.5">Opening Hours</p>
                                                <p className="text-sm text-gray-600 font-medium">
                                                    {vendor.hours || vendor.openingHours || '10:00 AM - 10:00 PM'}
                                                </p>
                                                {vendor.isOpen !== undefined && (
                                                    <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${vendor.isOpen
                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                        : 'bg-red-50 text-red-700 border border-red-200'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${vendor.isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                                                        {vendor.isOpen ? 'Open Now' : 'Closed'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        {vendor.phone && (
                                            <div className="flex items-start gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-green-200 hover:shadow-md transition-all group">
                                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                                    <Phone className="text-white" size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm text-gray-900 mb-1.5">Phone</p>
                                                    <a
                                                        href={`tel:${vendor.phone}`}
                                                        className="text-sm text-primary hover:text-primary/80 font-semibold hover:underline flex items-center gap-1 transition-colors"
                                                    >
                                                        {vendor.phone}
                                                        <span className="text-xs">📞</span>
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Get Directions Button */}
                                    <Button
                                        className="w-full gap-2 font-bold shadow-lg shadow-orange-500/30 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 h-12 text-base"
                                        size="lg"
                                        onClick={handleGetDirections}
                                    >
                                        <Navigation size={20} className="animate-pulse" />
                                        Get Directions
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                }

                {
                    activeTab === 'reviews' && (
                        <div className="space-y-8">
                            {/* Write Review Button */}
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">Customer Reviews ({reviews.length})</h2>
                                {!showReviewForm && (
                                    <Button
                                        onClick={() => setShowReviewForm(true)}
                                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:scale-105 transition-all"
                                    >
                                        Write a Review
                                    </Button>
                                )}
                            </div>

                            {/* Review Form */}
                            {showReviewForm && (
                                <div className="bg-white border-2 border-primary/20 rounded-2xl p-6 shadow-lg">
                                    <h3 className="text-xl font-bold mb-4">Write Your Review</h3>

                                    {/* Star Rating */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    className="transition-transform hover:scale-110"
                                                >
                                                    <Star
                                                        size={32}
                                                        className={`${star <= reviewRating
                                                            ? 'text-yellow-400 fill-yellow-400'
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Comment */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold mb-2">Your Review</label>
                                        <Textarea
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            placeholder="Share your experience with this vendor..."
                                            className="min-h-[120px] resize-none"
                                            maxLength={500}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">{reviewComment.length}/500 characters</p>
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleSubmitReview}
                                            disabled={submittingReview || !reviewComment.trim()}
                                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 gap-2"
                                        >
                                            {submittingReview ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                    Submitting...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={16} />
                                                    Submit Review
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowReviewForm(false)
                                                setReviewComment('')
                                                setReviewRating(5)
                                            }}
                                            disabled={submittingReview}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Reviews List */}
                            {reviews.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                    <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Reviews Yet</h3>
                                    <p className="text-gray-500 mb-6">Be the first to review this vendor and help others!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    <h4 className="font-bold text-lg">{review.user?.displayName || 'Anonymous'}</h4>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className="flex">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    size={16}
                                                                    className={`${star <= review.rating
                                                                        ? 'text-yellow-400 fill-yellow-400'
                                                                        : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                }
            </div >

            <Footer />
        </div >
    )
}
