'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, MoveRight, Star } from 'lucide-react'

interface VendorCardProps {
  id: string
  slug?: string
  name: string
  cuisine: string
  rating: number
  distance: string
  image?: string
  displayImageUrl?: string
  reviews: number
  tags: string[]
  priority?: boolean
  status?: string
}

function getStatusLabel(status?: string) {
  if (status === 'BUSY') {
    return 'Busy'
  }

  if (status === 'AVAILABLE') {
    return 'Open now'
  }

  return null
}

export function VendorCard({
  id,
  slug,
  name,
  cuisine,
  rating,
  distance,
  image,
  displayImageUrl,
  reviews,
  tags,
  priority = false,
  status,
}: VendorCardProps) {
  const vendorUrl = slug ? `/vendors/${slug}` : `/vendors/${id}`
  const statusLabel = getStatusLabel(status)
  const formattedDistance = !Number.isNaN(parseFloat(distance))
    ? `${parseFloat(distance).toFixed(1)} km`
    : distance

  return (
    <Link
      href={vendorUrl}
      className="block h-full group active:scale-[0.98] transition-transform duration-100"
      aria-label={`View ${name}, ${cuisine} street food vendor`}
    >
      <article className="surface-panel flex h-full flex-col overflow-hidden rounded-[1.75rem] border-[3px] sm:border-4 border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[4.5px_4.5px_0px_0px_rgba(0,0,0,1)] sm:group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="relative h-44 overflow-hidden bg-muted border-b-[3px] sm:border-b-4 border-black sm:h-52 md:h-56">
          <Image
            src={displayImageUrl || image || '/placeholder.svg?height=224&width=400&query=street+food+vendor'}
            alt={`${name} - ${cuisine} street food stall in your local area`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />

          <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-3">
            <span className="max-w-[70%] rounded-full border-2 border-black bg-white px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              {cuisine}
            </span>
            <div className="rounded-full border-2 border-black bg-yellow-300 px-3 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <span className="inline-flex items-center gap-1">
                <Star size={13} fill="currentColor" className="text-black" />
                {rating > 0 ? rating.toFixed(1) : 'New'}
              </span>
            </div>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-lg font-black leading-tight text-white md:text-xl">
                {name}
              </h3>
            </div>
            {statusLabel ? (
              <span
                className={`shrink-0 rounded-full border-2 border-black px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.16em] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                  status === 'AVAILABLE'
                    ? 'bg-yellow-300 text-black'
                    : 'bg-white text-black/65'
                }`}
              >
                {statusLabel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-5">
          <div className="flex flex-wrap gap-2">
            {(tags || []).slice(0, 2).map((tag, index) => (
              <span
                key={tag}
                className={`rounded-full border-2 border-black px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.14em] shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] ${
                  index === 0
                    ? 'bg-yellow-300 text-black'
                    : 'bg-white text-black'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border-2 border-black bg-orange-50/50 px-3 py-3 shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 text-black/70">
                <MapPin size={15} className="text-orange-500 stroke-[3px]" />
                <span className="text-[0.68rem] font-black uppercase tracking-[0.16em]">Distance</span>
              </div>
              <p className="mt-2 text-sm font-black text-black">{formattedDistance}</p>
            </div>
            <div className="rounded-2xl border-2 border-black bg-orange-50/50 px-3 py-3 shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-2 text-black/70">
                <Star size={15} className="fill-orange-500 text-orange-500" />
                <span className="text-[0.68rem] font-black uppercase tracking-[0.16em]">Reviews</span>
              </div>
              <p className="mt-2 text-sm font-black text-black">{reviews} {reviews === 1 ? 'review' : 'reviews'}</p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 border-t-2 border-black pt-4">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-orange-500">
                StreetBite pick
              </p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-black/70">
                Tap for menu, map, reviews, and live stall details
              </p>
            </div>
            <div className="flex h-11 min-w-11 items-center justify-center rounded-full border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5 group-hover:shadow-none">
              <MoveRight size={18} className="stroke-[3px]" />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
