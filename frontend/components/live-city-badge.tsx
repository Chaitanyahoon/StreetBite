"use client"

import { useCityName } from '@/hooks/use-city-name'

export function LiveCityBadge() {
  const { cityName, loading } = useCityName()

  return (
    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all cursor-default group transform -rotate-1">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border border-black"></span>
      </span>
      <span className="text-sm font-black text-black tracking-wide uppercase">
        Live in{' '}
        <span className="bg-black text-white px-2 py-0.5 rounded ml-1 group-hover:bg-orange-500 transition-colors">
          {loading ? '...' : cityName?.trim() ? cityName : 'YOUR CITY'}
        </span>
      </span>
    </div>
  )
}
