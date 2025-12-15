'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, MapPin, Save, ArrowLeft, Upload, Trash2, X } from 'lucide-react'
import { userApi } from '@/lib/api'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import axios from 'axios'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8081/api';

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Password Reset State
  const [isResetOpen, setIsResetOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetStatus, setResetStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const [userData, setUserData] = useState({
    userId: '',
    email: '',
    displayName: '',
    phoneNumber: '',
    role: '',
    profilePicture: '',
  })

  useEffect(() => {
    // Load user data from localStorage
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      router.push('/signin')
      return
    }

    try {
      const user = JSON.parse(userStr)
      setUserData({
        userId: user.id || user.userId || '',
        email: user.email || '',
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role || 'CUSTOMER',
        profilePicture: user.profilePicture || '',
      })
      setResetEmail(user.email || '')
      setLoading(false)
    } catch (e) {
      console.error('Error parsing user data:', e)
      setError('Failed to load user data')
      setLoading(false)
    }
  }, [router])

  const handleSave = async () => {
    if (!userData.userId) {
      setError('User ID not found')
      return
    }

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const updateData = {
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        profilePicture: userData.profilePicture,
      }

      const response = await userApi.update(userData.userId, updateData)

      // Update localStorage with new data
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        profilePicture: userData.profilePicture,
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))

      // Dispatch custom event to update Navbar
      window.dispatchEvent(new Event('user-updated'))

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleForgotPassword = async () => {
    setResetStatus('sending')
    try {
      await axios.post(`${BACKEND_URL}/auth/forgot-password`, { email: resetEmail })
      setResetStatus('sent')
    } catch (err) {
      setResetStatus('error')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await axios.post(`${BACKEND_URL}/files/upload`, formData)

      const imageUrl = response.data.url
      setUserData({ ...userData, profilePicture: imageUrl })
    } catch (err) {
      console.error('Upload failed:', err)
      setError('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveProfilePicture = () => {
    setUserData({ ...userData, profilePicture: '' })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">Loading profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-20">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/explore" className="inline-flex items-center gap-2 text-black font-black hover:-translate-x-1 duration-200 mb-8 bg-white px-4 py-2 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 transition-all">
          <ArrowLeft size={20} />
          BACK TO EXPLORE
        </Link>

        {/* Profile Header */}
        <div className="mb-8 flex flex-col items-center">
          <div className="inline-block px-6 py-2 bg-yellow-300 border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform -rotate-1 mb-4">
            <span className="text-sm font-black uppercase tracking-widest text-black">Control Center</span>
          </div>
          <h1 className="text-5xl font-black text-black uppercase tracking-tighter drop-shadow-sm text-center">
            My Profile
          </h1>
          <p className="text-gray-600 mt-2 font-bold text-lg text-center max-w-md">
            Manage your personal data and customize your avatar
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 border-4 border-black text-black font-bold px-6 py-4 rounded-xl mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-black flex items-center justify-center text-white">✓</div>
            Profile updated successfully!
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-4 border-black text-black font-bold px-6 py-4 rounded-xl mb-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-black flex items-center justify-center text-white">!</div>
            {error}
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
          {/* Left Column: Avatar Selection */}
          <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden h-fit rounded-[2.5rem]">
            <div className="h-36 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-orange-400 border-b-4 border-black relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              {/* Decorative shapes */}
              <div className="absolute top-4 right-4 w-12 h-12 bg-yellow-300 rounded-full border-2 border-black"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 bg-white rounded-lg border-2 border-black transform rotate-12"></div>
            </div>
            <CardContent className="-mt-20 flex flex-col items-center pb-8 px-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"></div>
                <div className="relative w-44 h-44 rounded-full overflow-hidden border-4 border-black bg-white transform transition-transform duration-300">
                  {userData.profilePicture ? (
                    <img
                      src={(() => {
                        const path = userData.profilePicture;
                        if (path.startsWith('http')) return path;
                        if (path.startsWith('/avatars/')) return path;
                        const baseUrl = BACKEND_URL.replace(/\/api\/?$/, '');
                        return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
                      })()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/avatars/avatar_1.png'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                      <User size={64} />
                    </div>
                  )}

                  {/* Remove Button Overlay */}
                  {userData.profilePicture && (
                    <button
                      onClick={handleRemoveProfilePicture}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold tracking-widest uppercase hover:bg-black/70"
                      title="Remove Profile Picture"
                    >
                      <Trash2 size={32} className="mb-1" />
                    </button>
                  )}
                </div>
              </div>

              <h2 className="mt-6 text-3xl font-black text-black uppercase tracking-tight">{userData.displayName || 'User'}</h2>
              <div className="inline-block mt-2 px-3 py-1 bg-black text-white rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)]">
                <p className="text-xs font-bold uppercase tracking-widest">{userData.role}</p>
              </div>

              {/* Custom Upload Buttons */}
              <div className="flex gap-3 mb-8 w-full mt-8">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1 bg-white text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:bg-gray-50 h-12 rounded-xl"
                >
                  {uploading ? 'UPLOADING...' : (
                    <>
                      <Upload size={18} className="mr-2" />
                      UPLOAD PHOTO
                    </>
                  )}
                </Button>
                {userData.profilePicture && (
                  <Button
                    onClick={handleRemoveProfilePicture}
                    className="bg-red-500 text-white font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-0.5 hover:bg-red-600 h-12 w-12 px-0 rounded-xl"
                  >
                    <X size={20} />
                  </Button>
                )}
              </div>

              <div className="w-full border-t-4 border-black/10 pt-6">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-xl">👾</span>
                  <Label className="text-center block text-black font-black text-lg uppercase tracking-wide">Select Avatar</Label>
                  <span className="text-xl">👾</span>
                </div>
                <div className="grid grid-cols-4 gap-3 p-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <button
                      key={num}
                      onClick={() => setUserData({ ...userData, profilePicture: `/avatars/avatar_${num}.png` })}
                      className={`relative aspect-square rounded-xl overflow-hidden transition-all duration-200 border-2 ${userData.profilePicture === `/avatars/avatar_${num}.png`
                        ? 'border-black ring-4 ring-yellow-300 ring-offset-0 scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10'
                        : 'border-transparent hover:border-black hover:scale-110 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-70 hover:opacity-100 hover:z-10'
                        }`}
                    >
                      <img
                        src={`/avatars/avatar_${num}.png`}
                        alt={`Avatar ${num}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right Column: Form */}
          <Card className="border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white h-fit rounded-[2.5rem] relative overflow-hidden">
            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300 rounded-bl-[4rem] border-b-4 border-l-4 border-black -z-0"></div>

            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                <span className="bg-black text-white p-2 text-sm rounded-lg transform -rotate-3 border-2 border-black shadow-[2px_2px_0px_0px_rgba(100,100,100,1)]">ID CARD</span>
                Details
              </CardTitle>
              <CardDescription className="font-bold text-gray-500">Update your official contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6 relative z-10">
              {/* Email (Read-only) */}
              <div className="group">
                <Label htmlFor="email" className="flex items-center gap-2 text-black font-black uppercase text-xs tracking-wider mb-2">
                  <Mail size={16} />
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    disabled
                    className="bg-gray-100 border-2 border-black font-bold text-gray-500 rounded-xl h-12 focus-visible:ring-0 focus-visible:ring-offset-0 opacity-80"
                  />
                  <div className="absolute right-3 top-3 text-xs font-black bg-gray-300 text-gray-600 px-2 py-0.5 rounded border border-gray-400">LOCKED</div>
                </div>
              </div>

              {/* Display Name */}
              <div className="group">
                <Label htmlFor="displayName" className="flex items-center gap-2 text-black font-black uppercase text-xs tracking-wider mb-2">
                  <User size={16} />
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="ENTER YOUR NAME"
                  value={userData.displayName}
                  onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
                  className="bg-white border-2 border-black font-bold text-black rounded-xl h-12 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-300 placeholder:font-normal"
                />
              </div>

              {/* Phone Number */}
              <div className="group">
                <Label htmlFor="phoneNumber" className="flex items-center gap-2 text-black font-black uppercase text-xs tracking-wider mb-2">
                  <Phone size={16} />
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="1234567890"
                  value={userData.phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                    setUserData({ ...userData, phoneNumber: value })
                  }}
                  maxLength={10}
                  className="bg-white border-2 border-black font-bold text-black rounded-xl h-12 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 transition-all focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-300 placeholder:font-normal"
                />
                <div className="flex justify-between mt-2">
                  {userData.phoneNumber && userData.phoneNumber.length < 10 && (
                    <p className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">! 10 digits required</p>
                  )}
                  {userData.phoneNumber && userData.phoneNumber.length === 10 && (
                    <p className="text-xs font-black text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 uppercase tracking-wide">✓ Valid number</p>
                  )}
                  <span className="text-xs text-gray-400 font-bold ml-auto">NUMBERS ONLY</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Role (Read-only) */}
                <div className="group">
                  <Label htmlFor="role" className="flex items-center gap-2 text-black font-black uppercase text-xs tracking-wider mb-2">
                    <MapPin size={16} />
                    Account Type
                  </Label>
                  <Input
                    id="role"
                    type="text"
                    value={userData.role}
                    disabled
                    className="bg-gray-100 border-2 border-black font-bold text-gray-500 rounded-xl uppercase h-12 opacity-80"
                  />
                </div>

                {/* Forgot Password Link Container */}
                <div className="flex items-end pb-1">
                  <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full text-black font-black underline decoration-2 hover:bg-yellow-100 hover:text-black rounded-xl h-12 border-2 border-transparent hover:border-black transition-all">
                        RESET PASSWORD?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase">Reset Password</DialogTitle>
                        <DialogDescription className="font-bold text-gray-500">
                          Enter your email address and we'll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email" className="font-black">Email</Label>
                          <Input
                            id="reset-email"
                            placeholder="name@example.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="border-2 border-black font-bold rounded-xl h-12"
                          />
                        </div>
                        {resetStatus === 'sent' && (
                          <div className="text-sm font-bold text-green-600 bg-green-50 p-3 rounded-lg border-2 border-green-100">
                            Check your email! A reset link has been sent if an account exists.
                          </div>
                        )}
                        {resetStatus === 'error' && (
                          <div className="text-sm font-bold text-red-600 bg-red-50 p-3 rounded-lg border-2 border-red-100">
                            Something went wrong. Please try again.
                          </div>
                        )}
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsResetOpen(false)} className="border-2 border-black font-bold rounded-xl h-12 hover:bg-gray-100">Cancel</Button>
                        <Button onClick={handleForgotPassword} disabled={resetStatus === 'sending' || resetStatus === 'sent'} className="bg-black text-white hover:bg-gray-800 font-bold border-2 border-black rounded-xl h-12 shadow-[4px_4px_0px_0px_rgba(128,128,128,1)]">
                          {resetStatus === 'sending' ? 'Sending...' : 'Send Reset Link'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-xl py-6 h-16 rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 transition-all border-4 border-black disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <Save size={24} className="stroke-[3]" />
                  {saving ? 'SAVING...' : 'SAVE CHANGES'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <p className="text-xs font-bold text-gray-400 bg-white inline-block px-4 py-2 rounded-full border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] uppercase tracking-widest">
            Note: Email and account type are locked for security
          </p>
        </div>
      </div>
    </div>
  )
}
