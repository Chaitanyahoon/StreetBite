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



        {/* Enhanced Hero Section - Premium Street Pop */}
        <section className="relative py-20 md:py-32 overflow-hidden bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-400 rounded-full blur-[100px] animate-pulse -z-10 mix-blend-multiply opacity-50" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-400 rounded-full blur-[100px] animate-pulse -z-10 mix-blend-multiply opacity-50" style={{ animationDuration: '4s' }} />

          {/* Floating Food Elements */}
          <div className="absolute top-20 left-[10%] text-7xl animate-float opacity-100 rotate-12 -z-10 hover:scale-110 transition-transform cursor-pointer drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">🍔</div>
          <div className="absolute bottom-40 right-[5%] text-7xl animate-float-delayed opacity-100 -rotate-12 -z-10 hover:scale-110 transition-transform cursor-pointer drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">🍕</div>
          <div className="absolute top-32 right-[15%] text-6xl animate-bounce-slow opacity-100 rotate-45 -z-10 hover:scale-110 transition-transform cursor-pointer drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">🍜</div>
          <div className="absolute bottom-10 left-[20%] text-5xl animate-float opacity-100 -rotate-6 -z-10 drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">🍟</div>

          <div className="max-w-screen-2xl mx-auto px-4 text-center relative z-10">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all cursor-default group transform -rotate-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-black"></span>
              </span>
              <span className="text-sm font-black text-black tracking-wide uppercase">
                Live in <span className="bg-black text-white px-2 py-0.5 rounded ml-1 group-hover:bg-orange-500 transition-colors">{loading ? '...' : (cityName?.trim() ? cityName : 'YOUR CITY')}</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-8 text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-black leading-[0.9] animate-slide-up">
              FIND THE <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10 text-orange-500 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] text-stroke-2 text-stroke-black">
                  BEST FOOD
                </span>
                {/* Text Decoration */}
                <span className="absolute -bottom-4 left-0 w-[110%] -ml-[5%] h-8 bg-yellow-400/0 -skew-x-6 -z-0" style={{ zIndex: -1 }}></span>

                <div className="absolute -top-12 -right-12 animate-spin-slow">
                  <Sparkles className="h-16 w-16 text-yellow-400 fill-yellow-400 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] stroke-black stroke-2" />
                </div>
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mt-8 text-xl md:text-2xl text-gray-800 font-bold max-w-2xl mx-auto leading-relaxed">
              Discover hidden gems, trending stalls, and authentic flavors right in your neighborhood.
            </p>

            {/* CTA Buttons */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/explore">
                <Button size="lg" className="h-20 px-12 rounded-full text-2xl font-black bg-black text-white hover:bg-orange-500 border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all duration-300">
                  <Search className="mr-3 h-8 w-8 stroke-[3]" />
                  FIND FOOD
                </Button>
              </Link>
              <Link href="/signup?type=vendor">
                <Button size="lg" variant="outline" className="h-20 px-12 rounded-full text-2xl font-black bg-white text-black border-4 border-black hover:bg-yellow-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-all duration-300">
                  <ChefHat className="mr-3 h-8 w-8 stroke-[3]" />
                  LIST STALL
                </Button>
              </Link>
            </div>

            {/* Stats - Floating Cards */}
            <div className="mt-24 grid grid-cols-2 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-2 group transform -rotate-2 hover:rotate-0">
                <div className="text-5xl md:text-6xl font-black text-black mb-2 group-hover:scale-110 transition-transform origin-center">500+</div>
                <div className="text-sm font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded inline-block">Active Vendors</div>
              </div>
              <div className="hidden md:block bg-yellow-400 p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-2 group mt-8 transform rotate-3 hover:rotate-0">
                <div className="text-5xl md:text-6xl font-black text-black mb-2 group-hover:scale-110 transition-transform origin-center">10K+</div>
                <div className="text-sm font-black text-black/70 uppercase tracking-widest bg-white/30 px-2 py-1 rounded inline-block">Happy Foodies</div>
              </div>
              <div className="bg-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-2 group md:mt-4 transform -rotate-1 hover:rotate-0">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-5xl md:text-6xl font-black text-black group-hover:scale-110 transition-transform origin-center">4.9</span>
                  <Star className="h-8 w-8 fill-orange-500 text-black stroke-[3] animate-pulse" />
                </div>
                <div className="text-sm font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-2 py-1 rounded inline-block">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Scrolling Ticker - Divider */}
        <ScrollingTicker />

        {/* Quick Cravings Section - Pop Art Style */}
        <section className="py-16 border-b-4 border-black bg-white overflow-hidden relative">
          <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>

          <div className="max-w-screen-2xl mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6">
              <div className="text-left">
                <div className="inline-block px-4 py-1 bg-black text-white text-xs font-black uppercase tracking-widest mb-2 transform -rotate-1">
                  Hungry?
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-foreground uppercase tracking-tight">
                  What are you <span className="text-primary underline decoration-wavy decoration-black/20">Yearning?</span>
                </h2>
              </div>
              <Link href="/explore">
                <Button variant="ghost" className="hidden md:flex gap-2 font-bold hover:bg-black/5 hover:text-primary transition-colors text-lg group">
                  View Full Menu <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {[
                { icon: "🔥", label: "Spicy" },
                { icon: "🥟", label: "Momos" },
                { icon: "🥪", label: "Sandwiches" },
                { icon: "🥤", label: "Drinks" },
                { icon: "🥗", label: "Healthy" },
                { icon: "🍰", label: "Sweet" },
                { icon: "🍗", label: "Non-Veg" },
                { icon: "🥘", label: "Thali" },
              ].map((item, idx) => (
                <Link href={`/explore?category=${item.label}`} key={idx}>
                  <div className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all cursor-pointer group hover:bg-yellow-100">
                    <span className="text-2xl group-hover:animate-bounce-slow filter drop-shadow-sm">{item.icon}</span>
                    <span className="font-black text-lg text-foreground uppercase tracking-wide">{item.label}</span>
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

          <div className="max-w-screen-2xl mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 border-2 border-black bg-white text-black text-sm font-black uppercase tracking-widest mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
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
        <section className="py-32 bg-white relative overflow-hidden">
          {/* Background Texture */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

          <div className="max-w-screen-2xl mx-auto px-4 relative z-10">
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
                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-xl transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
                <div className="relative bg-white border-4 border-black p-8 rounded-xl transform transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                  <div className="w-16 h-16 bg-cyan-400 border-4 border-black rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    1
                  </div>
                  <h3 className="text-3xl font-black mb-3 uppercase italic transform -skew-x-6">Spot It</h3>
                  <p className="text-lg font-bold text-gray-700 leading-tight">
                    Hunting mode on. Find hidden gems on the live map.
                  </p>
                  <MapPin className="absolute top-4 right-4 w-10 h-10 text-cyan-500/20 transform -rotate-12 group-hover:scale-125 transition-transform" />
                </div>
              </div>

              {/* Step 2 - Pink Pop */}
              <div className="group relative md:mt-12">
                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-xl transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
                <div className="relative bg-white border-4 border-black p-8 rounded-xl transform transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                  <div className="w-16 h-16 bg-pink-400 border-4 border-black rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    2
                  </div>
                  <h3 className="text-3xl font-black mb-3 uppercase italic transform -skew-x-6">Verify It</h3>
                  <p className="text-lg font-bold text-gray-700 leading-tight">
                    No sketchy food. Check hygiene & real reviews first.
                  </p>
                  <ScanEye className="absolute top-4 right-4 w-10 h-10 text-pink-500/20 transform rotate-12 group-hover:scale-125 transition-transform" />
                </div>
              </div>

              {/* Step 3 - Orange Pop */}
              <div className="group relative">
                <div className="absolute inset-0 bg-black translate-x-3 translate-y-3 rounded-xl transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
                <div className="relative bg-white border-4 border-black p-8 rounded-xl transform transition-transform group-hover:-translate-y-1 group-hover:-translate-x-1">
                  <div className="w-16 h-16 bg-orange-400 border-4 border-black rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    3
                  </div>
                  <h3 className="text-3xl font-black mb-3 uppercase italic transform -skew-x-6">Devour It</h3>
                  <p className="text-lg font-bold text-gray-700 leading-tight">
                    Go there, eat, and repeat. Satisfaction guaranteed.
                  </p>
                  <Utensils className="absolute top-4 right-4 w-10 h-10 text-orange-500/20 transform -rotate-6 group-hover:scale-125 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section - Dark Theme Pop */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-screen-2xl mx-auto px-4">
            <div className="relative bg-black rounded-[3rem] p-12 md:p-24 text-center text-white overflow-hidden shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] transform hover:-translate-y-2 transition-transform duration-500">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px]"></div>
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary rounded-full blur-[120px] opacity-60 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary rounded-full blur-[120px] opacity-60 animate-pulse" style={{ animationDelay: '2s' }}></div>
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 text-primary-foreground border-2 border-white/20 text-sm font-bold mb-8 backdrop-blur-md shadow-lg">
                  <TrendingUp className="h-5 w-5 text-primary animate-bounce-slow" />
                  <span className="text-gray-100 tracking-wide uppercase">Join the Night Market</span>
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tight">
                  Ready to Satisfy Your<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Late Night Cravings?</span>
                </h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                  Join <span className="text-white font-black underline decoration-primary decoration-4">10,000+ foodies</span> finding the best open stalls right now.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6">
                  <Link href="/signup">
                    <Button size="lg" className="h-20 px-16 rounded-full text-2xl font-black bg-primary text-white hover:bg-orange-500 shadow-[0_10px_40px_rgba(249,115,22,0.5)] hover:shadow-[0_15px_50px_rgba(249,115,22,0.7)] hover:-translate-y-2 hover:scale-105 transition-all duration-300 border-none group">
                      Get Started Free
                      <ArrowRight className="ml-3 h-8 w-8 group-hover:translate-x-2 transition-transform stroke-[3]" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button size="lg" variant="outline" className="h-20 px-16 rounded-full text-xl font-black bg-transparent text-white border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300">
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
