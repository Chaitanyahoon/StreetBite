'use client'

import { useState } from 'react'
import { Map, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface MapListToggleProps {
  onViewChange: (view: 'map' | 'list') => void
}

export function MapListToggle({ onViewChange }: MapListToggleProps) {
  const [activeView, setActiveView] = useState<'map' | 'list'>('list')

  const handleViewChange = (view: 'map' | 'list') => {
    setActiveView(view)
    onViewChange(view)
  }

  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
      <Button
        onClick={() => handleViewChange('list')}
        variant={activeView === 'list' ? 'default' : 'ghost'}
        size="sm"
        className={`gap-2 ${activeView === 'list' ? 'bg-primary text-white' : 'text-gray-600'}`}
      >
        <List size={18} />
        List View
      </Button>
      <Button
        onClick={() => handleViewChange('map')}
        variant={activeView === 'map' ? 'default' : 'ghost'}
        size="sm"
        className={`gap-2 ${activeView === 'map' ? 'bg-primary text-white' : 'text-gray-600'}`}
      >
        <Map size={18} />
        Map View
      </Button>
    </div>
  )
}
