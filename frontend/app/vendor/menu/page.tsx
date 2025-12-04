'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { menuApi } from '@/lib/api'
import { useLiveMenuItem } from '@/hooks/use-live-menu'

interface MenuItem {
  id?: number
  name: string
  category: string
  price: number
  description?: string
  preparationTime?: number
  imageUrl?: string
  isAvailable?: boolean
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    category: 'Main Course',
    price: '',
    description: '',
    preparationTime: '',
    imageUrl: '',
    isAvailable: true,
  })

  useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        const vid = user.vendorId || user.id
        setVendorId(vid)
        loadMenu(vid)
      } catch (e) {
        console.error('Error parsing user:', e)
        setError('Failed to load user data')
        setLoading(false)
      }
    } else {
      setError('Please sign in to manage your menu')
      setLoading(false)
    }
  }, [])

  const loadMenu = async (vid: string) => {
    try {
      setLoading(true)
      const items = await menuApi.getByVendor(vid)
      setMenuItems(items)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load menu')
      console.error('Error loading menu:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!vendorId) {
      setError('Vendor ID not found')
      return
    }

    try {
      const itemData = {
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        description: formData.description,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) : undefined,
        imageUrl: formData.imageUrl || undefined,
        isAvailable: formData.isAvailable,
      }

      if (editingItem) {
        await menuApi.update(editingItem.id!, itemData)
      } else {
        await menuApi.create({ ...itemData, vendorId })
      }

      await loadMenu(vendorId)
      setIsDialogOpen(false)
      setFormData({ name: '', category: 'Main Course', price: '', description: '', preparationTime: '', imageUrl: '', isAvailable: true })
      setImagePreview(null)
      setEditingItem(null)
    } catch (err: any) {
      setError(err.message || 'Failed to save item')
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price?.toString() || '',
      description: item.description || '',
      preparationTime: item.preparationTime?.toString() || '',
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable ?? true,
    })
    setImagePreview(item.imageUrl || null)
    setIsDialogOpen(true)
  }

  const handleDelete = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      await menuApi.delete(itemId)
      if (vendorId) {
        await loadMenu(vendorId)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete item')
    }
  }

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await menuApi.update(item.id!, { isAvailable: !item.isAvailable })
      // We don't strictly need to reload menu here if we trust the real-time hook,
      // but it's good practice to keep local state in sync for the list itself.
      // The hook will handle the visual toggle update instantly if Firebase is fast.
      if (vendorId) {
        await loadMenu(vendorId)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update availability')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading menu...</div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="text-muted-foreground mt-1">Add, edit, or remove items from your menu</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-orange-600 hover:bg-orange-700 gap-2"
              onClick={() => {
                setEditingItem(null)
                setFormData({ name: '', category: 'Main Course', price: '', description: '', preparationTime: '', imageUrl: '', isAvailable: true })
                setImagePreview(null)
              }}
            >
              <Plus className="w-4 h-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
              <DialogDescription>{editingItem ? 'Update menu item details' : 'Create a new item to add to your menu'}</DialogDescription>
            </DialogHeader>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Chicken Biryani"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  className="w-full px-3 py-2 border border-input rounded-md text-sm"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option>Main Course</option>
                  <option>Appetizers</option>
                  <option>Breads</option>
                  <option>Desserts</option>
                  <option>Beverages</option>
                </select>
              </div>
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="100"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="1"
                />
              </div>
              <div>
                <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
                <Input
                  id="preparationTime"
                  type="number"
                  placeholder="20"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="image">Item Image</Label>
                <div className="mt-2 space-y-4">
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            setImagePreview(null)
                            setFormData({ ...formData, imageUrl: '' })
                          }}
                          className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-accent rounded-lg flex items-center justify-center text-muted-foreground border border-dashed border-border">
                        <span className="text-xs">No image</span>
                      </div>
                    )}

                    <label className="cursor-pointer">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Image size must be less than 5MB')
                              return
                            }
                            const reader = new FileReader()
                            reader.onloadend = () => {
                              const base64 = reader.result as string
                              setImagePreview(base64)
                              setFormData({ ...formData, imageUrl: base64 })
                            }
                            reader.readAsDataURL(file)
                          }
                        }}
                      />
                      <div className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Upload Image
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your item..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button onClick={handleAddItem} className="w-full bg-orange-600 hover:bg-orange-700">
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Menu Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Menu Items</CardTitle>
          <CardDescription>{menuItems.length} items in your menu</CardDescription>
        </CardHeader>
        <CardContent>
          {menuItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No menu items yet. Add your first item to get started!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {menuItems.map((item) => (
                    <MenuItemRow
                      key={item.id}
                      item={item}
                      onToggle={handleToggleAvailability}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function MenuItemRow({
  item,
  onToggle,
  onEdit,
  onDelete
}: {
  item: MenuItem
  onToggle: (item: MenuItem) => void
  onEdit: (item: MenuItem) => void
  onDelete: (id: number) => void
}) {
  const isAvailable = useLiveMenuItem(item.id, item.isAvailable ?? true)

  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell>{item.category}</TableCell>
      <TableCell>₹{item.price}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{item.description || '-'}</TableCell>
      <TableCell>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${isAvailable
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-gray-100 text-gray-700'
            }`}
          onClick={() => onToggle(item)}
        >
          {isAvailable ? 'Available' : 'Unavailable'}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            onClick={() => onEdit(item)}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => item.id && onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
