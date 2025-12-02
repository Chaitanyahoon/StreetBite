'use client'

import Link from 'next/link'
import { Star, MapPin, TrendingUp, Clock } from 'lucide-react'

interface VendorCardProps {
  id: string
  name: string
  cuisine: string
  rating: number
  distance: string
  image?: string
  displayImageUrl?: string
  reviews: number
  tags: string[]
}

export function VendorCard({ id, name, cuisine, rating, distance, image, displayImageUrl, reviews, tags }: VendorCardProps) {
  return (
    <Link href={`/vendors/${id}`} className="block group">
      <div className="overflow-hidden rounded-2xl bg-white border-2 border-border/20 hover:border-primary/40 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer h-full flex flex-col hover:-translate-y-2">
        <div className="relative h-56 bg-muted overflow-hidden flex-shrink-0">
          <img
            src={displayImageUrl || image || "/placeholder.svg?height=224&width=400&query=street+food+vendor"}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          {/* Rating badge with gradient */}
          <div className="absolute top-4 right-4 bg-gradient-to-br from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-lg backdrop-blur-sm">
            <Star size={14} fill="currentColor" className="drop-shadow" />
            {rating}
          </div>

          {/* Hover overlay with view details */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full font-semibold text-primary shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
              View Details →
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4 flex flex-col flex-grow">
          <div>
            <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">{name}</h3>
            <p className="text-primary font-semibold text-sm">{cuisine}</p>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin size={16} className="text-primary flex-shrink-0" />
            <span className="font-medium">{distance}</span>
          </div>

          {/* Tags with gradient backgrounds */}
          <div className="flex gap-2 flex-wrap">
            {(tags || []).slice(0, 3).map((tag, index) => (
              <span
                key={tag}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 ${index === 0
                  ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700'
                  : 'bg-primary/10 text-primary'
                  }`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-auto">
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Star size={14} className="text-orange-400 fill-orange-400" />
              <span>{reviews} reviews</span>
            </div>
            <TrendingUp size={18} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </div>
    </Link>
  )
}
