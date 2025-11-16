'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Heart, Zap, Users, Globe, Lightbulb, Shield, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* CHANGE: improved hero section with consistent styling */}
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-orange-50 via-white to-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 text-balance">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">StreetBite</span>
          </h1>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Connecting food lovers with authentic street food vendors around the world
          </p>
        </div>
      </section>

      {/* CHANGE: improved mission section with better layout and spacing */}
      {/* Mission Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Our Mission</p>
                <h2 className="text-4xl font-black text-foreground mb-4">Celebrate Authentic Street Food</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Street food is more than just food—it's a celebration of culture, tradition, and community. StreetBite was founded to connect food enthusiasts with authentic street food vendors and help build thriving local food communities worldwide.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Why We Started</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Street food vendors are the backbone of culinary traditions. We created StreetBite to bridge the gap between vendors and customers, making it easier for people to discover authentic street food while supporting local entrepreneurs.
                </p>
                <div className="space-y-2 pt-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-primary flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">Direct support from customers to vendors</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-primary flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">Authentic experiences with real reviews</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-primary flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">Building vibrant local food communities</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border border-primary/20">
              <Heart size={120} className="text-primary/30" />
            </div>
          </div>
        </div>
      </section>

      {/* CHANGE: improved values section with cleaner grid and better spacing */}
      {/* Values Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-orange-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Core Values</p>
            <h2 className="text-4xl font-black text-foreground mb-4">What Drives Us Forward</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Lightbulb size={32} />,
                title: 'Innovation',
                description: 'We continuously improve our platform to make street food discovery seamless and enjoyable.'
              },
              {
                icon: <Users size={32} />,
                title: 'Community',
                description: 'Building authentic connections between food lovers and vendors to create a supportive ecosystem.'
              },
              {
                icon: <Globe size={32} />,
                title: 'Authenticity',
                description: 'We celebrate real street food culture and support traditional vendors creating genuine experiences.'
              },
              {
                icon: <Heart size={32} />,
                title: 'Support',
                description: 'We empower local vendors with tools and platforms to grow their businesses sustainably.'
              },
              {
                icon: <Shield size={32} />,
                title: 'Trust',
                description: 'Real reviews from real customers ensure quality and transparency in every transaction.'
              },
              {
                icon: <Zap size={32} />,
                title: 'Efficiency',
                description: 'Fast discovery, quick service, and seamless experience from search to satisfaction.'
              },
            ].map((value, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-white border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
                <div className="text-primary mb-5">{value.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CHANGE: added how it works timeline section */}
      {/* How It Works Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Process</p>
            <h2 className="text-4xl font-black text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Three simple steps to discover amazing street food</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                number: '01',
                title: 'Search & Discover',
                description: 'Use our platform to find street food vendors near you by cuisine, rating, or location'
              },
              {
                number: '02',
                title: 'Browse & Review',
                description: 'Check out menus, real customer reviews, and authentic food photos'
              },
              {
                number: '03',
                title: 'Enjoy & Support',
                description: 'Order, enjoy amazing street food, and support local vendors directly'
              }
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/10 border-2 border-primary/30">
                    <span className="text-2xl font-black text-primary">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
                {idx < 2 && (
                  <div className="hidden md:flex absolute top-8 -right-4 w-8 items-center justify-center">
                    <ArrowRight size={24} className="text-primary/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-orange-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Impact</p>
            <h2 className="text-4xl font-black text-foreground mb-4">Our Growing Community</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: '2,000+', label: 'Street Vendors' },
              { number: '50K+', label: 'Food Lovers' },
              { number: '25+', label: 'Cities' },
              { number: '100K+', label: 'Meals Discovered' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-8 rounded-2xl bg-white border border-border/30 hover:border-primary/40 hover:shadow-lg transition-all">
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
                  {stat.number}
                </div>
                <p className="text-muted-foreground font-medium text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 bg-gradient-to-r from-primary via-orange-500 to-secondary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-6">Join Our Community</h2>
          <p className="text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
            Whether you're a food lover looking to discover street food or a vendor wanting to grow your business, StreetBite is for you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/explore">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold text-base px-8">
                Start Discovering
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-bold text-base px-8">
                Become a Vendor
              </Button>
            </Link>
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
