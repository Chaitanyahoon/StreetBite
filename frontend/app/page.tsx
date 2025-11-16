'use client'

import { Navbar } from '@/components/navbar'
import { HeroSection } from '@/components/hero-section'
import { VendorCard } from '@/components/vendor-card'
import { FeatureCard } from '@/components/feature-card'
import { Button } from '@/components/ui/button'
import { MapPin, Zap, Users, TrendingUp, ArrowRight, Flame, Trophy, Smile } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  const vendors = [
    {
      id: 1,
      name: 'Taco Paradise',
      cuisine: 'Mexican Street Food',
      rating: 4.8,
      distance: '0.5 km away',
      image: '/mexican-tacos-street-food.jpg',
      reviews: 342,
      tags: ['Tacos', 'Affordable', 'Popular']
    },
    {
      id: 2,
      name: 'Spice Route',
      cuisine: 'Indian Street Food',
      rating: 4.9,
      distance: '0.8 km away',
      image: '/indian-street-food-samosa.jpg',
      reviews: 528,
      tags: ['Samosa', 'Chai', 'Authentic']
    },
    {
      id: 3,
      name: 'Pho King Good',
      cuisine: 'Vietnamese Street Food',
      rating: 4.7,
      distance: '1.2 km away',
      image: '/vietnamese-pho-street-food.jpg',
      reviews: 401,
      tags: ['Pho', 'Fresh', 'Traditional']
    },
    {
      id: 4,
      name: 'Seoul Bites',
      cuisine: 'Korean Street Food',
      rating: 4.8,
      distance: '1.5 km away',
      image: '/korean-tteokbokki-street-food.jpg',
      reviews: 389,
      tags: ['Tteokbokki', 'Spicy', 'Modern']
    },
  ]

  const features = [
    {
      icon: <MapPin size={24} />,
      title: 'Discover Near You',
      description: 'Find authentic street food vendors within minutes using real-time location-based discovery'
    },
    {
      icon: <Zap size={24} />,
      title: 'Fast & Fresh',
      description: 'Quick service without compromise with live vendor status and estimated wait times'
    },
    {
      icon: <Users size={24} />,
      title: 'Community Driven',
      description: 'Real reviews from real people sharing authentic food experiences'
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'Support Local',
      description: 'Direct support from customers to help local vendors grow their businesses'
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HeroSection />

      {/* CHANGE: improved spacing and section structure with better visual hierarchy */}
      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-white via-orange-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Why StreetBite</p>
            <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 text-balance">
              Everything You Need for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Amazing</span> Street Food
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              The ultimate platform connecting food lovers with authentic street vendors
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-4">
            <div>
              <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Popular Vendors</p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-3">Top Vendors Carousel</h2>
              <p className="text-muted-foreground text-lg max-w-xl">Trending street food vendors with amazing ratings from our community</p>
            </div>
            <Link href="/explore">
              <Button className="hidden md:flex gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg text-base px-8 font-semibold">
                Explore All <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {vendors.map((vendor) => (
              <VendorCard key={vendor.id} {...vendor} />
            ))}
          </div>
          <div className="flex md:hidden justify-center">
            <Link href="/explore">
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2 text-base px-8 font-semibold">
                Explore All <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-orange-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-16 gap-4">
            <div>
              <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Limited Time</p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-3">Special Offers</h2>
              <p className="text-muted-foreground text-lg max-w-xl">Save big with exclusive deals from your favorite vendors</p>
            </div>
            <Link href="/offers">
              <Button className="hidden md:flex gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg text-base px-8 font-semibold">
                View All Offers <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group rounded-2xl overflow-hidden bg-white border border-border/30 hover:border-primary/40 shadow-md hover:shadow-lg transition-all">
                <div className="relative h-40 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <Flame size={48} className="text-primary/30" />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-lg font-bold text-sm">30% OFF</div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-2">Amazing Deal</h3>
                  <p className="text-muted-foreground text-sm mb-4">Limited time offer on premium selections</p>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">Claim Offer</Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex md:hidden justify-center">
            <Link href="/offers">
              <Button className="bg-primary hover:bg-primary/90 text-white gap-2 text-base px-8 font-semibold">
                View All Offers <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary via-orange-500 to-secondary text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Active Vendors', value: '2,000+' },
              { label: 'Food Lovers', value: '50K+' },
              { label: 'Reviews', value: '10K+' },
              { label: 'Cities', value: '25+' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl md:text-5xl font-black mb-2">{stat.value}</div>
                <p className="text-white/80 font-medium text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-foreground mb-6 text-balance">Ready to Discover?</h2>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed max-w-2xl mx-auto">
            Join StreetBite today and become part of a vibrant community celebrating authentic street food culture
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/explore">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-lg text-base px-8 font-semibold">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/5 text-base px-8 font-semibold">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-black text-lg">
                  🍽️
                </div>
                <span className="font-black text-xl">StreetBite</span>
              </div>
              <p className="text-background/70 text-sm leading-relaxed">Discover amazing street food and support local vendors in your community</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Explore</h4>
              <ul className="space-y-3 text-sm text-background/70">
                <li><Link href="/explore" className="hover:text-background transition-colors">Browse Vendors</Link></li>
                <li><a href="#" className="hover:text-background transition-colors">Cuisines</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Locations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">For Vendors</h4>
              <ul className="space-y-3 text-sm text-background/70">
                <li><Link href="/signup" className="hover:text-background transition-colors">Join Now</Link></li>
                <li><a href="#" className="hover:text-background transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-3 text-sm text-background/70">
                <li><Link href="/about" className="hover:text-background transition-colors">About Us</Link></li>
                <li><a href="#" className="hover:text-background transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-background/70">
                <li><a href="#" className="hover:text-background transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm text-background/70">
            <p>&copy; 2025 StreetBite. Celebrating street food culture worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
