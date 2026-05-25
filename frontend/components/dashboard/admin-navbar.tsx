'use client'

import { Bell, User, Search, Menu } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface AdminNavbarProps {
  onMenuClick?: () => void
}

export function AdminNavbar({ onMenuClick }: AdminNavbarProps) {
  return (
    <header className="h-16 bg-[#fffaf4] border-b-3 border-black flex items-center justify-between px-4 sm:px-6 z-10">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden -ml-2 border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none hover:bg-gray-100 h-9 w-9 flex items-center justify-center cursor-pointer"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-black" />
        </Button>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-black/50" />
          <Input 
            placeholder="Search vendors, users..." 
            className="pl-10 border-2 border-black bg-white focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all font-bold h-9 text-xs rounded-xl"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 ml-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none hover:bg-gray-100 h-9 w-9 flex items-center justify-center cursor-pointer"
        >
          <Bell className="w-4 h-4 text-black" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-600 rounded-full" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none hover:bg-gray-100 h-9 w-9 flex items-center justify-center cursor-pointer"
        >
          <User className="w-4 h-4 text-black" />
        </Button>
      </div>
    </header>
  )
}
