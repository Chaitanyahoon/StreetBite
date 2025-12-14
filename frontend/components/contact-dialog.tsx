'use client'

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
import { Loader2, CheckCircle, MessageSquarePlus } from "lucide-react"
import { reportApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export function ContactDialog() {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl border-2 hover:bg-slate-50 text-lg font-bold gap-2">
                    <MessageSquarePlus size={20} />
                    Open Support Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">Send us a message</DialogTitle>
                    <DialogDescription>
                        Found a bug or have a suggestion? We'd love to hear from you.
                    </DialogDescription>
                </DialogHeader>
                <ReportForm onSuccess={() => setOpen(false)} />
            </DialogContent>
        </Dialog>
    )
}

function ReportForm({ onSuccess }: { onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        category: 'BUG',
        email: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await reportApi.create({
                ...formData,
                role: 'CUSTOMER',
                status: 'PENDING'
            })
            setSuccess(true)
            setFormData({ subject: '', description: '', category: 'BUG', email: '' })
            toast({
                title: "Report Submitted",
                description: "Thank you for your feedback.",
            })
            setTimeout(() => {
                onSuccess()
                setSuccess(false) // Reset for next time
            }, 2000)
        } catch (error) {
            console.error('Report submission error:', error)
            toast({
                title: "Submission Failed",
                description: "Please try again later.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-scale-in">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Thank You!</h3>
                <p className="text-muted-foreground mb-6">Your report has been submitted successfully.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Your Email (Optional)</label>
                    <input
                        type="email"
                        placeholder="For follow-up..."
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                        <option value="BUG">Bug Report</option>
                        <option value="COMPLAINT">Complaint</option>
                        <option value="SUGGESTION">Suggestion</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <input
                    required
                    type="text"
                    placeholder="Brief summary..."
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                    required
                    rows={4}
                    placeholder="Please describe the issue in detail..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-xl text-lg font-bold shadow-lg">
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                Submit Report
            </Button>
        </form>
    )
}
