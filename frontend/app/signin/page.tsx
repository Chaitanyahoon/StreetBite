'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Mail, Lock, ArrowLeft, Eye, EyeOff, ShieldCheck, Cookie, RefreshCcw } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, loginWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [resetError, setResetError] = useState<string | null>(null)
  const [showCookieHelp, setShowCookieHelp] = useState(false)
  const isCookieIssue = !!error?.toLowerCase().includes('allow cookies')

  const performLogin = async (emailInput: string, passwordInput: string) => {
    setIsLoading(true)
    setError(null)

    const result = await login(emailInput, passwordInput)

    if (result.success && result.requiresEmailVerification) {
      router.push(`/signup?verify=${encodeURIComponent(result.email || emailInput)}`)
      setIsLoading(false)
      return
    }

    if (result.success && result.user) {
      const nextPath = searchParams.get('next')
      if (nextPath && nextPath.startsWith('/')) {
        router.push(nextPath)
        return
      }

      // Redirect based on user role
      const role = result.user.role?.toUpperCase()
      if (role === 'VENDOR') {
        router.push('/vendor')
      } else if (role === 'ADMIN') {
        router.push('/admin')
      } else {
        router.push('/explore')
      }
    } else {
      setError(result.error || 'Login failed.')
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    try {
      const result = await loginWithGoogle()
      if (result.success && result.user) {
        const nextPath = searchParams.get('next')
        if (nextPath && nextPath.startsWith('/')) {
          router.push(nextPath)
          return
        }

        // Redirect based on user role
        const role = result.user.role?.toUpperCase()
        if (role === 'VENDOR') {
          router.push('/vendor')
        } else if (role === 'ADMIN') {
          router.push('/admin')
        } else {
          router.push('/explore')
        }
      } else {
        setError(result.error || 'Google Sign-In failed.')
        setIsGoogleLoading(false)
      }
    } catch (err: any) {
      console.error('Google Sign-In handler error:', err)
      setError('An unexpected error occurred during Google Sign-In.')
      setIsGoogleLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    await performLogin(email, password)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetStatus('sending')
    setResetError(null)
    try {
      await authApi.forgotPassword(resetEmail)
      setResetStatus('sent')
    } catch (err: any) {
      console.error('Forgot password error:', err)
      setResetError(err?.response?.data?.error || 'Failed to send. Try again!')
      setResetStatus('error')
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-dvh bg-[#FFFBF0] bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px] flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob -z-10" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000 -z-10" />

      {/* Back button */}
      <div className="px-4 pt-3 pb-1 sm:px-6 sm:pt-5 sm:pb-2 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all text-sm">
          <ArrowLeft size={18} strokeWidth={3} />
          BACK TO HOME
        </Link>
      </div>

      {/* Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 pt-2 pb-5 sm:pt-3 sm:pb-6 relative z-10">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo and Heading */}
          <div className="text-center mb-3 sm:mb-5">
            <motion.div
              className="flex justify-center mb-2 sm:mb-3 transform hover:scale-110 transition-transform duration-300"
              whileHover={{ rotate: [0, -10, 10, 0] }}
            >
              <Logo />
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="mb-3 inline-flex items-center gap-2 rounded-full border-4 border-black bg-white px-3 py-1.5 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <ShieldCheck className="size-4" strokeWidth={3} />
              Cookie-Secure Access
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-[2rem] sm:text-4xl md:text-5xl font-black mb-2 text-black tracking-tight">
              {showForgotPassword ? 'RESET PASSWORD' : 'WELCOME BACK!'}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-sm sm:text-lg font-bold text-gray-700">
              {showForgotPassword
                ? 'Don\'t worry, we\'ll get you back in!'
                : 'Sign in and get straight back to your saved bites.'}
            </motion.p>
          </div>

          {showForgotPassword ? (
            /* Forgot Password Form */
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleForgotPassword}
              className="bg-white rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 sm:p-8 border-4 border-black relative overflow-hidden"
            >
              {resetStatus === 'sent' ? (
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full border-4 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Mail size={26} strokeWidth={3} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl sm:text-2xl font-black text-black">CHECK YOUR EMAIL</h3>
                    <p className="text-sm sm:text-base text-gray-600 font-medium">
                      We sent a recovery link to <span className="font-bold text-black bg-yellow-200 px-1">{resetEmail}</span>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-4 h-14 rounded-xl border-4 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetStatus('idle')
                      setResetEmail('')
                      setResetError(null)
                    }}
                  >
                    BACK TO LOGIN
                  </Button>
                </div>
              ) : (
                <>
                  {resetStatus === 'error' && (
                    <div className="bg-red-100 border-4 border-black text-black px-4 py-3 rounded-xl font-bold flex items-center gap-2 mb-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full border border-black" />
                      {resetError || 'Failed to send. Try again!'}
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="block text-sm font-black text-black uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black transition-colors size-6" strokeWidth={2.5} />
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-12 pr-4 py-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-400"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={resetStatus === 'sending'}
                    className="w-full mt-6 h-14 bg-black text-white rounded-xl border-4 border-black font-black text-xl shadow-[4px_4px_0px_0px_#fbbf24] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#fbbf24] transition-all disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {resetStatus === 'sending' ? 'SENDING...' : 'SEND RESET LINK'}
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetError(null)
                    }}
                    className="w-full mt-4 text-sm font-bold text-gray-500 hover:text-black hover:underline transition-colors uppercase tracking-wide"
                  >
                    Cancel
                  </button>
                </>
              )}
            </motion.form>
          ) : (
            /* Login Form */
            <motion.form
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleSignIn}
              className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-7 border-3 sm:border-4 border-black relative overflow-hidden"
            >
              <div className="mb-3 rounded-xl border-3 border-black bg-[#FFF5D8] px-3.5 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                <Cookie className="size-4 shrink-0 text-amber-600" strokeWidth={3} />
                <p className="text-[10px] sm:text-xs font-bold text-gray-700 leading-tight">
                  StreetBite uses 1 secure session cookie to keep you signed in.
                </p>
              </div>

              {error && !isCookieIssue && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border-3 sm:border-4 border-black text-black px-3 py-2 rounded-xl font-bold flex items-center gap-2 mb-4 text-xs sm:text-sm animate-shake"
                >
                  <div className="w-3.5 h-3.5 bg-red-500 rounded-full border border-black flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {isCookieIssue && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl border-3 sm:border-4 border-black bg-yellow-100 px-3.5 py-3 text-xs sm:text-sm font-bold text-black"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-black bg-white">
                      <Cookie className="size-3.5" strokeWidth={2.8} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black">Allow Cookies To Sign In</p>
                      <p className="mt-0.5 text-xs sm:text-sm font-bold leading-relaxed text-black">
                        Your browser blocked the StreetBite session cookie. Allow cookies for this site, then try again.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => setShowCookieHelp((current) => !current)}
                      className="inline-flex items-center justify-center rounded-lg border-3 border-black bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5"
                    >
                      {showCookieHelp ? 'Hide Steps' : 'How To Allow'}
                    </button>
                    <button
                      type="button"
                      onClick={() => performLogin(email, password)}
                      disabled={isLoading || !email || !password}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border-3 border-black bg-orange-500 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCcw className="size-3" strokeWidth={2.8} />
                      Try Again
                    </button>
                  </div>

                  {showCookieHelp && (
                    <div className="mt-3 rounded-lg border-3 border-black bg-white p-3 text-xs font-bold leading-normal text-black">
                      <p className="font-black uppercase tracking-[0.18em] text-gray-500">Quick Fix</p>
                      <p className="mt-1">Chrome/Edge: click the lock icon near address bar and enable cookies.</p>
                      <p>Brave: disable Shields for StreetBite, then refresh.</p>
                      <p className="mt-1 text-gray-600 text-[10px]">
                        Press <span className="text-black font-black">Try Again</span> after enabling.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {error?.toLowerCase().includes('verify your email') && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl border-3 sm:border-4 border-black bg-yellow-100 px-3 py-2.5 text-xs sm:text-sm font-bold text-black"
                >
                  Your account needs email verification first. Complete it from the signup page.
                </motion.div>
              )}

              {/* Google Sign In Button */}
              <motion.div variants={itemVariants} className="mb-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-11 sm:h-14 bg-white hover:bg-yellow-50 text-black rounded-lg sm:rounded-xl border-3 sm:border-4 border-black font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isGoogleLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-4.5 w-4.5 border-3 border-black border-t-transparent" />
                      CONNECTING...
                    </span>
                  ) : (
                    <>
                      <svg className="h-4.5 w-4.5 shrink-0" viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      CONTINUE WITH GOOGLE
                    </>
                  )}
                </button>
              </motion.div>

              {/* Neo-brutalist OR Divider */}
              <motion.div variants={itemVariants} className="flex items-center gap-2.5 my-3">
                <div className="flex-1 h-0.5 bg-black" />
                <span className="text-[10px] text-black font-black uppercase tracking-wider bg-[#FFF5D8] px-2 py-0.5 border-2 border-black rounded-md shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">OR</span>
                <div className="flex-1 h-0.5 bg-black" />
              </motion.div>

              {/* Email Input */}
              <motion.div variants={itemVariants} className="space-y-1.5 mb-3.5">
                <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black transition-colors size-5" strokeWidth={2.5} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-2.5 sm:py-3.5 border-3 sm:border-4 border-black rounded-lg sm:rounded-xl text-sm sm:text-base font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants} className="space-y-1.5 mb-4.5">
                <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black transition-colors size-5" strokeWidth={2.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-11 pr-11 py-2.5 sm:py-3.5 border-3 sm:border-4 border-black rounded-lg sm:rounded-xl text-sm sm:text-base font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-bold text-gray-500 hover:text-black hover:underline transition-all"
                  >
                    FORGOT PASSWORD?
                  </button>
                </div>
              </motion.div>

              {/* Sign In Button */}
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 sm:h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl border-3 sm:border-4 border-black font-black text-base sm:text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin rounded-full h-5 w-5 border-3 border-white border-t-transparent" />
                      COOKING...
                    </span>
                  ) : (
                    'LET\'S EAT!'
                  )}
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="flex items-center gap-2.5 my-3.5">
                <div className="flex-1 h-0.5 bg-gray-200" />
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">NEW HERE?</span>
                <div className="flex-1 h-0.5 bg-gray-200" />
              </motion.div>

              {/* Sign Up Link */}
              <motion.p variants={itemVariants} className="text-center text-sm sm:text-base font-bold text-gray-600">
                New to StreetBite?{' '}
                <Link href="/signup" className="text-black font-black decoration-2 underline decoration-yellow-400 hover:bg-yellow-400 transition-colors px-1">
                  CREATE ACCOUNT
                </Link>
              </motion.p>
            </motion.form>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFBF0]" />}>
      <SignInContent />
    </Suspense>
  )
}
