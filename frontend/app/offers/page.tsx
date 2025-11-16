'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Flame, Tag, Calendar, MapPin, Copy } from 'lucide-react'
import { useState } from 'react'

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<number | null>(null)

  const offers = [
    {
      id: 1,
      vendor: 'Taco Paradise',
      title: 'Buy 2 Tacos, Get 1 Free',
      description: 'Get a free third taco with any purchase of 2 tacos',
      discount: '33% OFF',
      validUntil: '2025-12-31',
      cuisine: 'Mexican',
      code: 'TACO33',
      image: '/mexican-tacos-discount.jpg'
    },
    {
      id: 2,
      vendor: 'Spice Route',
      title: 'Samosa Combo Pack',
      description: '5 Samosas + Chai for only ₹99',
      discount: '40% OFF',
      validUntil: '2025-12-25',
      cuisine: 'Indian',
      code: 'SPICE40',
      image: '/indian-samosa-offer.jpg'
    },
    {
      id: 3,
      vendor: 'Pho King Good',
      title: 'Large Pho Special',
      description: 'Large bowl of Pho with free side at regular price',
      discount: '25% OFF',
      validUntil: '2025-12-28',
      cuisine: 'Vietnamese',
      code: 'PHO25',
      image: '/vietnamese-pho-offer.jpg'
    },
    {
      id: 4,
      vendor: 'Seoul Bites',
      title: 'Tteokbokki Feast',
      description: 'Spicy Tteokbokki with free drink upgrade',
      discount: '30% OFF',
      validUntil: '2025-12-26',
      cuisine: 'Korean',
      code: 'SEOUL30',
      image: '/korean-food-offer.jpg'
    },
    {
      id: 5,
      vendor: 'Bangkok Express',
      title: 'Pad Thai Weekday Special',
      description: 'Monday to Thursday: Pad Thai + Mango Sticky Rice',
      discount: '35% OFF',
      validUntil: '2025-12-27',
      cuisine: 'Thai',
      code: 'BANGKOK35',
      image: '/thai-noodles-offer.jpg'
    },
    {
      id: 6,
      vendor: 'Empanada Dreams',
      title: 'Premium Pack Discount',
      description: 'Box of 12 empanadas with variety of fillings',
      discount: '20% OFF',
      validUntil: '2025-12-30',
      cuisine: 'Argentine',
      code: 'EMPA20',
      image: '/empanadas-offer.jpg'
    },
    {
      id: 7,
      vendor: 'Middle East Magic',
      title: 'Shawarma Combo Deal',
      description: 'Chicken Shawarma + Falafel + Tahini Sauce',
      discount: '28% OFF',
      validUntil: '2025-12-29',
      cuisine: 'Middle Eastern',
      code: 'SHAWA28',
      image: '/shawarma-offer.jpg'
    },
    {
      id: 8,
      vendor: 'Dragon Wok',
      title: 'Dumpling Paradise',
      description: '30 dumplings + soup for group orders',
      discount: '32% OFF',
      validUntil: '2025-12-24',
      cuisine: 'Chinese',
      code: 'DRAGON32',
      image: '/chinese-dumplings-offer.jpg'
    },
  ]

  const daysUntilExpiry = (date: string) => {
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
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* CHANGE: improved hero section with consistent spacing and clean design */}
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-6">
            <Flame size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">Hot Deals This Week</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-4 text-balance">
            Exclusive Offers from <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Street Vendors</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Save big on your favorite street food with limited-time deals from our community vendors</p>
        </div>
      </section>

      {/* CHANGE: improved offers grid with better card design and spacing */}
      {/* Offers Grid */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-black text-foreground mb-12">Available Offers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offers.map((offer) => (
              <div key={offer.id} className="group rounded-2xl overflow-hidden border border-border/30 hover:border-primary/40 shadow-md hover:shadow-lg transition-all duration-300 bg-white flex flex-col h-full">
                {/* Image */}
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                  <img
                    src={offer.image || "/placeholder.svg"}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-lg font-black text-sm shadow-lg">
                    {offer.discount}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-primary uppercase tracking-wide">{offer.cuisine}</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2 line-clamp-2">{offer.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-2">{offer.description}</p>

                  {/* Meta Info */}
                  <div className="space-y-2 mb-5 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span className="truncate">{offer.vendor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar size={14} className="flex-shrink-0" />
                      <span>{typeof daysUntilExpiry(offer.validUntil) === 'number' ? `${daysUntilExpiry(offer.validUntil)} days left` : 'Expired'}</span>
                    </div>
                  </div>

                  {/* Code & Button */}
                  <div className="space-y-3 border-t border-border/30 pt-4">
                    <button
                      onClick={() => copyToClipboard(offer.code, offer.id)}
                      className="w-full bg-primary/10 hover:bg-primary/15 p-3 rounded-lg transition-colors text-center"
                    >
                      <p className="text-xs text-muted-foreground mb-1">Use Code</p>
                      <div className="flex items-center justify-center gap-2">
                        <p className="font-black text-primary text-sm">{offer.code}</p>
                        <Copy size={14} className="text-primary" />
                      </div>
                      {copiedCode === offer.id && (
                        <p className="text-xs text-primary mt-1 font-semibold">Copied!</p>
                      )}
                    </button>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-sm">
                      Claim Offer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-background/70">
          <p>&copy; 2025 StreetBite. Celebrating street food culture worldwide.</p>
        </div>
      </footer>
    </div>
  )
}
