'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { authApi, type AuthUser } from '@/lib/api'
import { auth, googleProvider } from '@/lib/firebase-client'
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth'

interface LoginResult {
  success: boolean
  error?: string
  user?: AuthUser
  requiresEmailVerification?: boolean
  email?: string
  redirecting?: boolean
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

  // On mount, check if user is authenticated via cookie or redirect result
  useEffect(() => {
    const handleRedirectAuth = async () => {
      try {
        if (!auth) {
          await refreshUser()
          return
        }

        // Check if there is a pending redirect sign-in result
        const result = await getRedirectResult(auth)
        if (result) {
          setIsLoading(true)
          const token = await result.user.getIdToken()
          const response = await authApi.firebaseLogin(token)
          let userData = response.user as AuthUser

          try {
            const me = await authApi.me()
            userData = me as AuthUser
          } catch (meError) {
            console.error('Failed to verify session after redirect login:', meError)
          }

          setUser(userData)
          window.dispatchEvent(new Event('user-updated'))
          setIsLoading(false)
        } else {
          // If no redirect result, fall back to current cookie session
          await refreshUser()
        }
      } catch (err) {
        console.error('Error handling redirect auth:', err)
        // Fall back to current cookie session if redirect check fails
        await refreshUser()
      }
    }

    handleRedirectAuth()
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

      // Directly use redirect sign-in to completely bypass cross-origin iframe blocks and popup hangs
      await signInWithRedirect(auth, googleProvider)
      return { success: true, redirecting: true }
    } catch (err: any) {
      console.error('Google Sign-In redirect error:', err)
      
      let errorMessage = 'Google Sign-In failed.'
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
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
