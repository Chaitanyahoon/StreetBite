import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Search, Star, ChefHat, ArrowRight, Sparkles, TrendingUp, Clock, Utensils, ScanEye } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { LiveCityBadge } from '@/components/live-city-badge'
import { ScrollingTicker } from '@/components/scrolling-ticker'

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

  const discoverySignals = [
    {
      icon: MapPin,
      title: 'Live nearby',
      detail: 'Spot active stalls and fast-moving favorites around your area.',
    },
    {
      icon: Clock,
      title: 'Open right now',
      detail: 'Cut the dead ends. See who is actually serving before you head out.',
    },
    {
      icon: TrendingUp,
      title: 'Worth the detour',
      detail: 'Reviews, momentum, and crowd signals make the good options obvious.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Enhanced Navbar */}
      <Navbar />

      <main className="flex-1 pt-20">



        {/* Hero Section */}
        <section className="relative overflow-hidden py-14 md:py-20 lg:py-24">
          <div className="absolute inset-0 -z-10">
            <div className="absolute left-[-10%] top-10 h-72 w-72 rounded-full bg-orange-300/25 blur-3xl md:h-96 md:w-96" />
            <div className="absolute right-[-8%] top-0 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl md:h-[26rem] md:w-[26rem]" />
            <div className="absolute bottom-[-12%] left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-teal-200/20 blur-3xl md:h-80 md:w-80" />
            <div className="absolute inset-x-0 top-0 h-px bg-black/10" />
          </div>

          <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:items-center">
              <div className="max-w-3xl">
                <div className="animate-slide-up">
                  <LiveCityBadge />
                </div>

                <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-black/80 shadow-[var(--shadow-soft)] backdrop-blur">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Street food, minus the guesswork
                </div>

                <h1 className="headline-display mt-6 max-w-4xl text-5xl leading-[0.92] text-black sm:text-6xl md:text-7xl lg:text-[5.5rem] animate-slide-up">
                  Street food
                  <span className="block text-primary">worth the detour.</span>
                </h1>

                <p className="mt-6 max-w-2xl text-lg font-medium leading-8 text-black/72 md:text-xl animate-slide-up">
                  Discover authentic stalls, see who is actually open, and choose with confidence before you step out.
                </p>

                <div className="mt-8 flex flex-col gap-3 text-sm font-semibold text-black/70 sm:flex-row sm:flex-wrap sm:items-center animate-fade-in">
                  <div className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-white shadow-[var(--shadow-soft)]">
                    <MapPin className="h-4 w-4" />
                    Live vendor discovery
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 shadow-[var(--shadow-soft)]">
                    <Clock className="h-4 w-4 text-primary" />
                    Open-now filtering
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 shadow-[var(--shadow-soft)]">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    Verified reviews
                  </div>
                </div>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row animate-slide-up">
                  <Link href="/explore">
                    <Button size="lg" className="h-14 w-full rounded-full px-8 text-base font-black uppercase tracking-[0.12em] sm:w-auto">
                      <Search className="mr-1 h-5 w-5 stroke-[2.6]" />
                      Explore vendors
                    </Button>
                  </Link>
                  <Link href="/signup?type=vendor">
                    <Button size="lg" variant="outline" className="h-14 w-full rounded-full px-8 text-base font-black uppercase tracking-[0.12em] sm:w-auto">
                      <ChefHat className="mr-1 h-5 w-5 stroke-[2.6]" />
                      List your stall
                    </Button>
                  </Link>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {heroStats.map((stat) => {
                    const Icon = stat.icon
                    return (
                      <div key={stat.label} className="surface-panel rounded-[1.4rem] px-5 py-4">
                        <div className="flex items-center gap-2 text-3xl font-black text-black md:text-4xl">
                          <span>{stat.value}</span>
                          {Icon ? <Icon className="h-5 w-5 fill-primary text-primary md:h-6 md:w-6" /> : null}
                        </div>
                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-black/55">
                          {stat.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="relative animate-fade-in">
                <div className="surface-panel-strong rounded-[2rem] p-5 md:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="eyebrow-label text-black/55">Tonight&apos;s edge</p>
                      <h2 className="mt-3 max-w-xs text-3xl font-black leading-tight text-black md:text-4xl">
                        Find the right stall fast.
                      </h2>
                    </div>
                    <div className="rounded-2xl bg-black p-3 text-white shadow-[var(--shadow-soft)]">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    {discoverySignals.map((signal) => {
                      const Icon = signal.icon
                      return (
                        <div key={signal.title} className="rounded-[1.4rem] border border-black/10 bg-white/88 p-4 shadow-[var(--shadow-soft)] backdrop-blur">
                          <div className="flex items-start gap-4">
                            <div className="mt-1 rounded-2xl bg-accent px-3 py-3 text-accent-foreground">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <h3 className="text-lg font-black text-black">{signal.title}</h3>
                              <p className="mt-1 text-sm font-medium leading-6 text-black/65">{signal.detail}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="mt-6 flex flex-col gap-3 rounded-[1.6rem] bg-black px-5 py-5 text-white md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="eyebrow-label text-white/60">Built for both sides</p>
                      <p className="mt-2 text-base font-semibold text-white/85">
                        Foodies discover faster. Vendors show up when it matters.
                      </p>
                    </div>
                    <Link href="/about" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-primary-foreground/90">
                      See how it works
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
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
