'use client'

import { Target, CheckCircle2, ChevronRight, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { gamificationApi } from '@/lib/api'

export function BiteBounties() {
    const handleAccept = async (niche: string, amount: number) => {
        try {
            await gamificationApi.performNicheAction(niche, amount);
        } catch (e) {
            console.warn("Silent bounty fail", e);
        }
        
        toast.success("Bounty Accepted!", {
            description: `You have 48 hours to complete this quest. (+${amount} ${niche} XP unlocked just for trying!)`,
            style: {
                background: '#000',
                color: '#fff',
                border: '4px solid #fff',
            }
        })
    }

    return (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-rose-50 rounded-[2rem] overflow-hidden">
            <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
                <div className="flex items-center gap-2">
                    <Target className="w-6 h-6 text-rose-500" />
                    <h3 className="font-black text-xl uppercase tracking-widest">Active Bounties</h3>
                </div>
                <span className="bg-rose-500 text-white text-xs font-black uppercase px-3 py-1 rounded-full border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                    New Weekly
                </span>
            </div>
            <CardContent className="p-6 space-y-4">
                <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-100 rounded-full mix-blend-multiply filter blur-2xl opacity-70 group-hover:scale-150 transition-transform"></div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black text-lg uppercase text-black line-clamp-1 group-hover:text-rose-600 transition-colors">
                                The Fire Breather
                            </h4>
                            <span className="text-xl font-black text-rose-500 bg-rose-100 px-2 rounded-md border-2 border-black -rotate-3">
                                500 XP
                            </span>
                        </div>
                        <p className="text-sm font-bold text-gray-700 mb-4 h-10">
                            Find and review the spiciest dish in your 5km radius. Must include a picture of your tears.
                        </p>
                        
                        <div className="flex justify-between items-center mb-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-200 overflow-hidden z-10" style={{ zIndex: 10 - i }}>
                                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="avatar" />
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center z-0 text-[10px] font-black">
                                    +42
                                </div>
                            </div>
                            <div className="text-xs font-black uppercase text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Ends in 2d
                            </div>
                        </div>

                        <Button 
                            className="w-full bg-black text-white hover:bg-rose-500 border-2 border-black font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none"
                            onClick={() => handleAccept('spice', 500)}
                        >
                            Accept Bounty <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>

                <div className="bg-white border-4 border-black p-5 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                     <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-black text-lg uppercase text-black line-clamp-1 group-hover:text-blue-600 transition-colors">
                                Early Bird
                            </h4>
                            <span className="text-xl font-black text-blue-500 bg-blue-100 px-2 rounded-md border-2 border-black rotate-2">
                                200 XP
                            </span>
                        </div>
                        <p className="text-sm font-bold text-gray-700 mb-4 h-10">
                            Post a breakfast review before 8:00 AM local time.
                        </p>
                        
                        <Button 
                            className="w-full bg-black text-white hover:bg-blue-500 border-2 border-black font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none"
                            onClick={() => handleAccept('night', 200)}
                        >
                            Accept Bounty <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
