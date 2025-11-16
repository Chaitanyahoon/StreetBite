'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit2, Trash2, Copy } from 'lucide-react'

interface Promotion {
  id: number
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
  expiryDate: string
}

export default function Promotions() {
  const [promotions] = useState<Promotion[]>([
    {
      id: 1,
      code: 'SAVE20',
      description: '20% off on all orders',
      discount: '20%',
      minOrder: 250,
      expiryDate: '2025-12-31',
      usageCount: 156,
      maxUsage: 500,
      active: true,
    },
    {
      id: 2,
      code: 'FIRST50',
      description: '₹50 off for first time customers',
      discount: '₹50',
      minOrder: 100,
      expiryDate: '2025-11-30',
      usageCount: 234,
      maxUsage: 1000,
      active: true,
    },
    {
      id: 3,
      code: 'BIRYANI15',
      description: '15% off on biryani items',
      discount: '15%',
      minOrder: 200,
      expiryDate: '2025-10-15',
      usageCount: 89,
      maxUsage: 300,
      active: false,
    },
  ])

  const [formData, setFormData] = useState<FormData>({
    code: '',
    description: '',
    discount: '',
    minOrder: '',
    expiryDate: '',
  })

  const handleAddPromotion = () => {
    console.log('Adding promotion:', formData)
    setFormData({ code: '', description: '', discount: '', minOrder: '', expiryDate: '' })
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Promotions & Offers</h1>
          <p className="text-muted-foreground mt-1">Create and manage promotional codes</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 gap-2">
              <Plus className="w-4 h-4" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Promotion</DialogTitle>
              <DialogDescription>Set up a new promotional code or offer</DialogDescription>
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
                <Label htmlFor="minOrder">Minimum Order Value (₹)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  placeholder="100"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
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
              <Button onClick={handleAddPromotion} className="w-full bg-orange-600 hover:bg-orange-700">
                Create Promotion
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        promo.active
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
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
