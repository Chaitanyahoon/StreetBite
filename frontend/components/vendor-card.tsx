import { Star, MapPin, TrendingUp } from 'lucide-react'

interface VendorCardProps {
  name: string
  cuisine: string
  rating: number
  distance: string
  image: string
  reviews: number
  tags: string[]
}

export function VendorCard({ name, cuisine, rating, distance, image, reviews, tags }: VendorCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl bg-white border border-border/30 hover:border-primary/40 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer">
      <div className="relative h-56 bg-muted overflow-hidden">
        <img
          src={image || "/placeholder.svg?height=224&width=400&query=street+food+vendor"}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* CHANGE: improved rating badge styling */}
        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
          <Star size={14} fill="currentColor" />
          {rating}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="font-bold text-lg text-foreground mb-1">{name}</h3>
          <p className="text-primary font-medium text-sm">{cuisine}</p>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MapPin size={16} className="text-primary flex-shrink-0" />
          <span>{distance}</span>
        </div>

        {/* CHANGE: improved tags with better spacing */}
        <div className="flex gap-2 flex-wrap">
          {(tags || []).map((tag) => (
            <span key={tag} className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <p className="text-xs font-medium text-muted-foreground">{reviews} reviews</p>
          <TrendingUp size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </div>
  )
}
