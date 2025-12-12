'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare, Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { discussionApi } from '@/lib/api'
import { toast } from 'sonner'

interface Discussion {
    id: number
    title: string
    authorName: string
    tags: string[]
    likesCount: number
    repliesCount: number
    isActive: boolean
    createdAt: string
}

export function HotTopicsManager() {
    const [discussions, setDiscussions] = useState<Discussion[]>([])
    const [loading, setLoading] = useState(true)
    const [newTitle, setNewTitle] = useState('')
    const [newTags, setNewTags] = useState('')
    const [creating, setCreating] = useState(false)

    useEffect(() => {
        fetchDiscussions()
    }, [])

    const fetchDiscussions = async () => {
        try {
            const data = await discussionApi.getAllAdmin()
            setDiscussions(data || [])
        } catch (error) {
            console.error('Failed to fetch discussions', error)
            toast.error('Failed to load discussions')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newTitle.trim()) {
            toast.error('Title is required')
            return
        }

        setCreating(true)
        try {
            const tags = newTags.split(',').map(t => t.trim()).filter(t => t)
            await discussionApi.create({ title: newTitle.trim(), tags })
            toast.success('Hot Topic created!')
            setNewTitle('')
            setNewTags('')
            fetchDiscussions()
        } catch (error) {
            console.error('Failed to create discussion', error)
            toast.error('Failed to create topic')
        } finally {
            setCreating(false)
        }
    }

    const handleToggle = async (id: number, currentStatus: boolean) => {
        try {
            await discussionApi.toggle(id)
            setDiscussions(discussions.map(d =>
                d.id === id ? { ...d, isActive: !currentStatus } : d
            ))
            toast.success(currentStatus ? 'Topic hidden' : 'Topic activated')
        } catch (error) {
            console.error('Failed to toggle discussion', error)
            toast.error('Failed to update topic')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this topic?')) return

        try {
            await discussionApi.delete(id)
            setDiscussions(discussions.filter(d => d.id !== id))
            toast.success('Topic deleted')
        } catch (error) {
            console.error('Failed to delete discussion', error)
            toast.error('Failed to delete topic')
        }
    }

    return (
        <Card className="border-2 border-orange-500 shadow-xl mb-8">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                    Hot Topics Management
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Create New Topic */}
                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <h4 className="font-bold text-sm text-gray-700">Create New Topic</h4>
                    <Input
                        placeholder="Topic title (e.g., 'Best Vada Pav in Mumbai?')"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="bg-white"
                    />
                    <Input
                        placeholder="Tags (comma-separated, e.g., 'Mumbai, Vada Pav')"
                        value={newTags}
                        onChange={(e) => setNewTags(e.target.value)}
                        className="bg-white"
                    />
                    <Button
                        onClick={handleCreate}
                        disabled={creating || !newTitle.trim()}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                        {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        Create Topic
                    </Button>
                </div>

                {/* Topics List */}
                <div className="space-y-3">
                    <h4 className="font-bold text-sm text-gray-700">All Topics ({discussions.length})</h4>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">
                            <Loader2 className="w-6 h-6 mx-auto animate-spin mb-2" />
                            Loading...
                        </div>
                    ) : discussions.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No topics yet. Create one above!
                        </div>
                    ) : (
                        discussions.map(discussion => (
                            <div
                                key={discussion.id}
                                className={`p-4 rounded-xl border ${discussion.isActive ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'}`}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h5 className="font-bold text-gray-900">{discussion.title}</h5>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {discussion.tags?.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                                            <span>❤️ {discussion.likesCount || 0}</span>
                                            <span>💬 {discussion.repliesCount || 0}</span>
                                            <span className={discussion.isActive ? 'text-green-600' : 'text-red-500'}>
                                                {discussion.isActive ? '● Active' : '○ Hidden'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleToggle(discussion.id, discussion.isActive)}
                                            className="h-8"
                                        >
                                            {discussion.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(discussion.id)}
                                            className="h-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
