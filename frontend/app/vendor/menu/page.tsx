'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Edit2, Trash2, Plus, Image as ImageIcon, Search, Filter } from 'lucide-react'
import { menuApi } from '@/lib/api'
import { useLiveMenuItem } from '@/hooks/use-live-menu'
import { toast } from 'sonner'
import { Navbar } from '@/components/navbar'

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
  const [vendorId, setVendorId] = useState<string | null>(null)
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')

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

        // Check if user has vendorId - required for vendors
        if (!user.vendorId && user.role === 'VENDOR') {
          // If vendorId is missing but user is a vendor, try to re-fetch user data
          console.warn('VendorId missing from stored user data. User may need to re-login.')
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
        loadMenu(vid)
      } catch (e) {
        console.error('Error parsing user:', e)
        toast.error('Failed to load user data')
        setLoading(false)
      }
    } else {
      toast.error('Please sign in to manage your menu')
      setLoading(false)
    }
  }, [])

  const loadMenu = async (vid: string) => {
    try {
      setLoading(true)
      const items = await menuApi.getByVendor(vid)
      setMenuItems(items)
    } catch (err: any) {
      toast.error(err.message || 'Failed to load menu')
      console.error('Error loading menu:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = async () => {
    if (!vendorId) {
      toast.error('Vendor ID not found')
      return
    }

    if (!formData.name || !formData.price) {
      toast.error('Name and Price are required')
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
        toast.success('Menu item updated successfully')
      } else {
        await menuApi.create({ ...itemData, vendorId })
        toast.success('Menu item added successfully')
      }

      await loadMenu(vendorId)
      setIsDialogOpen(false)
      resetForm()
    } catch (err: any) {
      toast.error(err.message || 'Failed to save item')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', category: 'Main Course', price: '', description: '', preparationTime: '', imageUrl: '', isAvailable: true })
    setImagePreview(null)
    setEditingItem(null)
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
    // In a real app, use a custom dialog. For now, confirm is okay but we'll wrap it nicely later if needed.
    // Ideally, use a toast with undo action or a proper alert dialog component.
    if (!confirm('Are you sure you want to delete this menu item?')) return

    try {
      await menuApi.delete(itemId)
      toast.success('Item deleted')
      if (vendorId) {
        await loadMenu(vendorId)
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete item')
    }
  }

  const handleToggleAvailability = async (itemId: number, currentAvailability: boolean) => {




    try {
      const newAvailability = !currentAvailability


      // Update local state immediately for responsive UI
      setMenuItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, isAvailable: newAvailability } : item
      ))

      const response = await menuApi.update(itemId, { isAvailable: newAvailability })


      toast.success(`Item marked as ${newAvailability ? 'Available' : 'Sold Out'}`)

      // Reload to ensure sync with backend
      if (vendorId) {
        await loadMenu(vendorId)
      }
    } catch (err: any) {
      console.error('Toggle error:', err)
      // Revert local state on error
      if (vendorId) {
        await loadMenu(vendorId)
      }
      toast.error(err.message || 'Failed to update availability')
    }
  }

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/50">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Menu Management</h1>
            <p className="text-muted-foreground mt-2 text-lg">Curate your delicious offerings.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 gap-2">
                <Plus className="w-5 h-5" />
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">{editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}</DialogTitle>
                <DialogDescription>{editingItem ? 'Update the details of your delicious item.' : 'Add a new tasty item to your menu.'}</DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6 py-4">
                {/* Left Column - Image */}
                <div className="space-y-4">
                  <Label className="text-base">Item Image</Label>
                  <div className="relative group">
                    <div className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center p-4 overflow-hidden relative transition-colors ${imagePreview ? 'border-primary/50 bg-primary/5' : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'}`}>
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ImageIcon className="w-8 h-8 text-white mb-2" />
                            <span className="text-white font-medium text-sm">Change Image</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                            <ImageIcon className="w-6 h-6 text-orange-600" />
                          </div>
                          <p className="text-sm font-medium text-gray-900">Upload Photo</p>
                          <p className="text-xs text-muted-foreground mt-1">Square image recommended</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            if (file.size > 5 * 1024 * 1024) {
                              toast.error('Image size must be less than 5MB')
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
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preparationTime">Prep Time (mins)</Label>
                    <Input
                      id="preparationTime"
                      type="number"
                      placeholder="e.g. 15"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>

                {/* Right Column - Details */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Item Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="e.g. Butter Chicken"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option>Main Course</option>
                      <option>Appetizers</option>
                      <option>Breads</option>
                      <option>Desserts</option>
                      <option>Beverages</option>
                      <option>Snacks</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                      <Input
                        id="price"
                        type="number"
                        placeholder="250"
                        className="pl-7"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the ingredients and taste..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddItem} className="bg-primary hover:bg-primary/90 text-white">
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-orange-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onToggle={handleToggleAvailability}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MenuItemCard({
  item,
  onToggle,
  onEdit,
  onDelete
}: {
  item: MenuItem
  onToggle: (itemId: number, currentAvailability: boolean) => void
  onEdit: (item: MenuItem) => void
  onDelete: (id: number) => void
}) {
  const isAvailable = useLiveMenuItem(item.id, item.isAvailable ?? true)

  return (
    <Card className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${!isAvailable ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}

        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-gray-700 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => item.id && onDelete(item.id)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-red-50 text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="absolute bottom-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm ${isAvailable
            ? 'bg-green-500/90 text-white'
            : 'bg-gray-900/80 text-white'
            }`}>
            {isAvailable ? 'In Stock' : 'Sold Out'}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-2 mb-2">
          <div>
            <h3 className="font-bold text-gray-900 line-clamp-1" title={item.name}>{item.name}</h3>
            <p className="text-xs text-muted-foreground font-medium">{item.category}</p>
          </div>
          <p className="font-bold text-primary">₹{item.price}</p>
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5em] mb-4">
          {item.description || 'No description available.'}
        </p>

        <div className="flex items-center justify-between">
          <span className={`text-xs font-semibold ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
            {isAvailable ? 'In Stock' : 'Sold Out'}
          </span>
          <button
            onClick={() => item.id && onToggle(item.id, isAvailable ?? true)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${isAvailable
              ? 'bg-green-500 focus:ring-green-500'
              : 'bg-gray-300 focus:ring-gray-400'
              }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${isAvailable ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
