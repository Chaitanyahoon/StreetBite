'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Store, Users, BarChart3, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: Home,
  },
  {
    label: 'Vendor Management',
    href: '/admin/vendors',
    icon: Store,
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    label: 'Hot Topics',
    href: '/admin/hot-topics',
    icon: Store, // Reusing Store icon or finding a better one like Flame if available, using Store for now to match safety
  },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push('/signin')
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
        "fixed lg:static inset-y-0 left-0 w-64 bg-card border-r-3 border-black flex flex-col z-40 transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="p-6 border-b-3 border-black bg-yellow-300">
          <h2 className="text-xl font-black text-black uppercase tracking-wider">StreetBite</h2>
          <p className="text-[10px] font-black uppercase text-black/50">Admin Dashboard</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose?.()}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 border-2',
                  isActive
                    ? 'bg-orange-300 text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold'
                    : 'text-black/70 hover:bg-orange-100 hover:text-black border-transparent'
                )}
              >
                <Icon className="w-5 h-5 text-black" />
                <span className="font-bold text-xs uppercase tracking-wider">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t-3 border-black bg-[#fffaf4]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-black hover:bg-red-200 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all cursor-pointer font-bold text-xs uppercase tracking-wider"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}
