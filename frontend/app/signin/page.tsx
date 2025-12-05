'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Mail, Lock, ArrowLeft, Sparkles } from 'lucide-react'
import { authApi } from '@/lib/api'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const performLogin = async (emailInput: string, passwordInput: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Direct backend login (no Firebase)
      const response = await authApi.login({
        email: emailInput,
        password: passwordInput
      })

      // Store JWT token and user info
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // Notify other components (Navbar) of the update
      window.dispatchEvent(new Event('user-updated'))

      // Redirect based on user role
      const role = response.user.role?.toUpperCase()
      if (role === 'VENDOR') {
        router.push('/vendor')
      } else if (role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/community')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      let errorMessage = 'Login failed. Please check your credentials.'

      if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password.'
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    await performLogin(email, password)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetStatus('sending')
    try {
      await authApi.forgotPassword(resetEmail)
      setResetStatus('sent')
    } catch (err) {
      setResetStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-float -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '2s' }} />

      {/* Back button */}
      <div className="p-4 sm:p-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors hover-lift">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>

      {/* Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md animate-slide-up">
          {/* Logo and Heading */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4 hover-lift">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-shine-amber">
                {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
              </span>
            </h1>
            <p className="text-muted-foreground">
              {showForgotPassword
                ? 'Enter your email to receive a reset link'
                : 'Sign in to discover amazing street food near you'}
            </p>
          </div>

          {showForgotPassword ? (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className="space-y-6 glass rounded-3xl shadow-elevated p-8 border border-white/20">
              {resetStatus === 'sent' ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <Mail size={32} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">Check your email</h3>
                    <p className="text-muted-foreground text-sm">
                      We have sent a password reset link to <span className="font-medium text-foreground">{resetEmail}</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetStatus('idle')
                      setResetEmail('')
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <>
                  {resetStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Failed to send reset link. Please try again.
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors size-5" />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-3.5 border-2 border-primary/10 rounded-xl focus:outline-none focus:border-primary bg-white/50 transition-all hover:bg-white/80"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={resetStatus === 'sending'}
                    className="w-full btn-gradient h-12 rounded-xl text-lg font-semibold shadow-lg hover-lift hover-glow disabled:opacity-50"
                  >
                    {resetStatus === 'sending' ? 'Sending...' : 'Send Reset Link'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                  >
                    Back to Sign In
                  </button>
                </>
              )}
            </form>
          ) : (
            /* Login Form */
            <form onSubmit={handleSignIn} className="space-y-6 glass rounded-3xl shadow-elevated p-8 border border-white/20">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-fade-in flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors size-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-primary/10 rounded-xl focus:outline-none focus:border-primary bg-white/50 transition-all hover:bg-white/80"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60 group-hover:text-primary transition-colors size-5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-primary/10 rounded-xl focus:outline-none focus:border-primary bg-white/50 transition-all hover:bg-white/80"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:text-primary/80 font-medium hover:underline transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gradient h-12 rounded-xl text-lg font-semibold shadow-lg hover-lift hover-glow disabled:opacity-50 disabled:hover:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-primary/10" />
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">OR</span>
                <div className="flex-1 h-px bg-primary/10" />
              </div>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:text-primary/80 font-bold hover:underline decoration-2 underline-offset-4">
                  Sign Up
                </Link>
              </p>

              {/* Quick Login for Development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-8 pt-6 border-t border-primary/10">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center mb-4">
                    Development Quick Login
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => performLogin('admin@streetbite.com', 'admin123')}
                      className="text-xs"
                    >
                      Admin
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => performLogin('user@streetbite.com', 'user123')}
                      className="text-xs"
                    >
                      User
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => performLogin('vendor1@streetbite.com', 'vendor123')}
                      className="text-xs"
                    >
                      Vendor
                    </Button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
