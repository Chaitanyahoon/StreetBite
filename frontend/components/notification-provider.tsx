'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Bell, MapPin } from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'
import { useUserLocation } from '@/lib/useUserLocation'
import { toast } from 'sonner'

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { requestPermission, isSupported, permission } = useNotifications()
  const { location, requestGeolocation } = useUserLocation()
  const showBell =
    isSupported &&
    typeof Notification !== 'undefined' &&
    permission !== 'granted'

  return (
    <>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex items-end gap-4 animate-fade-in">
        {!location ? (
          <button
            type="button"
            onClick={async () => {
              const error = await requestGeolocation()
              if (error === 'Location permission denied') {
                toast.error('Location access is blocked. Enable it in your browser settings to find street food near you.')
              }
            }}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-110 hover:shadow-emerald-500/50"
            aria-label="Enable Location"
          >
            <MapPin className="h-6 w-6 group-hover:animate-bounce" />
            <span className="pointer-events-none absolute right-full mr-4 flex translate-x-2 items-center gap-2 whitespace-nowrap rounded-xl border border-zinc-100 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 opacity-0 shadow-xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              Enable Location
            </span>
            <span className="absolute right-3.5 top-3 h-2.5 w-2.5 rounded-full bg-white">
              <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-75" />
            </span>
          </button>
        ) : null}

        {showBell ? (
          <button
            type="button"
            onClick={async () => {
              const result = await requestPermission()
              if (result === 'denied') {
                toast.error('Notifications are blocked. Enable them in your browser settings to receive updates.')
              }
            }}
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 transition-all duration-300 hover:scale-110 hover:shadow-amber-500/50"
            aria-label="Enable Notifications"
          >
            <Bell className="h-6 w-6 group-hover:animate-swing" />
            <span className="pointer-events-none absolute right-full mr-4 flex translate-x-2 items-center gap-2 whitespace-nowrap rounded-xl border border-zinc-100 bg-white px-3 py-1.5 text-sm font-medium text-zinc-600 opacity-0 shadow-xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              Enable Notifications
            </span>
            <span className="absolute right-3.5 top-3 h-2.5 w-2.5 rounded-full bg-white">
              <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-75" />
            </span>
          </button>
        ) : null}
      </div>
    </>
  )
}
