'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, AlertCircle, History, Clock, Loader2, Send } from 'lucide-react'
import { reportApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/context/AuthContext'
import {
    EMPTY_SUPPORT_FORM,
    getTicketStatusClassName,
    SUPPORT_CATEGORY_OPTIONS,
    SUPPORT_PRIORITY_OPTIONS,
    SUPPORT_QUICK_TIPS,
} from './support-helpers'

export default function VendorSupportPage() {
    return (
        <div className="space-y-8">
            <main className="max-w-6xl">
                <div className="flex flex-col md:flex-row gap-8">

                    {/* Header & Ticket Form */}
                    <div className="flex-1 space-y-6">
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-foreground mb-2 flex items-center gap-3">
                                <MessageSquare className="text-primary w-8 h-8" />
                                Support & Help
                            </h1>
                            <p className="text-muted-foreground">
                                Having trouble? Raise a ticket and our admin team will assist you.
                            </p>
                        </div>

                        <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6 md:p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <Send className="w-5 h-5 text-primary" />
                                Raise a Ticket
                            </h2>
                            <SupportTicketForm />
                        </div>
                    </div>

                    {/* Ticket History Sidebar */}
                    <div className="w-full md:w-96 space-y-6">
                        <div className="bg-card rounded-3xl border border-border/50 shadow-sm p-6 h-fit">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <History className="w-5 h-5 text-muted-foreground" />
                                Recent Tickets
                            </h2>
                            <TicketHistory />
                        </div>

                        <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100">
                            <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Quick Tips
                            </h3>
                            <ul className="text-sm text-blue-700 space-y-2 list-disc pl-4">
                                {SUPPORT_QUICK_TIPS.map((tip) => (
                                    <li key={tip}>{tip}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}

function SupportTicketForm() {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const { user } = useAuth()

    const [formData, setFormData] = useState(EMPTY_SUPPORT_FORM)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            if (!user) {
                throw new Error('Not authenticated')
            }

            await reportApi.create({
                ...formData,
                role: 'VENDOR',
                reporterId: user.id,
                status: 'PENDING'
            })

            toast({
                title: "Ticket Raised",
                description: "Support team has been notified.",
            })

            // Reset form
            setFormData(EMPTY_SUPPORT_FORM)

            // Trigger history refresh event
            window.dispatchEvent(new Event('ticket-created'))

        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to submit ticket. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-background"
                    >
                        {SUPPORT_CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-muted-foreground">Priority</label>
                    <select
                        value={formData.priority}
                        onChange={e => setFormData({ ...formData, priority: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border bg-background"
                    >
                        {SUPPORT_PRIORITY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <input
                    required
                    type="text"
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="e.g., Cannot update menu price..."
                />
            </div>

            <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <textarea
                    required
                    rows={5}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    placeholder="Describe the issue in detail..."
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full btn-gradient py-6 rounded-xl font-bold">
                {loading ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                Submit Ticket
            </Button>
        </form>
    )
}

function TicketHistory() {
    const [tickets, setTickets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()

    const fetchTickets = async () => {
        try {
            if (!user) return

            const allReports = await reportApi.getAll().catch(() => [])

            const myReports = Array.isArray(allReports)
                ? allReports.filter((r: any) => r.reporterId === user.id || r.email === user.email)
                : []

            setTickets(myReports)
        } catch (e) {

        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTickets()
        window.addEventListener('ticket-created', fetchTickets)
        return () => window.removeEventListener('ticket-created', fetchTickets)
    }, [])

    if (loading) return <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-primary" /></div>

    if (tickets.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                <p className="text-sm">No ticket history found.</p>
            </div>
        )
    }

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {tickets.map((ticket, i) => (
                <div key={i} className="p-3 bg-background rounded-xl border text-sm hover:border-primary/30 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getTicketStatusClassName(ticket.status)}`}>
                            {ticket.status}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.createdAt || Date.now()).toLocaleDateString()}
                        </span>
                    </div>
                    <p className="font-semibold text-foreground line-clamp-1">{ticket.subject}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ticket.description}</p>
                </div>
            ))}
        </div>
    )
}
