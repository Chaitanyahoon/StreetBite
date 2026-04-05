'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Menu, BarChart3, Tag, Settings, LogOut, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  {
    label: 'Dashboard',
    href: '/vendor',
    icon: Home,
  },
  {
    label: 'Menu Management',
    href: '/vendor/menu',
    icon: Menu,
  },
  {
    label: 'Analytics',
    href: '/vendor/analytics',
    icon: BarChart3,
  },
  {
    label: 'Promotions',
    href: '/vendor/promotions',
    icon: Tag,
  },
  {
    label: 'Support',
    href: '/vendor/support',
    icon: HelpCircle,
  },
  {
    label: 'Settings',
    href: '/vendor/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    window.location.href = '/signin'
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-72 bg-gradient-to-b from-orange-50 to-amber-50 border-r border-orange-200/50 flex flex-col shadow-lg z-40 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-8 border-b border-orange-200/30">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="StreetBite" className="w-10 h-10 rounded-xl shadow-md" />
            <div>
              <h2 className="text-xl font-bold text-orange-800">StreetBite</h2>
              <p className="text-xs text-orange-600 font-medium">Vendor Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md'
                    : 'text-orange-700 hover:bg-orange-100 hover:shadow-sm'
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-orange-600")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>


        {/* Logout */}
        <div className="p-6 border-t border-orange-200/30">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-200 group border border-red-200/50 hover:border-red-300"
            >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
