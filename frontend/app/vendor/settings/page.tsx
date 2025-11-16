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
import { getVendor, updateVendor } from '@/lib/api'

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
  })

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
        const vid = localStorage.getItem('vendorId') || user.userId
        setVendorId(vid)

        const vendor = await getVendor(vid)
        setVendorData({
          name: vendor.name || '',
          address: vendor.address || '',
          phone: vendor.phone || '',
          hours: vendor.hours || '',
          description: vendor.description || '',
          cuisine: vendor.cuisine || '',
        })
      } catch (err: any) {
        setError(err.message || 'Failed to load vendor data')
      } finally {
        setLoading(false)
      }
    }

    loadVendorData()
  }, [])

  const handleSave = async () => {
    if (!vendorId) {
      setError('Vendor ID not found')
      return
    }

    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      await updateVendor(vendorId, vendorData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save settings')
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
    <div className="p-8 space-y-6 max-w-4xl">
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

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Profile</CardTitle>
          <CardDescription>Update your business information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Upload */}
          <div>
            <Label>Business Logo</Label>
            <div className="mt-3 border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">Drop your logo here or click to upload</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
          </div>

          <Separator />

          {/* Business Details */}
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
                placeholder="+91-9876543210"
              />
            </div>
            <div>
              <Label htmlFor="hours">Operating Hours</Label>
              <Input
                id="hours"
                value={vendorData.hours}
                onChange={(e) => setVendorData({ ...vendorData, hours: e.target.value })}
                placeholder="10:00 AM - 10:00 PM"
              />
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
