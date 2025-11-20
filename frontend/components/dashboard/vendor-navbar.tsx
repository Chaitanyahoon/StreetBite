'use client'

import { Bell, User, Search, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface VendorNavbarProps {
  onMenuClick?: () => void
}

export function VendorNavbar({ onMenuClick }: VendorNavbarProps) {
  const router = useRouter()

  return (
    <header className="h-20 bg-white/40 backdrop-blur-xl border-b border-white/20 flex items-center justify-between px-4 lg:px-8 z-10">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden -ml-2 hover:bg-white/60 hover:text-orange-600"
          onClick={onMenuClick}
        >
          <Menu className="w-6 h-6" />
        </Button>

        <div className="relative group flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-hover:text-orange-500 transition-colors" />
          <Input 
            placeholder="Search orders..." 
            className="pl-10 bg-white/50 border-white/20 focus:bg-white focus:border-orange-500/50 transition-all duration-300 rounded-xl w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl hover:bg-white/60 hover:text-orange-600 transition-colors relative"
          onClick={() => alert('Notifications feature coming soon!')}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-xl hover:bg-white/60 hover:text-orange-600 transition-colors"
          onClick={() => router.push('/vendor/settings')}
        >
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
