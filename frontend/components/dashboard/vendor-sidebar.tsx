'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Menu, BarChart3, Tag, Settings, LogOut, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        "fixed lg:static inset-y-0 left-0 w-72 bg-white/40 backdrop-blur-xl border-r border-white/20 flex flex-col shadow-xl z-40 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg shadow-orange-500/20">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">StreetBite</h2>
              <p className="text-xs text-muted-foreground font-medium">Vendor Portal</p>
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
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group',
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                    : 'text-muted-foreground hover:bg-white/60 hover:text-orange-600 hover:shadow-md'
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-muted-foreground group-hover:text-orange-600")} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>


        {/* Logout */}
        <div className="p-6 border-t border-white/10">
          <button 
            onClick={() => {
              localStorage.clear()
              window.location.href = '/signin'
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-300 group border border-transparent hover:border-red-100"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
