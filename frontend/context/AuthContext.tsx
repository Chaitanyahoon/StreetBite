'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authApi, type AuthUser } from '@/lib/api'
import { auth, googleProvider } from '@/lib/firebase-client'
import { signInWithPopup } from 'firebase/auth'

interface LoginResult {
  success: boolean
  error?: string
  user?: AuthUser
  requiresEmailVerification?: boolean
  email?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isLoggedIn: boolean
  login: (email: string, password: string) => Promise<LoginResult>
  loginWithGoogle: () => Promise<LoginResult>
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
      if (response.requiresEmailVerification) {
        return {
          success: true,
          requiresEmailVerification: true,
          email: response.email,
        }
      }

      // Verify the cookie-backed session actually persisted before treating login as successful.
      let userData = response.user as AuthUser

      try {
        const me = await authApi.me()
        userData = me as AuthUser
      } catch (meError: any) {
        setUser(null)
        const sessionError =
          meError?.response?.status === 401
            ? 'Please allow cookies for StreetBite and try signing in again.'
            : 'Please allow cookies and try signing in again.'

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

  const loginWithGoogle = useCallback(async () => {
    try {
      if (!auth || !googleProvider) {
        return {
          success: false,
          error: 'Google Sign-In is temporarily unavailable. Firebase credentials are not fully initialized.'
        }
      }

      const result = await signInWithPopup(auth, googleProvider)
      const token = await result.user.getIdToken()

      const response = await authApi.firebaseLogin(token)

      // Verify the cookie-backed session actually persisted before treating login as successful.
      let userData = response.user as AuthUser

      try {
        const me = await authApi.me()
        userData = me as AuthUser
      } catch (meError: any) {
        setUser(null)
        const sessionError =
          meError?.response?.status === 401
            ? 'Please allow cookies for StreetBite and try signing in again.'
            : 'Please allow cookies and try signing in again.'

        return { success: false, error: sessionError }
      }

      setUser(userData)

      // Notify other components (e.g. Navbar in other tabs)
      window.dispatchEvent(new Event('user-updated'))

      return { success: true, user: userData }
    } catch (err: any) {
      console.error('Google Sign-In error:', err)
      
      let errorMessage = 'Google Sign-In failed.'
      if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Sign-in popup was blocked by your browser. Please allow popups and try again.'
      } else if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in window was closed before completing authentication.'
      } else if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
        errorMessage = 'Google Sign-In is not enabled for your Firebase project. Please enable "Google" under Build > Authentication > Sign-in method in your Firebase Console.'
      } else if (err.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for OAuth sign-in. Please add this domain to the Authorized Domains list in Firebase Console > Authentication > Settings.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
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
      loginWithGoogle,
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
