'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { gamificationApi } from '@/lib/api'
import { toast } from 'sonner'

interface GamificationContextType {
    xp: number
    level: number
    streak: number
    rank: number
    displayName: string
    lastCheckIn: string | null
    addXP: (amount: number, source: string) => void
    checkIn: () => void
    hasCheckedInToday: boolean
    performAction: (actionType: string) => Promise<void>
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined)

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const [xp, setXp] = useState(0)
    const [level, setLevel] = useState(1)
    const [streak, setStreak] = useState(0)
    const [rank, setRank] = useState(0)
    const [displayName, setDisplayName] = useState('')
    const [lastCheckIn, setLastCheckIn] = useState<string | null>(null)
    const [hasCheckedInToday, setHasCheckedInToday] = useState(false)

    // Load initial state
    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const stats = await gamificationApi.getUserStats()
            setXp(stats.xp)
            setLevel(stats.level)
            setStreak(stats.streak)
            setRank(stats.rank)
            setDisplayName(stats.displayName)
            setLastCheckIn(stats.lastCheckIn)

            if (stats.lastCheckIn) {
                checkIfCheckedInToday(stats.lastCheckIn)
            }
        } catch (error) {
            console.error("Failed to fetch gamification stats", error)
        }
    }

    const checkIfCheckedInToday = (lastDate: string) => {
        const today = new Date().toISOString().split('T')[0]
        setHasCheckedInToday(lastDate === today)
    }

    const addXP = async (amount: number, source: string) => {
        // Optimistic update
        const newXP = xp + amount
        setXp(newXP)

        // We don't manually calculate level here anymore, backend does it
        // But for UI responsiveness we can estimate
        const estimatedLevel = Math.floor(newXP / 1000) + 1
        if (estimatedLevel > level) {
            toast.success(`Level Up! 🎉`, {
                description: `You reached Level ${estimatedLevel}!`,
                style: { background: '#8B5CF6', color: 'white', border: 'none' }
            })
            setLevel(estimatedLevel)
        }
    }

    const performAction = async (actionType: string) => {
        try {
            const response = await gamificationApi.performAction(actionType)
            if (response.success) {
                setXp(response.newXp)
                setLevel(response.level)

                if (response.level > level) {
                    toast.success(`Level Up! 🎉`, {
                        description: `You reached Level ${response.level}!`,
                        style: { background: '#8B5CF6', color: 'white', border: 'none' }
                    })
                }
            }
        } catch (error) {
            console.error("Failed to perform action", error)
        }
    }

    const checkIn = async () => {
        if (hasCheckedInToday) return

        try {
            await performAction('daily_login')
            setHasCheckedInToday(true)

            // Optimistic streak update
            setStreak(prev => prev + 1)

            toast.success("Streak Extended! 🔥", {
                description: "You're on fire! Keep it up!",
                style: { background: '#F97316', color: 'white', border: 'none' }
            })
        } catch (error) {
            toast.error("Failed to check in")
        }
    }

    return (
        <GamificationContext.Provider value={{ xp, level, streak, rank, displayName, lastCheckIn, addXP, checkIn, hasCheckedInToday, performAction }}>
            {children}
        </GamificationContext.Provider>
    )
}

export function useGamification() {
    const context = useContext(GamificationContext)
    if (context === undefined) {
        throw new Error('useGamification must be used within a GamificationProvider')
    }
    return context
}
