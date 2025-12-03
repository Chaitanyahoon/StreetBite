// @ts-nocheck
'use client'

import React, { useEffect, useState } from 'react'
import { useNotifications } from '@/hooks/use-notifications'
import { Bell, MapPin } from 'lucide-react'
import { useUserLocation } from '@/lib/useUserLocation'

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { requestPermission, isSupported, permission } = useNotifications()
    const { location, requestGeolocation } = useUserLocation()
    const [showBell, setShowBell] = useState(false)

    useEffect(() => {
        // Show bell if supported and NOT granted (so it shows on 'default' AND 'denied')
        if (isSupported && Notification.permission !== 'granted') {
            setShowBell(true)
        } else {
            setShowBell(false)
        }
    }, [isSupported, permission])

    return (
        <>
            {children}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end animate-fade-in">
                {/* Location Button */}
                {!location && (
                    <button
                        onClick={async () => {
                            const error = await requestGeolocation()
                            if (error === 'Location permission denied') {
                                alert('Location access is blocked. Please enable it in your browser settings to find street food near you.')
                            }
                        }}
                        className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-600 text-white rounded-full shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-110 transition-all duration-300 z-50"
                        aria-label="Enable Location"
                    >
                        <MapPin className="w-6 h-6 group-hover:animate-bounce" />

                        <span className="absolute right-full mr-4 px-3 py-1.5 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-sm font-medium rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            Enable Location
                        </span>

                        <span className="absolute top-3 right-3.5 w-2.5 h-2.5 bg-white rounded-full">
                            <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-75"></span>
                        </span>
                    </button>
                )}

                {/* Notification Bell */}
                {showBell && (
                    <button
                        onClick={async () => {
                            const result = await requestPermission()
                            if (result === 'denied') {
                                alert('Notifications are blocked. Please enable them in your browser settings to receive updates.')
                            }
                        }}
                        className="group relative flex items-center justify-center w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-110 transition-all duration-300 z-50"
                        aria-label="Enable Notifications"
                    >
                        <Bell className="w-6 h-6 group-hover:animate-swing" />

                        <span className="absolute right-full mr-4 px-3 py-1.5 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 text-sm font-medium rounded-xl shadow-xl border border-zinc-100 dark:border-zinc-800 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 whitespace-nowrap pointer-events-none flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Enable Notifications
                        </span>

                        <span className="absolute top-3 right-3.5 w-2.5 h-2.5 bg-white rounded-full">
                            <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-75"></span>
                        </span>
                    </button>
                )}
            </div>
        </>
    )
}
