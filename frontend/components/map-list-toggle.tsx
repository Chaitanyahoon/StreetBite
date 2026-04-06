'use client'

import { Map, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MapListToggleProps {
  value?: 'map' | 'list'
  onViewChange: (view: 'map' | 'list') => void
}

export function MapListToggle({ value = 'list', onViewChange }: MapListToggleProps) {
  const activeView = value

  const handleViewChange = (view: 'map' | 'list') => {
    onViewChange(view)
  }

  return (
    <div className="inline-flex rounded-2xl border border-black/10 bg-white/80 p-1 shadow-[var(--shadow-soft)] backdrop-blur">
      <Button
        type="button"
        onClick={() => handleViewChange('list')}
        variant={activeView === 'list' ? 'default' : 'ghost'}
        size="sm"
        className={cn(
          'rounded-xl px-4 text-xs font-black uppercase tracking-[0.14em] sm:text-sm',
          activeView === 'list'
            ? 'bg-black text-white hover:bg-black'
            : 'text-black/60 hover:bg-accent hover:text-black',
        )}
      >
        <List size={18} />
        List
      </Button>
      <Button
        type="button"
        onClick={() => handleViewChange('map')}
        variant={activeView === 'map' ? 'default' : 'ghost'}
        size="sm"
        className={cn(
          'rounded-xl px-4 text-xs font-black uppercase tracking-[0.14em] sm:text-sm',
          activeView === 'map'
            ? 'bg-black text-white hover:bg-black'
            : 'text-black/60 hover:bg-accent hover:text-black',
        )}
      >
        <Map size={18} />
        Map
      </Button>
    </div>
  )
}
