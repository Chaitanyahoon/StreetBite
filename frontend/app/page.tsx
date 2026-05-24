import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Search, Star, ChefHat, ArrowRight, Sparkles, TrendingUp, Clock, Utensils, ScanEye, Flame, Sandwich, CupSoda, Leaf, Drumstick, Soup, Croissant, CookingPot } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { LiveCityBadge } from '@/components/live-city-badge'
import { ScrollingTicker } from '@/components/scrolling-ticker'
import { CravingsRoulette } from '@/components/cravings-roulette'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'StreetBite | Discover Authentic Local Street Food Near You',
  description: 'The ultimate guide to street food. Find hidden gems, trending stalls, and live tracking for the best street food vendors in your neighborhood.',
  alternates: {
    canonical: 'https://streetbitego.vercel.app',
  },
}

export default function Home() {
  const heroStats = [
    { value: '500+', label: 'Active vendors' },
    { value: '10K+', label: 'Foodie check-ins' },
    { value: '4.9', label: 'Average rating', icon: Star },
  ]

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Enhanced Navbar */}
      <Navbar forceSolid />

      <main className="flex-1">



        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 lg:py-28">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-[-8%] top-10 h-56 w-56 rounded-[4rem] border-4 border-black/12 bg-orange-300/20 blur-2xl md:h-72 md:w-72" />
            <div className="absolute right-[6%] top-16 h-28 w-28 rotate-12 rounded-[2rem] border-4 border-black/12 bg-yellow-300/35 shadow-[var(--shadow-soft)] md:h-40 md:w-40" />
            <div className="absolute bottom-20 left-[8%] h-20 w-20 -rotate-12 rounded-full border-4 border-black/10 bg-teal-200/45 shadow-[var(--shadow-soft)] md:h-28 md:w-28" />
            <div className="absolute bottom-8 right-[-4%] h-60 w-60 rounded-full bg-orange-200/25 blur-3xl md:h-80 md:w-80" />
          </div>

          <div className="max-w-screen-2xl mx-auto px-4 md:px-6 text-center">
            <div className="mx-auto max-w-5xl">
              <div className="animate-slide-up">
                <LiveCityBadge />
              </div>

              <div className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-[0.72rem] font-black uppercase tracking-[0.24em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-slide-up">
                <Sparkles className="h-4 w-4 text-primary" />
                Find the best food fast
              </div>

              <h1 className="mt-8 text-[2.25rem] xs:text-[2.75rem] sm:text-6xl md:text-8xl lg:text-9xl leading-[1.05] sm:leading-[1] font-black tracking-[-0.06em] text-black animate-slide-up">
                FIND THE
                <br />
                <span className="relative inline-block mt-2 text-primary drop-shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] sm:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  BEST FOOD
                  <span className="absolute -right-8 -top-8 hidden md:block">
                    <Sparkles className="h-12 w-12 fill-yellow-300 text-yellow-300 stroke-black stroke-2 animate-spin-slow" />
                  </span>
                </span>
              </h1>

              <p className="mt-8 max-w-2xl mx-auto text-lg font-bold leading-8 text-black/75 md:text-2xl animate-slide-up">
                Discover hidden gems, trending stalls, and authentic flavors right in your neighborhood.
              </p>

              <div className="mt-8 flex flex-row items-center justify-center gap-2.5 sm:gap-4 animate-slide-up w-full max-w-md mx-auto sm:max-w-none">
                <Link href="/explore" className="flex-1 sm:flex-initial">
                  <Button
                    size="lg"
                    className="h-10.5 sm:h-16 w-full px-3.5 sm:px-10 text-[11px] xs:text-xs sm:text-lg font-black uppercase tracking-[0.08em] sm:tracking-[0.12em] text-white rounded-full border-2 sm:border-4 border-black bg-black shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] hover:bg-primary sm:hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] sm:active:translate-x-[2px] sm:active:translate-y-[2px] sm:active:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all duration-150"
                  >
                    <Search className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-6 sm:w-6 stroke-[2.6]" />
                    Find food
                  </Button>
                </Link>
                <Link href="/signup?type=vendor" className="flex-1 sm:flex-initial">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-10.5 sm:h-16 w-full px-3.5 sm:px-10 text-[11px] xs:text-xs sm:text-lg font-black uppercase tracking-[0.08em] sm:tracking-[0.12em] text-black rounded-full border-2 sm:border-4 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:active:translate-x-[2px] sm:active:translate-y-[2px] sm:active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
                  >
                    <ChefHat className="mr-1 h-3.5 w-3.5 sm:mr-2 sm:h-6 sm:w-6 stroke-[2.6]" />
                    List stall
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex flex-row flex-wrap justify-center gap-2 text-xs font-semibold text-black/70 animate-fade-in">
                <div className="inline-flex items-center justify-center gap-1.5 rounded-full bg-black px-2.5 py-1 text-white shadow-[var(--shadow-soft)] text-[10px] sm:text-xs">
                  <MapPin className="h-3.5 w-3.5" />
                  Live discovery
                </div>
                <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-2.5 py-1 shadow-[var(--shadow-soft)] text-[10px] sm:text-xs">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Open-now filter
                </div>
                <div className="inline-flex items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white/80 px-2.5 py-1 shadow-[var(--shadow-soft)] text-[10px] sm:text-xs">
                  <TrendingUp className="h-3.5 w-3.5 text-primary" />
                  Trending picks
                </div>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-2 sm:gap-8 max-w-4xl mx-auto animate-fade-in">
                {heroStats.map((stat, index) => {
                  const Icon = stat.icon
                  const cardClassName =
                    index === 1
                      ? 'bg-yellow-300 sm:translate-y-6 animate-pulse-subtle'
                      : 'bg-white'

                  return (
                    <div
                      key={stat.label}
                      className={`rounded-xl sm:rounded-[1.8rem] border-2 sm:border-4 border-black px-1.5 py-2.5 sm:px-5 sm:py-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 ${cardClassName}`}
                    >
                      <div className="flex items-center justify-center gap-1 sm:gap-2 text-sm xs:text-base sm:text-4xl font-black text-black md:text-5xl">
                        <span>{stat.value}</span>
                        {Icon ? <Icon className="h-3 w-3 fill-primary text-primary sm:h-6 sm:w-6 md:h-7 md:w-7" /> : null}
                      </div>
                      <p className="mt-1 text-[8px] xs:text-[9px] sm:text-[0.72rem] font-black uppercase tracking-[0.05em] xs:tracking-[0.16em] sm:tracking-[0.2em] text-black/55 md:text-xs">
                        {stat.label}
                      </p>
                    </div>
                  )
                })}
              </div>

              <div className="mt-10 inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-black/65 shadow-[var(--shadow-soft)] backdrop-blur">
                <ArrowRight className="h-4 w-4 text-primary" />
                Street food, minus the guesswork
              </div>
            </div>
          </div>
        </section>

        {/* Scrolling Ticker - Divider */}
        <ScrollingTicker />

        {/* Quick Cravings Section - Pop Art Style */}
        <section className="py-10 sm:py-16 border-b-4 border-black bg-white overflow-hidden relative">
          <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
          <div className="max-w-screen-2xl mx-auto px-4 relative z-10">
            <CravingsRoulette />
          </div>
        </section>


        {/* Enhanced Features Section - Street Pop Style */}
        <section className="py-12 sm:py-24 bg-white relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}></div>

          <div className="max-w-screen-2xl mx-auto px-4 relative z-10">
            <div className="text-center mb-10 sm:mb-16">
              <div className="inline-block px-4 py-2 border-2 border-black bg-white text-black text-sm font-black uppercase tracking-widest mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
                Why StreetBite
              </div>
              <h2 className="text-[2.25rem] sm:text-5xl md:text-6xl font-black mb-6 text-foreground leading-[1.05] sm:leading-tight">
                Your <span className="text-shine-amber">Ultimate Food Guide</span>
              </h2>
              <p className="text-xl font-bold text-muted-foreground max-w-2xl mx-auto">
                Everything you need to discover, enjoy, and share amazing street food experiences.
              </p>
            </div>

            <div className="flex md:grid md:grid-cols-3 gap-4 sm:gap-8 overflow-x-auto pb-6 pt-2 px-4 -mx-4 scrollbar-none snap-x snap-mandatory">
              {/* Feature 1 - Live Tracking - Primary Orange */}
              <div className="group bg-white pt-3 pb-3.5 px-3.5 sm:p-8 border-[2px] sm:border-4 border-black rounded-xl sm:rounded-3xl shadow-[2.5px_2.5px_0px_0px_rgba(249,115,22,1)] sm:shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] hover:shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(249,115,22,1)] transition-all hover:-translate-y-0.5 w-[220px] xs:w-[255px] sm:w-auto flex-shrink-0 snap-center">
                <div className="w-7 h-7 sm:w-14 sm:h-14 bg-black text-white flex items-center justify-center rounded-md mb-1.5 sm:mb-6 shadow-[1px_1px_0px_0px_rgba(100,100,100,1)] sm:shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] group-hover:rotate-3 transition-transform">
                  <MapPin className="h-3.5 w-3.5 sm:h-7 sm:w-7 text-primary" />
                </div>
                <h3 className="text-xs xs:text-[13px] sm:text-2xl font-black mb-1 sm:mb-3 text-black">Live Tracking</h3>
                <p className="text-[10px] xs:text-[11px] sm:text-lg font-semibold sm:font-medium text-gray-600 leading-snug">
                  Real-time location updates. Never miss the pani puri guy again.
                </p>
              </div>

              {/* Feature 2 - Trusted Reviews - Secondary Teal */}
              <div className="group bg-white pt-3 pb-3.5 px-3.5 sm:p-8 border-[2px] sm:border-4 border-black rounded-xl sm:rounded-3xl shadow-[2.5px_2.5px_0px_0px_rgba(20,184,166,1)] sm:shadow-[8px_8px_0px_0px_rgba(20,184,166,1)] hover:shadow-[4px_4px_0px_0px_rgba(20,184,166,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(20,184,166,1)] transition-all hover:-translate-y-0.5 md:-mt-8 w-[220px] xs:w-[255px] sm:w-auto flex-shrink-0 snap-center">
                <div className="w-7 h-7 sm:w-14 sm:h-14 bg-black text-white flex items-center justify-center rounded-md mb-1.5 sm:mb-6 shadow-[1px_1px_0px_0px_rgba(100,100,100,1)] sm:shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] group-hover:-rotate-3 transition-transform">
                  <Star className="h-3.5 w-3.5 sm:h-7 sm:w-7 text-secondary" />
                </div>
                <h3 className="text-xs xs:text-[13px] sm:text-2xl font-black mb-1 sm:mb-3 text-black">Trusted Reviews</h3>
                <p className="text-[10px] xs:text-[11px] sm:text-lg font-semibold sm:font-medium text-gray-600 leading-snug">
                  Authentic ratings from real foodies. No fake 5-star bots here.
                </p>
              </div>

              {/* Feature 3 - Vendor Tools - Accent/Neutral */}
              <div className="group bg-white pt-3 pb-3.5 px-3.5 sm:p-8 border-[2px] sm:border-4 border-black rounded-xl sm:rounded-3xl shadow-[2.5px_2.5px_0px_0px_rgba(24,24,27,1)] sm:shadow-[8px_8px_0px_0px_rgba(24,24,27,1)] hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] sm:hover:shadow-[12px_12px_0px_0px_rgba(24,24,27,1)] transition-all hover:-translate-y-0.5 w-[220px] xs:w-[255px] sm:w-auto flex-shrink-0 snap-center">
                <div className="w-7 h-7 sm:w-14 sm:h-14 bg-black text-white flex items-center justify-center rounded-md mb-1.5 sm:mb-6 shadow-[1px_1px_0px_0px_rgba(100,100,100,1)] sm:shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] group-hover:rotate-3 transition-transform">
                  <ChefHat className="h-3.5 w-3.5 sm:h-7 sm:w-7 text-white" />
                </div>
                <h3 className="text-xs xs:text-[13px] sm:text-2xl font-black mb-1 sm:mb-3 text-black">Vendor Tools</h3>
                <p className="text-[10px] xs:text-[11px] sm:text-lg font-semibold sm:font-medium text-gray-600 leading-snug">
                  Powerful dashboard for stall owners to manage menus & growth.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* How It Works Section - Street Pop / Neo-Brutalism */}
        <section className="py-16 sm:py-32 bg-white relative overflow-hidden">
          {/* Background Texture */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>

          <div className="max-w-screen-2xl mx-auto px-4 relative z-10">
            <div className="text-center mb-12 sm:mb-20">
              <div className="inline-block px-6 py-2 bg-black text-white text-lg font-black uppercase tracking-wider mb-6 transform -rotate-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Street Logic
              </div>
              <h2 className="text-[2.5rem] xs:text-5xl sm:text-6xl md:text-7xl font-black mb-6 uppercase leading-[1.05] sm:leading-[0.9]">
                From Screen<br />To <span className="text-shine-amber">Street</span>
              </h2>
            </div>

            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-12 max-w-5xl mx-auto overflow-x-auto pb-6 pt-2 px-4 -mx-4 scrollbar-none snap-x snap-mandatory">
              {/* Step 1 - Cyan Pop */}
              <div className="group relative w-[220px] xs:w-[255px] sm:w-auto flex-shrink-0 snap-center">
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 sm:translate-x-3 sm:translate-y-3 rounded-xl transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
                <div className="relative bg-white border-2 sm:border-4 border-black pt-3 pb-3.5 px-3 sm:p-8 rounded-xl transform transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5">
                  <div className="w-7 h-7 sm:w-16 sm:h-16 bg-cyan-400 border-2 sm:border-4 border-black rounded-full flex items-center justify-center text-[10px] sm:text-3xl font-black mb-1.5 sm:mb-6 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    1
                  </div>
                  <h3 className="text-xs xs:text-[13px] sm:text-3xl font-black mb-1 sm:mb-3 uppercase italic transform -skew-x-6">Spot It</h3>
                  <p className="text-[10px] xs:text-[11px] sm:text-lg font-bold text-gray-700 leading-tight">
                    Hunting mode on. Find hidden gems on the live map.
                  </p>
                  <MapPin className="absolute top-3 right-3 w-5 h-5 sm:w-10 sm:h-10 text-cyan-500/20 transform -rotate-12 group-hover:scale-125 transition-transform" />
                </div>
              </div>

              {/* Step 2 - Pink Pop */}
              <div className="group relative md:mt-12 w-[220px] xs:w-[255px] sm:w-auto flex-shrink-0 snap-center">
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 sm:translate-x-3 sm:translate-y-3 rounded-xl transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
                <div className="relative bg-white border-2 sm:border-4 border-black pt-3 pb-3.5 px-3 sm:p-8 rounded-xl transform transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5">
                  <div className="w-7 h-7 sm:w-16 sm:h-16 bg-pink-400 border-2 sm:border-4 border-black rounded-full flex items-center justify-center text-[10px] sm:text-3xl font-black mb-1.5 sm:mb-6 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    2
                  </div>
                  <h3 className="text-xs xs:text-[13px] sm:text-3xl font-black mb-1 sm:mb-3 uppercase italic transform -skew-x-6">Verify It</h3>
                  <p className="text-[10px] xs:text-[11px] sm:text-lg font-bold text-gray-700 leading-tight">
                    No sketchy food. Check hygiene & real reviews first.
                  </p>
                  <ScanEye className="absolute top-3 right-3 w-5 h-5 sm:w-10 sm:h-10 text-pink-500/20 transform rotate-12 group-hover:scale-125 transition-transform" />
                </div>
              </div>

              {/* Step 3 - Orange Pop */}
              <div className="group relative w-[220px] xs:w-[255px] sm:w-auto flex-shrink-0 snap-center">
                <div className="absolute inset-0 bg-black translate-x-1 translate-y-1 sm:translate-x-3 sm:translate-y-3 rounded-xl transition-transform group-hover:translate-x-4 group-hover:translate-y-4"></div>
                <div className="relative bg-white border-2 sm:border-4 border-black pt-3 pb-3.5 px-3 sm:p-8 rounded-xl transform transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5">
                  <div className="w-7 h-7 sm:w-16 sm:h-16 bg-orange-400 border-2 sm:border-4 border-black rounded-full flex items-center justify-center text-[10px] sm:text-3xl font-black mb-1.5 sm:mb-6 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    3
                  </div>
                  <h3 className="text-xs xs:text-[13px] sm:text-3xl font-black mb-1 sm:mb-3 uppercase italic transform -skew-x-6">Devour It</h3>
                  <p className="text-[10px] xs:text-[11px] sm:text-lg font-bold text-gray-700 leading-tight">
                    Go there, eat, and repeat. Satisfaction guaranteed.
                  </p>
                  <Utensils className="absolute top-3 right-3 w-5 h-5 sm:w-10 sm:h-10 text-orange-500/20 transform -rotate-6 group-hover:scale-125 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section - Dark Theme Pop */}
        <section className="py-24 relative overflow-hidden">
          <div className="max-w-screen-2xl mx-auto px-4">
            <div className="relative bg-black rounded-[1.75rem] sm:rounded-[3rem] p-5 py-10 sm:p-12 md:p-24 text-center text-white overflow-hidden shadow-[4px_4px_0px_0px_rgba(249,115,22,1)] sm:shadow-[16px_16px_0px_0px_rgba(249,115,22,1)] transform hover:-translate-y-2 transition-transform duration-500">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#ffffff_2px,transparent_2px)] [background-size:24px_24px]"></div>
              </div>

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 text-primary-foreground border-2 border-white/20 text-sm font-bold mb-8 backdrop-blur-md shadow-lg">
                  <TrendingUp className="h-5 w-5 text-primary animate-bounce-slow" />
                  <span className="text-gray-100 tracking-wide uppercase">Join the Night Market</span>
                </div>
                <h2 className="text-2xl xs:text-3xl sm:text-5xl md:text-7xl font-black mb-6 sm:mb-8 leading-[1.0] sm:leading-[0.9] tracking-tight">
                  Ready to Satisfy Your<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Late Night Cravings?</span>
                </h2>
                <p className="text-sm xs:text-base sm:text-lg md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                  Join <span className="text-white font-black underline decoration-primary decoration-4">10,000+ foodies</span> finding the best open stalls right now.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 max-w-md mx-auto sm:max-w-none">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button size="lg" className="h-12 xs:h-14 sm:h-20 w-full px-5 xs:px-6 sm:px-16 rounded-full text-sm xs:text-lg sm:text-2xl font-black bg-primary text-white hover:bg-orange-500 shadow-[0_6px_20px_rgba(249,115,22,0.4)] sm:shadow-[0_10px_40px_rgba(249,115,22,0.5)] hover:-translate-y-2 hover:scale-105 transition-all duration-300 border-none group">
                      Get Started Free
                      <ArrowRight className="ml-1.5 sm:ml-3 h-4.5 w-4.5 sm:h-8 sm:w-8 group-hover:translate-x-2 transition-transform stroke-[3]" />
                    </Button>
                  </Link>
                  <Link href="/about" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="h-12 xs:h-14 sm:h-20 w-full px-5 xs:px-6 sm:px-16 rounded-full text-xs xs:text-base sm:text-xl font-black bg-transparent text-white border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300">
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
