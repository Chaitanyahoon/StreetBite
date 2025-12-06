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


// Level scaling functions - exported for use in components
export const getXPForLevel = (level: number): number => {
    // Formula: Total XP needed = level * (level - 1) * 50
    // Level 1: 0 XP, Level 2: 100 XP, Level 3: 300 XP, Level 4: 600 XP, etc.
    return level * (level - 1) * 50
}

export const getLevelFromXP = (xp: number): number => {
    // Find the highest level where required XP <= current XP
    let level = 1
    while (getXPForLevel(level + 1) <= xp) {
        level++
    }
    return level
}

export const getXPForNextLevel = (currentLevel: number): number => {
    return getXPForLevel(currentLevel + 1)
}

export const getXPProgressInCurrentLevel = (xp: number, level: number): number => {
    const xpForCurrentLevel = getXPForLevel(level)
    const xpForNextLevel = getXPForLevel(level + 1)
    const xpIntoLevel = xp - xpForCurrentLevel
    const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel
    return (xpIntoLevel / xpNeededForLevel) * 100
}

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
        const token = localStorage.getItem('token')
        if (token) {
            fetchStats()
        }
    }, [])

    // Recalculate level whenever XP changes - REMOVED to prevent refresh bug
    // Level is now managed explicitly in addXP, performAction, and fetchStats

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

        // Calculate new level with scaling
        const estimatedLevel = getLevelFromXP(newXP)
        if (estimatedLevel > level) {
            toast.success(`Level Up! 🌟`, {
                description: `Congratulations! You reached Level ${estimatedLevel}!`,
                style: {
                    background: 'linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)',
                    color: '#000',
                    border: '1px solid #FCD34D',
                    fontWeight: 'bold'
                },
                icon: '🏆'
            })
            setLevel(estimatedLevel)
        }
    }

    const performAction = async (actionType: string) => {
        const token = localStorage.getItem('token')
        if (!token) return

        try {
            const response = await gamificationApi.performAction(actionType)
            if (response.success) {
                setXp(response.newXp)
                setLevel(response.level)

                if (response.level > level) {
                    toast.success(`Level Up! 🌟`, {
                        description: `Congratulations! You reached Level ${response.level}!`,
                        style: {
                            background: 'linear-gradient(135deg, #FFD700 0%, #F59E0B 100%)',
                            color: '#000',
                            border: '1px solid #FCD34D',
                            fontWeight: 'bold'
                        },
                        icon: '🏆'
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
                style: {
                    background: 'linear-gradient(135deg, #F97316 0%, #EF4444 100%)',
                    color: 'white',
                    border: '1px solid #FCA5A5',
                    fontWeight: 'bold'
                }
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
