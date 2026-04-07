'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authApi, type AuthUser } from '@/lib/api'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: AuthUser }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateLocalUser: (updated: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.me()
      setUser(data as AuthUser)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // On mount, check if user is authenticated via cookie
  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      // Verify the cookie-backed session actually persisted before treating login as successful.
      let userData = response.user as AuthUser

      try {
        const me = await authApi.me()
        userData = me as AuthUser
      } catch (meError: any) {
        setUser(null)
        const sessionError =
          meError?.response?.status === 401
            ? 'Login succeeded, but your browser is blocking the session cookie. Allow cookies for StreetBite and try again.'
            : 'Login succeeded, but the session could not be verified. Please allow cookies and try again.'

        return { success: false, error: sessionError }
      }

      setUser(userData)

      // Notify other components (e.g. Navbar in other tabs)
      window.dispatchEvent(new Event('user-updated'))

      return { success: true, user: userData }
    } catch (err: any) {
      let errorMessage = 'Login failed. Please check your credentials.'
      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      }
      return { success: false, error: errorMessage }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } catch {
      // Cookie might already be gone
    }
    setUser(null)
    // Clean up any legacy localStorage data
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('firebaseUser')
    }
    window.dispatchEvent(new Event('user-updated'))
  }, [])

  // Allow components to optimistically update user data (e.g. after profile edit)
  const updateLocalUser = useCallback((updated: Partial<AuthUser>) => {
    setUser(prev => prev ? { ...prev, ...updated } : null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isLoggedIn: !!user,
      login,
      logout,
      refreshUser,
      updateLocalUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
