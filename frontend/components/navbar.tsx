'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfilePic, setUserProfilePic] = useState<string>('')
  const [scrolled, setScrolled] = useState(false)
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Check if user is logged in
    const checkAuthState = () => {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setIsLoggedIn(true)
          setUserName(user.displayName || user.email || 'User')
          setUserProfilePic(user.profilePicture || '')
        } catch (e) {
          setIsLoggedIn(false)
        }
      } else {
        setIsLoggedIn(false)
      }
    }

    checkAuthState()

    // Listen for storage changes (e.g., login/logout in another tab)
    window.addEventListener('storage', checkAuthState)
    // Custom event for profile updates
    window.addEventListener('user-updated', checkAuthState)

    return () => {
      window.removeEventListener('storage', checkAuthState)
      window.removeEventListener('user-updated', checkAuthState)
    }
  }, [])

  // ... (scroll effect remains same)

  // ... (handleLogout remains same)

  // Helper to resolve image URL
  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('/avatars/')) return path;
    const baseUrl = BACKEND_URL.replace(/\/api\/?$/, '');
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  // ... (navItems remains same)

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
      ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-orange-100/50'
      : 'bg-white/80 backdrop-blur-md border-b border-orange-100/30 shadow-sm'
      }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0 group">
            <div className="transform group-hover:scale-105 transition-transform">
              <Logo />
            </div>
          </Link>

          {/* Center: Navigation Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 font-medium text-sm rounded-lg transition-all duration-200 group ${isActive
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-primary hover:bg-orange-50'
                    }`}
                >
                  {item.label}
                  {/* Gradient underline */}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-300 ${isActive ? 'w-3/4' : 'w-0 group-hover:w-3/4'
                    }`} />
                </Link>
              )
            })}
          </div>

          {/* Right: Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-orange-50 transition-all duration-200 hover:scale-105 group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-sm group-hover:shadow-lg transition-shadow overflow-hidden">
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
                    <span className="text-sm font-medium text-foreground">{userName}</span>
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-all duration-200 hover:scale-105"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5 hover:scale-105 transition-all duration-200">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-orange-50 rounded-lg transition-all duration-200 hover:scale-110"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} className="text-primary" /> : <Menu size={24} className="text-primary" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-orange-100 pb-6 pt-4 space-y-2 animate-in slide-in-from-top duration-300">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-3 font-medium text-sm rounded-lg transition-all duration-200 ${isActive
                    ? 'text-primary bg-orange-50 border-l-4 border-primary'
                    : 'text-foreground/70 hover:text-primary hover:bg-orange-50'
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              )
            })}
            <div className="flex flex-col gap-3 pt-4 px-4 border-t border-orange-100">
              {isLoggedIn ? (
                <>
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    <button className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 text-primary font-medium transition-all duration-200 hover:shadow-md">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
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
                      {userName}
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-red-50 text-red-600 font-medium transition-all duration-200 hover:shadow-md"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
