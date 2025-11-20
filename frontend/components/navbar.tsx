'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/logo'

export function Navbar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string>('')

  useEffect(() => {
    // Check if user is logged in
    const checkAuthState = () => {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setIsLoggedIn(true)
          setUserName(user.displayName || user.email || 'User')
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
    return () => window.removeEventListener('storage', checkAuthState)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('firebaseUser')
    setIsLoggedIn(false)
    setUserName('')
    router.push('/')
  }

  const navItems = [
    { label: 'Explore', href: '/explore' },
    { label: 'Offers', href: '/offers' },
    { label: 'About', href: '/about' },
    { label: 'Community', href: '/#community' },
  ]

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo only (CHANGE: removed duplicate logo, kept only one) */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
            <Logo />
          </Link>

          {/* Center: Navigation Menu (CHANGE: moved to right, removed from center) */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-foreground/70 hover:text-primary transition-colors font-medium text-sm hover:bg-orange-50 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right: Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-orange-50 transition-colors">
                    <User size={20} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">{userName}</span>
                  </button>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link href="/signin">
                  <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary/5">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white shadow-md">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-orange-50 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} className="text-primary" /> : <Menu size={24} className="text-primary" />}
          </button>
        </div>

        {/* Mobile Menu (CHANGE: improved mobile spacing and structure) */}
        {isOpen && (
          <div className="lg:hidden border-t border-orange-100 pb-6 pt-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-foreground/70 hover:text-primary font-medium text-sm hover:bg-orange-50 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-4 px-4 border-t border-orange-100">
              {isLoggedIn ? (
                <>
                  <Link href="/profile" onClick={() => setIsOpen(false)}>
                    <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-orange-50 text-primary font-medium transition-colors">
                      <User size={20} />
                      {userName}
                    </button>
                  </Link>
                  <button 
                    onClick={() => {
                      setIsOpen(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-50 text-red-600 font-medium transition-colors"
                  >
                    <LogOut size={20} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin">
                    <Button variant="outline" className="w-full border-primary/20 text-primary hover:bg-primary/5">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white">
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
