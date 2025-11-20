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
import { createMenuItem, getVendorMenu, updateMenuItem, deleteMenuItem, type MenuItem } from '@/lib/api'

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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
    // Get vendor ID from localStorage (set during login/signup)
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        // Use userId as vendorId (1:1 mapping)
        setVendorId(user.userId)
        loadMenu(user.userId)
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
      const items = await getVendorMenu(vid)
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
        // Update existing item
        await updateMenuItem(editingItem.itemId!, itemData)
      } else {
        // Create new item
        await createMenuItem(vendorId, itemData)
      }

      // Reload menu
      await loadMenu(vendorId)
      setIsDialogOpen(false)
      setFormData({ name: '', category: 'Main Course', price: '', description: '', preparationTime: '', imageUrl: '', isAvailable: true })
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
    setIsDialogOpen(true)
  }

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      await deleteMenuItem(itemId)
      if (vendorId) {
        await loadMenu(vendorId)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete item')
    }
  }

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await updateMenuItem(item.itemId!, { isAvailable: !item.isAvailable })
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
                  step="0.01"
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
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
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
                    <TableRow key={item.itemId}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>₹{item.price}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.description || '-'}</TableCell>
                    <TableCell>
                        <span 
                          className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer ${
                            item.isAvailable 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}
                          onClick={() => handleToggleAvailability(item)}
                        >
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-600 hover:text-blue-700"
                            onClick={() => handleEdit(item)}
                          >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700"
                            onClick={() => item.itemId && handleDelete(item.itemId)}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
