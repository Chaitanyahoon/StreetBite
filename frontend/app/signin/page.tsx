'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Mail, Lock, ArrowLeft } from 'lucide-react'
import { loginUser } from '@/lib/api'
import { signInWithEmailAndPassword, getAuthInstance } from '@/lib/firebase'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Step 1: Get auth instance and authenticate with Firebase
      const authInstance = getAuthInstance()
      const userCredential = await signInWithEmailAndPassword(
        authInstance,
        email,
        password
      )
      
      // Step 2: Get user profile from backend
      const response = await loginUser({ email, password })
      
      // Step 3: Store user info in localStorage
      if (response.user) {
        const userData = {
          ...response.user,
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        }
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('firebaseUser', JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        }))
        
        // Redirect based on user role
        const role = response.user.role?.toUpperCase()
        if (role === 'VENDOR') {
          router.push('/vendor')
        } else if (role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/explore')
        }
      } else {
        // If backend doesn't have user, still allow login with Firebase
        const userData = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          role: 'CUSTOMER',
        }
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('firebaseUser', JSON.stringify({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
        }))
        router.push('/explore')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      let errorMessage = 'Login failed. Please check your credentials.'
      
      if (err.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase Auth is not configured. Please enable Email/Password authentication in Firebase Console.'
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email. Please sign up first.'
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
      
      {/* Back button */}
      <div className="p-4 sm:p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>

      {/* Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo and Heading */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to discover amazing street food near you</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-6 bg-card rounded-2xl shadow-lg p-8 border border-border">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary size-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary size-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50"
                  required
                />
              </div>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-lg transition-all disabled:opacity-50"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-orange-200" />
              <span className="text-xs text-muted-foreground font-medium">OR</span>
              <div className="flex-1 h-px bg-orange-200" />
            </div>

            {/* Sign Up Link */}
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
