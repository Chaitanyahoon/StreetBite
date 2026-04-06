'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'
import { useAuth } from '@/context/AuthContext'

interface Announcement {
  message: string
  type?: 'WARNING' | 'ALERT' | 'INFO'
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoggedIn, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api'

  const userName = user?.displayName || user?.email || 'User'
  const userProfilePic = user?.profilePicture || ''
  const userRole = user?.role || ''

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { announcementApi } = await import('@/lib/api')
        const data = await announcementApi.getActive()
        if (Array.isArray(data) && data.length > 0) {
          setAnnouncement(data[0])
        }
      } catch (error) {
        console.error('Error fetching announcements:', error)
      }
    }
    fetchAnnouncement()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const customerNavItems = [
    { label: 'Explore', href: '/explore' },
    { label: 'Offers', href: '/offers' },
    { label: 'About', href: '/about' },
    { label: 'Community', href: '/community' },
  ]

  const vendorNavItems = [
    { label: 'Dashboard', href: '/vendor' },
    { label: 'Menu', href: '/vendor/menu' },
    { label: 'Analytics', href: '/vendor/analytics' },
    { label: 'Promotions', href: '/vendor/promotions' },
  ]

  const navItems = userRole === 'VENDOR' ? vendorNavItems : customerNavItems

  // Helper to resolve image URL
  const getImageUrl = (path: string) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    if (path.startsWith('/avatars/')) return path
    const baseUrl = BACKEND_URL.replace(/\/api\/?$/, '')
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`
  }

  return (
    <>
      {announcement && (
        <div className={`w-full py-3 px-4 text-center text-sm font-black uppercase tracking-wider border-b-4 border-black ${announcement.type === 'WARNING' ? 'bg-red-500 text-white' :
          announcement.type === 'ALERT' ? 'bg-yellow-400 text-black' :
            'bg-black text-white'
          }`}>
          {announcement.message}
        </div>
      )}
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white border-b-4 border-black shadow-[0px_4px_0px_0px_rgba(0,0,0,0.1)]'
        : (pathname === '/' ? 'bg-transparent border-b-transparent' : 'bg-white border-b-4 border-black')
        } ${announcement ? '' : ''}`}>
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-100 transition-opacity flex-shrink-0 group">
              <div className="transform group-hover:scale-105 transition-transform group-hover:rotate-2">
                <Logo />
              </div>
            </Link>

            {/* Center: Navigation Menu */}
            <div className="hidden lg:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-6 py-2 font-black text-sm uppercase tracking-wider rounded-lg border-2 transition-all duration-200 transform hover:-translate-y-1 ${isActive
                      ? 'bg-yellow-400 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-transparent text-black border-transparent hover:bg-orange-50 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                      }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Right: Auth Buttons */}
            <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
              {isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile">
                    <button className="flex items-center gap-3 px-2 py-1 rounded-xl hover:bg-orange-50 transition-all duration-200 group">
                      <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white font-black text-sm border-2 border-black group-hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow overflow-hidden">
                        {userProfilePic ? (
                          <img
                            src={getImageUrl(userProfilePic)}
                            alt={userName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).parentElement!.innerText = userName.charAt(0).toUpperCase();
                            }}
                          />
                        ) : (
                          userName.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span className="text-sm font-black text-black uppercase tracking-wide hidden xl:block">{userName}</span>
                    </button>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-black hover:bg-red-500 hover:text-white text-black transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                  >
                    <LogOut size={18} className="stroke-[3px]" />
                  </button>
                </div>
              ) : (
                <>
                  <Link href="/signin">
                    <Button variant="outline" className="font-black uppercase border-2 border-black bg-white text-black hover:bg-black hover:text-white hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="font-black uppercase border-2 border-black bg-orange-500 text-white hover:bg-orange-600 hover:translate-y-[-2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:bg-yellow-400 active:translate-y-[2px] active:shadow-none lg:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              aria-expanded={isOpen}
              aria-controls="mobile-navigation"
            >
              {isOpen ? <X size={24} className="text-black stroke-[3px]" /> : <Menu size={24} className="text-black stroke-[3px]" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isOpen && (
            <div className="absolute inset-x-0 top-full z-40 border-y-4 border-black bg-white/95 shadow-2xl backdrop-blur lg:hidden">
              <div
                id="mobile-navigation"
                className="max-h-[calc(100vh-5rem)] space-y-4 overflow-y-auto px-4 py-4 pb-[max(env(safe-area-inset-bottom),1rem)]"
              >
                <div className="grid gap-3">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block rounded-2xl border-2 px-5 py-4 text-base font-black uppercase tracking-[0.14em] transition-all duration-200 ${isActive
                          ? 'border-black bg-yellow-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'border-black/15 bg-[#fff8ef] text-black hover:border-black hover:bg-orange-50'
                          }`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
                <div className="space-y-4 border-t-4 border-black pt-4">
                  {isLoggedIn ? (
                    <>
                      <Link href="/profile">
                        <button className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-black bg-black px-4 py-4 font-black text-white shadow-[4px_4px_0px_0px_#9ca3af] transition-all active:translate-y-[2px]">
                          <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white text-sm font-black text-black">
                            {userProfilePic ? (
                              <img
                                src={getImageUrl(userProfilePic)}
                                alt={userName}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none'
                                  const parent = (e.target as HTMLImageElement).parentElement
                                  if (parent) {
                                    parent.innerText = userName.charAt(0).toUpperCase()
                                  }
                                }}
                              />
                            ) : (
                              userName.charAt(0).toUpperCase()
                            )}
                          </div>
                          <span className="line-clamp-1">{userName}</span>
                        </button>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-black bg-white px-4 py-4 font-black uppercase text-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px]"
                      >
                        <LogOut size={20} className="stroke-[3px]" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Link href="/signin">
                        <Button variant="outline" className="h-12 w-full font-black uppercase border-2 border-black bg-white text-black hover:bg-gray-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/signup">
                        <Button className="h-12 w-full font-black uppercase border-2 border-black bg-orange-500 text-white hover:bg-orange-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] transition-all">
                          Register
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
