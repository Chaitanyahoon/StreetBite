'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronRight, Sparkles, Eye, EyeOff, UtensilsCrossed, Store, MapPin, ShieldCheck, Mail } from 'lucide-react'
import { authApi, type RegisterRequest } from '@/lib/api'
import { useUserLocation } from '@/lib/useUserLocation'
import { useAuth } from '@/context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

export default function SignUpPage() {
  const router = useRouter()
  const { refreshUser, loginWithGoogle } = useAuth()
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<'customer' | 'vendor' | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null)
  const { location } = useUserLocation()

  const [showUserExistsModal, setShowUserExistsModal] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const verify = params.get('verify')
    if (verify) {
      setStep(3)
      setVerificationEmail(verify.toLowerCase())
    }
    const errorParam = params.get('error')
    if (errorParam === 'google_not_registered') {
      setError('No StreetBite account found with that Google email. Please select your role and sign up below.')
    }
  }, [])

  const handleGoogleSignUp = async () => {
    if (userType === 'vendor' && !formData.businessName.trim()) {
      setError('Please enter your Business Name before signing up with Google.')
      return
    }
    setIsGoogleLoading(true)
    setError(null)
    try {
      const role = userType === 'vendor' ? 'VENDOR' : 'USER'
      const businessName = userType === 'vendor' ? formData.businessName : undefined
      const result = await loginWithGoogle(role, businessName)
      if (result.success) {
        if (result.redirecting) {
          return
        }
        if (result.user) {
          const role = result.user.role?.toUpperCase()
          router.push(role === 'VENDOR' ? '/vendor' : role === 'ADMIN' ? '/admin' : '/community')
        }
      } else {
        setError(result.error || 'Google Sign-Up failed.')
        setIsGoogleLoading(false)
      }
    } catch (err: any) {
      console.error('Google Sign-Up error:', err)
      setError('An unexpected error occurred during Google Sign-Up.')
      setIsGoogleLoading(false)
    }
  }

  const handleContinue = () => {
    if (step === 1 && userType) {
      setStep(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Direct backend registration (no Firebase)
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        role: userType === 'vendor' ? 'VENDOR' : 'USER',
        businessName: formData.businessName,
        location: location ? {
          latitude: location.lat,
          longitude: location.lng,
        } : undefined,
      }

      const response = await authApi.register(registerData)
      if (response.requiresEmailVerification) {
        setVerificationEmail(response.email || formData.email)
        setVerificationCode('')
        setVerificationMessage('We sent a 6-digit verification code to your email.')
        setStep(3)
        setIsLoading(false)
        return
      }
    } catch (err: any) {
      // Handle User Already Exists (409) - Check this FIRST and don't log as error
      if (err.response?.status === 409 || err.message?.includes('409')) {
        setShowUserExistsModal(true)
        setIsLoading(false)
        return
      }

      console.error('Registration error:', err)

      let errorMessage = 'Registration failed. Please try again.'

      if (err.response?.data?.error) {
        errorMessage = err.response.data.error
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setIsLoading(false)
    }
  }

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setVerificationMessage(null)

    try {
      const response = await authApi.verifyEmail({ email: verificationEmail, code: verificationCode })
      await refreshUser()

      const role = response.user?.role?.toUpperCase()
      router.push(role === 'VENDOR' ? '/vendor' : role === 'ADMIN' ? '/admin' : '/community')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.')
      setIsLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await authApi.resendVerification(verificationEmail)
      setVerificationMessage(response.message || 'Verification code sent again.')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend verification code.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-[#FFFBF0] bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px] flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-yellow-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob -z-10" />
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-200/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000 -z-10" />

      {/* User Exists Modal */}
      <AnimatePresence>
        {showUserExistsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-[2rem] border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] max-w-md w-full mx-4 text-center"
            >
              <div className="w-20 h-20 bg-yellow-400 text-black border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles size={40} className="animate-spin-slow" />
              </div>
              <h3 className="text-3xl font-black mb-2 uppercase">Already Loaded?</h3>
              <p className="text-gray-600 mb-8 font-medium text-lg">
                The email <strong>{formData.email}</strong> is already satisfying cravings here.
              </p>
              <div className="flex flex-col gap-4">
                <Link href="/signin">
                  <Button className="w-full h-14 bg-black text-white rounded-xl border-4 border-black font-black text-xl shadow-[4px_4px_0px_0px_#fbbf24] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#fbbf24] transition-all">
                    LOG IN NOW
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => setShowUserExistsModal(false)}
                  className="text-gray-500 font-bold hover:text-black uppercase tracking-wide hover:bg-transparent"
                >
                  Let me try again
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Back button */}
      <div className="px-3 pt-2.5 pb-0.5 sm:px-6 sm:pt-5 sm:pb-2 relative z-10">
        <Link href="/" className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-white text-black font-black border-3 sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all text-xs sm:text-sm">
          <ArrowLeft size={16} strokeWidth={3} />
          BACK TO HOME
        </Link>
      </div>

      {/* Sign Up Form */}
      <div className="flex-1 flex items-center justify-center px-3 pt-1 pb-4 sm:pt-3 sm:pb-6 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Logo and Heading */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-3 sm:mb-5"
          >
            <motion.div
              className="flex justify-center mb-1.5 sm:mb-3 transform"
              whileHover={{ rotate: [0, -10, 10, 0] }}
            >
              <Logo />
            </motion.div>
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border-3 sm:border-4 border-black bg-white px-2.5 py-1 text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ShieldCheck className="size-3.5" strokeWidth={3} />
              Quick Secure Setup
            </div>
            <h1 className="text-[2.5rem] xs:text-[3rem] sm:text-4xl md:text-5xl font-black mb-1 sm:mb-2 text-black tracking-[-0.05em] uppercase leading-[1]">
              Join the Feast
            </h1>
            <p className="text-xs sm:text-lg font-bold text-gray-700">Create your account and get into StreetBite fast.</p>
            <p className="mt-1.5 text-[9px] sm:text-sm font-bold uppercase tracking-[0.2em] text-gray-500 hidden xs:block">
              Pick your role, enter the basics, verify once
            </p>
          </motion.div>

          {error && step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-100 border-3 sm:border-4 border-black text-black px-3.5 py-2.5 rounded-xl font-bold flex items-center gap-2.5 mb-4 text-xs sm:text-sm relative z-10 animate-shake"
            >
              <div className="w-3.5 h-3.5 bg-red-500 rounded-full border border-black flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="grid grid-cols-2 gap-2.5 sm:gap-4"
              >
                {/* Customer Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserType('customer')}
                    className={`p-3 sm:p-5 rounded-[1.25rem] sm:rounded-[2rem] border-3 sm:border-4 cursor-pointer transition-all ${userType === 'customer'
                    ? 'bg-yellow-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10'
                    : 'bg-white border-black hover:bg-yellow-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                >
                  <div className="mb-2 flex size-10 sm:size-14 items-center justify-center rounded-lg sm:rounded-[1rem] border-3 sm:border-4 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <UtensilsCrossed className="size-5 sm:size-7 text-orange-500" strokeWidth={2.7} />
                  </div>
                  <p className="mb-1.5 sm:mb-3 inline-flex rounded-full border-2 border-black bg-white px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-gray-600">Customer</p>
                  <h2 className="text-base sm:text-2xl font-black text-black mb-1 sm:mb-2 uppercase">Foodie</h2>
                  <p className="text-gray-700 font-medium mb-1 sm:mb-3 leading-tight sm:leading-relaxed text-[11px] sm:text-base line-clamp-2 sm:line-clamp-none">Save favorite vendors, track offers, and discover what is nearby.</p>
                  <div className="hidden sm:block space-y-1.5 font-bold text-xs sm:text-sm text-black/80">
                    <div>Save favorites</div>
                    <div>Join community posts</div>
                    <div>Track live vendors</div>
                  </div>
                </motion.div>

                {/* Vendor Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserType('vendor')}
                    className={`p-3 sm:p-5 rounded-[1.25rem] sm:rounded-[2rem] border-3 sm:border-4 cursor-pointer transition-all ${userType === 'vendor'
                    ? 'bg-orange-500 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10'
                    : 'bg-white border-black hover:bg-orange-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                >
                  <div className="mb-2 flex size-10 sm:size-14 items-center justify-center rounded-lg sm:rounded-[1rem] border-3 sm:border-4 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Store className="size-5 sm:size-7 text-orange-500" strokeWidth={2.7} />
                  </div>
                  <p className="mb-1.5 sm:mb-3 inline-flex rounded-full border-2 border-black bg-white px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-gray-600">Vendor</p>
                  <h2 className="text-base sm:text-2xl font-black text-black mb-1 sm:mb-2 uppercase">Vendor</h2>
                  <p className="text-black/80 font-medium mb-1 sm:mb-3 leading-tight sm:leading-relaxed text-[11px] sm:text-base line-clamp-2 sm:line-clamp-none">Launch your stall profile, publish offers, and manage your dashboard.</p>
                  <div className="hidden sm:block space-y-1.5 font-bold text-xs sm:text-sm text-black/80">
                    <div>Vendor dashboard</div>
                    <div>Menu and offer control</div>
                    <div>Location visibility</div>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Step 2: Registration Form */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                onSubmit={handleSubmit}
                className="bg-white rounded-[1.25rem] sm:rounded-[2rem] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-7 md:p-8 space-y-3 sm:space-y-4 border-3 sm:border-4 border-black relative overflow-hidden"
              >
                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-bl-[100%] z-0 opacity-20"></div>

                <div className="relative z-10 rounded-xl border-3 sm:border-4 border-black bg-[#FFF5D8] p-3 sm:p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Account Setup</p>
                      <h2 className="mt-1 text-base sm:text-2xl font-black uppercase text-black">
                        {userType === 'vendor' ? 'Launch Your Vendor Profile' : 'Build Your Foodie Profile'}
                      </h2>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border-3 sm:border-4 border-black bg-white px-2.5 py-1 sm:px-4 sm:py-2 text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-black">
                      {location ? <MapPin className="size-3.5" strokeWidth={3} /> : <Sparkles className="size-3.5" strokeWidth={3} />}
                      {location ? 'City picked up' : 'City optional'}
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] sm:text-sm font-bold text-gray-700 hidden xs:block">
                    Add the basics now. You can finish the rest after you sign in.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-100 border-3 sm:border-4 border-black text-black px-3 py-2 rounded-xl font-bold flex items-center gap-2 mb-3 text-xs sm:text-sm relative z-10 animate-shake">
                    <div className="w-3.5 h-3.5 bg-red-500 rounded-full border border-black flex-shrink-0" />
                    {error}
                  </div>
                )}

                {userType === 'vendor' && (
                  <div className="space-y-1 relative z-10">
                    <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wider ml-1">Business Name</label>
                    <input
                      type="text"
                      placeholder="YOUR FOOD STAND NAME"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      required={userType === 'vendor'}
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 border-3 sm:border-4 border-black rounded-lg sm:rounded-xl text-sm sm:text-base font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-300 uppercase"
                    />
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gray-500 hidden xs:block">You must enter your stall name before choosing a sign up method.</p>
                  </div>
                )}

                {/* Google Sign Up Button */}
                <div className="relative z-10">
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
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
                </div>

                {/* Neo-brutalist OR Divider */}
                <div className="flex items-center gap-2.5 my-3 relative z-10">
                  <div className="flex-1 h-0.5 bg-black" />
                  <span className="text-[10px] text-black font-black uppercase tracking-wider bg-[#FFF5D8] px-2 py-0.5 border-2 border-black rounded-md shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">OR</span>
                  <div className="flex-1 h-0.5 bg-black" />
                </div>

                <div className="grid md:grid-cols-2 gap-3 sm:gap-4 relative z-10">
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wider ml-1">First Name</label>
                    <input
                      type="text"
                      placeholder="JOHN"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 border-3 sm:border-4 border-black rounded-lg sm:rounded-xl text-sm sm:text-base font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-300 uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wider ml-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="DOE"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 border-3 sm:border-4 border-black rounded-lg sm:rounded-xl text-sm sm:text-base font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-300 uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-1 relative z-10">
                  <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wider ml-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                    required
                    autoComplete="username"
                    className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 border-3 sm:border-4 border-black rounded-lg sm:rounded-xl text-sm sm:text-base font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-300 lowercase"
                  />
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gray-500 hidden xs:block">Use the email you want to keep on this account.</p>
                </div>

                <div className="space-y-1 relative z-10">
                  <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wider ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => {
                        const newPass = e.target.value
                        setFormData({ ...formData, password: newPass })

                        // Password Strength Logic
                        let score = 0
                        if (newPass.length >= 8) score++
                        if (/[A-Z]/.test(newPass)) score++
                        if (/[a-z]/.test(newPass)) score++
                        if (/[0-9]/.test(newPass)) score++
                        if (/[^A-Za-z0-9]/.test(newPass)) score++
                        const common = ['password', '123456', 'qwerty', 'streetbite', '12345678']
                        if (common.some(c => newPass.toLowerCase().includes(c))) score = 0
                        setPasswordStrength(score)
                      }}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3.5 pr-11 sm:pr-14 border-3 sm:border-4 border-black rounded-lg sm:rounded-xl text-sm sm:text-base font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors p-1"
                    >
                      {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="space-y-1.5 pt-1.5">
                      <div className="flex gap-1.5 h-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`flex-1 rounded-full border-2 border-black transition-all duration-300 ${passwordStrength >= level
                              ? (passwordStrength <= 2 ? 'bg-red-500' : passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500')
                              : 'bg-gray-200'
                              }`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] text-right font-black uppercase tracking-wider ${passwordStrength <= 2 ? 'text-red-600' : passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                        {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                      </p>
                    </div>
                  )}
                </div>



                <div className="flex flex-col-reverse gap-3 pt-2 sm:pt-4 relative z-10 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="flex-1 rounded-lg sm:rounded-xl h-11 sm:h-14 border-3 sm:border-4 border-black font-black text-sm sm:text-lg hover:bg-gray-100"
                  >
                    BACK
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl h-11 sm:h-14 border-3 sm:border-4 border-black font-black text-base sm:text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isLoading ? 'COOKING...' : 'CREATE ACCOUNT'}
                  </Button>
                </div>

                <p className="text-center text-sm sm:text-base font-bold text-gray-600 relative z-10">
                  Already part of the crew?{' '}
                  <Link href="/signin" className="text-black font-black decoration-2 underline decoration-yellow-400 hover:bg-yellow-400 transition-colors px-1">
                    SIGN IN
                  </Link>
                </p>
              </motion.form>
            )}

            {step === 3 && (
              <motion.form
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                onSubmit={handleVerifyEmail}
                className="bg-white rounded-[1.25rem] sm:rounded-[2rem] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-7 md:p-8 space-y-3 sm:space-y-4 border-3 sm:border-4 border-black relative overflow-hidden"
              >
                <div className="relative z-10 rounded-xl border-3 sm:border-4 border-black bg-[#FFF5D8] p-3 sm:p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-gray-500">Email Verification</p>
                      <h2 className="mt-1 text-base sm:text-2xl font-black uppercase text-black">Unlock Your Account</h2>
                    </div>
                    <div className="inline-flex items-center gap-1.5 rounded-full border-3 sm:border-4 border-black bg-white px-2.5 py-1 sm:px-4 sm:py-2 text-[9px] sm:text-xs font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] text-black">
                      <Mail className="size-3.5" strokeWidth={3} />
                      6-digit code
                    </div>
                  </div>
                  <p className="mt-1.5 text-[11px] sm:text-sm font-bold text-gray-700 break-all leading-normal">
                    Enter the 6-digit code sent to <span className="text-black">{verificationEmail}</span>.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-100 border-3 sm:border-4 border-black text-black px-3 py-2 rounded-xl font-bold flex items-center gap-2 text-xs sm:text-sm">
                    <div className="w-3.5 h-3.5 bg-red-500 rounded-full border border-black flex-shrink-0" />
                    {error}
                  </div>
                )}

                {verificationMessage && (
                  <div className="bg-yellow-100 border-3 sm:border-4 border-black text-black px-3 py-2 rounded-xl font-bold text-xs sm:text-sm">
                    {verificationMessage}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs sm:text-sm font-black text-black uppercase tracking-wider ml-1">Verification Code</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black size-5" strokeWidth={2.5} />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      className="w-full pl-11 pr-4 py-2.5 sm:pl-14 sm:py-3.5 border-3 sm:border-4 border-black rounded-lg sm:rounded-xl text-sm sm:text-lg font-bold tracking-[0.3em] sm:tracking-[0.35em] focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-300"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:pt-4 sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    disabled={isLoading}
                    className="flex-1 rounded-lg sm:rounded-xl h-11 sm:h-14 border-3 sm:border-4 border-black font-black text-sm sm:text-lg hover:bg-gray-100"
                  >
                    BACK
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white rounded-lg sm:rounded-xl h-11 sm:h-14 border-3 sm:border-4 border-black font-black text-base sm:text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isLoading ? 'VERIFYING...' : 'VERIFY ACCOUNT'}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResendVerification}
                  disabled={isLoading || !verificationEmail}
                  className="w-full text-xs sm:text-sm font-black uppercase tracking-wide hover:text-black hover:bg-transparent"
                >
                  Resend verification code
                </Button>
              </motion.form>
            )}

          </AnimatePresence>

          {/* Continue Button for Step 1 */}
          {step === 1 && userType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 sm:mt-6 flex justify-center"
            >
              <Button
                onClick={handleContinue}
                className="w-full max-w-xs sm:max-w-md bg-black text-white rounded-lg sm:rounded-full h-11 sm:h-16 px-6 py-3 text-sm sm:text-xl font-black flex items-center justify-center gap-2 sm:gap-3 shadow-[4px_4px_0px_0px_#fbbf24] sm:shadow-[8px_8px_0px_0px_#fbbf24] border-3 sm:border-4 border-black hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#fbbf24] sm:hover:shadow-[12px_12px_0px_0px_#fbbf24] transition-all"
              >
                CONTINUE
                <ChevronRight className="size-5 sm:size-6.5" strokeWidth={4} />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
