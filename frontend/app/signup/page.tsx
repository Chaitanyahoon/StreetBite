'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react'
import { authApi } from '@/lib/api'
import { useUserLocation } from '@/lib/useUserLocation'

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
      console.error('Registration error:', err)

      // Handle User Already Exists (409)
      if (err.response?.status === 409 || err.message?.includes('409')) {
        setShowUserExistsModal(true)
        setIsLoading(false)
        return
      }

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
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-float -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '2s' }} />

      {/* User Exists Modal */}
      {showUserExistsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-card p-8 rounded-3xl shadow-2xl max-w-md w-full mx-4 text-center animate-scale-in border border-primary/20">
            <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={40} />
            </div>
            <h3 className="text-2xl font-bold mb-2">Account Already Exists</h3>
            <p className="text-muted-foreground mb-8">
              It looks like <strong>{formData.email}</strong> is already registered with us. Would you like to sign in instead?
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/signin">
                <Button className="w-full btn-gradient h-12 rounded-xl text-lg font-semibold shadow-lg hover-lift">
                  Sign In
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => setShowUserExistsModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="p-4 sm:p-6 relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors hover-lift">
          <ArrowLeft size={20} />
          Back to Home
        </Link>
      </div>

      {/* Sign Up Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-2xl animate-slide-up">
          {/* Logo and Heading */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4 hover-lift">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="text-shine-amber">Join StreetBite</span>
            </h1>
            <p className="text-muted-foreground">Choose your account type to get started</p>
          </div>

          {/* Step 1: User Type Selection */}
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Card */}
              <div
                onClick={() => setUserType('customer')}
                className={`p-8 rounded-3xl border-2 cursor-pointer transition-all card-tilt ${userType === 'customer'
                  ? 'border-primary glass shadow-xl shadow-primary/10 scale-105'
                  : 'border-border bg-card/80 hover:border-primary/50 hover:shadow-lg'
                  }`}
              >
                <div className="text-5xl mb-4 animate-bounce" style={{ animationDuration: '3s' }}>🍔</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Customer</h2>
                <p className="text-muted-foreground mb-6">Discover delicious street food vendors near you, place orders, and enjoy amazing meals</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Search vendors by location</div>
                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Browse menus and reviews</div>
                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Track orders in real-time</div>
                </div>
              </div>

              {/* Vendor Card */}
              <div
                onClick={() => setUserType('vendor')}
                className={`p-8 rounded-3xl border-2 cursor-pointer transition-all card-tilt ${userType === 'vendor'
                  ? 'border-primary glass shadow-xl shadow-primary/10 scale-105'
                  : 'border-border bg-card/80 hover:border-primary/50 hover:shadow-lg'
                  }`}
              >
                <div className="text-5xl mb-4 animate-bounce" style={{ animationDuration: '3s', animationDelay: '0.5s' }}>👨‍🍳</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Vendor</h2>
                <p className="text-muted-foreground mb-6">Register your food stand, manage your menu, and reach more customers through our platform</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Create your vendor profile</div>
                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Manage menu and pricing</div>
                  <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Track location and orders</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="glass rounded-3xl shadow-elevated p-8 space-y-6 border border-white/20 animate-fade-in">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground ml-1">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 border-2 border-primary/10 rounded-xl focus:outline-none focus:border-primary bg-white/50 transition-all hover:bg-white/80"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground ml-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full px-4 py-3.5 border-2 border-primary/10 rounded-xl focus:outline-none focus:border-primary bg-white/50 transition-all hover:bg-white/80"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground ml-1">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 border-2 border-primary/10 rounded-xl focus:outline-none focus:border-primary bg-white/50 transition-all hover:bg-white/80"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground ml-1">Password</label>
                <input
                  type="password"
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

                    // Common password check
                    const common = ['password', '123456', 'qwerty', 'streetbite', '12345678']
                    if (common.some(c => newPass.toLowerCase().includes(c))) score = 0

                    setPasswordStrength(score)
                  }}
                  required
                  minLength={8}
                  className="w-full px-4 py-3.5 border-2 border-primary/10 rounded-xl focus:outline-none focus:border-primary bg-white/50 transition-all hover:bg-white/80"
                />

                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-all duration-300 ${passwordStrength >= level
                            ? (passwordStrength <= 2 ? 'bg-red-500' : passwordStrength <= 3 ? 'bg-yellow-500' : 'bg-green-500')
                            : 'bg-gray-200'
                            }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs text-right font-medium ${passwordStrength <= 2 ? 'text-red-500' : passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                      {passwordStrength <= 2 ? 'Weak' : passwordStrength <= 3 ? 'Medium' : 'Strong'}
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-0.5 pl-1">
                      <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>• At least 8 characters</li>
                      <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>• One uppercase letter</li>
                      <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>• One number</li>
                      <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-600' : ''}>• One special character</li>
                    </ul>
                  </div>
                )}
              </div>

              {userType === 'vendor' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground ml-1">Business Name</label>
                  <input
                    type="text"
                    placeholder="Your food stand name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3.5 border-2 border-primary/10 rounded-xl focus:outline-none focus:border-primary bg-white/50 transition-all hover:bg-white/80"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="flex-1 rounded-xl h-12 border-2 hover:bg-muted"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-gradient h-12 rounded-xl text-lg font-semibold shadow-lg hover-lift hover-glow disabled:opacity-50"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>

              <p className="text-center text-sm text-foreground/60">
                Already have an account?{' '}
                <Link href="/signin" className="text-primary hover:text-primary/80 font-bold hover:underline decoration-2 underline-offset-4">
                  Sign In
                </Link>
              </p>
            </form>
          )}

          {/* Continue Button for Step 1 */}
          {step === 1 && userType && (
            <div className="mt-8 flex justify-center animate-fade-in">
              <Button
                onClick={handleContinue}
                className="btn-gradient rounded-full px-10 py-6 text-lg font-bold flex items-center gap-2 shadow-lg hover-lift hover-glow"
              >
                Continue
                <ChevronRight size={24} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
