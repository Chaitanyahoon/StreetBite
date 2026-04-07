'use client'

import { Navbar } from '@/components/navbar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Star, Phone, Share2, Navigation, ChevronLeft, Utensils, Heart, Send, CreditCard, ShieldCheck, Edit2, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import dynamic from 'next/dynamic'
const DirectionsMap = dynamic(() => import('@/components/directions-map').then(m => m.DirectionsMap), { ssr: false, loading: () => <div className="w-full h-96 bg-gray-100 rounded-xl animate-pulse" /> })
import { vendorApi, menuApi, reviewApi, promotionApi, favoriteApi, analyticsApi } from '@/lib/api'
import { Footer } from '@/components/footer'
import { Textarea } from '@/components/ui/textarea'
import { useLiveVendorStatus } from '@/hooks/use-live-vendor-status'
import { useLiveMenuAvailability } from '@/hooks/use-live-menu-availability'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/context/AuthContext'
import {
    buildVendorQuickStats,
    buildPromotionShareText,
    filterAndSortPromotions,
    getPromotionBadges,
    getReviewSummaryText,
    groupMenuItemsByCategory,
    MenuItem,
    OfferFilter,
    OfferSort,
    Review,
    statusMeta,
    normalizeVendorPromotion,
    VENDOR_DETAIL_TABS,
    Vendor,
    VendorPromotion,
} from './vendor-detail-helpers'

export default function VendorDetailClient({ vendorIdParams }: { vendorIdParams?: string }) {
    const params = useParams()
    const router = useRouter()
    const paramId = vendorIdParams || (params?.id as string)
    const { toast } = useToast()
    const { user: authUser, isLoggedIn } = useAuth()

    const [vendor, setVendor] = useState<Vendor | null>(null)
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('menu')
    const [isFavorite, setIsFavorite] = useState(false)
    const [promotions, setPromotions] = useState<VendorPromotion[]>([])
    const [resolvedVendorId, setResolvedVendorId] = useState<string>('')

    // Offers filter and sort state
    const [offerFilter, setOfferFilter] = useState<OfferFilter>('all')
    const [offerSort, setOfferSort] = useState<OfferSort>('discount')

    // Real-time vendor status from Firebase
    const { status: liveStatus } = useLiveVendorStatus(resolvedVendorId)

    // Real-time menu availability from Firebase
    const { getAvailability } = useLiveMenuAvailability(menuItems)

    // Review form state
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)

    // Edit review state
    const [editingReviewId, setEditingReviewId] = useState<number | null>(null)
    const [editRating, setEditRating] = useState(5)
    const [editComment, setEditComment] = useState('')
    const [reviewToDelete, setReviewToDelete] = useState<number | null>(null)

    // Directions State
    const [showDirections, setShowDirections] = useState(false)
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

    // Merge live status with vendor data
    const displayVendor = vendor ? {
        ...vendor,
        status: liveStatus || vendor.status
    } : null

    // Dynamic page title based on vendor name
    useEffect(() => {
        if (vendor?.name) {
            document.title = `${vendor.name}${vendor.cuisine ? ` — ${vendor.cuisine}` : ''} | StreetBite`
        }
        return () => { document.title = 'Vendor Details | StreetBite' }
    }, [vendor?.name, vendor?.cuisine])

    useEffect(() => {
        if (!paramId) return

        const fetchData = async () => {
            try {
                let vendorData: any = null
                let vendorIdStr = paramId

                // Determine if param is a numeric ID or a slug
                const isNumericId = /^\d+$/.test(paramId)

                if (isNumericId) {
                    vendorData = await vendorApi.getById(paramId)
                } else {
                    // Slug-based lookup
                    vendorData = await vendorApi.getBySlug(paramId)
                }

                if (!vendorData || !vendorData.id) {
                    console.error('Vendor not found for:', paramId)
                    setLoading(false)
                    return
                }

                vendorIdStr = String(vendorData.id)
                setResolvedVendorId(vendorIdStr)

                // If vendor is suspended and the user is NOT an Admin, handle the display.
                // We'll set a local state or just handle it in the render block.
                setVendor(vendorData)

                // Log Profile View
                analyticsApi.logEvent(vendorIdStr, 'VIEW_PROFILE').catch(console.error)

                // Fetch menu items
                const menuData = await menuApi.getByVendor(vendorIdStr)
                setMenuItems(menuData || [])

                // Fetch reviews
                try {
                    const reviewData = await reviewApi.getByVendor(vendorIdStr)
                    setReviews(reviewData || [])
                } catch (err) {
                    console.error('Failed to fetch reviews:', err)
                }

                // Fetch active promotions
                try {
                    const promos = await promotionApi.getActiveByVendor(vendorIdStr)
                    setPromotions((promos || []).map((promo) => normalizeVendorPromotion(promo)))
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
    }, [paramId])

    // Check favorite status once we have the resolved vendor ID
    useEffect(() => {
        if (!resolvedVendorId) return
        const checkFavoriteStatus = async () => {
            try {
                const response = await favoriteApi.checkFavorite(resolvedVendorId)
                setIsFavorite(response.isFavorite)
            } catch (error) {
                console.error('Error checking favorite status:', error)
            }
        }
        checkFavoriteStatus()
    }, [resolvedVendorId])

    const handleGetDirections = () => {
        if (!displayVendor) return

        // Log Direction Click
        analyticsApi.logEvent(resolvedVendorId, 'CLICK_DIRECTION').catch(console.error)

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
                toast({
                    title: 'Link copied',
                    description: 'Vendor link copied to your clipboard.',
                })
            }
        } catch (err) {
            console.error('Error sharing:', err)
        }
    }

    const toggleFavorite = async () => {
        if (!resolvedVendorId) return

        try {
            if (isFavorite) {
                await favoriteApi.removeFavorite(resolvedVendorId)
                setIsFavorite(false)
                toast({
                    title: "Removed from Favorites",
                    description: `${vendor?.name || 'Vendor'} has been removed from your favorites.`,
                })
            } else {
                await favoriteApi.addFavorite(resolvedVendorId)
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
        if (!resolvedVendorId || !reviewComment.trim()) {
            toast({
                title: 'Comment required',
                description: 'Please write a comment for your review.',
                variant: 'destructive',
            })
            return
        }

        if (!isLoggedIn || !authUser) {
            toast({
                title: 'Please sign in to leave a review',
                description: 'You need to be logged in to submit reviews',
            })
            setTimeout(() => router.push('/signin'), 1500)
            return
        }

        setSubmittingReview(true)
        try {
            const reviewData = {
                vendor: { id: parseInt(resolvedVendorId) },
                user: { id: authUser.id },
                rating: reviewRating,
                comment: reviewComment
            }

            await reviewApi.create(reviewData)

            // Refresh reviews
            const updatedReviews = await reviewApi.getByVendor(resolvedVendorId)
            setReviews(updatedReviews || [])

            // Reset form
            setReviewComment('')
            setReviewRating(5)
            setShowReviewForm(false)
            toast({
                title: 'Review submitted',
                description: 'Your review was posted successfully.',
            })
        } catch (error) {
            console.error('Error submitting review:', error)
            toast({
                title: 'Review failed',
                description: 'Failed to submit review. Please try again.',
                variant: 'destructive',
            })
        } finally {
            setSubmittingReview(false)
        }
    }

    const handleEditReview = async (reviewId: number) => {
        if (!isLoggedIn || !authUser) {
            toast({
                title: 'Please sign in',
                description: 'You need to be logged in to edit reviews',
            })
            return
        }

        try {
            await reviewApi.update(reviewId, {
                userId: authUser.id,
                rating: editRating,
                comment: editComment
            })

            // Refresh reviews
            const updatedReviews = await reviewApi.getByVendor(resolvedVendorId)
            setReviews(updatedReviews || [])

            setEditingReviewId(null)
            toast({
                title: 'Review updated',
                description: 'Your review has been updated successfully',
            })
        } catch (error: any) {
            console.error('Error updating review:', error)
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to update review',
                variant: 'destructive'
            })
        }
    }

    const handleDeleteReview = async (reviewId: number) => {
        if (!isLoggedIn || !authUser) {
            toast({
                title: 'Please sign in',
                description: 'You need to be logged in to delete reviews',
            })
            return
        }

        try {
            await reviewApi.delete(reviewId, authUser.id)

            // Refresh reviews
            const updatedReviews = await reviewApi.getByVendor(resolvedVendorId)
            setReviews(updatedReviews || [])

            toast({
                title: 'Review deleted',
                description: 'Your review has been deleted',
            })
        } catch (error: any) {
            console.error('Error deleting review:', error)
            toast({
                title: 'Error',
                description: error.response?.data?.error || 'Failed to delete review',
                variant: 'destructive'
            })
        } finally {
            setReviewToDelete(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_45%),linear-gradient(180deg,#fffdf8_0%,#fff6ed_100%)]">
                <Navbar />
                <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-6xl items-center px-6 py-16">
                    <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                        <div className="space-y-5">
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-orange-700 backdrop-blur">
                                Vendor profile
                            </div>
                            <div className="space-y-3">
                                <div className="h-5 w-40 animate-pulse rounded-full bg-orange-200/70" />
                                <div className="h-14 max-w-xl animate-pulse rounded-3xl bg-gray-200/80" />
                                <div className="h-5 max-w-2xl animate-pulse rounded-full bg-gray-200/80" />
                                <div className="h-5 max-w-lg animate-pulse rounded-full bg-gray-200/80" />
                            </div>
                            <div className="grid max-w-2xl gap-4 sm:grid-cols-3">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="rounded-3xl border border-white/80 bg-white/80 p-5 shadow-sm backdrop-blur">
                                        <div className="mb-3 h-4 w-20 animate-pulse rounded-full bg-gray-200" />
                                        <div className="h-8 w-16 animate-pulse rounded-full bg-orange-200/80" />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur">
                            <div className="mb-4 aspect-[4/5] animate-pulse rounded-[1.5rem] bg-gradient-to-br from-orange-100 via-amber-50 to-white" />
                            <div className="space-y-3">
                                <div className="h-4 w-24 animate-pulse rounded-full bg-gray-200" />
                                <div className="h-4 w-full animate-pulse rounded-full bg-gray-200" />
                                <div className="h-4 w-4/5 animate-pulse rounded-full bg-gray-200" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!vendor) {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.2),_transparent_40%),linear-gradient(180deg,#fffdf8_0%,#fff7ed_100%)]">
                <Navbar />
                <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-5xl items-center px-6 py-16">
                    <div className="grid w-full gap-8 rounded-[2rem] border border-white/80 bg-white/85 p-8 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.3)] backdrop-blur md:grid-cols-[1.1fr_0.9fr] md:p-12">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-orange-700">
                                Vendor unavailable
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-4xl font-black tracking-tight text-gray-950 md:text-5xl">This stall is not available right now.</h1>
                                <p className="max-w-xl text-base leading-7 text-gray-600 md:text-lg">
                                    The link may be old, the vendor may have been removed, or the profile is still being reviewed.
                                    Explore other active street food spots nearby.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/explore">
                                    <Button className="h-12 rounded-full bg-gray-950 px-6 text-sm font-bold text-white hover:bg-orange-600">
                                        Browse vendors
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    className="h-12 rounded-full border-gray-300 px-6 text-sm font-bold"
                                    onClick={() => router.back()}
                                >
                                    Go back
                                </Button>
                            </div>
                        </div>
                        <div className="rounded-[1.75rem] bg-gradient-to-br from-orange-500 via-amber-400 to-orange-300 p-[1px] shadow-lg">
                            <div className="flex h-full flex-col justify-between rounded-[calc(1.75rem-1px)] bg-[#1f1a17] p-8 text-white">
                                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                                    <Utensils className="h-7 w-7 text-amber-300" />
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-white/60">StreetBite</p>
                                    <p className="text-2xl font-black leading-tight">Fresh finds are still a tap away.</p>
                                    <p className="text-sm leading-6 text-white/70">
                                        Jump back into explore for nearby favorites, live offers, and vendors that are open now.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (vendor.status === 'SUSPENDED' && authUser?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.15),_transparent_35%),linear-gradient(180deg,#fffdf8_0%,#fff7ed_100%)]">
                <Navbar />
                <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-5xl items-center px-6 py-16">
                    <div className="w-full rounded-[2rem] border border-orange-100 bg-white/90 p-8 text-center shadow-[0_24px_80px_-32px_rgba(15,23,42,0.3)] backdrop-blur md:p-12">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-orange-100 text-orange-600">
                            <ShieldCheck className="h-10 w-10" />
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-[0.32em] text-orange-600">Moderation status</p>
                            <h1 className="text-4xl font-black tracking-tight text-gray-950 md:text-5xl">Vendor temporarily unavailable</h1>
                            <p className="mx-auto max-w-2xl text-base leading-7 text-gray-600 md:text-lg">
                                This profile is inactive or under review by the StreetBite moderation team. Explore other active vendors for now.
                            </p>
                        </div>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Link href="/explore">
                                <Button className="h-12 rounded-full bg-gray-950 px-6 text-sm font-bold text-white hover:bg-orange-600">
                                    Explore active vendors
                                </Button>
                            </Link>
                            <Button
                                variant="outline"
                                className="h-12 rounded-full border-gray-300 px-6 text-sm font-bold"
                                onClick={() => router.push('/')}
                            >
                                Back to home
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const menuByCategory = groupMenuItemsByCategory(menuItems)
    const activeStatusMeta = statusMeta[displayVendor?.status || 'UNAVAILABLE'] || statusMeta.UNAVAILABLE
    const vendorRating = displayVendor?.rating ?? 0
    const vendorReviewCount = reviews.length
    const vendorPhone = displayVendor?.phone
    const filteredPromotions = filterAndSortPromotions(promotions, offerFilter, offerSort)
    const quickStats = buildVendorQuickStats(menuItems.length, promotions.length, reviews.length)

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#fffaf4_0%,#fff7ef_18%,#f8fafc_50%,#ffffff_100%)]">
            <Navbar />

            {/* Structured Schema Data for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": vendor.cuisine ? "Restaurant" : "LocalBusiness",
                        "name": vendor.name,
                        "image": vendor.bannerImageUrl || vendor.imageUrl || "https://streetbite.app/og-image.jpg",
                        "description": vendor.description,
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": vendor.address,
                            "addressCountry": "IN"
                        },
                        "geo": {
                            "@type": "GeoCoordinates",
                            "latitude": vendor.latitude,
                            "longitude": vendor.longitude
                        },
                        "aggregateRating": vendor.rating > 0 ? {
                            "@type": "AggregateRating",
                            "ratingValue": vendor.rating,
                            "reviewCount": reviews.length || 1
                        } : undefined,
                        "servesCuisine": vendor.cuisine || "Street Food",
                        "telephone": vendor.phone || undefined,
                        "priceRange": "₹",
                        "openingHours": vendor.hours || undefined
                    })
                }}
            />

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
            <div className="relative overflow-hidden bg-[#120f0d]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(251,146,60,0.45),_transparent_25%),radial-gradient(circle_at_left,_rgba(249,115,22,0.22),_transparent_30%)]" />
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#120f0d] via-black/60 to-black/20" />
                <img
                    src={displayVendor?.bannerImageUrl || displayVendor?.imageUrl || "/placeholder-vendor.jpg"}
                    alt={displayVendor?.name}
                    className="h-[480px] w-full object-cover opacity-65 md:h-[560px]"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop'
                    }}
                />

                <div className="absolute inset-x-0 top-0 z-20">
                    <div className="mx-auto flex max-w-7xl items-start justify-between px-4 pt-5 md:px-6 md:pt-6">
                        <Link href="/explore">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="h-11 w-11 rounded-full border border-white/20 bg-white/12 text-white backdrop-blur-md hover:bg-white/20"
                            >
                                <ChevronLeft size={22} />
                            </Button>
                        </Link>
                        <Button
                            variant="secondary"
                            size="icon"
                            className={`h-11 w-11 rounded-full border border-white/20 backdrop-blur-md transition-all hover:scale-105 ${isFavorite ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white/12 text-white hover:bg-white/20'
                                }`}
                            onClick={toggleFavorite}
                        >
                            <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
                        </Button>
                    </div>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-20">
                    <div className="mx-auto max-w-7xl px-4 pb-8 md:px-6 md:pb-12">
                        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
                            <div className="max-w-3xl">
                                <div className="mb-4 flex flex-wrap items-center gap-2.5">
                                    <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] text-white backdrop-blur-sm">
                                        {displayVendor?.cuisine || 'Street food'}
                                    </span>
                                    {vendorRating > 0 && (
                                        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                                            <Star size={15} className="fill-amber-300 text-amber-300" />
                                            <span>{vendorRating.toFixed(1)}</span>
                                            <span className="text-white/70">
                                                {getReviewSummaryText(vendorReviewCount)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] shadow-lg backdrop-blur-sm ${activeStatusMeta.badgeClassName}`}>
                                        <span className={`h-2.5 w-2.5 rounded-full ${activeStatusMeta.dotClassName}`}></span>
                                        {activeStatusMeta.label}
                                    </div>
                                    {promotions.length > 0 && (
                                        <div className="rounded-full bg-[#fb7185] px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-white shadow-lg">
                                            {promotions.length} live offer{promotions.length > 1 ? 's' : ''}
                                        </div>
                                    )}
                                </div>
                                <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl">
                                    {displayVendor?.name}
                                </h1>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/78 md:text-base">
                                    {displayVendor?.description || 'A local street-food favorite serving fresh plates, fast comfort food, and neighborhood flavor.'}
                                </p>
                                <div className="mt-5 flex flex-col gap-3 text-sm text-white/82 md:text-base">
                                    <div className="flex items-start gap-2.5">
                                        <MapPin size={18} className="mt-0.5 flex-shrink-0 text-orange-300" />
                                        <span className="line-clamp-2">{displayVendor?.address || 'Location available on map'}</span>
                                    </div>
                                    {displayVendor?.hours && (
                                        <div className="flex items-center gap-2.5">
                                            <Clock size={18} className="flex-shrink-0 text-orange-300" />
                                            <span>{displayVendor.hours}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Button
                                        onClick={handleGetDirections}
                                        className="h-12 rounded-full bg-white px-6 text-sm font-bold text-gray-950 shadow-lg shadow-black/20 hover:bg-orange-50"
                                    >
                                        <Navigation size={18} />
                                        Get directions
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleShare}
                                        className="h-12 rounded-full border-white/25 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20"
                                    >
                                        <Share2 size={18} />
                                        Share stall
                                    </Button>
                                    {vendorPhone && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="h-12 rounded-full border-white/25 bg-transparent px-6 text-sm font-bold text-white hover:bg-white/10"
                                        >
                                            <a href={`tel:${vendorPhone}`}>
                                                <Phone size={18} />
                                                Call vendor
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <div className="hidden rounded-[2rem] border border-white/15 bg-white/10 p-5 text-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.75)] backdrop-blur-md lg:block">
                                <p className="text-xs font-bold uppercase tracking-[0.26em] text-white/60">Quick look</p>
                                <div className="mt-5 space-y-4">
                                    {quickStats.map((stat) => (
                                        <div key={stat.label} className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4">
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">{stat.label}</p>
                                            <p className="mt-2 text-3xl font-black text-white">{stat.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 md:px-6 lg:hidden">
                <div className="grid gap-3 rounded-[2rem] border border-white/80 bg-white/92 p-4 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] backdrop-blur sm:grid-cols-3">
                    {quickStats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl bg-[#fff8f1] px-4 py-4">
                            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-700/80">{stat.label}</p>
                            <p className="mt-1 text-2xl font-black text-gray-950">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Enhanced Tabs */}
            <div className="sticky top-16 z-30 mt-8 border-y border-orange-100/80 bg-white/90 shadow-sm backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="flex gap-3 overflow-x-auto py-3 no-scrollbar">
                        {VENDOR_DETAIL_TABS.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab.toLowerCase())}
                                className={`relative rounded-full px-4 py-2.5 text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.toLowerCase()
                                    ? 'bg-gray-950 text-white shadow-lg'
                                    : 'bg-[#fff7ef] text-gray-600 hover:bg-orange-100 hover:text-gray-950'
                                    }`}
                            >
                                {tab}
                                {tab === 'Reviews' && reviews.length > 0 && (
                                    <span className="ml-2 rounded-full bg-white/85 px-2 py-0.5 text-xs text-gray-700">
                                        {reviews.length}
                                    </span>
                                )}
                                {tab === 'Offers' && promotions.length > 0 && (
                                    <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white shadow-sm">
                                        {promotions.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4 py-10 pb-28 md:px-6 md:py-12 md:pb-12">
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
                        ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredPromotions.map((promo) => {
                                        const badges = getPromotionBadges(promo)

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
                                                                toast({
                                                                    title: 'Code copied',
                                                                    description: `${promo.promoCode} copied to your clipboard.`,
                                                                })
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
                                                            <span className="font-semibold">Min. Spend:</span>
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
                                                        onClick={() => {
                                                            const shareText = buildPromotionShareText(vendor?.name, promo)

                                                            if (navigator.share) {
                                                                navigator.share({
                                                                    title: `Offer at ${vendor?.name}`,
                                                                    text: shareText,
                                                                    url: window.location.href
                                                                }).catch(() => { })
                                                            } else {
                                                                navigator.clipboard.writeText(shareText)
                                                                toast({
                                                                    title: 'Offer copied',
                                                                    description: 'Offer details copied to your clipboard.',
                                                                })
                                                            }
                                                        }}
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
                        )}
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
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-teal-50 text-teal-800">
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
                                    {reviews.map((review) => {
                                        const isOwner = authUser && review.user?.id === authUser.id

                                        return (
                                            <div key={review.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                                {editingReviewId === review.id ? (
                                                    // Edit mode
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-bold text-lg">Editing your review</h4>
                                                            <button
                                                                onClick={() => setEditingReviewId(null)}
                                                                className="text-gray-500 hover:text-gray-700"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => setEditRating(star)}
                                                                    className="transition-transform hover:scale-110"
                                                                >
                                                                    <Star
                                                                        size={24}
                                                                        className={`${star <= editRating
                                                                            ? 'text-yellow-400 fill-yellow-400'
                                                                            : 'text-gray-300'
                                                                            }`}
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <Textarea
                                                            value={editComment}
                                                            onChange={(e) => setEditComment(e.target.value)}
                                                            placeholder="Update your review..."
                                                            className="min-h-[100px] resize-none"
                                                            maxLength={500}
                                                        />
                                                        <Button
                                                            onClick={() => handleEditReview(review.id)}
                                                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                                        >
                                                            Save Changes
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    // View mode
                                                    <>
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
                                                            {isOwner && (
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingReviewId(review.id)
                                                                            setEditRating(review.rating)
                                                                            setEditComment(review.comment)
                                                                        }}
                                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        title="Edit review"
                                                                    >
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setReviewToDelete(review.id)}
                                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                        title="Delete review"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                                    </>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                }
            </div >

            <div className="sticky bottom-4 z-30 mx-auto mt-4 w-full max-w-7xl px-4 pb-[max(env(safe-area-inset-bottom),0.5rem)] md:hidden">
                <div className="grid grid-cols-3 gap-2 rounded-[1.75rem] border border-white/80 bg-white/92 p-2 shadow-[0_18px_50px_-26px_rgba(15,23,42,0.4)] backdrop-blur">
                    <Button
                        onClick={handleGetDirections}
                        className="h-12 rounded-2xl bg-gray-950 text-xs font-bold text-white hover:bg-orange-600"
                    >
                        <Navigation size={16} />
                        Route
                    </Button>
                    <Button
                        variant="outline"
                        onClick={toggleFavorite}
                        className={`h-12 rounded-2xl text-xs font-bold ${isFavorite ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' : 'border-gray-200 bg-white text-gray-700 hover:bg-orange-50'}`}
                    >
                        <Heart size={16} className={isFavorite ? 'fill-current' : ''} />
                        Save
                    </Button>
                    {displayVendor?.phone ? (
                        <Button
                            asChild
                            variant="outline"
                            className="h-12 rounded-2xl border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-orange-50"
                        >
                            <a href={`tel:${displayVendor.phone}`}>
                                <Phone size={16} />
                                Call
                            </a>
                        </Button>
                    ) : (
                        <Button
                            variant="outline"
                            onClick={handleShare}
                            className="h-12 rounded-2xl border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-orange-50"
                        >
                            <Share2 size={16} />
                            Share
                        </Button>
                    )}
                </div>
            </div>

            <AlertDialog
                open={reviewToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setReviewToDelete(null)
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete review?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove your review from this vendor page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (reviewToDelete !== null) {
                                    void handleDeleteReview(reviewToDelete)
                                }
                            }}
                            className="bg-destructive text-white hover:bg-destructive/90"
                        >
                            Delete review
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Footer />
        </div >
    )
}
