'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Store, Users, BarChart3, Settings, LogOut, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'

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
    label: 'Reports',
    href: '/admin/reports',
    icon: Flag,
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    label: 'Hot Topics',
    href: '/admin/hot-topics',
    icon: Store, // Reusing Store icon or finding a better one like Flame if available, using Store for now to match safety
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter() // Ensure this hook is used

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user') // Clear user data
    window.dispatchEvent(new Event('user-updated')) // Notify app
    router.push('/signin') // Redirect to login
  }

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-bold text-orange-600">StreetBite</h2>
        <p className="text-xs text-muted-foreground">Admin Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-orange-100 text-orange-600 font-medium'
                  : 'text-muted-foreground hover:bg-accent'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
