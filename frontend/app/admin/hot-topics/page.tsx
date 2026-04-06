'use client'

import { useState, useEffect } from 'react'
import { hotTopicApi } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MessageSquare, Heart, Trash2, Edit, Plus, Eye, EyeOff, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface HotTopic {
  id: number
  title: string
  content: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  likesCount?: number
  commentsCount?: number
}

export default function HotTopicManagement() {
  const [topics, setTopics] = useState<HotTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<HotTopic | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: '',
    isActive: true
  })

  const fetchTopics = async () => {
    try {
      setLoading(true)
      const data = await hotTopicApi.getAll()
      // The API returns the full object with nested likes and comments
      const mapped = data.map((t: any) => ({
        ...t,
        likesCount: t.likes?.length || 0,
        commentsCount: t.comments?.length || 0
      }))
      setTopics(mapped)
    } catch (err) {
      console.error('Failed to fetch hot topics', err)
      toast.error('Failed to load community discussions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTopics()
  }, [])

  const handleOpenCreate = () => {
    setEditingTopic(null)
    setFormData({ title: '', content: '', imageUrl: '', isActive: true })
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (topic: HotTopic) => {
    setEditingTopic(topic)
    setFormData({
      title: topic.title,
      content: topic.content,
      imageUrl: topic.imageUrl || '',
      isActive: topic.isActive
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingTopic) {
        await hotTopicApi.update(editingTopic.id, formData)
        toast.success('Topic updated successfully')
      } else {
        await hotTopicApi.create(formData)
        toast.success('New topic created!')
      }
      setIsDialogOpen(false)
      fetchTopics()
    } catch (err) {
      toast.error('Failed to save topic')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this topic? All comments and likes will be lost.')) return
    try {
      await hotTopicApi.delete(id)
      toast.success('Topic deleted')
      fetchTopics()
    } catch (err) {
      toast.error('Failed to delete topic')
    }
  }

  const toggleStatus = async (topic: HotTopic) => {
    try {
      await hotTopicApi.update(topic.id, { ...topic, isActive: !topic.isActive })
      toast.success(`Topic is now ${!topic.isActive ? 'Visible' : 'Hidden'}`)
      fetchTopics()
    } catch (err) {
      toast.error('Failed to update status')
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
            <div className="text-center py-20 bg-muted/20">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-xl font-semibold">No Hot Topics Yet</p>
                <p className="text-muted-foreground">Start by creating your first community discussion.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold text-black uppercase text-xs">Topic Name</TableHead>
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenEdit(topic)} className="hover:bg-orange-50 hover:text-orange-600 border-2 rounded-xl">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(topic.id)} className="hover:bg-red-50 hover:text-red-600 hover:border-red-600 border-2 rounded-xl">
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
    </div>
  )
}
