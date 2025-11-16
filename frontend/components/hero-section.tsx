'use client'

import { ChefHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchBar } from '@/components/search-bar'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-orange-50 via-white to-white overflow-hidden pt-16 pb-20 px-6">
      {/* CHANGE: simplified and repositioned background gradients for cleaner aesthetic */}
      <div className="absolute top-32 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl -z-10"></div>
      
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-semibold text-primary">Discover Local Street Food</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground leading-tight text-balance">
                Discover Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Street Food</span> Around You
              </h1>
              <p className="text-xl text-muted-foreground max-w-xl leading-relaxed font-medium">
                Explore nearby vendors with real-time updates, authentic reviews, and incredible flavors waiting to be discovered
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/explore">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all font-semibold">
                  <ChefHat size={20} />
                  Explore Now
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 font-semibold">
                  Register Stall
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="pt-8 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Join 50K+ food enthusiasts</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Support 2000+ local vendors</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                <span>Real reviews from real customers</span>
              </div>
            </div>
          </div>

          {/* Right - Illustration */}
          <div className="relative h-80 lg:h-96 rounded-2xl overflow-hidden">
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/5 flex items-center justify-center relative border border-primary/10">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-8 right-12 w-40 h-40 bg-primary/10 rounded-3xl rotate-45"></div>
                <div className="absolute bottom-16 left-8 w-48 h-48 bg-secondary/10 rounded-full"></div>
              </div>
              
              <div className="relative z-10 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary/30">
                  <ChefHat size={40} className="text-primary" />
                </div>
                <p className="text-lg font-bold text-foreground">Discover & Support</p>
                <p className="text-sm text-muted-foreground">Authentic street food at your fingertips</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
          <SearchBar />
        </div>
      </div>
    </section>
  )
}
