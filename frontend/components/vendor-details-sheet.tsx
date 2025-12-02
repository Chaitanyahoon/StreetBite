'use client'

import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Clock, Phone, Globe, Share2, Heart } from "lucide-react"

interface VendorDetailsSheetProps {
    vendor: any | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function VendorDetailsSheet({ vendor, open, onOpenChange }: VendorDetailsSheetProps) {
    if (!vendor) return null

    // Use vendor data directly (no real-time status from Firebase)
    const isOnline = vendor.isOnline || false
    const isAcceptingOrders = vendor.isAcceptingOrders || false

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto p-0 border-l-2 border-primary/20">
                {/* Visually hidden title for accessibility */}
                <SheetHeader className="sr-only">
                    <SheetTitle>{vendor.name} - Vendor Details</SheetTitle>
                    <SheetDescription>
                        View details, ratings, and information about {vendor.name}
                    </SheetDescription>
                </SheetHeader>

                {/* Cover Image */}
                <div className="relative h-64 w-full bg-muted">
                    <img
                        src={vendor.displayImageUrl || vendor.image || "/placeholder.svg?height=300&width=500&query=street+food"}
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full"
                        onClick={() => onOpenChange(false)}
                    >
                        <span className="sr-only">Close</span>
                        {/* Close icon is handled by Sheet primitive usually, but we can add custom controls */}
                    </Button>

                    <div className="absolute bottom-4 left-6 right-6 text-white">
                        <Badge className={`mb-2 ${isOnline ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}`}>
                            {isOnline ? (isAcceptingOrders ? 'Open Now' : 'Busy') : 'Closed'}
                        </Badge>
                        <h2 className="text-3xl font-black mb-1">{vendor.name}</h2>
                        <p className="text-white/90 font-medium">{vendor.cuisine}</p>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Stats Row */}
                    <div className="flex items-center justify-between py-4 border-b border-border">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 font-bold text-lg">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                {vendor.rating || 'New'}
                            </div>
                            <span className="text-xs text-muted-foreground">Rating</span>
                        </div>
                        <div className="w-px h-10 bg-border" />
                        <div className="flex flex-col items-center">
                            <div className="font-bold text-lg">{vendor.distance || '0.5 km'}</div>
                            <span className="text-xs text-muted-foreground">Distance</span>
                        </div>
                        <div className="w-px h-10 bg-border" />
                        <div className="flex flex-col items-center">
                            <div className="font-bold text-lg">{vendor.reviews || '0'}</div>
                            <span className="text-xs text-muted-foreground">Reviews</span>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="font-bold text-lg mb-2">About</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {vendor.description || "Experience authentic street food flavors with our specially curated menu. Fresh ingredients, hygienic preparation, and the true taste of the streets."}
                        </p>
                    </div>

                    {/* Tags */}
                    {vendor.tags && vendor.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {vendor.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="px-3 py-1">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Info List */}
                    <div className="space-y-3 bg-muted/30 p-4 rounded-xl">
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{vendor.location || "Location available on map"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>10:00 AM - 10:00 PM</span>
                        </div>
                        {vendor.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-primary" />
                                <span>{vendor.phone}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="w-full gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                        </Button>
                        <Button variant="outline" className="w-full gap-2">
                            <Heart className="w-4 h-4" />
                            Favorite
                        </Button>
                    </div>

                    <SheetFooter className="pt-4">
                        <Button className="w-full h-12 text-lg font-bold shadow-primary hover-lift" size="lg">
                            View Full Menu
                        </Button>
                    </SheetFooter>
                </div>
            </SheetContent>
        </Sheet>
    )
}
