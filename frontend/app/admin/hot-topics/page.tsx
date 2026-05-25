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
        setError('Admin access is required. Please sign in again.')
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

  const renderTopicActions = (topic: HotTopic) => (
    <div className="flex gap-2 justify-end w-full sm:w-auto">
      {!topic.isApproved && (
        <Button variant="outline" size="icon" onClick={() => approveTopic(topic)} className="hover:bg-emerald-50 hover:text-emerald-600 border-2 rounded-xl border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none bg-white h-9 w-9 p-0 flex items-center justify-center cursor-pointer">
          <CheckCircle2 className="w-4 h-4 text-black" />
        </Button>
      )}
      <Button variant="outline" size="icon" onClick={() => handleOpenEdit(topic)} className="hover:bg-orange-50 hover:text-orange-600 border-2 rounded-xl border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none bg-white h-9 w-9 p-0 flex items-center justify-center cursor-pointer">
        <Edit className="w-4 h-4 text-black" />
      </Button>
      <Button variant="outline" size="icon" onClick={() => setTopicToDelete(topic)} className="hover:bg-red-50 hover:text-red-650 hover:border-red-650 border-2 rounded-xl border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none bg-white h-9 w-9 p-0 flex items-center justify-center cursor-pointer">
        <Trash2 className="w-4 h-4 text-black" />
      </Button>
    </div>
  )

  const renderStatus = (topic: HotTopic) => {
    if (!topic.isApproved) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-black bg-amber-300 text-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
          Pending
        </span>
      )
    }
    return (
      <button 
        onClick={() => toggleStatus(topic)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-black transition-all cursor-pointer shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none ${
          topic.isActive 
            ? 'bg-green-300 text-black' 
            : 'bg-gray-200 text-black/50'
        }`}
      >
        {topic.isActive ? <Eye className="w-3 h-3 text-black" /> : <EyeOff className="w-3 h-3 text-black" />}
        {topic.isActive ? 'Visible' : 'Hidden'}
      </button>
    )
  }

  const renderStats = (topic: HotTopic) => (
    <div className="flex items-center gap-3 text-xs font-semibold">
      <div className="flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-0.5 rounded-lg border border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
        <Heart className="w-3.5 h-3.5 text-orange-700 fill-current" />
        <span>{topic.likesCount || 0}</span>
      </div>
      <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
        <MessageSquare className="w-3.5 h-3.5 text-blue-700" />
        <span>{topic.commentsCount || 0}</span>
      </div>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-6xl mx-auto pb-10 pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-black text-black uppercase tracking-tight">Community Management</h1>
          <p className="text-xs sm:text-sm font-bold text-black/60 mt-1">Create and manage Hot Topics for the social feed</p>
        </div>
        <Button 
          onClick={handleOpenCreate} 
          className="w-full sm:w-auto h-11 border-3 border-black rounded-xl font-black uppercase text-xs tracking-wider bg-orange-400 hover:bg-orange-500 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Discussion
        </Button>
      </div>

      <Card className="bg-[#fffaf4] border-3 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden">
        <CardHeader className="border-b-2 border-black/10 pb-4 p-4 sm:p-6">
          <CardTitle className="text-sm sm:text-base font-black uppercase tracking-wider text-black">All Discussions</CardTitle>
          <CardDescription className="text-xs font-bold text-black/40">Manage community engagement and yaps</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-orange-600" />
              <p className="text-black font-black uppercase tracking-wider text-xs">Fetching topics...</p>
            </div>
          ) : topics.length === 0 ? (
            error ? (
              <div className="text-center py-20 bg-white/20 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-4">
                <MessageSquare className="w-12 h-12 text-black/25 mx-auto" />
                <p className="text-xl font-black uppercase">Admin Access Required</p>
                <p className="text-sm font-bold text-black/60">{error}</p>
                <Button 
                  onClick={() => window.location.href = '/signin'} 
                  className="h-10 border-3 border-black bg-black text-white hover:bg-gray-800 rounded-xl px-4 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(251,191,36,1)] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
                >
                  Go to Sign In
                </Button>
              </div>
            ) : (
              <div className="text-center py-20 bg-white/20 border-2 border-black rounded-2xl p-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <MessageSquare className="w-12 h-12 text-black/25 mx-auto mb-4" />
                <p className="text-xl font-black uppercase">No Hot Topics Yet</p>
                <p className="text-xs font-bold text-black/50">Start by creating your first community discussion.</p>
              </div>
            )
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-2 border-black/15">
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
                      <TableRow key={topic.id} className="border-b border-black/10 hover:bg-black/5">
                        <TableCell className="font-medium max-w-[300px]">
                          <div className="flex flex-col">
                            <span className="text-sm font-black uppercase tracking-tight text-black">{topic.title}</span>
                            <span className="text-xs font-semibold text-black/50 line-clamp-1 mt-0.5">{topic.content}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-xs text-black/80">
                          {topic.createdByDisplayName || 'StreetBite Team'}
                        </TableCell>
                        <TableCell className="text-black/60 font-bold text-xs">
                          {new Date(topic.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {renderStats(topic)}
                        </TableCell>
                        <TableCell>
                          {renderStatus(topic)}
                        </TableCell>
                        <TableCell className="text-right">
                          {renderTopicActions(topic)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {topics.map((topic) => (
                  <div 
                    key={topic.id}
                    className="bg-white border-2 border-black rounded-xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-sm text-black uppercase tracking-tight leading-snug">{topic.title}</h4>
                        <p className="text-[10px] font-bold text-black/50 line-clamp-2 mt-1">{topic.content}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-2 text-xs">
                      <div>
                        <p className="text-[9px] text-black/40 font-black uppercase">Author</p>
                        <p className="font-bold text-black">{topic.createdByDisplayName || 'StreetBite Team'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-black/40 font-black uppercase">Created</p>
                        <p className="font-bold text-black">{new Date(topic.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-black/40 font-black uppercase mb-0.5">Status</p>
                        {renderStatus(topic)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-black/5 pt-3">
                      {renderStats(topic)}
                      {renderTopicActions(topic)}
                    </div>
                  </div>
                ))}
              </div>
            </>
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
