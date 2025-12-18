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
      favFood: "Pani Puri (Extra Tikha)",
      quote: "If it's not spicy, it's not food.",
      stats: { spiceLevel: 'Extreme', reviews: 89, badge: "EXPLORER" }
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
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000"></div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative max-w-5xl mx-auto text-center z-10"
        >
          <div className="inline-block px-6 py-2 bg-black text-white font-black text-sm uppercase tracking-widest mb-6 transform -rotate-2 rounded-lg shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            EST. 2025
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-black mb-8 leading-[0.9] tracking-tighter">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">StreetBite</span><br /> Revolution
          </h1>
          <p className="text-2xl text-black font-bold max-w-3xl mx-auto leading-relaxed border-l-8 border-black pl-6 text-left md:text-center md:border-l-0 md:pl-0">
            We're not just an app. We're a movement. Championing the culinary heroes who feed our cities, one plate at a time.
          </p>
        </motion.div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="bg-white p-8 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
              <div>
                <p className="text-black font-black text-lg uppercase tracking-widest mb-4 bg-yellow-300 inline-block px-2 transform -rotate-1">Our Mission</p>
                <h2 className="text-4xl font-black text-black mb-6 leading-tight">Democratizing Technology for Street Vendors</h2>
                <p className="text-lg text-black/80 font-medium leading-relaxed mb-6">
                  In a world of digital-first giants, the humble street vendor was left behind. <strong className="bg-orange-200 px-1">We said "No more."</strong> We built StreetBite to give the best vada pav and roll stalls the same power as the big chains.
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle size={20} strokeWidth={3} />
                    </div>
                    <span className="text-lg font-bold text-black">Preserving culinary heritage</span>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle size={20} strokeWidth={3} />
                    </div>
                    <span className="text-lg font-bold text-black">Empowering micro-entrepreneurs</span>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle size={20} strokeWidth={3} />
                    </div>
                    <span className="text-lg font-bold text-black">Connecting communities through food</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[500px] w-full rounded-[2rem] overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
              <MissionMap />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scrolling Ticker */}
      <div className="overflow-hidden py-4">
        <div className="border-y-4 border-black bg-yellow-300 py-4 transform -rotate-1 scale-105">
          <ScrollingTicker />
        </div>
      </div>

      {/* Meet the Team Section */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <p className="text-black font-black text-sm uppercase tracking-widest mb-4 inline-block bg-white px-4 py-1 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">The Creators</p>
            <h2 className="text-5xl font-black text-black mb-4">MEET THE SQUAD</h2>
            <p className="text-xl text-black/70 font-bold max-w-2xl mx-auto">
              Foodies, coders, and dreamers building the future of street food.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {teamMembers.map((member, idx) => (
              <motion.div variants={fadeInUp} key={idx} className="hover:-translate-y-2 transition-transform duration-300">
                <TeamCard member={member} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 px-4 bg-white border-y-4 border-black">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <p className="text-black font-black text-sm uppercase tracking-widest mb-4 bg-yellow-300 inline-block px-3 py-1 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">Core Values</p>
            <h2 className="text-5xl font-black text-black">THE STREETBITE PROMISE</h2>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <motion.div variants={fadeInUp} className="md:col-span-2 p-8 rounded-[2rem] bg-orange-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col justify-center group">
              <div className="text-black mb-4"><Lightbulb size={48} strokeWidth={2.5} className="group-hover:text-orange-500 transition-colors" /></div>
              <h3 className="text-3xl font-black text-black mb-3">Innovation for All</h3>
              <p className="text-black/80 text-xl font-bold">Advanced tech shouldn't be a luxury. We bring enterprise-grade tools to the street corner.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-8 rounded-[2rem] bg-pink-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="text-black mb-4"><Users size={40} strokeWidth={2.5} /></div>
              <h3 className="text-2xl font-black text-black mb-2">Community First</h3>
              <p className="text-black/80 font-medium">Strengthening bonds between local vendors and food lovers.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="p-8 rounded-[2rem] bg-blue-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="text-black mb-4"><Globe size={40} strokeWidth={2.5} /></div>
              <h3 className="text-2xl font-black text-black mb-2">Authenticity</h3>
              <p className="text-black/80 font-medium">Real street food. No gourmet makeovers. Just pure flavor.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="md:col-span-2 p-8 rounded-[2rem] bg-black text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(100,100,100,1)] hover:shadow-[10px_10px_0px_0px_rgba(100,100,100,1)] transition-all flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-20"><Shield size={120} /></div>
              <div className="relative z-10">
                <div className="mb-4 text-yellow-400"><Shield size={48} strokeWidth={2.5} /></div>
                <h3 className="text-3xl font-black mb-3">Trust & Transparency</h3>
                <p className="text-gray-300 text-xl font-bold">Real prices, real reviews, and verified locations. No hidden fees.</p>
              </div>
            </motion.div>

            <motion.div variants={fadeInUp} className="md:col-span-3 p-8 rounded-[2rem] bg-green-100 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="text-black p-4 bg-white rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                <Heart size={40} strokeWidth={2.5} className="fill-current text-green-500" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-black mb-2">Empowerment</h3>
                <p className="text-black/80 font-bold text-lg">Giving families the tools, data, and platform to grow their legacy and reach new customers.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MERGED CTA + IMPACT SECTION */}
      <section className="py-24 px-4 bg-black text-white overflow-hidden relative border-t-4 border-black">
        <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:20px_20px] opacity-30"></div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-7xl mx-auto relative z-10"
        >
          <div className="text-center mb-16">
            <div className="inline-block px-6 py-2 rounded-full bg-white/10 text-yellow-400 border-2 border-yellow-400/50 font-bold mb-8 animate-pulse">
              JOIN THE REVOLUTION
            </div>
            <h2 className="text-5xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Eat the Street?</span>
            </h2>
            <p className="text-2xl mb-12 font-bold text-gray-400 max-w-2xl mx-auto">
              Don't just read about the food revolution. Be a part of it.
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
              <div key={idx} className="text-center p-6 rounded-2xl bg-white/5 border-2 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all hover:-translate-y-1">
                <div className="text-4xl md:text-5xl font-black text-yellow-400 mb-2">
                  <Counter value={stat.number} suffix={stat.suffix} />
                </div>
                <p className="text-gray-300 font-bold uppercase tracking-wider text-sm">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/explore">
              <Button size="lg" className="h-20 px-12 rounded-full text-2xl font-black bg-orange-500 text-white border-4 border-white hover:bg-orange-600 shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.6)] transition-all transform hover:-translate-y-2 hover:scale-105">
                Start Eating Now
              </Button>
            </Link>
            <Link href="/signup">
              <span className="text-xl font-bold text-gray-500 hover:text-white transition-colors cursor-pointer border-b-2 border-gray-500 hover:border-white pb-1">
                Or Join as a Vendor
              </span>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* MINIMALIST CONTACT SECTION */}
      <section className="py-24 px-4 bg-[#FADFA1]">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="max-w-5xl mx-auto bg-white rounded-[2.5rem] p-12 text-center border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="mb-10">
            <h2 className="text-4xl font-black text-black mb-4 uppercase">Still got questions?</h2>
            <p className="text-xl text-black/70 font-bold max-w-xl mx-auto">
              We're here to help. Whether you're a vendor looking to get listed or a foodie with a feature request.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10 mb-12">
            <div className="flex items-center gap-4 text-left group">
              <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] group-hover:-translate-y-1 transition-transform">
                <MapPin size={28} />
              </div>
              <div>
                <p className="font-black text-black text-xl uppercase">Headquarters</p>
                <p className="text-lg font-bold text-gray-500">Nashik, Maharashtra</p>
              </div>
            </div>

            <div className="w-px h-16 bg-black hidden md:block opacity-20"></div>

            <div className="flex items-center gap-4 text-left group">
              <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] group-hover:-translate-y-1 transition-transform">
                <Mail size={28} />
              </div>
              <div>
                <p className="font-black text-black text-xl uppercase">Email Us</p>
                <p className="text-lg font-bold text-gray-500">teamstreetbite@gmail.com</p>
              </div>
            </div>
          </div>

          <ContactDialog />
          <div className="mt-8 text-sm font-bold text-gray-400 uppercase tracking-widest">
            Always listening • Always hungry
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
