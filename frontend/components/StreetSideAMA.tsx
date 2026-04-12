'use client'

import { useState } from 'react'
import { Mic2, MessageSquare, Send } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export interface StreetSideAMAProps {
    vendor?: {
        name?: string;
        description?: string;
        displayImageUrl?: string;
    } | null;
}

export function StreetSideAMA({ vendor }: StreetSideAMAProps) {
    const [question, setQuestion] = useState('')

    const vendorName = vendor?.name || "Momo King";
    const vendorDesc = vendor?.description || "Ask me anything about my secret 12-spice red chutney recipe or how I started this cart 10 years ago!";
    const vendorImage = vendor?.displayImageUrl || "https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=400&q=80";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!question.trim()) return

        toast.success("Question submitted!", {
            description: `If selected, ${vendorName} will answer it live.`,
            style: {
                background: '#000',
                color: '#fff',
                border: '4px solid #fff',
            }
        })
        setQuestion('')
    }

    return (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-[#D9F2E6] rounded-[2rem] overflow-hidden lg:col-span-2">
            <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
                <div className="flex items-center gap-2">
                    <Mic2 className="w-6 h-6 text-emerald-400" />
                    <h3 className="font-black text-xl uppercase tracking-widest">Street Side AMA</h3>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-black" />
                    <span className="text-xs font-black uppercase text-red-400">Live Now</span>
                </div>
            </div>
            
            <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Left: Vendor Info */}
                    <div className="p-6 md:border-r-4 border-black flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full border-4 border-black overflow-hidden bg-white">
                                <img src={vendorImage} alt={vendorName} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-400 border-2 border-black rounded-lg px-2 py-0.5 text-[10px] font-black uppercase rotate-6">
                                Featured
                            </div>
                        </div>
                        <h4 className="font-black text-3xl uppercase mb-1">{vendorName}</h4>
                        <p className="font-bold text-gray-600 mb-4 px-4 text-sm line-clamp-3">
                            "{vendorDesc}"
                        </p>
                        
                        <form onSubmit={handleSubmit} className="w-full mt-auto relative">
                            <Input 
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Drop your question..."
                                className="w-full pl-4 pr-12 h-12 bg-white border-2 border-black rounded-xl font-bold placeholder:text-gray-400 focus:ring-0 focus:border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                            />
                            <button 
                                type="submit" 
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white p-2 rounded-lg hover:bg-emerald-500 transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                    {/* Right: Q&A Highlight */}
                    <div className="p-6 bg-white flex flex-col justify-center">
                        <h5 className="font-black text-sm uppercase tracking-widest text-emerald-600 mb-4 border-b-2 border-emerald-100 pb-2">
                            Top Answered
                        </h5>
                        
                        <div className="space-y-6">
                            <div className="relative">
                                <div className="bg-gray-100 border-2 border-black p-3 rounded-xl rounded-tl-none font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ml-4">
                                    <span className="absolute -left-6 top-0 font-black text-2xl text-black/20">Q</span>
                                    Is the chutney really that spicy, or are people just weak?
                                </div>
                            </div>
                            
                            <div className="relative">
                                <div className="bg-emerald-100 border-2 border-black p-3 rounded-xl rounded-tr-none font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mr-4">
                                    <span className="absolute -right-6 top-0 font-black text-2xl text-emerald-500/30">A</span>
                                    Try it yourself! But seriously, I use Bhut Jolokia chillies imported directly. It's not a joke. 🔥
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-xs font-black uppercase text-gray-400">
                            124 more questions answered...
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
