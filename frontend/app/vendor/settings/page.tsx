'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Upload, Save, MapPin, Clock, Phone, Store, Shield, Bell, CheckCircle2, AlertCircle, XCircle, X } from 'lucide-react'
import { vendorApi } from '@/lib/api'
import { toast } from 'sonner'
import { Navbar } from '@/components/navbar'

export default function Settings() {
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [vendorData, setVendorData] = useState({
    name: '',
    address: '',
    phone: '',
    hours: '',
    description: '',
    cuisine: '',
    latitude: '',
    longitude: '',
    bannerImageUrl: '',
    displayImageUrl: '',
    status: 'AVAILABLE',
  })

  // Image previews
  const [bannerPreview, setBannerPreview] = useState<string | null>(null)
  const [displayPreview, setDisplayPreview] = useState<string | null>(null)

  const [settings, setSettings] = useState({
    autoAcceptOrders: true,
    notifications: true,
    weeklyReports: true,
    emailPromos: false,
  })

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        const userStr = localStorage.getItem('user')
        if (!userStr) {
          toast.error('Please sign in to view settings')
          setLoading(false)
          return
        }

        const user = JSON.parse(userStr)

        // Check if user has vendorId - required for vendors
        if (!user.vendorId && user.role === 'VENDOR') {
          toast.error('Vendor ID not found. Please sign out and sign in again.')
          setLoading(false)
          return
        }

        const vid = user.vendorId
        if (!vid) {
          toast.error('You need to be a vendor to access this page')
          setLoading(false)
          return
        }
        setVendorId(vid)

        const vendor = await vendorApi.getById(vid)
        setVendorData({
          name: vendor.name || '',
          address: vendor.address || '',
          phone: vendor.phone || '',
          hours: vendor.hours || '',
          description: vendor.description || '',
          cuisine: vendor.cuisine || '',
          latitude: vendor.latitude?.toString() || '',
          longitude: vendor.longitude?.toString() || '',
          bannerImageUrl: vendor.bannerImageUrl || '',
          displayImageUrl: vendor.displayImageUrl || '',
          status: vendor.status || 'AVAILABLE',
        })

        if (vendor.bannerImageUrl) setBannerPreview(vendor.bannerImageUrl)
        if (vendor.displayImageUrl) setDisplayPreview(vendor.displayImageUrl)

      } catch (err: any) {
        toast.error(err.message || 'Failed to load vendor data')
      } finally {
        setLoading(false)
      }
    }

    loadVendorData()
  }, [])

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

          <div className="flex items-center gap-2 bg-white p-1 rounded-full shadow-sm border border-gray-200">
            <button
              onClick={() => updateStatus('AVAILABLE')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${vendorData.status === 'AVAILABLE'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Open
            </button>
            <button
              onClick={() => updateStatus('BUSY')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${vendorData.status === 'BUSY'
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              <AlertCircle className="w-4 h-4" />
              Busy
            </button>
            <button
              onClick={() => updateStatus('UNAVAILABLE')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${vendorData.status === 'UNAVAILABLE'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
                }`}
            >
              <XCircle className="w-4 h-4" />
              Closed
            </button>
          </div>
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
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Logo Upload */}
                  <div className="space-y-2 flex-shrink-0">
                    <Label className="text-sm font-medium text-gray-900">Logo</Label>
                    <div className="relative">
                      <label className="block cursor-pointer group relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 'display')
                          }}
                        />
                        <div className={`w-32 h-32 rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center p-2 overflow-hidden relative ${displayPreview ? 'border-primary/50 bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                          }`}>
                          {displayPreview ? (
                            <>
                              <img src={displayPreview} alt="Logo" className="w-full h-full object-cover absolute inset-0" />
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Upload className="w-6 h-6 text-white mb-1" />
                                <span className="text-white font-medium text-xs">Change</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Upload className="w-6 h-6 text-gray-400 mb-2" />
                              <p className="text-xs text-muted-foreground">Upload Logo</p>
                            </>
                          )}
                        </div>
                      </label>
                      {displayPreview && (
                        <button
                          onClick={() => handleRemoveImage('display')}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all hover:scale-110"
                          title="Remove logo"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Banner Upload */}
                  <div className="space-y-2 flex-grow">
                    <Label className="text-sm font-medium text-gray-900">Banner Image</Label>
                    <div className="relative">
                      <label className="block cursor-pointer group relative">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 'banner')
                          }}
                        />
                        <div className={`h-32 w-full rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center p-4 overflow-hidden relative ${bannerPreview ? 'border-primary/50 bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
                          }`}>
                          {bannerPreview ? (
                            <>
                              <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover absolute inset-0" />
                              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <Upload className="w-8 h-8 text-white mb-2" />
                                <span className="text-white font-medium text-sm">Change Banner</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <p className="text-sm font-medium text-gray-900">Upload Banner</p>
                              <p className="text-xs text-muted-foreground">1920x1080 recommended</p>
                            </>
                          )}
                        </div>
                      </label>
                      {bannerPreview && (
                        <button
                          onClick={() => handleRemoveImage('banner')}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all hover:scale-110"
                          title="Remove banner"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

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
                  {vendorData.latitude && vendorData.longitude && !isNaN(parseFloat(vendorData.latitude)) && !isNaN(parseFloat(vendorData.longitude)) && (
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
                        📍 {parseFloat(vendorData.latitude).toFixed(6)}, {parseFloat(vendorData.longitude).toFixed(6)}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            {/* Preferences Card */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100/50 py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Preferences</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Auto Accept</Label>
                    <p className="text-xs text-muted-foreground">Automatically accept orders</p>
                  </div>
                  <Switch
                    checked={settings.autoAcceptOrders}
                    onCheckedChange={(c) => setSettings({ ...settings, autoAcceptOrders: c })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Notifications</Label>
                    <p className="text-xs text-muted-foreground">Receive order alerts</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(c) => setSettings({ ...settings, notifications: c })}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Weekly Reports</Label>
                    <p className="text-xs text-muted-foreground">Performance summary</p>
                  </div>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(c) => setSettings({ ...settings, weeklyReports: c })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security Card */}
            <Card className="border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100/50 py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Shield className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Security</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 text-sm"
                  onClick={() => toast.info('Password change feature coming soon!')}
                >
                  Change Password
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 text-sm"
                  onClick={() => toast.info('Two-factor authentication coming soon!')}
                >
                  Two-Factor Auth
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 text-sm"
                  onClick={() => toast.info('Session management coming soon!')}
                >
                  Active Sessions
                </Button>
              </CardContent>
            </Card>

            {/* Save Button - Sticky on Mobile */}
            <div className="sticky bottom-4 md:static">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
