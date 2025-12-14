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
            const response = await axios.post('http://localhost:8081/api/newsletter/subscribe', {
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
        <footer className="relative bg-gradient-to-b from-amber-50/30 via-orange-50/50 to-white border-t border-orange-100 overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '0s' }} />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '2s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-amber-200/5 to-orange-200/5 rounded-full blur-3xl -z-20" />

            {/* Decorative top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="container px-4 md:px-6 mx-auto relative z-10">
                {/* Newsletter Section */}
                <div className="py-16 border-b border-orange-100">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 text-primary text-sm font-bold mb-6 animate-scale-in shadow-sm">
                            <Sparkles className="h-4 w-4" />
                            STAY UPDATED
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black text-foreground mb-4 leading-tight">
                            Never Miss a <span className="text-gradient-animate">Delicious Deal</span>
                        </h3>
                        <p className="text-muted-foreground mb-10 text-lg max-w-2xl mx-auto leading-relaxed">
                            Get the latest vendor updates, exclusive offers, and food recommendations delivered to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter your email"
                                disabled={subscribing}
                                className="flex-1 px-6 py-4 rounded-full border-2 border-orange-200 bg-white focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all text-foreground placeholder:text-muted-foreground shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                            />
                            <button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-orange-600 hover:from-primary/90 hover:to-orange-600/90 text-white font-bold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all hover-lift group flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-lg"
                            >
                                {subscribing ? 'Subscribing...' : 'Subscribe'}
                                <ArrowRight className={`h-5 w-5 transition-transform ${subscribing ? 'animate-pulse' : 'group-hover:translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 py-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div>
                            <h3 className="text-5xl font-black bg-gradient-to-r from-primary via-orange-500 to-orange-600 bg-clip-text text-transparent mb-2 leading-tight">
                                StreetBite
                            </h3>
                            <p className="text-base font-bold text-primary">Taste the Street</p>
                        </div>
                        <p className="text-muted-foreground leading-relaxed max-w-sm text-base">
                            Discover authentic street food from local vendors. Your ultimate companion for finding the best flavors in your city, connecting food lovers with amazing street food experiences.
                        </p>

                        {/* Social Links with Premium Styling */}
                        <div className="flex gap-3">
                            <Link
                                href="https://instagram.com/streetbiteeats"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Follow us on Instagram"
                                className="group relative w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-100 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 flex items-center justify-center text-pink-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/30 border border-pink-200 hover:border-transparent"
                            >
                                <Instagram className="w-6 h-6 relative z-10" />
                            </Link>
                            <Link
                                href="https://twitter.com/streetbiteeats"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Follow us on Twitter"
                                className="group relative w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100 hover:from-sky-400 hover:to-blue-600 flex items-center justify-center text-sky-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-sky-500/30 border border-sky-200 hover:border-sky-500"
                            >
                                <Twitter className="w-6 h-6 relative z-10" />
                            </Link>
                            <Link
                                href="https://linkedin.com/company/streetbiteeats"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Follow us on LinkedIn"
                                className="group relative w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-600 hover:to-blue-700 flex items-center justify-center text-blue-600 hover:text-white transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/30 border border-blue-200 hover:border-blue-600"
                            >
                                <Linkedin className="w-6 h-6 relative z-10" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-black text-foreground mb-6 text-lg flex items-center gap-2">
                            <span className="w-1.5 h-7 bg-gradient-to-b from-primary to-orange-600 rounded-full"></span>
                            Quick Links
                        </h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/explore" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group font-medium">
                                    <ArrowRight className="h-4 w-4 text-primary/60 group-hover:translate-x-1 transition-transform" />
                                    Explore Food
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group font-medium">
                                    <ArrowRight className="h-4 w-4 text-primary/60 group-hover:translate-x-1 transition-transform" />
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/signup?type=vendor" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group font-medium">
                                    <ArrowRight className="h-4 w-4 text-primary/60 group-hover:translate-x-1 transition-transform" />
                                    Become a Vendor
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group font-medium">
                                    <ArrowRight className="h-4 w-4 text-primary/60 group-hover:translate-x-1 transition-transform" />
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-black text-foreground mb-6 text-lg flex items-center gap-2">
                            <span className="w-1.5 h-7 bg-gradient-to-b from-primary to-orange-600 rounded-full"></span>
                            Legal
                        </h4>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group font-medium">
                                    <ArrowRight className="h-4 w-4 text-primary/60 group-hover:translate-x-1 transition-transform" />
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group font-medium">
                                    <ArrowRight className="h-4 w-4 text-primary/60 group-hover:translate-x-1 transition-transform" />
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group font-medium">
                                    <ArrowRight className="h-4 w-4 text-primary/60 group-hover:translate-x-1 transition-transform" />
                                    Cookie Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund" className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group font-medium">
                                    <ArrowRight className="h-4 w-4 text-primary/60 group-hover:translate-x-1 transition-transform" />
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-black text-foreground mb-6 text-lg flex items-center gap-2">
                            <span className="w-1.5 h-7 bg-gradient-to-b from-primary to-orange-600 rounded-full"></span>
                            Contact Us
                        </h4>
                        <ul className="space-y-5">
                            <li className="flex items-start gap-3 group">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground mb-1 text-sm">Address</p>
                                    <p className="text-muted-foreground text-sm leading-relaxed">StreetBite HQ<br />Nashik, Maharashtra</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                    <Phone className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground mb-1 text-sm">Phone</p>
                                    <a
                                        href="tel:+911234567890"
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                                    >
                                        +91 123 456 7890
                                    </a>
                                </div>
                            </li>
                            <li className="flex items-start gap-3 group">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground mb-1 text-sm">Email</p>
                                    <a
                                        href="mailto:teamstreetbite@gmail.com"
                                        className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
                                    >
                                        teamstreetbite@gmail.com
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-orange-100 py-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-muted-foreground text-sm flex items-center gap-2 font-medium">
                            © {currentYear} StreetBite. All rights reserved. Made with{' '}
                            <Heart className="w-4 h-4 fill-primary text-primary animate-pulse" /> for food lovers.
                        </p>
                        <div className="flex gap-6 text-sm text-muted-foreground font-medium">
                            <Link href="/sitemap" className="hover:text-primary transition-colors duration-200">
                                Sitemap
                            </Link>
                            <Link href="/accessibility" className="hover:text-primary transition-colors duration-200">
                                Accessibility
                            </Link>
                            <Link href="/help" className="hover:text-primary transition-colors duration-200">
                                Help Center
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Decorative bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-lg" />
        </footer>
    )
}
