'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Search, Star, ChefHat, ArrowRight, Sparkles, TrendingUp, Clock, Utensils, ScanEye } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useCityName } from '@/hooks/use-city-name'
import { ScrollingTicker } from '@/components/scrolling-ticker'

export default function Home() {
  const { cityName, loading } = useCityName()

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Enhanced Navbar */}
      <Navbar />

      <main className="flex-1 pt-20">



        {/* Enhanced Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl -z-20" />

          {/* Floating Food Emojis (Lightweight 3D Effect) */}
          <div className="absolute top-20 left-[10%] text-6xl animate-bounce-slow opacity-20 rotate-12 -z-10">🍔</div>
          <div className="absolute bottom-20 right-[10%] text-6xl animate-bounce-slow opacity-20 -rotate-12 -z-10" style={{ animationDelay: '1.5s' }}>🍕</div>
          <div className="absolute top-40 right-[15%] text-5xl animate-pulse opacity-20 rotate-45 -z-10">🍜</div>

          <div className="container mx-auto px-4 text-center relative z-10">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/80 border border-primary/20 backdrop-blur-sm text-sm font-semibold mb-8 animate-scale-in shadow-sm hover:shadow-md transition-all cursor-default">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-foreground/80">
                Live in <span className="text-primary font-bold">{loading ? '...' : (cityName?.trim() ? cityName : 'your city')}</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tight text-foreground leading-[1.1] animate-slide-up">
              Find the Best <br />
              <span className="relative inline-block px-4">
                <span className="relative z-10 text-shine-amber">
                  Street Food
                </span>
                {/* Underline Highlight */}
                <span className="absolute bottom-2 left-0 w-full h-3 bg-orange-100/50 -skew-x-12 -z-0"></span>

                <div className="absolute -top-6 -right-8 animate-float" style={{ animationDelay: '0.5s' }}>
                  <Sparkles className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                </div>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up font-medium" style={{ animationDelay: '0.1s' }}>
              From hidden gems to trending stalls, discover authentic local flavors in your neighborhood.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/explore">
                <Button size="lg" className="h-16 px-10 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 hover-lift group">
                  <Search className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Find Food Near Me
                </Button>
              </Link>
              <Link href="/signup?type=vendor">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg font-bold border-2 hover:bg-secondary/10 hover-lift group bg-white/50 backdrop-blur-sm">
                  <ChefHat className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  List My Stall
                </Button>
              </Link>
            </div>

            {/* Stats - Glass Effect */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in bg-white/40 backdrop-blur-md border border-white/50 p-6 rounded-3xl shadow-sm" style={{ animationDelay: '0.3s' }}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-foreground mb-1">500+</div>
                <div className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-wider">Vendors</div>
              </div>
              <div className="text-center border-x border-foreground/10">
                <div className="text-3xl md:text-4xl font-black text-foreground mb-1">10K+</div>
                <div className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-wider">Foodies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-foreground mb-1">4.9</div>
                <div className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-wider">Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Scrolling Ticker - Divider */}
        <ScrollingTicker />

        {/* Quick Cravings Section */}
        <section className="py-12 border-b border-border/40">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-8 animate-fade-in">
              What are you craving?
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {[
                { icon: "🔥", label: "Spicy" },
                { icon: "🥟", label: "Momos" },
                { icon: "🥪", label: "Sandwiches" },
                { icon: "🥤", label: "Drinks" },
                { icon: "🥗", label: "Healthy" },
                { icon: "🍰", label: "Sweet" },
              ].map((item, idx) => (
                <Link href={`/explore?category=${item.label}`} key={idx}>
                  <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary/10 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all cursor-pointer hover:scale-105 active:scale-95 group">
                    <span className="text-xl group-hover:animate-bounce-slow">{item.icon}</span>
                    <span className="font-medium text-foreground">{item.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Section - Street Pop Style */}
        <section className="py-24 bg-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 border-2 border-black bg-white text-black text-sm font-black uppercase tracking-widest mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Why StreetBite
              </div>
              <h2 className="text-5xl md:text-6xl font-black mb-6 text-foreground leading-tight">
                Your <span className="text-shine-amber">Ultimate Food Guide</span>
              </h2>
              <p className="text-xl font-bold text-muted-foreground max-w-2xl mx-auto">
                Everything you need to discover, enjoy, and share amazing street food experiences.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 - Live Tracking - Primary Orange */}
              <div className="group bg-white p-8 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] transition-all hover:-translate-y-1">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-xl mb-6 shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] group-hover:rotate-3 transition-transform">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-black">Live Tracking</h3>
                <p className="text-lg font-medium text-gray-600 leading-relaxed">
                  Real-time location updates. Never miss the pani puri guy again.
                </p>
              </div>

              {/* Feature 2 - Trusted Reviews - Secondary Teal */}
              <div className="group bg-white p-8 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(20,184,166,1)] hover:shadow-[12px_12px_0px_0px_rgba(20,184,166,1)] transition-all hover:-translate-y-1 md:-mt-8">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-xl mb-6 shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] group-hover:-rotate-3 transition-transform">
                  <Star className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-black">Trusted Reviews</h3>
                <p className="text-lg font-medium text-gray-600 leading-relaxed">
                  Authentic ratings from real foodies. No fake 5-star bots here.
                </p>
              </div>

              {/* Feature 3 - Vendor Tools - Accent/Neutral */}
              <div className="group bg-white p-8 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] hover:shadow-[12px_12px_0px_0px_rgba(24,24,27,1)] transition-all hover:-translate-y-1">
                <div className="w-16 h-16 bg-black text-white flex items-center justify-center rounded-xl mb-6 shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] group-hover:rotate-3 transition-transform">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-black">Vendor Tools</h3>
                <p className="text-lg font-medium text-gray-600 leading-relaxed">
                  Powerful dashboard for stall owners to manage menus & growth.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* How It Works Section - Street Pop / Neo-Brutalism */}
        <section className="py-32 bg-yellow-50 relative overflow-hidden">
          {/* Background Texture */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-block px-6 py-2 bg-black text-white text-lg font-black uppercase tracking-wider mb-6 transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Street Logic
              </div>
              <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase leading-[0.9]">
                From Screen<br />To <span className="text-shine-amber">Street</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {/* Step 1 - Cyan Pop */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-xl"></div>
                <div className="relative bg-white border-4 border-black p-8 rounded-xl transform transition-transform group-hover:-translate-y-2 group-hover:-translate-x-2">
                  <div className="w-16 h-16 bg-cyan-400 border-4 border-black rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    1
                  </div>
                  <h3 className="text-3xl font-black mb-3 uppercase italic">Spot It</h3>
                  <p className="text-lg font-bold text-gray-700 leading-tight">
                    Hunting mode on. Find hidden gems on the live map.
                  </p>
                  <MapPin className="absolute top-4 right-4 w-10 h-10 text-black transform -rotate-12 opacity-80" />
                </div>
              </div>

              {/* Step 2 - Pink Pop */}
              <div className="group relative md:mt-12">
                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-xl"></div>
                <div className="relative bg-white border-4 border-black p-8 rounded-xl transform transition-transform group-hover:-translate-y-2 group-hover:-translate-x-2">
                  <div className="w-16 h-16 bg-pink-400 border-4 border-black rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    2
                  </div>
                  <h3 className="text-3xl font-black mb-3 uppercase italic">Verify It</h3>
                  <p className="text-lg font-bold text-gray-700 leading-tight">
                    No sketchy food. Check hygiene & real reviews first.
                  </p>
                  <ScanEye className="absolute top-4 right-4 w-10 h-10 text-black transform rotate-12 opacity-80" />
                </div>
              </div>

              {/* Step 3 - Orange Pop */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-xl"></div>
                <div className="relative bg-white border-4 border-black p-8 rounded-xl transform transition-transform group-hover:-translate-y-2 group-hover:-translate-x-2">
                  <div className="w-16 h-16 bg-orange-400 border-4 border-black rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    3
                  </div>
                  <h3 className="text-3xl font-black mb-3 uppercase italic">Devour It</h3>
                  <p className="text-lg font-bold text-gray-700 leading-tight">
                    Go there, eat, and repeat. Satisfaction guaranteed.
                  </p>
                  <Utensils className="absolute top-4 right-4 w-10 h-10 text-black transform -rotate-6 opacity-80" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section - Dark Theme */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="relative bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center text-white overflow-hidden shadow-2xl animate-scale-in">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-primary rounded-full blur-[100px] opacity-30"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary rounded-full blur-[100px] opacity-30"></div>
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-primary-foreground border border-white/10 text-sm font-bold mb-6 backdrop-blur-md">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-gray-200">Join the Night Market</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                  Ready to Satisfy Your<br />
                  <span className="text-shine-amber">Late Night Cravings?</span>
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
                  Join <span className="text-white font-bold">10,000+ foodies</span> finding the best open stalls right now.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="h-16 px-12 rounded-full text-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25 hover-lift hover-glow group border-none">
                      Get Started Free
                      <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline" className="h-16 px-12 rounded-full text-lg font-bold bg-transparent text-white border-white/20 hover:bg-white/10 hover-lift group">
                      Our Story
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <Footer />
    </div>
  )
}
