  'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { registerUser, type RegisterRequest } from '@/lib/api'
import { useUserLocation } from '@/lib/useUserLocation'
import { createUserWithEmailAndPassword, getAuthInstance } from '@/lib/firebase'

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
  const { location } = useUserLocation()

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
      // Step 1: Get auth instance and create Firebase Auth user
      const authInstance = getAuthInstance()
      const userCredential = await createUserWithEmailAndPassword(
        authInstance,
        formData.email,
        formData.password
      )
      
      // Step 2: Create user profile in backend/Firestore
      const registerData: RegisterRequest = {
        email: formData.email,
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        role: userType === 'vendor' ? 'VENDOR' : 'CUSTOMER',
        businessName: formData.businessName,
        location: location ? {
          latitude: location.lat,
          longitude: location.lng,
        } : undefined,
      }

      const response = await registerUser(registerData)
      
      // Step 3: Store user info in localStorage
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

      // Redirect based on user type
      if (userType === 'vendor') {
        router.push('/vendor')
      } else {
        router.push('/explore')
      }
    } catch (err: any) {
      console.error('Registration error:', err)
      let errorMessage = 'Registration failed. Please try again.'
      
      if (err.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase Auth is not configured. Please enable Email/Password authentication in Firebase Console.'
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please sign in instead.'
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.'
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.'
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

      {/* Sign Up Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Logo and Heading */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Join StreetBite</h1>
            <p className="text-muted-foreground">Choose your account type to get started</p>
          </div>

          {/* Step 1: User Type Selection */}
          {step === 1 && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Card */}
              <div
                onClick={() => setUserType('customer')}
                className={`p-8 rounded-3xl border-2 cursor-pointer transition-all hover:-translate-y-1 ${
                  userType === 'customer'
                    ? 'border-primary glass shadow-xl shadow-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="text-5xl mb-4">🍔</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Customer</h2>
                <p className="text-muted-foreground mb-6">Discover delicious street food vendors near you, place orders, and enjoy amazing meals</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Search vendors by location</div>
                  <div>✓ Browse menus and reviews</div>
                  <div>✓ Track orders in real-time</div>
                </div>
              </div>

              {/* Vendor Card */}
              <div
                onClick={() => setUserType('vendor')}
                className={`p-8 rounded-3xl border-2 cursor-pointer transition-all hover:-translate-y-1 ${
                  userType === 'vendor'
                    ? 'border-primary glass shadow-xl shadow-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="text-5xl mb-4">👨‍🍳</div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Vendor</h2>
                <p className="text-muted-foreground mb-6">Register your food stand, manage your menu, and reach more customers through our platform</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>✓ Create your vendor profile</div>
                  <div>✓ Manage menu and pricing</div>
                  <div>✓ Track location and orders</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Registration Form */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="glass rounded-3xl shadow-xl p-8 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                <input
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50"
                />
              </div>

              {userType === 'vendor' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Business Name</label>
                  <input
                    type="text"
                    placeholder="Your food stand name"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white/50"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                  className="flex-1 rounded-full"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 rounded-full bg-primary hover:bg-primary/90 text-white font-medium disabled:opacity-50 shadow-lg shadow-primary/25"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>

              <p className="text-center text-sm text-foreground/60">
                Already have an account?{' '}
                <Link href="/signin" className="text-primary hover:text-primary/80 font-semibold">
                  Sign In
                </Link>
              </p>
            </form>
          )}

          {/* Continue Button for Step 1 */}
          {step === 1 && userType && (
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleContinue}
                className="rounded-full bg-primary hover:bg-primary/90 text-white font-medium px-8 py-3 flex items-center gap-2 shadow-lg shadow-primary/25 transition-all hover:scale-105"
              >
                Continue
                <ChevronRight size={20} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
