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
                <Button variant="outline" size="lg" className="h-14 px-8 rounded-xl border-4 border-black bg-white text-black hover:bg-yellow-400 text-lg font-black gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1">
                    <MessageSquarePlus size={24} strokeWidth={2.5} />
                    Open Support Ticket
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-[2rem] p-0 gap-0 bg-[#FFFBF0]">
                <DialogHeader className="p-8 border-b-4 border-black bg-yellow-300">
                    <DialogTitle className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                        <MessageSquarePlus size={32} strokeWidth={2.5} />
                        Send us a message
                    </DialogTitle>
                    <DialogDescription className="text-black font-bold text-lg opacity-80">
                        Found a bug or have a suggestion? We'd love to hear from you.
                    </DialogDescription>
                </DialogHeader>
                <div className="p-8">
                    <ReportForm onSuccess={() => setOpen(false)} />
                </div>
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
                <div className="w-20 h-20 bg-green-400 text-black border-4 border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
                    <CheckCircle size={40} strokeWidth={3} />
                </div>
                <h3 className="text-3xl font-black mb-2 uppercase">Message Sent!</h3>
                <p className="text-black font-bold text-lg mb-6">Thanks for helping us make StreetBite better.</p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider pl-1">Your Email (Optional)</label>
                    <input
                        type="email"
                        placeholder="For follow-up..."
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-4 border-black rounded-xl font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-gray-400"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-wider pl-1">Category</label>
                    <div className="relative">
                        <select
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-4 border-black rounded-xl font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="BUG">Bug Report</option>
                            <option value="COMPLAINT">Complaint</option>
                            <option value="SUGGESTION">Suggestion</option>
                            <option value="OTHER">Other</option>
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                            <div className="pb-1">▼</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-wider pl-1">Subject</label>
                <input
                    required
                    type="text"
                    placeholder="Brief summary..."
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-4 border-black rounded-xl font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none transition-all placeholder:text-gray-400"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-black uppercase tracking-wider pl-1">Description</label>
                <textarea
                    required
                    rows={4}
                    placeholder="Please describe the issue in detail..."
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-4 border-black rounded-xl font-bold focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none resize-none transition-all placeholder:text-gray-400"
                />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white border-4 border-black py-6 rounded-xl text-xl font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">
                {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                Submit Report
            </Button>
        </form>
    )
}
