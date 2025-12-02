'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Star, Phone, Share2, Navigation, ChevronLeft, Utensils, Heart, Send } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DirectionsMap } from '@/components/directions-map'
import { vendorApi, menuApi, reviewApi } from '@/lib/api'
import { Footer } from '@/components/footer'
import { Textarea } from '@/components/ui/textarea'
import { useLiveVendorStatus } from '@/hooks/use-live-vendor-status'

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

    const [vendor, setVendor] = useState<Vendor | null>(null)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('menu')
    const [isFavorite, setIsFavorite] = useState(false)

    // Real-time vendor status from Firebase
    const { status: liveStatus } = useLiveVendorStatus(vendorId)

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
                // Fetch vendor details
                const vendorData = await vendorApi.getById(vendorId)
                setVendor(vendorData)

                // Fetch menu items
                const menuData = await menuApi.getByVendor(vendorId)
                setLoading(false)
            }
        }

        fetchData()

        // Load favorite status from localStorage
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
        setIsFavorite(favorites.includes(vendorId))
    }, [vendorId])

    const handleGetDirections = () => {
        if (!displayVendor) return

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

    const toggleFavorite = () => {
        const favorites = JSON.parse(localStorage.getItem('favorites') || '[]')
        let newFavorites: string[]

        if (isFavorite) {
            // Remove from favorites
            newFavorites = favorites.filter((id: string) => id !== vendorId)
        } else {
            // Add to favorites
            newFavorites = [...favorites, vendorId]
        }

        localStorage.setItem('favorites', JSON.stringify(newFavorites))
        setIsFavorite(!isFavorite)
    }

    const handleSubmitReview = async () => {
        if (!vendorId || !reviewComment.trim()) {
            alert('Please write a comment for your review')
            return
        }

        // Check if user is logged in
        const userStr = localStorage.getItem('user')
        if (!userStr) {
            alert('Please sign in to leave a review')
            router.push('/signin')
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
                        {['Menu', 'About', 'Reviews'].map((tab) => (
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
                                    <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                                        {reviews.length}
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
                                        {items.map((item) => (
                                            <div key={item.id} className="group bg-white border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-primary/40 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
                                                    {!item.isAvailable && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                                                                Unavailable
                                                            </span>
                                                        </div>
                                                    )}
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
                                                            disabled={!item.isAvailable}
                                                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold hover:scale-105 transition-all"
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

                {activeTab === 'about' && (
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                                <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                                    <span className="h-1 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                                    About {vendor.name}
                                </h3>
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {vendor.description || 'No description available for this vendor yet.'}
                                </p>
                            </div>

                            {/* Gallery Section */}
                            {vendor.galleryImages && vendor.galleryImages.length > 0 && (
                                <div>
                                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                        <span className="h-1 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></span>
                                        Gallery
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {vendor.galleryImages.map((imgUrl, i) => (
                                            <div key={i} className="aspect-square bg-gray-100 rounded-2xl overflow-hidden group cursor-pointer">
                                                <img
                                                    src={imgUrl}
                                                    alt={`Gallery ${i + 1}`}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                                <h3 className="font-bold text-lg mb-6">Contact & Hours</h3>
                                <div className="space-y-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <MapPin className="text-primary" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900 mb-1">Address</p>
                                            <p className="text-sm text-gray-600 leading-relaxed">{vendor.address || 'Location on map'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Clock className="text-primary" size={20} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900 mb-1">Opening Hours</p>
                                            <p className="text-sm text-gray-600">{vendor.hours || 'Not specified'}</p>
                                        </div>
                                    </div>
                                    {vendor.phone && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                                                <Phone className="text-primary" size={20} />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-gray-900 mb-1">Phone</p>
                                                <a href={`tel:${vendor.phone}`} className="text-sm text-primary hover:underline font-medium">
                                                    {vendor.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
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
                )}
            </div>

            <Footer />
        </div>
    )
}
