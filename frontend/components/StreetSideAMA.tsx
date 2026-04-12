'use client'

import { useState, useMemo } from 'react'
import { Mic2, Send } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export interface StreetSideAMAProps {
    vendor?: {
        name?: string;
        description?: string;
        displayImageUrl?: string;
        image?: string;
    } | null;
}

const QA_POOL = [
    { q: "What's the one ingredient you'll never compromise on?", a: "Quality oil. Cheap oil ruins everything — the taste, the smell, the whole vibe. I'd rather close shop than serve something I wouldn't eat myself. 💯" },
    { q: "How did you come up with your signature recipe?", a: "Honestly? By accident! I was experimenting one night, mixed the wrong spices together, and my family went CRAZY for it. Been making it that way ever since. 🔥" },
    { q: "What's your busiest hour and why?", a: "8-9 PM, no contest. That's when the evening crowd hits — college kids, office workers, families. It's chaos but I love the energy! 🌙" },
    { q: "Any secret menu items regulars know about?", a: "If you know, you know 😏 Ask for the 'extra special' and I'll hook you up with my off-menu creation. Only for the real ones!" },
    { q: "What's the weirdest topping someone has requested?", a: "Someone once asked me to put chocolate sauce on a savory dish. I judged them hard... but then I tried it. Not terrible? Still judging though. 😂" },
    { q: "How do you keep your food consistent every single day?", a: "Muscle memory, honestly. After doing this for years, my hands just KNOW the right amount. But I still taste-test every batch — that's non-negotiable. 👨‍🍳" },
    { q: "What made you start your food business?", a: "I was tired of people saying 'you should sell this!' every time I cooked. Finally thought — why not? Best decision I ever made. No office, no boss, just me and the grill. 🙌" },
    { q: "Do you eat your own food daily?", a: "EVERY. SINGLE. DAY. If I'm not willing to eat it, why should you? That's my rule #1. Plus it's genuinely the best meal I know 😤" },
    { q: "What's one dish you wish more people ordered?", a: "My slow-cooked special! Everyone goes for the popular stuff, but the slow-cook has layers of flavor that hit different. Give it a shot, you won't regret it. 🍲" },
    { q: "Rain or shine — do you still set up?", a: "Rain, shine, heatwave — I'm there. My regulars count on me. Plus, rainy day sales are FIRE because everyone wants hot comfort food. ☔🔥" },
    { q: "What do you think sets street food apart from restaurants?", a: "Soul. No fancy plating, no pretension. Just raw, honest flavor made right in front of you. You can see the love going into every bite. ❤️" },
    { q: "How do you handle negative feedback?", a: "I take it seriously! If someone says something's off, I taste it myself. Usually they're wrong 😂 but sometimes they catch something real, and I fix it immediately." },
];

function getVendorQA(vendorName: string) {
    // Use the vendor name as a seed to consistently pick a Q&A pair per vendor
    let hash = 0;
    for (let i = 0; i < vendorName.length; i++) {
        hash = ((hash << 5) - hash) + vendorName.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % QA_POOL.length;
    return QA_POOL[index];
}

export function StreetSideAMA({ vendor }: StreetSideAMAProps) {
    const [question, setQuestion] = useState('')

    const vendorName = vendor?.name || "Today's Vendor";
    const vendorDesc = vendor?.description || "Ask me anything about my food, my journey, or my secret recipes!";
    const vendorImage = vendor?.image || vendor?.displayImageUrl || "https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?w=400&q=80";

    const qa = useMemo(() => getVendorQA(vendorName), [vendorName]);

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
                            &ldquo;{vendorDesc}&rdquo;
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

                    {/* Right: Q&A Highlight — dynamic per vendor */}
                    <div className="p-6 bg-white flex flex-col justify-center">
                        <h5 className="font-black text-sm uppercase tracking-widest text-emerald-600 mb-4 border-b-2 border-emerald-100 pb-2">
                            Top Answered
                        </h5>
                        
                        <div className="space-y-6">
                            <div className="relative">
                                <div className="bg-gray-100 border-2 border-black p-3 rounded-xl rounded-tl-none font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ml-4">
                                    <span className="absolute -left-6 top-0 font-black text-2xl text-black/20">Q</span>
                                    {qa.q}
                                </div>
                            </div>
                            
                            <div className="relative">
                                <div className="bg-emerald-100 border-2 border-black p-3 rounded-xl rounded-tr-none font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mr-4">
                                    <span className="absolute -right-6 top-0 font-black text-2xl text-emerald-500/30">A</span>
                                    {qa.a}
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-xs font-black uppercase text-gray-400">
                            More questions coming soon...
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
