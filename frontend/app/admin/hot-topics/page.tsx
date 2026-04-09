'use client'

import { useState, useEffect, useCallback } from 'react'
import { hotTopicApi } from '@/lib/api'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MessageSquare, Heart, Trash2, Edit, Plus, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'

interface HotTopic {
  id: number
  title: string
  content: string
  imageUrl?: string
  cityName?: string
  latitude?: number | null
  longitude?: number | null
  isActive: boolean
  isApproved: boolean
  createdByDisplayName?: string
  createdAt: string
  likesCount?: number
  commentsCount?: number
}

export default function HotTopicManagement() {
  const [topics, setTopics] = useState<HotTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<HotTopic | null>(null)
  const [topicToDelete, setTopicToDelete] = useState<HotTopic | null>(null)
  const { logout } = useAuth()
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    cityName: '',
    latitude: '',
    longitude: '',
    isActive: true
  })

  const mapTopic = (topic: any): HotTopic => ({
    ...topic,
    isActive: topic?.isActive ?? topic?.active ?? false,
    isApproved: topic?.isApproved ?? topic?.approved ?? false,
    likesCount: Array.isArray(topic?.likes) ? topic.likes.length : (topic?.likesCount ?? 0),
    commentsCount: Array.isArray(topic?.comments) ? topic.comments.length : (topic?.commentsCount ?? 0),
  })

  const getErrorMessage = (err: any, fallback: string) =>
    err?.response?.data?.error || err?.message || fallback

  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true)
      const data = await hotTopicApi.getAll()
      const mapped = Array.isArray(data) ? data.map(mapTopic) : []
      setTopics(mapped)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch hot topics', err)
      const status = (err as any)?.response?.status
      if (status === 401 || status === 403) {
        setError('Admin access is required. Sign in again and allow cookies for StreetBite.')
        toast.error('Admin session required')
        if (status === 401) {
          await logout()
        }
      } else {
        setError('Failed to load community discussions')
        toast.error('Failed to load community discussions')
      }
    } finally {
      setLoading(false)
    }
  }, [logout])

  useEffect(() => {
    void fetchTopics()
  }, [fetchTopics])

  const handleOpenCreate = () => {
    setEditingTopic(null)
    setFormData({ title: '', content: '', imageUrl: '', cityName: '', latitude: '', longitude: '', isActive: true })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (topic: HotTopic) => {
    setEditingTopic(topic)
    setFormData({
      title: topic.title,
      content: topic.content,
      imageUrl: topic.imageUrl || '',
      cityName: topic.cityName || '',
      latitude: topic.latitude != null ? String(topic.latitude) : '',
      longitude: topic.longitude != null ? String(topic.longitude) : '',
      isActive: topic.isActive
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedLatitude = formData.latitude.trim()
    const trimmedLongitude = formData.longitude.trim()
    const hasLatitude = trimmedLatitude.length > 0
    const hasLongitude = trimmedLongitude.length > 0

    if (hasLatitude !== hasLongitude) {
      toast.error('Please provide both latitude and longitude')
      return
    }

    let latitude: number | undefined
    let longitude: number | undefined
    if (hasLatitude && hasLongitude) {
      const parsedLatitude = Number.parseFloat(trimmedLatitude)
      const parsedLongitude = Number.parseFloat(trimmedLongitude)
      if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
        toast.error('Latitude and longitude must be valid numbers')
        return
      }
      latitude = parsedLatitude
      longitude = parsedLongitude
    }

    const payload = {
      title: formData.title,
      content: formData.content,
      imageUrl: formData.imageUrl,
      cityName: formData.cityName.trim() || undefined,
      latitude,
      longitude,
      isActive: formData.isActive,
    }

    try {
      if (editingTopic) {
        const updated = await hotTopicApi.update(editingTopic.id, payload)
        setTopics((prev) => prev.map((topic) => (topic.id === updated.id ? mapTopic(updated) : topic)))
        toast.success('Topic updated successfully')
      } else {
        const created = await hotTopicApi.create(payload)
        setTopics((prev) => [mapTopic(created), ...prev])
        toast.success('New topic created!')
      }
      setIsDialogOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save topic'))
    }
  }

  const handleDelete = async () => {
    if (!topicToDelete) return
    try {
      await hotTopicApi.delete(topicToDelete.id)
      toast.success('Topic deleted')
      setTopics((prev) => prev.filter((topic) => topic.id !== topicToDelete.id))
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete topic'))
    } finally {
      setTopicToDelete(null)
    }
  }

  const toggleStatus = async (topic: HotTopic) => {
    try {
      const updated = await hotTopicApi.update(topic.id, { isActive: !topic.isActive })
      toast.success(`Topic is now ${!topic.isActive ? 'Visible' : 'Hidden'}`)
      setTopics((prev) => prev.map((item) => (item.id === updated.id ? mapTopic(updated) : item)))
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update status'))
    }
  }

  const approveTopic = async (topic: HotTopic) => {
    try {
      const updated = await hotTopicApi.update(topic.id, { isApproved: true, isActive: true })
      toast.success('Topic approved and now visible')
      setTopics((prev) => prev.map((item) => (item.id === updated.id ? mapTopic(updated) : item)))
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to approve topic'))
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage Hot Topics for the social feed</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" />
          New Discussion
        </Button>
      </div>

      <Card className="border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="border-b-2">
          <CardTitle>All Discussions</CardTitle>
          <CardDescription>Manage community engagement and yaps</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
              <p className="text-muted-foreground font-medium">Fetching topics...</p>
            </div>
          ) : topics.length === 0 ? (
            error ? (
              <div className="text-center py-20 bg-muted/20 space-y-4">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto opacity-20" />
                <p className="text-xl font-semibold">Admin Access Required</p>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => window.location.href = '/signin'} className="bg-orange-600 hover:bg-orange-700">
                  Go to Sign In
                </Button>
              </div>
            ) : (
            <div className="text-center py-20 bg-muted/20">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-xl font-semibold">No Hot Topics Yet</p>
                <p className="text-muted-foreground">Start by creating your first community discussion.</p>
            </div>
            )
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold text-black uppercase text-xs">Topic Name</TableHead>
                  <TableHead className="font-bold text-black uppercase text-xs">Author</TableHead>
                  <TableHead className="font-bold text-black uppercase text-xs">Created</TableHead>
                  <TableHead className="font-bold text-black uppercase text-xs">Stats</TableHead>
                  <TableHead className="font-bold text-black uppercase text-xs">Status</TableHead>
                  <TableHead className="text-right font-bold text-black uppercase text-xs">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="font-medium max-w-[300px]">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold">{topic.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{topic.content}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold text-muted-foreground">
                      {topic.createdByDisplayName || 'StreetBite Team'}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(topic.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 text-sm font-semibold">
                        <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                          <Heart className="w-4 h-4 fill-current" />
                          {topic.likesCount}
                        </div>
                        <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">
                          <MessageSquare className="w-4 h-4" />
                          {topic.commentsCount}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {!topic.isApproved ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-amber-200 bg-amber-50 text-amber-700">
                          Pending
                        </span>
                      ) : (
                        <button 
                          onClick={() => toggleStatus(topic)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${
                            topic.isActive 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          {topic.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {topic.isActive ? 'Visible' : 'Hidden'}
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!topic.isApproved && (
                          <Button variant="outline" size="icon" onClick={() => approveTopic(topic)} className="hover:bg-emerald-50 hover:text-emerald-600 border-2 rounded-xl">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="outline" size="icon" onClick={() => handleOpenEdit(topic)} className="hover:bg-orange-50 hover:text-orange-600 border-2 rounded-xl">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => setTopicToDelete(topic)} className="hover:bg-red-50 hover:text-red-600 hover:border-red-600 border-2 rounded-xl">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl border-4 border-black rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                {editingTopic ? 'Edit Discussion' : 'Create Hot Topic'}
              </DialogTitle>
              <DialogDescription className="font-bold text-gray-500">
                Kick off a new foodie social conversation.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-6 font-medium">
              <div className="grid gap-2">
                <Label htmlFor="title" className="font-black uppercase text-xs">Topic Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Best Vada Pav in Mumbai?" 
                  className="border-4 border-black rounded-xl h-12 font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content" className="font-black uppercase text-xs">Description / Prompt</Label>
                <Textarea 
                  id="content" 
                  placeholder="Ask a spicy question to get the yaps flowing!" 
                  className="min-h-[120px] border-4 border-black rounded-xl font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl" className="font-black uppercase text-xs">Image URL (Unsplash)</Label>
                <Input 
                  id="imageUrl" 
                  placeholder="https://images.unsplash.com/..." 
                  className="border-4 border-black rounded-xl h-12 font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cityName" className="font-black uppercase text-xs">City (Optional)</Label>
                <Input
                  id="cityName"
                  placeholder="Mumbai, Pune, Bengaluru..."
                  className="border-4 border-black rounded-xl h-12 font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  value={formData.cityName}
                  onChange={(e) => setFormData({ ...formData, cityName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="latitude" className="font-black uppercase text-xs">Latitude (Optional)</Label>
                  <Input
                    id="latitude"
                    placeholder="19.0760"
                    className="border-4 border-black rounded-xl h-12 font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="longitude" className="font-black uppercase text-xs">Longitude (Optional)</Label>
                  <Input
                    id="longitude"
                    placeholder="72.8777"
                    className="border-4 border-black rounded-xl h-12 font-bold focus-visible:ring-0 focus-visible:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-4 border-black rounded-xl font-black uppercase h-12">Cancel</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-black text-white font-black uppercase border-4 border-black h-12 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
                {editingTopic ? 'Save Changes' : 'Post Topic'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(topicToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setTopicToDelete(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete discussion?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{topicToDelete?.title}" and all of its comments and likes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete discussion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
