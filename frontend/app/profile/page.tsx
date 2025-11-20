'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Phone, MapPin, Save, ArrowLeft } from 'lucide-react'
import { updateUserProfile } from '@/lib/api'
import Link from 'next/link'
import { Navbar } from '@/components/navbar'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [userData, setUserData] = useState({
    userId: '',
    email: '',
    displayName: '',
    phoneNumber: '',
    role: '',
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
        userId: user.userId || '',
        email: user.email || '',
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        role: user.role || 'CUSTOMER',
      })
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
      }

      const response = await updateUserProfile(userData.userId, updateData)
      
      // Update localStorage with new data
      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        displayName: userData.displayName,
        phoneNumber: userData.phoneNumber,
      }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/explore" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors mb-6">
          <ArrowLeft size={20} />
          Back to Explore
        </Link>

        {/* Profile Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your personal information</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Profile updated successfully!
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile details below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                disabled
                className="mt-2 bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            {/* Display Name */}
            <div>
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User size={16} className="text-primary" />
                Display Name
              </Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your name"
                value={userData.displayName}
                onChange={(e) => setUserData({ ...userData, displayName: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber" className="flex items-center gap-2">
                <Phone size={16} className="text-primary" />
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+91 1234567890"
                value={userData.phoneNumber}
                onChange={(e) => setUserData({ ...userData, phoneNumber: e.target.value })}
                className="mt-2"
              />
            </div>

            {/* Role (Read-only) */}
            <div>
              <Label htmlFor="role" className="flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                Account Type
              </Label>
              <Input
                id="role"
                type="text"
                value={userData.role}
                disabled
                className="mt-2 bg-gray-50 cursor-not-allowed capitalize"
              />
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Your email and account type cannot be changed. If you need to update these, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
