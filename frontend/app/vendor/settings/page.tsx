'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Upload, Save } from 'lucide-react'
import { vendorApi } from '@/lib/api'

export default function Settings() {
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

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
          setError('Please sign in to view settings')
          setLoading(false)
          return
        }

        const user = JSON.parse(userStr)
        const vid = user.vendorId || user.id

        if (!vid) {
          throw new Error('Vendor ID is missing')
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
        setError(err.message || 'Failed to load vendor data')
      } finally {
        setLoading(false)
      }
    }

    loadVendorData()
  }, [])

  const handleImageUpload = (file: File, type: 'banner' | 'display') => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Convert to base64
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
    }
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    if (!vendorData.name || vendorData.name.trim().length < 3) {
      setError('Business name must be at least 3 characters')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!vendorId) {
      setError('Vendor ID not found')
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      const updateData: any = {
        name: vendorData.name,
        address: vendorData.address,
        phone: vendorData.phone,
        hours: vendorData.hours,
        description: vendorData.description,
        cuisine: vendorData.cuisine,
      }

      // Only include images if they have values (empty strings trigger backend validation errors)
      if (vendorData.bannerImageUrl) {
        updateData.bannerImageUrl = vendorData.bannerImageUrl
      }
      if (vendorData.displayImageUrl) {
        updateData.displayImageUrl = vendorData.displayImageUrl
      }

      // Add latitude/longitude as direct fields (backend expects this format)
      if (vendorData.latitude && vendorData.longitude) {
        updateData.latitude = parseFloat(vendorData.latitude)
        updateData.longitude = parseFloat(vendorData.longitude)
      }

      await vendorApi.update(vendorId, updateData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      console.error('Save error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading settings...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl overflow-x-hidden">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your vendor profile and preferences</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      {/* Vendor Status */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Status</CardTitle>
          <CardDescription>Update your current operational status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={async () => {
                if (!vendorId) return
                try {
                  setVendorData(prev => ({ ...prev, status: 'AVAILABLE' }))
                  await vendorApi.update(vendorId, { status: 'AVAILABLE' })
                  alert('Status updated to AVAILABLE')
                } catch (error) {
                  alert('Failed to update status')
                }
              }}
              className={`flex-1 transition-all duration-200 ${vendorData.status === 'AVAILABLE'
                ? 'bg-green-600 hover:bg-green-700 ring-4 ring-green-600/30 scale-105 font-bold shadow-lg'
                : 'bg-green-600/20 text-green-700 hover:bg-green-600/30 hover:text-green-800'
                }`}
            >
              {vendorData.status === 'AVAILABLE' && <span className="mr-2">●</span>}
              Available
            </Button>
            <Button
              onClick={async () => {
                if (!vendorId) return
                try {
                  setVendorData(prev => ({ ...prev, status: 'BUSY' }))
                  await vendorApi.update(vendorId, { status: 'BUSY' })
                  alert('Status updated to BUSY')
                } catch (error) {
                  alert('Failed to update status')
                }
              }}
              className={`flex-1 transition-all duration-200 ${vendorData.status === 'BUSY'
                ? 'bg-orange-500 hover:bg-orange-600 ring-4 ring-orange-500/30 scale-105 font-bold shadow-lg'
                : 'bg-orange-500/20 text-orange-700 hover:bg-orange-500/30 hover:text-orange-800'
                }`}
            >
              {vendorData.status === 'BUSY' && <span className="mr-2">●</span>}
              Busy
            </Button>
            <Button
              onClick={async () => {
                if (!vendorId) return
                try {
                  setVendorData(prev => ({ ...prev, status: 'UNAVAILABLE' }))
                  await vendorApi.update(vendorId, { status: 'UNAVAILABLE' })
                  alert('Status updated to UNAVAILABLE')
                } catch (error) {
                  alert('Failed to update status')
                }
              }}
              className={`flex-1 transition-all duration-200 ${vendorData.status === 'UNAVAILABLE'
                ? 'bg-red-600 hover:bg-red-700 ring-4 ring-red-600/30 scale-105 font-bold shadow-lg'
                : 'bg-red-600/20 text-red-700 hover:bg-red-600/30 hover:text-red-800'
                }`}
            >
              {vendorData.status === 'UNAVAILABLE' && <span className="mr-2">●</span>}
              Unavailable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Update your business information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Display Image (Logo) Upload */}
            <div>
              <Label className="text-base font-semibold">Business Logo</Label>
              <p className="text-sm text-muted-foreground mb-4">This will be displayed on your vendor card.</p>

              <label className="block cursor-pointer group relative w-fit">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleImageUpload(file, 'display')
                  }}
                />

                {displayPreview ? (
                  <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-border shadow-sm group-hover:border-primary/50 transition-colors">
                    <img src={displayPreview} alt="Display preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[2px]">
                      <Upload className="w-6 h-6 text-white mb-2" />
                      <span className="text-white text-xs font-medium">Change Logo</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-40 h-40 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-4 hover:bg-accent/50 hover:border-primary/50 transition-all duration-200">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="text-xs font-medium text-foreground">Upload Logo</p>
                  </div>
                )}
              </label>
            </div>

            {/* Banner Image Upload */}
            <div>
              <Label className="text-base font-semibold">Banner Image</Label>
              <p className="text-sm text-muted-foreground mb-4">This will be the background on your details page.</p>

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

                {bannerPreview ? (
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-border shadow-sm group-hover:border-primary/50 transition-colors">
                    <img src={bannerPreview} alt="Banner preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 backdrop-blur-[2px]">
                      <Upload className="w-8 h-8 text-white mb-2" />
                      <span className="text-white text-sm font-medium">Change Banner</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-40 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center p-4 hover:bg-accent/50 hover:border-primary/50 transition-all duration-200">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Upload Banner Image</p>
                    <p className="text-xs text-muted-foreground mt-1">1920x1080 recommended</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Business Name</Label>
              <Input
                id="name"
                value={vendorData.name}
                onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })}
                placeholder="Your business name"
              />
            </div>
            <div>
              <Label htmlFor="cuisine">Cuisine Type</Label>
              <Input
                id="cuisine"
                value={vendorData.cuisine}
                onChange={(e) => setVendorData({ ...vendorData, cuisine: e.target.value })}
                placeholder="e.g., Indian, Chinese"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={vendorData.phone}
                onChange={(e) => setVendorData({ ...vendorData, phone: e.target.value })}
                placeholder="9876543210 or +91-9876543210"
              />
              <p className="text-xs text-muted-foreground mt-1">Format: 10 digits with optional country code</p>
            </div>
            <div>
              <Label htmlFor="hours">Operating Hours</Label>
              <Input
                id="hours"
                value={vendorData.hours}
                onChange={(e) => setVendorData({ ...vendorData, hours: e.target.value })}
                placeholder="Mon-Sun: 10:00 AM - 10:00 PM"
              />
              <p className="text-xs text-muted-foreground mt-1">Example: Mon-Fri: 9AM-9PM or 9:00 AM - 9:00 PM</p>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address">Business Address</Label>
              <Input
                id="address"
                value={vendorData.address}
                onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })}
                placeholder="Street address, City"
              />
            </div>
          </div>

          {/* Location Coordinates */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Location Coordinates</h4>
              <p className="text-xs text-muted-foreground mb-3">Set your exact location to appear on the map. Use GPS or click on the map.</p>
            </div>

            {/* GPS Button */}
            <Button
              type="button"
              onClick={async () => {
                if (!navigator.geolocation) {
                  alert('Geolocation is not supported by your browser')
                  return
                }

                try {
                  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject)
                  })

                  setVendorData({
                    ...vendorData,
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                  })
                  alert('Location captured successfully!')
                } catch (err) {
                  alert('Failed to get your location. Please enable location permissions.')
                }
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Current Location (GPS)
            </Button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={vendorData.latitude}
                  onChange={(e) => setVendorData({ ...vendorData, latitude: e.target.value })}
                  placeholder="e.g., 19.9975"
                />
                <p className="text-xs text-muted-foreground mt-1">North-South position</p>
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={vendorData.longitude}
                  onChange={(e) => setVendorData({ ...vendorData, longitude: e.target.value })}
                  placeholder="e.g., 73.7898"
                />
                <p className="text-xs text-muted-foreground mt-1">East-West position</p>
              </div>
            </div>

            {/* Map Preview */}
            {vendorData.latitude && vendorData.longitude && (
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="300"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps?q=${vendorData.latitude},${vendorData.longitude}&output=embed`}
                  allowFullScreen
                />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Tips:</strong>
                <br />• Click "Use My Current Location" to automatically get your GPS coordinates
                <br />• Or right-click on your location in Google Maps and copy the coordinates
                <br />• The map preview will show your selected location
              </p>
            </div>
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              rows={4}
              value={vendorData.description}
              onChange={(e) => setVendorData({ ...vendorData, description: e.target.value })}
              placeholder="Describe your business..."
            />
          </div>


          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700 gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Configure your notification and automation settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <div>
              <p className="font-medium">Auto Accept Orders</p>
              <p className="text-sm text-muted-foreground">Automatically accept incoming orders</p>
            </div>
            <Switch
              checked={settings.autoAcceptOrders}
              onCheckedChange={(checked) => setSettings({ ...settings, autoAcceptOrders: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <div>
              <p className="font-medium">Order Notifications</p>
              <p className="text-sm text-muted-foreground">Receive alerts for new orders</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <div>
              <p className="font-medium">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">Get weekly analytics and performance reports</p>
            </div>
            <Switch
              checked={settings.weeklyReports}
              onCheckedChange={(checked) => setSettings({ ...settings, weeklyReports: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
            <div>
              <p className="font-medium">Promotional Emails</p>
              <p className="text-sm text-muted-foreground">Receive tips and promotional opportunities</p>
            </div>
            <Switch
              checked={settings.emailPromos}
              onCheckedChange={(checked) => setSettings({ ...settings, emailPromos: checked })}
            />
          </div>

          <Button onClick={handleSave} className="w-full bg-orange-600 hover:bg-orange-700 mt-4">
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full">
            Change Password
          </Button>
          <Button variant="outline" className="w-full">
            Two-Factor Authentication
          </Button>
          <Button variant="outline" className="w-full">
            View Active Sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
