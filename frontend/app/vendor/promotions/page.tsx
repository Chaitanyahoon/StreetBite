// @ts-nocheck
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit2, Trash2, Copy } from 'lucide-react'
import { promotionApi } from '@/lib/api'

interface Promotion {
  id: string
  code: string
  description: string
  discount: string
  minOrder: number
  expiryDate: string
  usageCount: number
  maxUsage: number
  active: boolean
}

interface FormData {
  code: string
  description: string
  discount: string
  minOrder: string
  maxUsage: string
  expiryDate: string
  active: boolean
}

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vendorId, setVendorId] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    code: '',
    description: '',
    discount: '',
    minOrder: '',
    maxUsage: '100',
    expiryDate: '',
    active: true,
  })

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  const [mounted, setMounted] = useState(false)

  // Fix hydration error
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load promotions from backend
  useEffect(() => {
    const loadPromotions = async () => {
      try {
        if (typeof window === 'undefined') return

        const userStr = localStorage.getItem('user')
        if (!userStr) {
          setError('Please sign in to view promotions')
          setLoading(false)
          return
        }

        const user = JSON.parse(userStr)
        const vid = user.vendorId || user.id
        setVendorId(vid)

        const apiPromotions = await promotionApi.getByVendor(vid)
        console.log('API Promotions Response:', apiPromotions)

        // Convert API format to UI format
        const uiPromotions: Promotion[] = apiPromotions.map(p => ({
          id: p.id || p.promotionId || '',
          code: p.promoCode,
          description: p.title,
          discount: `${p.discountValue}${p.discountType === 'PERCENTAGE' ? '%' : '₹'}`,
          minOrder: p.minOrderValue || 0,
          expiryDate: p.endDate,
          usageCount: p.currentUses || 0,
          maxUsage: p.maxUses || 100,
          active: p.active !== undefined ? p.active : p.isActive,
        }))

        setPromotions(uiPromotions)
      } catch (err: any) {
        setError(err.message || 'Failed to load promotions')
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      loadPromotions()
    }
  }, [mounted])

  const handleAddPromotion = async () => {
    if (!formData.code || !formData.description || !formData.discount || !vendorId) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)

      // Parse discount (e.g., "20%" or "₹50")
      const isPercentage = formData.discount.includes('%')
      const discountValue = parseFloat(formData.discount.replace(/[%₹]/g, ''))

      const promotionData = {
        title: formData.description,
        description: formData.description,
        discountType: isPercentage ? 'PERCENTAGE' : 'FIXED',
        discountValue: discountValue,
        minOrderValue: formData.minOrder ? parseFloat(formData.minOrder) : 0,
        promoCode: formData.code,
        endDate: formData.expiryDate || null,
        isActive: formData.active,
        maxUses: formData.maxUsage ? parseInt(formData.maxUsage) : 100,
      }

      console.log('Sending promotion data:', promotionData)

      if (editingPromo) {
        // Update existing promotion
        await promotionApi.update(editingPromo.id, promotionData)
      } else {
        // Create new promotion
        await promotionApi.create({ ...promotionData, vendorId })
      }

      // Reload promotions
      const apiPromotions = await promotionApi.getByVendor(vendorId)
      console.log('API Promotions:', apiPromotions)
      const uiPromotions: Promotion[] = apiPromotions.map(p => {
        const active = p.active !== undefined ? p.active : p.isActive
        console.log(`Promotion ${p.promoCode}: p.active=${p.active}, p.isActive=${p.isActive}, final=${active}`)
        return {
          id: p.id || p.promotionId || '',
          code: p.promoCode,
          description: p.title,
          discount: `${p.discountValue}${p.discountType === 'PERCENTAGE' ? '%' : '₹'}`,
          minOrder: p.minOrderValue || 0,
          expiryDate: p.endDate,
          usageCount: p.currentUses || 0,
          maxUsage: p.maxUses || 100,
          active: active,
        }
      })
      setPromotions(uiPromotions)

      setFormData({ code: '', description: '', discount: '', minOrder: '', maxUsage: '100', expiryDate: '', active: true })
      setEditingPromo(null)
      setIsDialogOpen(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save promotion')
      alert(err.message || 'Failed to save promotion')
    } finally {
      setLoading(false)
    }
  }

  const handleEditPromotion = (promo: Promotion) => {
    setEditingPromo(promo)
    setFormData({
      code: promo.code,
      description: promo.description,
      discount: promo.discount,
      minOrder: promo.minOrder.toString(),
      maxUsage: promo.maxUsage.toString(),
      expiryDate: promo.expiryDate ? promo.expiryDate.split('T')[0] : '',
      active: promo.active,
    })
    setIsDialogOpen(true)
  }

  const handleDeletePromotion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return

    try {
      setLoading(true)
      await promotionApi.delete(id)

      // Reload promotions
      if (vendorId) {
        const apiPromotions = await promotionApi.getByVendor(vendorId)
        const uiPromotions: Promotion[] = apiPromotions.map(p => ({
          id: p.id || p.promotionId || '',
          code: p.promoCode,
          description: p.title,
          discount: `${p.discountValue}${p.discountType === 'PERCENTAGE' ? '%' : '₹'}`,
          minOrder: p.minOrderValue || 0,
          expiryDate: p.endDate,
          usageCount: p.currentUses || 0,
          maxUsage: p.maxUses || 100,
          active: p.active !== undefined ? p.active : p.isActive,
        }))
        setPromotions(uiPromotions)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete promotion')
      alert(err.message || 'Failed to delete promotion')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    alert(`Copied "${code}" to clipboard!`)
  }

  if (!mounted) {
    return null // Prevent hydration mismatch
  }

  if (loading && promotions.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotions & Offers</h1>
          <p className="text-muted-foreground mt-1">Create and manage promotional codes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open)
          if (!open) {
            setEditingPromo(null)
            setFormData({ code: '', description: '', discount: '', minOrder: '', maxUsage: '100', expiryDate: '' })
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
              <Plus className="w-4 h-4" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPromo ? 'Edit Promotion' : 'Create New Promotion'}</DialogTitle>
              <DialogDescription>
                {editingPromo ? 'Update promotion details' : 'Set up a new promotional code or offer'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Promo Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., SAVE20"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., 20% off on all orders"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    placeholder="e.g., 20% or ₹100"
                    value={formData.discount}
                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="minOrder">Min Order Value (₹)</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    placeholder="100"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxUsage">Max Usage Limit</Label>
                  <Input
                    id="maxUsage"
                    type="number"
                    placeholder="100"
                    value={formData.maxUsage}
                    onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label htmlFor="active" className="font-semibold">Active Status</Label>
                  <p className="text-sm text-gray-500">Enable or disable this promotion</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="active"
                    className="sr-only peer"
                    checked={!!formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
                </label>
              </div>
              <Button onClick={handleAddPromotion} className="w-full bg-orange-600 hover:bg-orange-700">
                {editingPromo ? 'Update Promotion' : 'Create Promotion'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Promotions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Promotions</CardTitle>
          <CardDescription>{promotions.filter(p => p.active).length} active promotions running</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min Order</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded font-mono font-semibold">
                        {promo.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm">{promo.description}</TableCell>
                    <TableCell className="font-semibold text-orange-600">{promo.discount}</TableCell>
                    <TableCell>₹{promo.minOrder}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{promo.usageCount}/{promo.maxUsage}</p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((promo.usageCount / promo.maxUsage) * 100)}% used
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${promo.active
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}>
                        {promo.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => copyToClipboard(promo.code)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleEditPromotion(promo)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeletePromotion(promo.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
