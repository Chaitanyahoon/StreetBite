'use client'

import { useState } from 'react'
import { Search, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function SearchBar() {
  const [cuisine, setCuisine] = useState('')
  const [location, setLocation] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search:', { cuisine, location })
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      {/* CHANGE: improved styling and spacing with better pill design */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-full p-2 shadow-lg border border-orange-100">
        <div className="flex-1 flex items-center gap-3 px-5">
          <Search size={20} className="text-primary flex-shrink-0" />
          <input
            type="text"
            placeholder="What are you craving?"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium"
          />
        </div>
        <div className="flex-1 flex items-center gap-3 px-5 border-t sm:border-t-0 sm:border-l border-orange-100">
          <MapPin size={20} className="text-primary flex-shrink-0" />
          <input
            type="text"
            placeholder="Enter location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium"
          />
        </div>
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 sm:px-8 font-semibold"
        >
          Search
        </Button>
      </div>
    </form>
  )
}
