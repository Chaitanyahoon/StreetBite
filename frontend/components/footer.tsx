'use client'

import Link from 'next/link'
import { Instagram, Twitter, Linkedin, Mail, Phone, MapPin, Heart, ArrowRight, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'sonner'

export function Footer() {
    const [currentYear, setCurrentYear] = useState(2025)
    const [email, setEmail] = useState('')
    const [subscribing, setSubscribing] = useState(false)

    useEffect(() => {
        setCurrentYear(new Date().getFullYear())
    }, [])

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
        return emailRegex.test(email)
    }

    const handleSubscribe = async () => {
        const trimmedEmail = email.trim()

        // Validation
        if (!trimmedEmail) {
            toast.error('Please enter your email address')
            return
        }

        if (!validateEmail(trimmedEmail)) {
            toast.error('Please enter a valid email address')
            return
        }

        setSubscribing(true)

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api';
            const response = await axios.post(`${backendUrl}/newsletter/subscribe`, {
                email: trimmedEmail.toLowerCase()
            })

            if (response.data.success) {
                toast.success(response.data.message || 'Successfully subscribed!', {
                    description: 'Get ready for amazing food deals and updates!',
                    duration: 5000,
                })
                setEmail('') // Clear input
            } else {
                toast.info(response.data.message || 'Subscription status updated')
            }

        } catch (error: any) {
            console.error('Newsletter subscription error:', error)

            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error('Failed to subscribe. Please try again later.')
            }
        } finally {
            setSubscribing(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !subscribing) {
            handleSubscribe()
        }
    }

    return (
        <footer className="relative bg-white border-t-4 border-black overflow-hidden selection:bg-orange-500 selection:text-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                backgroundSize: '16px 16px'
            }}></div>

            <div className="max-w-screen-2xl px-4 md:px-6 mx-auto relative z-10">
                {/* Newsletter Section */}
                <div className="py-16 border-b-4 border-black">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-block px-4 py-2 bg-black text-white text-sm font-black uppercase tracking-widest mb-6 transform -rotate-2 shadow-[4px_4px_0px_0px_#fbbf24]">
                            Updates & Deals
                        </div>
                        <h3 className="text-4xl md:text-6xl font-black text-black mb-6 uppercase leading-[0.9] tracking-tighter">
                            Don't Miss a <span className="text-orange-500 inline-block transform rotate-1 decoration-4 underline decoration-black">Bite!</span>
                        </h3>
                        <p className="text-black font-bold mb-10 text-xl max-w-2xl mx-auto leading-relaxed">
                            Get the spiciest updates, secret menu drops, and exclusive vendor offers straight to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="ENTER YOUR EMAIL"
                                disabled={subscribing}
                                className="flex-1 px-6 py-4 rounded-xl border-4 border-black bg-white focus:outline-none focus:bg-yellow-50 transition-all text-black placeholder:text-gray-400 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                            <button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className="px-8 py-4 rounded-xl bg-black text-white font-black uppercase tracking-wider border-4 border-black shadow-[4px_4px_0px_0px_#fbbf24] hover:shadow-[6px_6px_0px_0px_#fbbf24] hover:-translate-y-1 transition-all hover:bg-orange-500 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {subscribing ? 'JOINING...' : 'JOIN CLUB'}
                                {!subscribing && <ArrowRight className="h-6 w-6 stroke-[3]" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 py-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <Link href="/" className="inline-block">
                                <h3 className="text-5xl font-black text-black tracking-tighter uppercase mb-2 leading-none hover:text-orange-500 transition-colors">
                                    Street<br />Bite.
                                </h3>
                            </Link>
                        </div>
                        <p className="text-black font-bold text-lg leading-relaxed max-w-sm border-l-4 border-black pl-4">
                            Your ultimate guide to the streets. Discover, eat, and support local vendors with style.
                        </p>

                        {/* Social Links */}
                        <div className="flex gap-4 pt-4">
                            {[
                                { Icon: Instagram, href: "https://instagram.com/streetbiteeats", color: "hover:bg-pink-500" },
                                { Icon: Twitter, href: "https://twitter.com/streetbiteeats", color: "hover:bg-sky-500" },
                                { Icon: Linkedin, href: "https://linkedin.com/company/streetbiteeats", color: "hover:bg-blue-600" }
                            ].map((social, idx) => (
                                <Link
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`w-12 h-12 bg-white border-3 border-black flex items-center justify-center text-black hover:text-white transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 ${social.color}`}
                                >
                                    <social.Icon className="w-6 h-6 stroke-[2.5]" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick Link Columns */}
                    {[
                        {
                            title: "Explore", links: [
                                { label: "Find Food", href: "/explore" },
                                { label: "Trending", href: "/explore?sort=trending" },
                                { label: "Categories", href: "/explore" },
                                { label: "Live Map", href: "/map" }
                            ]
                        },
                        {
                            title: "Company", links: [
                                { label: "About Us", href: "/about" },
                                { label: "Our Story", href: "/about" },
                                { label: "Careers", href: "/careers" },
                                { label: "Press", href: "/press" }
                            ]
                        },
                        {
                            title: "Support", links: [
                                { label: "Help Center", href: "/help" },
                                { label: "Partner with us", href: "/signup?type=vendor" },
                                { label: "Terms of Service", href: "/terms" },
                                { label: "Privacy Policy", href: "/privacy" }
                            ]
                        }
                    ].map((column, idx) => (
                        <div key={idx}>
                            <h4 className="font-black text-black text-xl uppercase tracking-wide mb-6 border-b-4 border-black inline-block pb-1">
                                {column.title}
                            </h4>
                            <ul className="space-y-4">
                                {column.links.map((link, linkIdx) => (
                                    <li key={linkIdx}>
                                        <Link href={link.href} className="text-gray-600 font-bold hover:text-black hover:underline decoration-4 decoration-yellow-400 underline-offset-4 transition-all flex items-center group">
                                            <ArrowRight className="w-4 h-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity stroke-[3]" />
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="border-t-4 border-black py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-black font-bold text-sm flex items-center gap-2">
                            © {currentYear} STREETBITE. MADE WITH <Heart className="w-4 h-4 fill-red-500 text-black stroke-[2]" /> IN INDIA.
                        </p>
                        <div className="flex gap-6 text-sm font-black uppercase">
                            <span className="bg-black text-white px-2 py-1">Eat Local</span>
                            <span className="bg-yellow-400 text-black px-2 py-1 border-2 border-black">Support Vendors</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}
