'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useUserLocation } from '@/lib/useUserLocation'

import { motion, AnimatePresence } from 'framer-motion'

export default function SignUpPage() {
  const router = useRouter()
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
  const [error, setError] = useState<string | null>(null)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { location } = useUserLocation()

  const [showUserExistsModal, setShowUserExistsModal] = useState(false)

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
      const registerData = {
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

      // Store JWT token and user info
      localStorage.setItem('token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      // Notify other components (Navbar) of the update
      window.dispatchEvent(new Event('user-updated'))

      // Redirect based on user type
      if (userType === 'vendor') {
        router.push('/vendor')
      } else {
        router.push('/explore')
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

  return (
    <div className="min-h-screen bg-[#FFFBF0] bg-[radial-gradient(#E5E7EB_1px,transparent_1px)] [background-size:24px_24px] flex flex-col relative overflow-hidden">
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
      <div className="p-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
          <ArrowLeft size={24} strokeWidth={3} />
          BACK TO HOME
        </Link>
      </div>

      {/* Sign Up Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-2xl">
          {/* Logo and Heading */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <motion.div
              className="flex justify-center mb-6 transform"
              whileHover={{ rotate: [0, -10, 10, 0] }}
            >
              <Logo />
            </motion.div>
            <h1 className="text-5xl font-black mb-4 text-black tracking-tight uppercase">
              Join the Feast
            </h1>
            <p className="text-xl font-bold text-gray-700">Choose your flavor to get started</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="grid md:grid-cols-2 gap-8"
              >
                {/* Customer Card */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserType('customer')}
                  className={`p-8 rounded-[2rem] border-4 cursor-pointer transition-all ${userType === 'customer'
                    ? 'bg-yellow-400 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10'
                    : 'bg-white border-black hover:bg-yellow-50 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                >
                  <div className="text-6xl mb-6 animate-bounce" style={{ animationDuration: '3s' }}>🍔</div>
                  <h2 className="text-3xl font-black text-black mb-2 uppercase">Foodie</h2>
                  <p className="text-gray-700 font-medium mb-6 leading-relaxed">Discover hidden gems, rate your bites, and follow your favorite trucks.</p>
                  <div className="space-y-3 font-bold text-sm text-black/80">
                    <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-black" /> Epic Food Discovery</div>
                    <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-black" /> Real-time Updates</div>
                    <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-black" /> Exclusive Deals</div>
                  </div>
                </motion.div>

                {/* Vendor Card */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserType('vendor')}
                  className={`p-8 rounded-[2rem] border-4 cursor-pointer transition-all ${userType === 'vendor'
                    ? 'bg-orange-500 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-10'
                    : 'bg-white border-black hover:bg-orange-50 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                    }`}
                >
                  <div className="text-6xl mb-6 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>👨‍🍳</div>
                  <h2 className="text-3xl font-black text-black mb-2 uppercase">Old Master</h2>
                  <p className="text-black/80 font-medium mb-6 leading-relaxed">Showcase your menu, manage orders, and feed the hungry masses.</p>
                  <div className="space-y-3 font-bold text-sm text-black/80">
                    <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-black" /> Build Your Brand</div>
                    <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-black" /> Live Location Tracking</div>
                    <div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-black" /> Grow Your Audience</div>
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
                className="bg-white rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 md:p-12 space-y-6 border-4 border-black relative overflow-hidden"
              >
                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400 rounded-bl-[100%] z-0 opacity-20"></div>

                {error && (
                  <div className="bg-red-100 border-4 border-black text-black px-4 py-3 rounded-xl font-bold flex items-center gap-3 relative z-10 animate-shake">
                    <div className="w-4 h-4 bg-red-500 rounded-full border border-black flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-black uppercase tracking-wider ml-1">First Name</label>
                    <input
                      type="text"
                      placeholder="JOHN"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                      className="w-full px-4 py-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-300 uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-black text-black uppercase tracking-wider ml-1">Last Name</label>
                    <input
                      type="text"
                      placeholder="DOE"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                      className="w-full px-4 py-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-300 uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-2 relative z-10">
                  <label className="block text-sm font-black text-black uppercase tracking-wider ml-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="YOU@EXAMPLE.COM"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-300 uppercase"
                  />
                </div>

                <div className="space-y-2 relative z-10">
                  <label className="block text-sm font-black text-black uppercase tracking-wider ml-1">Password</label>
                  <input
                    type="password"
                    placeholder="MAKE IT STRONG"
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
                    className="w-full px-4 py-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-300"
                  />

                  {/* Password Strength Meter */}
                  {formData.password && (
                    <div className="space-y-2 pt-2">
                      <div className="flex gap-2 h-3">
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
                      <p className={`text-xs text-right font-black uppercase tracking-wider ${passwordStrength <= 2 ? 'text-red-600' : passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                        {passwordStrength <= 2 ? 'Weak Sauce' : passwordStrength <= 3 ? 'Getting Spicy' : 'Fiery Hot!'}
                      </p>
                    </div>
                  )}
                </div>

                {userType === 'vendor' && (
                  <div className="space-y-2 relative z-10">
                    <label className="block text-sm font-black text-black uppercase tracking-wider ml-1">Business Name</label>
                    <input
                      type="text"
                      placeholder="YOUR FOOD STAND NAME"
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-4 py-4 border-4 border-black rounded-xl text-lg font-bold focus:outline-none focus:ring-4 focus:ring-yellow-400 bg-gray-50 transition-all placeholder:text-gray-300 uppercase"
                    />
                  </div>
                )}

                <div className="flex gap-4 pt-6 relative z-10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                    className="flex-1 rounded-xl h-14 border-4 border-black font-black text-lg hover:bg-gray-100"
                  >
                    BACK
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-14 border-4 border-black font-black text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                  >
                    {isLoading ? 'COOKING...' : 'CREATE ACCOUNT'}
                  </Button>
                </div>

                <p className="text-center text-lg font-medium text-gray-600 relative z-10">
                  Already part of the crew?{' '}
                  <Link href="/signin" className="text-black font-black decoration-4 underline decoration-yellow-400 hover:bg-yellow-400 transition-colors px-1">
                    SIGN IN
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Continue Button for Step 1 */}
          {step === 1 && userType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 flex justify-center"
            >
              <Button
                onClick={handleContinue}
                className="bg-black text-white rounded-full px-12 py-8 text-2xl font-black flex items-center gap-4 shadow-[8px_8px_0px_0px_#fbbf24] border-4 border-black hover:-translate-y-2 hover:shadow-[12px_12px_0px_0px_#fbbf24] transition-all"
              >
                CONTINUE
                <ChevronRight size={32} strokeWidth={4} />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
