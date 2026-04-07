'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Copy, Edit2, Plus, Trash2 } from 'lucide-react'
import { promotionApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

interface Promotion {
  id: string
  code: string
  description: string
  discount: string
  minSpend: number
  expiryDate: string
  usageCount: number
  maxUsage: number
  active: boolean
}

interface PromotionFormData {
  code: string
  description: string
  discount: string
  minSpend: string
  maxUsage: string
  expiryDate: string
  active: boolean
}

interface ApiPromotion {
  id?: string
  promotionId?: string
  promoCode: string
  title: string
  discountValue: number
  discountType: string
  minOrderValue?: number
  endDate: string
  currentUses?: number
  maxUses?: number
  active?: boolean
  isActive?: boolean
}

const EMPTY_FORM: PromotionFormData = {
  code: '',
  description: '',
  discount: '',
  minSpend: '',
  maxUsage: '100',
  expiryDate: '',
  active: true,
}

function normalizePromotion(promotion: ApiPromotion): Promotion {
  const isPercentage = promotion.discountType === 'PERCENTAGE'
  const active = promotion.active !== undefined ? promotion.active : Boolean(promotion.isActive)

  return {
    id: promotion.id || promotion.promotionId || '',
    code: promotion.promoCode,
    description: promotion.title,
    discount: `${promotion.discountValue}${isPercentage ? '%' : '₹'}`,
    minSpend: promotion.minOrderValue || 0,
    expiryDate: promotion.endDate,
    usageCount: promotion.currentUses || 0,
    maxUsage: promotion.maxUses || 100,
    active,
  }
}

function buildPromotionPayload(formData: PromotionFormData) {
  const isPercentage = formData.discount.includes('%')
  const discountValue = parseFloat(formData.discount.replace(/[%₹]/g, ''))

  return {
    title: formData.description,
    description: formData.description,
    discountType: isPercentage ? 'PERCENTAGE' : 'FIXED',
    discountValue,
    minOrderValue: formData.minSpend ? parseFloat(formData.minSpend) : 0,
    promoCode: formData.code,
    endDate: formData.expiryDate || null,
    isActive: formData.active,
    maxUses: formData.maxUsage ? parseInt(formData.maxUsage, 10) : 100,
  }
}

export default function Promotions() {
  const { user } = useAuth()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [formData, setFormData] = useState<PromotionFormData>(EMPTY_FORM)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState<Promotion | null>(null)
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null)

  const activePromotionCount = useMemo(
    () => promotions.filter((promotion) => promotion.active).length,
    [promotions]
  )

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        if (!user) {
          setError('Please sign in to view promotions')
          return
        }

        if (!user.vendorId && user.role === 'VENDOR') {
          setError('Vendor ID not found. Please sign out and sign in again.')
          return
        }

        const nextVendorId = String(user.vendorId || '')
        if (!nextVendorId || nextVendorId === 'undefined') {
          setError('You need to be a vendor to view promotions')
          return
        }

        setVendorId(nextVendorId)
        const apiPromotions = (await promotionApi.getByVendor(nextVendorId)) as ApiPromotion[]
        setPromotions(apiPromotions.map(normalizePromotion))
        setError(null)
      } catch (loadError) {
        const message = loadError instanceof Error ? loadError.message : 'Failed to load promotions'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    loadPromotions()
  }, [user])

  const refreshPromotions = async (currentVendorId: string) => {
    const apiPromotions = (await promotionApi.getByVendor(currentVendorId)) as ApiPromotion[]
    setPromotions(apiPromotions.map(normalizePromotion))
  }

  const resetDialogState = () => {
    setEditingPromo(null)
    setFormData(EMPTY_FORM)
  }

  const handleSavePromotion = async () => {
    if (!formData.code || !formData.description || !formData.discount || !vendorId) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const payload = buildPromotionPayload(formData)

      if (editingPromo) {
        await promotionApi.update(editingPromo.id, payload)
      } else {
        await promotionApi.create({ ...payload, vendorId })
      }

      await refreshPromotions(vendorId)
      resetDialogState()
      setIsDialogOpen(false)
      setError(null)
      toast.success(editingPromo ? 'Promotion updated' : 'Promotion created')
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Failed to save promotion'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditPromotion = (promotion: Promotion) => {
    setEditingPromo(promotion)
    setFormData({
      code: promotion.code,
      description: promotion.description,
      discount: promotion.discount,
      minSpend: promotion.minSpend.toString(),
      maxUsage: promotion.maxUsage.toString(),
      expiryDate: promotion.expiryDate ? promotion.expiryDate.split('T')[0] : '',
      active: promotion.active,
    })
    setIsDialogOpen(true)
  }

  const handleDeletePromotion = async () => {
    if (!vendorId || !promotionToDelete) return

    try {
      setLoading(true)
      await promotionApi.delete(promotionToDelete.id)
      await refreshPromotions(vendorId)
      setError(null)
      toast.success('Promotion deleted')
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Failed to delete promotion'
      setError(message)
      toast.error(message)
    } finally {
      setPromotionToDelete(null)
      setLoading(false)
    }
  }

  const copyToClipboard = async (code: string) => {
    await navigator.clipboard.writeText(code)
    toast.success(`Copied "${code}" to clipboard`)
  }

  if (loading && promotions.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotions & Offers</h1>
          <p className="mt-1 text-muted-foreground">Create and manage promotional codes</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) {
              resetDialogState()
            }
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4" />
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
                  onChange={(event) => setFormData({ ...formData, code: event.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., 20% off all items"
                  value={formData.description}
                  onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    placeholder="e.g., 20% or ₹100"
                    value={formData.discount}
                    onChange={(event) => setFormData({ ...formData, discount: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="minSpend">Min. Spend (₹)</Label>
                  <Input
                    id="minSpend"
                    type="number"
                    placeholder="100"
                    value={formData.minSpend}
                    onChange={(event) => setFormData({ ...formData, minSpend: event.target.value })}
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
                    onChange={(event) => setFormData({ ...formData, maxUsage: event.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(event) => setFormData({ ...formData, expiryDate: event.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                <div>
                  <Label htmlFor="active" className="font-semibold">
                    Active Status
                  </Label>
                  <p className="text-sm text-gray-500">Enable or disable this promotion</p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    id="active"
                    className="peer sr-only"
                    checked={formData.active}
                    onChange={(event) => setFormData({ ...formData, active: event.target.checked })}
                  />
                  <div className="h-7 w-14 rounded-full bg-gray-300 peer-checked:bg-orange-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 after:absolute after:start-[4px] after:top-0.5 after:h-6 after:w-6 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white rtl:peer-checked:after:-translate-x-full" />
                </label>
              </div>
              <Button onClick={handleSavePromotion} className="w-full bg-orange-600 hover:bg-orange-700">
                {editingPromo ? 'Update Promotion' : 'Create Promotion'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Active Promotions</CardTitle>
          <CardDescription>{activePromotionCount} active promotions running</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Min. Spend</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 font-mono font-semibold">
                        {promotion.code}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm">{promotion.description}</TableCell>
                    <TableCell className="font-semibold text-orange-600">{promotion.discount}</TableCell>
                    <TableCell>₹{promotion.minSpend}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">
                          {promotion.usageCount}/{promotion.maxUsage}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((promotion.usageCount / promotion.maxUsage) * 100)}% used
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          promotion.active
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {promotion.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => copyToClipboard(promotion.code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => handleEditPromotion(promotion)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setPromotionToDelete(promotion)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      <AlertDialog
        open={Boolean(promotionToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setPromotionToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete promotion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {promotionToDelete?.code || 'this promotion'} from your offers list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePromotion}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete promotion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
