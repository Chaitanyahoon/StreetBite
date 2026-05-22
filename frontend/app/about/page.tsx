'use client'

import { useRef } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Heart, Zap, Users, Globe, Lightbulb, Shield, ArrowRight, ArrowLeft, CheckCircle, MapPin, Mail } from 'lucide-react'
import Link from 'next/link'
import { Footer } from '@/components/footer'
import { MissionMap } from '@/components/mission-map'
import { ScrollingTicker } from '@/components/scrolling-ticker'
import { Counter } from '@/components/counter'
import { TeamCard } from '@/components/team-card'
import { ContactDialog } from '@/components/contact-dialog'
import { BreadcrumbListSchema } from '@/components/seo/breadcrumb-schema'

import { motion, Variants } from 'framer-motion'
import { TeamMember } from '@/components/team-card'

export default function AboutPage() {
  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  }

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  const teamMembers: TeamMember[] = [
    {
      name: "Chaitanya Patil",
      role: "Chief Eating Officer",
      image: "/team/abhijit.jpg",
      favFood: "Spicy Misal Pav",
      quote: "I code so I can eat more.",
      stats: { spiceLevel: 'Hot', reviews: 142, badge: "CEO" }
    },
    {
      name: "Abhilasha Thakur",
      role: "Head of Hidden Gems",
      image: "/team/abhilasha.jpg",
      favFood: "RasGulla (Extra Syrupy)",
      quote: "If it's not sweet, it's not food.",
      stats: { spiceLevel: 'Lowkey', reviews: 89, badge: "EXPLORER" }
    },
    {
      name: "Abhay Jadhav",
      role: "Street Food Evangelist",
      image: "/team/abhay.jpg",
      imageStyle: { transform: 'scale(1.6) translateY(15px)' },
      favFood: "Paneer Tikka Roll",
      quote: "Spreading the gospel of flavor.",
      stats: { spiceLevel: 'Medium', reviews: 210, badge: "VETERAN" }
    },
    {
      name: "Abhijit Rede",
      role: "Digital Cartographer",
      image: "/team/chaitanya.jpg",
      favFood: "Vada Pav",
      quote: "Mapping the streets, one bite at a time.",
      stats: { spiceLevel: 'Low', reviews: 56, badge: "MAPPER" }
    }
  ]

  return (
    <div className="min-h-screen bg-[#FFFBF0] bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px] overflow-x-hidden">
      <BreadcrumbListSchema items={[
        { name: 'Home', item: 'https://streetbitego.vercel.app' },
        { name: 'About', item: 'https://streetbitego.vercel.app/about' }
      ]} />
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-15%] w-[200px] h-[200px] sm:w-[320px] sm:h-[320px] bg-yellow-200/40 rounded-full mix-blend-multiply filter blur-[35px] sm:blur-[60px] opacity-60 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-15%] w-[200px] h-[200px] sm:w-[320px] sm:h-[320px] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-[35px] sm:blur-[60px] opacity-60 animate-blob animation-delay-2000"></div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative max-w-3xl mx-auto text-center z-10"
        >
          <div className="inline-block px-3 py-1 bg-black text-white font-black text-[10px] sm:text-xs uppercase tracking-widest mb-3 sm:mb-4 transform -rotate-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
            EST. 2025
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-black mb-3 sm:mb-4 leading-[0.9] tracking-tighter">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:drop-shadow-[3px_3px_0px_rgba(0,0,0,1)]">StreetBite</span><br /> Revolution
          </h1>
          <p className="text-xs sm:text-base text-black font-bold max-w-2xl mx-auto leading-relaxed border-l-3 sm:border-l-4 border-black pl-3 sm:pl-0 text-left md:text-center md:border-l-0">
            We're not just an app. We're a movement. Championing the culinary heroes who feed our cities, one plate at a time.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-6 sm:py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center"
          >
            <div className="bg-white p-4 sm:p-5 rounded-xl border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all">
              <div>
                <p className="text-black font-black text-[10px] sm:text-xs uppercase tracking-widest mb-2 bg-yellow-300 inline-block px-1.5 transform -rotate-1">Our Mission</p>
                <h2 className="text-lg sm:text-2xl font-black text-black mb-3 leading-tight">Democratizing Technology for Street Vendors</h2>
                <p className="text-xs sm:text-sm text-black/80 font-medium leading-relaxed mb-3">
                  In a world of digital-first giants, the humble street vendor was left behind. <strong className="bg-orange-200 px-1">We said "No more."</strong> We built StreetBite to give the best vada pav and roll stalls the same power as the big chains.
                </p>
              </div>
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 sm:gap-3 group">
                    <div className="w-6.5 h-6.5 sm:w-8 sm:h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <CheckCircle size={13} strokeWidth={3} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-black">Preserving culinary heritage</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 group">
                    <div className="w-6.5 h-6.5 sm:w-8 sm:h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <CheckCircle size={13} strokeWidth={3} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-black">Empowering micro-entrepreneurs</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 group">
                    <div className="w-6.5 h-6.5 sm:w-8 sm:h-8 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <CheckCircle size={13} strokeWidth={3} />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-black">Connecting communities through food</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[200px] sm:h-[260px] lg:h-[320px] w-full rounded-xl overflow-hidden border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white">
              <MissionMap />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scrolling Ticker */}
      <div className="overflow-hidden py-1.5 sm:py-2">
        <div className="border-y-2 sm:border-y-3 border-black bg-yellow-300 py-1.5 sm:py-2 transform -rotate-1 scale-105">
          <ScrollingTicker />
        </div>
      </div>

      {/* Meet the Team Section */}
      <section className="py-6 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-4 sm:mb-5"
          >
            <p className="text-black font-black text-[9px] sm:text-[10px] uppercase tracking-widest mb-1.5 inline-block bg-white px-2 py-0.5 border-1.5 border-black rounded-full shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">The Creators</p>
            <h2 className="text-xl sm:text-2xl font-black text-black mb-1.5">MEET THE SQUAD</h2>
            <p className="text-[11px] sm:text-xs font-bold text-black/70 max-w-xl mx-auto">
              Foodies, coders, and dreamers building the future of street food.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:overflow-x-visible md:pb-0 scrollbar-none scroll-smooth"
          >
            {teamMembers.map((member, idx) => (
              <motion.div 
                variants={fadeInUp} 
                key={idx} 
                className="hover:-translate-y-0.5 transition-transform duration-300 snap-start shrink-0 w-[265px] sm:w-[280px] md:w-auto"
              >
                <TeamCard member={member} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-6 sm:py-10 px-4 bg-white border-y-2 sm:border-y-3 border-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-4 sm:mb-5"
          >
            <p className="text-black font-black text-[9px] sm:text-[10px] uppercase tracking-widest mb-1.5 bg-yellow-300 inline-block px-1.5 py-0.5 border-1.5 border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">Core Values</p>
            <h2 className="text-xl sm:text-2xl font-black text-black">THE STREETBITE PROMISE</h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4"
          >
            <motion.div variants={fadeInUp} className="md:col-span-2 p-3.5 sm:p-4 rounded-xl bg-orange-100 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all flex flex-col justify-center group">
              <div className="text-black mb-1.5"><Lightbulb size={22} strokeWidth={2.5} className="group-hover:text-orange-500 transition-colors sm:w-[28px] sm:h-[28px]" /></div>
              <h3 className="text-base sm:text-lg font-black text-black mb-0.5 leading-tight">Innovation for All</h3>
              <p className="text-black/80 text-[11px] sm:text-xs font-bold leading-relaxed">Advanced tech shouldn't be a luxury. We bring enterprise-grade tools to the street corner.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-3.5 sm:p-4 rounded-xl bg-pink-100 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all flex flex-col justify-center">
              <div className="text-black mb-1.5"><Users size={20} strokeWidth={2.5} className="sm:w-[24px] sm:h-[24px]" /></div>
              <h3 className="text-sm sm:text-base font-black text-black mb-0.5 leading-tight">Community First</h3>
              <p className="text-black/80 text-[11px] sm:text-xs font-medium leading-normal">Strengthening bonds between local vendors and food lovers.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-3.5 sm:p-4 rounded-xl bg-blue-100 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all flex flex-col justify-center">
              <div className="text-black mb-1.5"><Globe size={20} strokeWidth={2.5} className="sm:w-[24px] sm:h-[24px]" /></div>
              <h3 className="text-sm sm:text-base font-black text-black mb-0.5 leading-tight">Authenticity</h3>
              <p className="text-black/80 text-[11px] sm:text-xs font-medium leading-normal">Real street food. No gourmet makeovers. Just pure flavor.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="md:col-span-2 p-3.5 sm:p-4 rounded-xl bg-black text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(100,100,100,1)] sm:shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] hover:-translate-y-0.5 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 sm:p-4 opacity-20"><Shield size={44} className="sm:w-[60px] sm:h-[60px]" /></div>
              <div className="relative z-10">
                <div className="mb-1.5 text-yellow-400"><Shield size={22} strokeWidth={2.5} className="sm:w-[28px] sm:h-[28px]" /></div>
                <h3 className="text-base sm:text-lg font-black mb-0.5 leading-tight">Trust & Transparency</h3>
                <p className="text-gray-300 text-[11px] sm:text-xs font-bold leading-relaxed">Real prices, real reviews, and verified locations. No hidden fees.</p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="md:col-span-3 p-3.5 sm:p-4 rounded-xl bg-green-100 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all flex flex-col sm:flex-row items-center gap-2.5 sm:gap-4 text-center sm:text-left">
              <div className="text-black p-2 bg-white rounded-full border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <Heart size={20} strokeWidth={2.5} className="fill-current text-green-500 sm:w-[24px] sm:h-[24px]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-black mb-0.5 leading-tight">Empowerment</h3>
                <p className="text-black/80 font-bold text-[11px] sm:text-xs leading-relaxed">Giving families the tools, data, and platform to grow their legacy and reach new customers.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MERGED CTA + IMPACT SECTION */}
      <section className="py-6 sm:py-10 px-4 bg-black text-white overflow-hidden relative border-t-2 sm:border-t-3 border-black">
        <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="text-center mb-4 sm:mb-5">
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-yellow-400 border-2 border-yellow-400/50 font-bold mb-2 sm:mb-3 animate-pulse text-[9px]">
              JOIN THE REVOLUTION
            </div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black mb-2 sm:mb-3 leading-[0.9] tracking-tighter">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Eat the Street?</span>
            </h2>
            <p className="text-[11px] sm:text-xs mb-3 font-bold text-gray-400 max-w-xl mx-auto">
              Don't just read about the food revolution. Be a part of it.
            </p>
          </div>

          {/* Integrated Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-5">
            {[
              { number: 2000, suffix: '+', label: 'Street Vendors' },
              { number: 50000, suffix: '+', label: 'Food Lovers' },
              { number: 25, suffix: '+', label: 'Cities' },
              { number: 100000, suffix: '+', label: 'Meals Discovered' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all hover:-translate-y-0.5">
                <div className="text-lg sm:text-xl md:text-2xl font-black text-yellow-400 mb-0.5">
                  <Counter value={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-gray-300 font-bold uppercase tracking-wider text-[8px] sm:text-[9px]">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center">
            <Link href="/explore">
              <Button size="lg" className="h-9 sm:h-11 px-4 sm:px-6 rounded-full text-xs sm:text-sm font-black bg-orange-500 text-white border-2 border-white hover:bg-orange-600 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:-translate-y-0.5 transition-all">
                Start Eating Now
              </Button>
            </Link>
            <Link href="/signup">
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 hover:text-white transition-colors cursor-pointer border-b-2 border-gray-500 hover:border-white pb-0.5">
                Or Join as a Vendor
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* MINIMALIST CONTACT SECTION */}
      <section className="py-6 sm:py-10 px-4 bg-[#FADFA1]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl mx-auto bg-white rounded-2xl p-4 sm:p-6 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center"
        >
          <div className="mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-black text-black mb-1.5 uppercase">Still got questions?</h2>
            <p className="text-[11px] sm:text-xs text-black/70 font-bold max-w-sm mx-auto">
              We're here to help. Whether you're a vendor looking to get listed or a foodie with a feature request.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <div className="flex items-center gap-2 text-left group">
              <div className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full bg-black text-white flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-0.5 transition-transform shrink-0 border border-black">
                <MapPin size={13} className="sm:w-[16px] sm:h-[16px]" />
              </div>
              <div>
                <p className="font-black text-black text-xs sm:text-sm uppercase leading-tight">Headquarters</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-500">Nashik, Maharashtra</p>
              </div>
            </div>

            <div className="w-px h-6 bg-black hidden sm:block opacity-20"></div>

            <div className="flex items-center gap-2 text-left group">
              <div className="w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full bg-black text-white flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] group-hover:-translate-y-0.5 transition-transform shrink-0 border border-black">
                <Mail size={13} className="sm:w-[16px] sm:h-[16px]" />
              </div>
              <div>
                <p className="font-black text-black text-xs sm:text-sm uppercase leading-tight">Email Us</p>
                <p className="text-[9px] sm:text-[10px] font-bold text-gray-500">teamstreetbite@gmail.com</p>
              </div>
            </div>
          </div>

          <ContactDialog />
          <div className="mt-4 text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Always listening • Always hungry
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
