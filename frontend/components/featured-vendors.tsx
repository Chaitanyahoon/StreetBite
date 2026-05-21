'use client'

import { useState, useEffect } from 'react'
import { vendorApi, type ApiVendor } from '@/lib/api'
import { VendorCard } from '@/components/vendor-card'
import { Card, CardContent } from '@/components/ui/card'
import { Utensils } from 'lucide-react'

const MOCK_VENDORS: ApiVendor[] = [
  {
    id: 'mock-1',
    slug: 'golden-pani-puri',
    name: 'Golden Pani Puri',
    cuisine: 'Chaat',
    rating: 4.9,
    image: '',
    reviews: 142,
    tags: ['Legendary', 'Spicy'],
    status: 'AVAILABLE',
  },
  {
    id: 'mock-2',
    slug: 'delhi-momos',
    name: 'Delhi Momos & More',
    cuisine: 'Momos',
    rating: 4.8,
    image: '',
    reviews: 98,
    tags: ['Hot Seller', 'Steamed'],
    status: 'AVAILABLE',
  },
  {
    id: 'mock-3',
    slug: 'bombay-sandwich',
    name: 'Bombay Masala Grill',
    cuisine: 'Sandwich',
    rating: 4.7,
    image: '',
    reviews: 75,
    tags: ['Cheesy', 'Grilled'],
    status: 'BUSY',
  },
]

export function FeaturedVendors() {
  const [vendors, setVendors] = useState<ApiVendor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFeatured() {
      try {
        const data = await vendorApi.getAll()
        if (data && data.length > 0) {
          // Sort by rating desc and take top 3
          const sorted = [...data]
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 3)
          setVendors(sorted)
        } else {
          setVendors(MOCK_VENDORS)
        }
      } catch (error) {
        console.warn('Could not load live vendors, falling back to mock content:', error)
        setVendors(MOCK_VENDORS)
      } finally {
        setLoading(false)
      }
    }
    void loadFeatured()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map((idx) => (
          <Card
            key={idx}
            className="h-[380px] w-full border-4 border-black rounded-[1.75rem] bg-gray-100 animate-pulse overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="h-48 bg-gray-200" />
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="h-10 bg-gray-200 rounded-xl" />
                <div className="h-10 bg-gray-200 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Define dynamic offsets to betray standard linear grid split.
  // Card 1 shifts slightly up/left tilted. Card 2 shifts down/right tilted. Card 3 shifts slightly up tilted.
  const offsetClasses = [
    'md:-rotate-1 hover:rotate-0 md:-translate-y-2',
    'md:rotate-1 hover:rotate-0 md:translate-y-4 shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]',
    'md:-rotate-1 hover:rotate-0 md:translate-y-1',
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 pb-6">
      {vendors.map((vendor, idx) => {
        // Prepare props
        const idStr = String(vendor.id)
        const name = vendor.name
        const cuisine = vendor.cuisine || 'Street Food'
        const rating = vendor.rating || vendor.averageRating || 0
        const rawDistance = vendor.location
          ? `${(Math.random() * 2 + 0.2).toFixed(1)} km` // Calculate simulated distance if location exists
          : '0.5 km'
        const reviews = vendor.reviews || vendor.reviewCount || 0
        const tags = vendor.tags || []
        const status = vendor.status || 'AVAILABLE'
        const image = vendor.displayImageUrl || vendor.image || ''

        return (
          <div key={idStr} className={`transition-all duration-300 ${offsetClasses[idx % 3]}`}>
            <div className="border-4 border-black rounded-[1.8rem] bg-white overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full">
              <VendorCard
                id={idStr}
                slug={vendor.slug}
                name={name}
                cuisine={cuisine}
                rating={rating}
                distance={rawDistance}
                image={image}
                reviews={reviews}
                tags={tags}
                status={status}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
