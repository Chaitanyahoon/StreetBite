'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Mail, Lock, ArrowLeft, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Forgot Password State
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const performLogin = async (emailInput: string, passwordInput: string) => {
    setIsLoading(true)
    setError(null)

    const result = await login(emailInput, passwordInput)

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
        router.push('/community')
      }
    } else {
      setError(result.error || 'Login failed.')
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
      console.error('Forgot password error:', err)
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
      <div className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-3 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all text-sm sm:text-base">
          <ArrowLeft size={20} strokeWidth={3} />
          BACK TO HOME
        </Link>
      </div>

      {/* Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-4 sm:py-6 relative z-10">
        <motion.div
          className="w-full max-w-md"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Logo and Heading */}
          <div className="text-center mb-5 sm:mb-7">
            <motion.div
              className="flex justify-center mb-4 sm:mb-5 transform hover:scale-110 transition-transform duration-300"
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
            <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 text-black tracking-tight">
              {showForgotPassword ? 'RESET PASSWORD' : 'WELCOME BACK!'}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg sm:text-xl font-bold text-gray-700">
              {showForgotPassword
                ? 'Don\'t worry, we\'ll get you back in!'
                : 'Ready to satisfy those cravings?'}
            </motion.p>
            {!showForgotPassword && (
              <motion.p variants={itemVariants} className="mt-2 text-[11px] sm:text-sm font-bold uppercase tracking-[0.2em] text-gray-500">
                Sign in with the account you already use on StreetBite
              </motion.p>
            )}
          </div>

          {showForgotPassword ? (
            /* Forgot Password Form */
            <motion.form
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onSubmit={handleForgotPassword}
              className="bg-white rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 border-4 border-black relative overflow-hidden"
            >
              {resetStatus === 'sent' ? (
                <div className="text-center space-y-6">
                  <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full border-4 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Mail size={32} strokeWidth={3} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-black">CHECK YOUR EMAIL</h3>
                    <p className="text-gray-600 font-medium">
                      We sent a recovery link to <br /><span className="font-bold text-black bg-yellow-200 px-1">{resetEmail}</span>
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
                      Failed to send. Try again!
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
                    onClick={() => setShowForgotPassword(false)}
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
              className="bg-white rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 sm:p-8 border-4 border-black relative overflow-hidden"
            >
              <div className="mb-5 rounded-[1.5rem] border-4 border-black bg-[#FFF5D8] p-4 sm:p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Email + Password</p>
                    <h2 className="mt-2 text-xl sm:text-2xl font-black uppercase text-black">Jump Back In Fast</h2>
                  </div>
                  <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl border-4 border-black bg-white">
                    <Sparkles className="size-6 sm:size-7 text-orange-500" strokeWidth={2.8} />
                  </div>
                </div>
                <p className="mt-2 text-xs sm:text-sm font-bold text-gray-700">
                  Your session is verified from the backend, so make sure cookies are enabled before signing in.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-100 border-4 border-black text-black px-4 py-3 rounded-xl font-bold flex items-center gap-3 mb-6 animate-shake"
                >
                  <div className="w-4 h-4 bg-red-500 rounded-full border border-black flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {error?.toLowerCase().includes('cookie') && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-xl border-4 border-black bg-yellow-100 px-4 py-4 text-sm font-bold text-black"
                >
                  Enable cookies for `streetbitego.vercel.app` and `streetbite.onrender.com`, then try signing in again.
                </motion.div>
              )}

              {error?.toLowerCase().includes('verify your email') && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-xl border-4 border-black bg-yellow-100 px-4 py-4 text-sm font-bold text-black"
                >
                  Your account needs email verification first. Complete it from the signup page.
                </motion.div>
              )}

              {/* Email Input */}
              <motion.div variants={itemVariants} className="space-y-4 mb-6">
                <label className="block text-sm font-black text-black uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-black transition-colors size-6" strokeWidth={2.5} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-14 pr-4 py-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-400"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Input */}
              <motion.div variants={itemVariants} className="space-y-4 mb-8">
                <label className="block text-sm font-black text-black uppercase tracking-wider ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-black transition-colors size-6" strokeWidth={2.5} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-14 pr-14 py-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm font-bold text-gray-500 hover:text-black hover:underline transition-all"
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
                  className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-xl border-4 border-black font-black text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-3">
                      <span className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                      COOKING...
                    </span>
                  ) : (
                    'LET\'S EAT!'
                  )}
                </Button>
              </motion.div>

              {/* Divider */}
              <motion.div variants={itemVariants} className="flex items-center gap-3 my-8">
                <div className="flex-1 h-1 bg-gray-200 rounded-full" />
                <span className="text-xs text-gray-400 font-black uppercase tracking-widest">NEW HERE?</span>
                <div className="flex-1 h-1 bg-gray-200 rounded-full" />
              </motion.div>

              {/* Sign Up Link */}
              <motion.p variants={itemVariants} className="text-center text-lg font-medium text-gray-600">
                New to StreetBite?{' '}
                <Link href="/signup" className="text-black font-black decoration-4 underline decoration-yellow-400 hover:bg-yellow-400 transition-colors px-1">
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
