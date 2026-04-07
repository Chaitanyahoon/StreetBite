'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { MapPin, Clock, Phone, Store } from 'lucide-react'
import { vendorApi } from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import {
  buildVendorSettingsForm,
  DEFAULT_VENDOR_PREFERENCES,
  EMPTY_VENDOR_SETTINGS_FORM,
  formatCoordinatePair,
  hasValidCoordinates,
  type VendorPreferenceState,
  type VendorSettingsFormState,
} from './settings-helpers'
import {
  SettingsStatusSwitcher,
  VendorImageUploads,
  VendorPreferencesCard,
  VendorSaveButton,
  VendorSecurityCard,
} from './settings-sections'

export default function Settings() {
  const { user } = useAuth()
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [vendorData, setVendorData] = useState<VendorSettingsFormState>(EMPTY_VENDOR_SETTINGS_FORM)

  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [displayPreview, setDisplayPreview] = useState<string | null>(null)

  const [settings, setSettings] = useState<VendorPreferenceState>(DEFAULT_VENDOR_PREFERENCES)

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        if (!user) {
          toast.error('Please sign in to view settings')
          setLoading(false)
          return
        }

        if (!user.vendorId && user.role === 'VENDOR') {
          toast.error('Vendor ID not found. Please sign out and sign in again.')
          setLoading(false)
          return
        }

        const vid = String(user.vendorId)
        if (!vid || vid === 'undefined') {
          toast.error('You need to be a vendor to access this page')
          setLoading(false)
          return
        }
        setVendorId(vid)

        const vendor = await vendorApi.getById(vid)
        setVendorData(buildVendorSettingsForm(vendor))

        if (vendor.bannerImageUrl) setBannerPreview(vendor.bannerImageUrl)
        if (vendor.displayImageUrl) setDisplayPreview(vendor.displayImageUrl)

      } catch (err: any) {
        toast.error(err.message || 'Failed to load vendor data')
      } finally {
        setLoading(false)
      }
    }

    loadVendorData()
  }, [user])

  const handleImageUpload = (file: File, type: 'banner' | 'display') => {
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      if (type === 'banner') {
        setBannerPreview(base64)
        setVendorData(prev => ({ ...prev, bannerImageUrl: base64 }))
      } else {
        setDisplayPreview(base64)
        setVendorData(prev => ({ ...prev, displayImageUrl: base64 }))
      }
      toast.success(`${type === 'banner' ? 'Banner' : 'Logo'} uploaded successfully`)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = (type: 'banner' | 'display') => {
    if (type === 'banner') {
      setBannerPreview(null)
      setVendorData(prev => ({ ...prev, bannerImageUrl: '' }))
      toast.success('Banner removed')
    } else {
      setDisplayPreview(null)
      setVendorData(prev => ({ ...prev, displayImageUrl: '' }))
      toast.success('Logo removed')
    }
  }

  const validateForm = () => {
    if (!vendorData.name || vendorData.name.trim().length < 3) {
      toast.error('Business name must be at least 3 characters')
      return false
    }
    if (vendorData.phone && vendorData.phone.length !== 10) {
      toast.error('Phone number must be exactly 10 digits')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!vendorId) {
      toast.error('Vendor ID not found')
      return
    }

    if (!validateForm()) return

    try {
      setSaving(true)

      const updateData: any = {
        name: vendorData.name,
        address: vendorData.address,
        phone: vendorData.phone,
        hours: vendorData.hours,
        description: vendorData.description,
        cuisine: vendorData.cuisine,
        status: vendorData.status,
      }

      if (vendorData.bannerImageUrl) updateData.bannerImageUrl = vendorData.bannerImageUrl
      if (vendorData.displayImageUrl) updateData.displayImageUrl = vendorData.displayImageUrl

      if (vendorData.latitude && vendorData.longitude) {
        updateData.latitude = parseFloat(vendorData.latitude)
        updateData.longitude = parseFloat(vendorData.longitude)
      }

      await vendorApi.update(vendorId, updateData)
      toast.success('Settings saved successfully!')
    } catch (err: any) {
      console.error('Save error:', err)
      toast.error(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (status: string) => {
    if (!vendorId) return
    try {
      setVendorData(prev => ({ ...prev, status }))
      await vendorApi.update(vendorId, { status })
      toast.success(`Status updated to ${status}`)
    } catch (error) {
      toast.error('Failed to update status')
      // Revert on error
      setVendorData(prev => ({ ...prev, status: vendorData.status }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">


      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Vendor Settings</h1>
            <p className="text-muted-foreground mt-1 text-base">Manage your business profile and preferences.</p>
          </div>

          <SettingsStatusSwitcher status={vendorData.status} onStatusChange={updateStatus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Business Profile Card */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-white border-b border-orange-100/50 py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Store className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Business Profile</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Images Section - Compact Layout */}
                <VendorImageUploads
                  bannerPreview={bannerPreview}
                  displayPreview={displayPreview}
                  onBannerSelect={(file) => handleImageUpload(file, 'banner')}
                  onDisplaySelect={(file) => handleImageUpload(file, 'display')}
                  onBannerRemove={() => handleRemoveImage('banner')}
                  onDisplayRemove={() => handleRemoveImage('display')}
                />

                <Separator className="bg-gray-100" />

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">Business Name</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={vendorData.name}
                        onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })}
                        className="pl-9 h-10"
                        placeholder="e.g. Gojo Momos"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cuisine">Cuisine Type</Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="cuisine"
                        value={vendorData.cuisine}
                        onChange={(e) => setVendorData({ ...vendorData, cuisine: e.target.value })}
                        className="pl-9 h-10"
                        placeholder="e.g. Indian, Chinese"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={vendorData.phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                          setVendorData({ ...vendorData, phone: value })
                        }}
                        className="pl-9 h-10"
                        placeholder="10-digit number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Operating Hours</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="hours"
                        value={vendorData.hours}
                        onChange={(e) => setVendorData({ ...vendorData, hours: e.target.value })}
                        className="pl-9 h-10"
                        placeholder="10:00 AM - 10:00 PM"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={vendorData.description}
                    onChange={(e) => setVendorData({ ...vendorData, description: e.target.value })}
                    placeholder="Tell customers about your business..."
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-blue-100/50 py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Location</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="address">Full Address</Label>
                  <Input
                    id="address"
                    value={vendorData.address}
                    onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })}
                    placeholder="Street address, City, Zip"
                    className="h-10"
                  />
                </div>

                <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="lat">Latitude</Label>
                        <Input
                          id="lat"
                          value={vendorData.latitude}
                          onChange={(e) => setVendorData({ ...vendorData, latitude: e.target.value })}
                          placeholder="0.000000"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lng">Longitude</Label>
                        <Input
                          id="lng"
                          value={vendorData.longitude}
                          onChange={(e) => setVendorData({ ...vendorData, longitude: e.target.value })}
                          placeholder="0.000000"
                          className="h-10"
                        />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={async () => {
                        if (!navigator.geolocation) {
                          toast.error('Geolocation not supported')
                          return
                        }
                        navigator.geolocation.getCurrentPosition(
                          (pos) => {
                            setVendorData(prev => ({
                              ...prev,
                              latitude: pos.coords.latitude.toString(),
                              longitude: pos.coords.longitude.toString()
                            }))
                            toast.success('Location updated!')
                          },
                          () => toast.error('Failed to get location'),
                          {
                            enableHighAccuracy: true,
                            timeout: 10000,
                            maximumAge: 0
                          }
                        )
                      }}
                      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white h-10"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Use GPS
                    </Button>
                  </div>

                  {/* Mini Map Preview */}
                  {hasValidCoordinates(vendorData.latitude, vendorData.longitude) && (
                    <div className="mt-4 rounded-lg overflow-hidden border border-blue-200">
                      <iframe
                        width="100%"
                        height="200"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${vendorData.latitude},${vendorData.longitude}&zoom=15`}
                        allowFullScreen
                      />
                      <div className="bg-blue-100 px-3 py-2 text-xs text-blue-700">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {formatCoordinatePair(vendorData.latitude, vendorData.longitude)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            <VendorPreferencesCard settings={settings} onSettingsChange={setSettings} />

            <VendorSecurityCard />

            <VendorSaveButton saving={saving} onSave={handleSave} />
          </div>
        </div>
      </div>
    </div>
  )
}
