'use client'

import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Heart, Zap, Users, Globe, Lightbulb, Shield, ArrowRight, CheckCircle, MapPin, Mail } from 'lucide-react'
import Link from 'next/link'
import { Footer } from '@/components/footer'
import { MissionMap } from '@/components/mission-map'
import { ScrollingTicker } from '@/components/scrolling-ticker'
import { Counter } from '@/components/counter'
import { TeamCard } from '@/components/team-card'
import { ContactDialog } from '@/components/contact-dialog'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-white py-20 px-6 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          <h1 className="text-5xl md:text-6xl font-black text-foreground mb-6 text-balance">
            The <span className="text-shine-amber">StreetBite</span> Story
          </h1>
          <p className="text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Born in 2025. Built for the streets. Championing the culinary heroes who feed our cities.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div>
                <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Our Mission</p>
                <h2 className="text-4xl font-black text-foreground mb-4">Democratizing Technology for Street Vendors</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  In a world of digital-first delivery giants, the humble street vendor was being left behind. We founded StreetBite to change that. Our mission is to provide the same powerful tools used by big chains to the aunties and uncles running the best vada pav, pani puri, and roll stalls in town.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-foreground">Why We Started in 2025</h3>
                <p className="text-muted-foreground leading-relaxed">
                  It started with a simple craving. We were looking for that *specific* poha stall in Indiranagar, but he had moved. No Google Maps pin, no Instagram update. Just gone.
                  <br /><br />
                  We realized that while everything else was online, our most authentic culinary culture was invisible. StreetBite was born to map the unmapped and give a voice to the flavor makers of our streets.
                </p>
                <div className="space-y-2 pt-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-primary flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">Preserving culinary heritage</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-primary flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">Empowering micro-entrepreneurs</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-primary flex-shrink-0 mt-1" />
                    <span className="text-muted-foreground">Connecting communities through food</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[500px] w-full rounded-3xl overflow-hidden bg-slate-50 flex items-center justify-center">
              <MissionMap />
            </div>
          </div>
        </div>
      </section>

      {/* Scrolling Ticker */}
      <ScrollingTicker />

      {/* Meet the Team Section */}
      <section className="py-24 px-6 bg-white border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">The Creators</p>
            <h2 className="text-4xl font-black text-foreground mb-4">Meet the Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Foodies, engineers, and dreamers building the future of street food.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                name: "Chaitanya Patil",
                role: "Chief Eating Officer",
                favFood: "Spicy Misal Pav",
                quote: "I code so I can eat more.",
                stats: { spiceLevel: 'Hot', reviews: 142, badge: "CEO" }
              },
              {
                name: "Abhilasha Thakur",
                role: "Head of Hidden Gems",
                favFood: "Pani Puri (Extra Tikha)",
                quote: "If it's not spicy, it's not food.",
                stats: { spiceLevel: 'Extreme', reviews: 89, badge: "EXPLORER" }
              },
              {
                name: "Abhay Jadhav",
                role: "Street Food Evangelist",
                favFood: "Paneer Tikka Roll",
                quote: "Spreading the gospel of flavor.",
                stats: { spiceLevel: 'Medium', reviews: 210, badge: "VETERAN" }
              },
              {
                name: "Abhijit Rede",
                role: "Digital Cartographer",
                favFood: "Vada Pav",
                quote: "Mapping the streets, one bite at a time.",
                stats: { spiceLevel: 'Low', reviews: 56, badge: "MAPPER" }
              }
            ].map((member, idx) => (
              // @ts-ignore
              <TeamCard key={idx} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-orange-50/50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">Core Values</p>
            <h2 className="text-4xl font-black text-foreground mb-4">The StreetBite Promise</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 p-8 rounded-3xl bg-primary/5 border border-primary/10 hover:shadow-lg transition-all flex flex-col justify-center">
              <div className="text-primary mb-4"><Lightbulb size={40} /></div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Innovation for All</h3>
              <p className="text-muted-foreground text-lg">Advanced tech shouldn't be a luxury. We bring enterprise-grade tools to the street corner.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-border/30 hover:shadow-lg transition-all">
              <div className="text-orange-500 mb-4"><Users size={32} /></div>
              <h3 className="text-xl font-bold text-foreground mb-2">Community First</h3>
              <p className="text-muted-foreground">Strengthening bonds between local vendors and food lovers.</p>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-border/30 hover:shadow-lg transition-all">
              <div className="text-green-600 mb-4"><Globe size={32} /></div>
              <h3 className="text-xl font-bold text-foreground mb-2">Authenticity</h3>
              <p className="text-muted-foreground">Real street food. No gourmet makeovers. Just pure flavor.</p>
            </div>

            <div className="md:col-span-2 p-8 rounded-3xl bg-slate-900 text-white border border-slate-800 hover:shadow-lg transition-all flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10"><Shield size={100} /></div>
              <div className="relative z-10">
                <div className="mb-4 text-primary"><Shield size={40} /></div>
                <h3 className="text-2xl font-bold mb-2">Trust & Transparency</h3>
                <p className="text-slate-300 text-lg">Real prices, real reviews, and verified locations. No hidden fees.</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-white border border-border/30 hover:shadow-lg transition-all">
              <div className="text-red-500 mb-4"><Heart size={32} /></div>
              <h3 className="text-xl font-bold text-foreground mb-2">Empowerment</h3>
              <p className="text-muted-foreground">Giving families the tools to grow their legacy.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MERGED CTA + IMPACT SECTION */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <ScrollingTicker />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary font-bold mb-6 border border-primary/20 animate-pulse">
              Join the Revolution
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Eat the Street?</span>
            </h2>
            <p className="text-xl mb-12 leading-relaxed max-w-2xl mx-auto text-slate-300">
              Don't just read about the food revolution. Be a part of it.
              Whether you're hungry for distinct flavors or hungry for success.
            </p>
          </div>

          {/* Integrated Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {[
              { number: 2000, suffix: '+', label: 'Street Vendors' },
              { number: 50000, suffix: '+', label: 'Food Lovers' },
              { number: 25, suffix: '+', label: 'Cities' },
              { number: 100000, suffix: '+', label: 'Meals Discovered' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all">
                <div className="text-3xl md:text-4xl font-black text-white mb-2">
                  <Counter value={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-slate-400 font-medium text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/explore">
              <Button size="lg" className="h-16 px-10 rounded-full text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_0_30px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] transition-all transform hover:-translate-y-1">
                Start Eating Now
              </Button>
            </Link>
            <Link href="/signup">
              <span className="text-lg font-bold text-white/50 hover:text-white transition-colors cursor-pointer border-b border-white/20 hover:border-white pb-1">
                Or Join as a Vendor
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* MINIMALIST CONTACT SECTION */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto bg-slate-50 rounded-[2.5rem] p-12 text-center border border-slate-100 shadow-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-foreground mb-4">Still got questions?</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              We're here to help. Whether you're a vendor looking to get listed or a foodie with a feature request.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-10">
            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                <MapPin size={24} />
              </div>
              <div>
                <p className="font-bold text-foreground">Headquarters</p>
                <p className="text-sm text-muted-foreground">Nashik, Maharashtra</p>
              </div>
            </div>

            <div className="w-px h-12 bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-3 text-left">
              <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-primary">
                <Mail size={24} />
              </div>
              <div>
                <p className="font-bold text-foreground">Email Us</p>
                <p className="text-sm text-muted-foreground">teamstreetbite@gmail.com</p>
              </div>
            </div>
          </div>

          <ContactDialog />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
