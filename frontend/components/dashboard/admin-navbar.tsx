'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function AdminNavbar() {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search vendors, users..."
            className="pl-10"
          />
        </div>
      </div>
    </header>
  )
}
