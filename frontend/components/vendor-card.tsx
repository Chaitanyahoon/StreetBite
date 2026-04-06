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
      className="block h-full group"
      aria-label={`View ${name}, ${cuisine} street food vendor`}
    >
      <article className="surface-panel flex h-full flex-col overflow-hidden rounded-[1.75rem] border border-black/10 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[var(--shadow-lifted)]">
        <div className="relative h-44 overflow-hidden bg-muted sm:h-52 md:h-56">
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
            <span className="max-w-[70%] rounded-full bg-white/92 px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.16em] text-black shadow-[var(--shadow-soft)] backdrop-blur">
              {cuisine}
            </span>
            <div className="rounded-full bg-black/82 px-3 py-1.5 text-xs font-black text-white shadow-[var(--shadow-soft)] backdrop-blur">
              <span className="inline-flex items-center gap-1">
                <Star size={13} fill="currentColor" className="text-yellow-400" />
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
                className={`shrink-0 rounded-full px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.16em] ${
                  status === 'AVAILABLE'
                    ? 'bg-[#f8dd8a] text-black'
                    : 'bg-white/88 text-black/65'
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
                className={`rounded-full px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.14em] ${
                  index === 0
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-black/5 text-black/65'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-black/[0.035] px-3 py-3">
              <div className="flex items-center gap-2 text-black/65">
                <MapPin size={15} className="text-primary" />
                <span className="text-[0.68rem] font-black uppercase tracking-[0.16em]">Distance</span>
              </div>
              <p className="mt-2 text-sm font-black text-black">{formattedDistance}</p>
            </div>
            <div className="rounded-2xl bg-black/[0.035] px-3 py-3">
              <div className="flex items-center gap-2 text-black/65">
                <Star size={15} className="fill-primary text-primary" />
                <span className="text-[0.68rem] font-black uppercase tracking-[0.16em]">Reviews</span>
              </div>
              <p className="mt-2 text-sm font-black text-black">{reviews} {reviews === 1 ? 'review' : 'reviews'}</p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-4 border-t border-black/8 pt-4">
            <div className="min-w-0">
              <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-black/45">
                StreetBite pick
              </p>
              <p className="mt-1 text-sm font-semibold text-black/70">
                Tap for menu, map, reviews, and live stall details
              </p>
            </div>
            <div className="flex h-11 min-w-11 items-center justify-center rounded-full bg-black text-white shadow-[var(--shadow-soft)] transition-transform duration-200 group-hover:translate-x-1">
              <MoveRight size={18} />
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
