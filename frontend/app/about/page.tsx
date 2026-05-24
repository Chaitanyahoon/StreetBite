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
      <section className="relative py-10 xs:py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-yellow-200/40 rounded-full mix-blend-multiply filter blur-[50px] sm:blur-[80px] opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-[50px] sm:blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative max-w-5xl mx-auto text-center z-10"
        >
          <div className="inline-block px-4 py-1.5 sm:px-6 sm:py-2 bg-black text-white font-black text-xs sm:text-sm uppercase tracking-widest mb-4 sm:mb-6 transform -rotate-2 rounded-lg shadow-[2.5px_2.5px_0px_0px_rgba(255,255,255,1)] sm:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            EST. 2025
          </div>
          <h1 className="text-[2.25rem] xs:text-[2.75rem] sm:text-5xl md:text-8xl font-black text-black mb-4 sm:mb-6 leading-[1.05] md:leading-[0.9] tracking-tighter">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] sm:drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">StreetBite</span><br /> Revolution
          </h1>
          <p className="text-sm sm:text-lg md:text-2xl text-black font-bold max-w-3xl mx-auto leading-relaxed border-l-4 sm:border-l-0 border-black pl-4 sm:pl-0 text-left md:text-center">
            We're not just an app. We're a movement. Championing the culinary heroes who feed our cities, one plate at a time.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-10 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 items-center"
          >
            <div className="bg-white p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-[3px] sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
              <div>
                <p className="text-black font-black text-xs sm:text-lg uppercase tracking-widest mb-3 sm:mb-4 bg-yellow-300 inline-block px-2 transform -rotate-1">Our Mission</p>
                <h2 className="text-xl xs:text-2xl sm:text-4xl font-black text-black mb-4 sm:mb-6 leading-tight">Democratizing Technology for Street Vendors</h2>
                <p className="text-sm sm:text-lg text-black/80 font-medium leading-relaxed mb-4 sm:mb-6">
                  In a world of digital-first giants, the humble street vendor was left behind. <strong className="bg-orange-200 px-1">We said "No more."</strong> We built StreetBite to give the best vada pav and roll stalls the same power as the big chains.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                    </div>
                    <span className="text-sm sm:text-lg font-bold text-black">Preserving culinary heritage</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                    </div>
                    <span className="text-sm sm:text-lg font-bold text-black">Empowering micro-entrepreneurs</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                    </div>
                    <span className="text-sm sm:text-lg font-bold text-black">Connecting communities through food</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[260px] sm:h-[400px] md:h-[500px] w-full rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden border-[3px] sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <MissionMap />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scrolling Ticker */}
      <div className="overflow-hidden py-3 sm:py-4">
        <div className="border-y-[3px] sm:border-y-4 border-black bg-yellow-300 py-3 sm:py-4 transform -rotate-1 scale-105">
          <ScrollingTicker />
        </div>
      </div>

      {/* Meet the Team Section */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-10 sm:mb-16"
          >
            <p className="text-black font-black text-xs sm:text-sm uppercase tracking-widest mb-3 sm:mb-4 inline-block bg-white px-3.5 py-1 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">The Creators</p>
            <h2 className="text-2xl xs:text-3xl sm:text-5xl font-black text-black mb-3 sm:mb-4">MEET THE SQUAD</h2>
            <p className="text-sm xs:text-base sm:text-xl text-black/70 font-bold max-w-2xl mx-auto">
              Foodies, coders, and dreamers building the future of street food.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="flex md:grid overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar gap-5 pb-6 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 md:grid-cols-2 lg:grid-cols-4"
          >
            {teamMembers.map((member, idx) => (
              <motion.div
                variants={fadeInUp}
                key={idx}
                className="shrink-0 w-[280px] xs:w-[320px] sm:w-[340px] md:w-auto snap-center hover:-translate-y-2 transition-transform duration-300"
              >
                <TeamCard member={member} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-10 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white border-y-[3px] sm:border-y-4 border-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-6 sm:mb-16"
          >
            <p className="text-black font-black text-xs sm:text-sm uppercase tracking-widest mb-2.5 sm:mb-4 bg-yellow-300 inline-block px-3 py-1 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Core Values</p>
            <h2 className="text-2xl xs:text-3xl sm:text-5xl font-black text-black">THE STREETBITE PROMISE</h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8"
          >
            <motion.div variants={fadeInUp} className="md:col-span-2 p-4 sm:p-8 rounded-xl sm:rounded-[2rem] bg-orange-100 border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-center group max-w-[380px] md:max-w-none w-full mx-auto">
              <div className="text-black mb-2 sm:mb-4"><Lightbulb strokeWidth={2.5} className="w-8 h-8 sm:w-12 sm:h-12 group-hover:text-orange-500 transition-colors" /></div>
              <h3 className="text-lg sm:text-3xl font-black text-black mb-1 sm:mb-3">Innovation for All</h3>
              <p className="text-black/80 text-xs sm:text-xl font-bold leading-snug sm:leading-normal">Tech shouldn't be a luxury. We bring enterprise tools to the street corner.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-4 sm:p-8 rounded-xl sm:rounded-[2rem] bg-pink-100 border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all max-w-[380px] md:max-w-none w-full mx-auto">
              <div className="text-black mb-2 sm:mb-4"><Users strokeWidth={2.5} className="w-6 h-6 sm:w-10 sm:h-10" /></div>
              <h3 className="text-lg sm:text-2xl font-black text-black mb-1">Community First</h3>
              <p className="text-black/80 text-xs sm:text-base font-bold leading-snug sm:leading-normal">Strengthening bonds between local vendors and food lovers.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-4 sm:p-8 rounded-xl sm:rounded-[2rem] bg-blue-100 border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all max-w-[380px] md:max-w-none w-full mx-auto">
              <div className="text-black mb-2 sm:mb-4"><Globe strokeWidth={2.5} className="w-6 h-6 sm:w-10 sm:h-10" /></div>
              <h3 className="text-lg sm:text-2xl font-black text-black mb-1">Authenticity</h3>
              <p className="text-black/80 text-xs sm:text-base font-bold leading-snug sm:leading-normal">Real street food. No gourmet makeovers. Just pure flavor.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="md:col-span-2 p-4 sm:p-8 rounded-xl sm:rounded-[2rem] bg-black text-white border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(100,100,100,1)] sm:shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] hover:shadow-[10px_10px_0px_0px_rgba(100,100,100,1)] transition-all flex flex-col justify-center relative overflow-hidden max-w-[380px] md:max-w-none w-full mx-auto">
              <div className="absolute top-0 right-0 p-4 sm:p-10 opacity-20"><Shield className="w-[50px] h-[50px] sm:w-[120px] sm:h-[120px]" /></div>
              <div className="relative z-10">
                <div className="mb-2 sm:mb-4 text-yellow-400"><Shield strokeWidth={2.5} className="w-8 h-8 sm:w-12 sm:h-12" /></div>
                <h3 className="text-lg sm:text-3xl font-black mb-1 sm:mb-3">Trust & Transparency</h3>
                <p className="text-gray-300 text-xs sm:text-xl font-bold leading-snug sm:leading-normal">Real prices, real reviews, and verified locations. Zero hidden fees.</p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="md:col-span-3 p-4 sm:p-8 rounded-xl sm:rounded-[2rem] bg-green-100 border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col md:flex-row items-center gap-4 sm:gap-6 text-center md:text-left max-w-[380px] md:max-w-none w-full mx-auto">
              <div className="text-black p-2 bg-white rounded-full border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <Heart strokeWidth={2.5} className="w-6 h-6 sm:w-10 sm:h-10 fill-current text-green-500" />
              </div>
              <div>
                <h3 className="text-lg sm:text-3xl font-black text-black mb-1">Empowerment</h3>
                <p className="text-black/80 text-xs sm:text-lg font-bold leading-snug sm:leading-normal">Giving vendor families the tools to grow their legacy and reach new foodies.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MERGED CTA + IMPACT SECTION */}
      <section className="py-8 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-black text-white overflow-hidden relative border-t-[3px] sm:border-t-4 border-black">
        <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="text-center mb-6 sm:mb-16">
            <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-yellow-400 border border-yellow-400/30 text-[10px] sm:text-sm font-bold mb-3 sm:mb-8 animate-pulse">
              JOIN THE REVOLUTION
            </div>
            <h2 className="text-2xl xs:text-4xl sm:text-5xl md:text-7xl font-black mb-3 sm:mb-8 leading-[0.9] tracking-tighter">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Eat the Street?</span>
            </h2>
            <p className="text-xs sm:text-base md:text-xl mb-4 sm:mb-12 font-bold text-gray-400 max-w-2xl mx-auto">
              Don't just read about the food revolution. Be a part of it.
            </p>
          </div>

          {/* Integrated Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-6 mb-6 sm:mb-16">
            {[
              { number: 2000, suffix: '+', label: 'Street Vendors' },
              { number: 50000, suffix: '+', label: 'Food Lovers' },
              { number: 25, suffix: '+', label: 'Cities' },
              { number: 100000, suffix: '+', label: 'Meals Discovered' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center p-2.5 sm:p-6 rounded-lg sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all hover:-translate-y-0.5">
                <div className="text-base sm:text-3xl md:text-5xl font-black text-yellow-400 mb-0.5 sm:mb-2">
                  <Counter value={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-gray-300 font-bold uppercase tracking-wider text-[8px] sm:text-[10px] md:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/explore" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-11 sm:h-16 md:h-20 px-5 sm:px-10 rounded-full text-xs sm:text-lg md:text-2xl font-black bg-orange-500 text-white border-2 border-white hover:bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.3)] sm:shadow-[0_0_40px_rgba(249,115,22,0.4)] transition-all transform hover:-translate-y-1 active:translate-y-0">
                Start Eating Now
              </Button>
            </Link>
            <Link href="/signup">
              <span className="text-[11px] sm:text-sm md:text-xl font-bold text-gray-500 hover:text-white transition-colors cursor-pointer border-b border-gray-500 hover:border-white pb-0.5">
                Or Join as a Vendor
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* MINIMALIST CONTACT SECTION */}
      <section className="py-6 sm:py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#FADFA1]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-4xl md:max-w-5xl mx-auto bg-white rounded-xl md:rounded-[2.5rem] p-4 sm:p-8 md:p-12 text-center border-2 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="mb-4 sm:mb-10">
            <h2 className="text-lg xs:text-2xl md:text-4xl font-black text-black mb-1 sm:mb-4 uppercase">Still got questions?</h2>
            <p className="text-xs sm:text-base md:text-xl text-black/70 font-bold max-w-sm md:max-w-xl mx-auto">
              We're here to help. Whether you want to list your stall or share a feature request.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-10 mb-6 sm:mb-12">
            <div className="flex items-center gap-3 text-left group">
              <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-black text-white flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_rgba(200,200,200,1)] sm:shadow-[3px_3px_0px_0px_rgba(200,200,200,1)] border border-black transition-transform group-hover:-translate-y-0.5">
                <MapPin size={16} className="w-4 h-4 sm:w-6 sm:h-6 md:w-[28px] md:h-[28px]" />
              </div>
              <div>
                <p className="font-black text-black text-xs sm:text-lg md:text-xl uppercase leading-tight">Headquarters</p>
                <p className="text-[10px] sm:text-base md:text-lg font-bold text-gray-500">Nashik, Maharashtra</p>
              </div>
            </div>

            <div className="w-px h-8 bg-black hidden md:block opacity-20"></div>

            <div className="flex items-center gap-3 text-left group">
              <div className="w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-black text-white flex items-center justify-center shadow-[1.5px_1.5px_0px_0px_rgba(200,200,200,1)] sm:shadow-[3px_3px_0px_0px_rgba(200,200,200,1)] border border-black transition-transform group-hover:-translate-y-0.5">
                <Mail size={16} className="w-4 h-4 sm:w-6 sm:h-6 md:w-[28px] md:h-[28px]" />
              </div>
              <div>
                <p className="font-black text-black text-xs sm:text-lg md:text-xl uppercase leading-tight">Email Us</p>
                <p className="text-[10px] sm:text-base md:text-lg font-bold text-gray-500">teamstreetbite@gmail.com</p>
              </div>
            </div>
          </div>

          <ContactDialog />
          <div className="mt-3 sm:mt-8 text-[10px] sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
            Always listening • Always hungry
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
