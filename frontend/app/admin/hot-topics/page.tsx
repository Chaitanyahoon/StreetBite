'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Edit, Save, X, Flame } from 'lucide-react'
import { hotTopicApi } from '@/lib/api'
import { toast } from 'sonner'

export default function AdminHotTopicsPage() {
    const [topics, setTopics] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        imageUrl: ''
    })

    useEffect(() => {
        fetchTopics()
    }, [])

    const fetchTopics = async () => {
        try {
            const data = await hotTopicApi.getAll()
            setTopics(data)
        } catch (error) {
            console.error('Failed to fetch topics:', error)
            toast.error('Failed to load hot topics')
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await hotTopicApi.create(formData)
            toast.success('Hot Topic created successfully!')
            setIsCreating(false)
            setFormData({ title: '', content: '', imageUrl: '' })
            fetchTopics()
        } catch (error) {
            console.error('Failed to create topic:', error)
            toast.error('Failed to create hot topic')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this topic?')) return
        try {
            await hotTopicApi.delete(id)
            toast.success('Topic deleted successfully')
            fetchTopics()
        } catch (error) {
            console.error('Failed to delete topic:', error)
            toast.error('Failed to delete topic')
        }
    }

    return (
        <div className="p-8 space-y-8 min-h-screen bg-gray-50/30">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-2">
                        <Flame className="text-orange-600 fill-orange-600" />
                        Hot Topics Management
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Manage trending discussions and featured stories.
                    </p>
                </div>
                <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-black text-white hover:bg-orange-600 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all"
                >
                    <Plus className="mr-2 h-5 w-5" />
                    New Topic
                </Button>
            </div>

            {/* Create Form Modal/Overlay could go here, but for simplicity using inline or top card */}
            {isCreating && (
                <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-4">
                    <CardHeader>
                        <CardTitle>Create New Hot Topic</CardTitle>
                        <CardDescription>Share something spicy with the community</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Enter topic title"
                                    className="border-2 border-black focus-visible:ring-orange-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Content</Label>
                                <Textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Enter topic content"
                                    className="min-h-[150px] border-2 border-black focus-visible:ring-orange-500"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Image URL</Label>
                                <Input
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="Enter image URL"
                                    className="border-2 border-black focus-visible:ring-orange-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreating(false)}
                                    className="border-2 border-black font-bold"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-orange-500 text-white hover:bg-orange-600 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    Publish Topic
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Topics List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-20 text-muted-foreground">Loading topics...</div>
                ) : topics.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-white rounded-xl border-dashed border-2 border-gray-300">
                        <Flame className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-500">No Hot Topics Yet</h3>
                        <p className="text-gray-400">Create your first topic to get started.</p>
                    </div>
                ) : (
                    topics.map((topic) => (
                        <Card key={topic.id} className="border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform flex flex-col">
                            {topic.imageUrl && (
                                <div className="h-48 overflow-hidden border-b-4 border-black relative">
                                    <img src={topic.imageUrl} alt={topic.title} className="w-full h-full object-cover" />
                                    {!topic.active && (
                                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 border-2 border-black">
                                            INACTIVE
                                        </div>
                                    )}
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="line-clamp-1 text-xl">{topic.title}</CardTitle>
                                <CardDescription className="text-xs">
                                    Posted on {new Date(topic.createdAt).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                    {topic.content}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-gray-100">
                                    <div className="flex gap-4 text-sm font-bold text-gray-500">
                                        <span>❤️ {topic.likes?.length || 0}</span>
                                        <span>💬 {topic.comments?.length || 0}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => handleDelete(topic.id)}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
