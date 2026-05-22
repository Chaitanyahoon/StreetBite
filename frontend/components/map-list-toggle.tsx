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
    <div className="inline-flex rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black bg-white p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-row justify-center items-center gap-1">
      <Button
        type="button"
        onClick={() => handleViewChange('list')}
        variant={activeView === 'list' ? 'default' : 'ghost'}
        size="sm"
        className={cn(
          'h-8 sm:h-10 rounded-lg sm:rounded-xl px-3 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.14em] flex items-center gap-1.5 transition-all',
          activeView === 'list'
            ? 'bg-black text-white hover:bg-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_var(--primary)] sm:shadow-[2px_2px_0px_0px_var(--primary)]'
            : 'text-black/60 bg-transparent hover:bg-orange-50 hover:text-black border-2 border-transparent',
        )}
      >
        <List size={14} className="sm:size-[18px]" />
        List
      </Button>
      <Button
        type="button"
        onClick={() => handleViewChange('map')}
        variant={activeView === 'map' ? 'default' : 'ghost'}
        size="sm"
        className={cn(
          'h-8 sm:h-10 rounded-lg sm:rounded-xl px-3 sm:px-4 text-[10px] sm:text-xs font-black uppercase tracking-[0.14em] flex items-center gap-1.5 transition-all',
          activeView === 'map'
            ? 'bg-black text-white hover:bg-black border-2 border-black shadow-[1.5px_1.5px_0px_0px_var(--primary)] sm:shadow-[2px_2px_0px_0px_var(--primary)]'
            : 'text-black/60 bg-transparent hover:bg-orange-50 hover:text-black border-2 border-transparent',
        )}
      >
        <Map size={14} className="sm:size-[18px]" />
        Map
      </Button>
    </div>
  )
}
