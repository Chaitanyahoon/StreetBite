'use client'

import { useState, useEffect } from 'react'
import { Crown, Flame, Cookie, Moon, Trophy, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

type LeaderboardCategory = 'spice' | 'sugar' | 'night'

interface ApiUser {
    id: number;
    displayName: string;
    xp: number;
    level: number;
    profilePicture: string;
}

interface RankedUser extends ApiUser {
    rank: number;
}

export function FlavorLeaderboards() {
    const [activeTab, setActiveTab] = useState<LeaderboardCategory>('spice')
    const [leaderboardData, setLeaderboardData] = useState<Record<LeaderboardCategory, RankedUser[]>>({
        spice: [], sugar: [], night: []
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchLeaderboards = async () => {
            try {
                // In local dev, assuming no CORS issues since next.config.js might proxy, 
                // or backend runs on 8081. Let's use relative path if we have rewrites or absolute if needed.
                // Assuming NextJS proxy or standard fetch:
                const res = await fetch('http://localhost:8081/api/gamification/niche-leaderboard');
                if (res.ok) {
                    const data = await res.json();
                    
                    // Helper to inject ranks
                    const addRanks = (arr: ApiUser[]): RankedUser[] => {
                        return (arr || []).map((u, i) => ({ ...u, rank: i + 1 }));
                    }

                    setLeaderboardData({
                        spice: addRanks(data.spice),
                        sugar: addRanks(data.sugar),
                        night: addRanks(data.night)
                    });
                }
            } catch (error) {
                console.error("Failed to fetch niche leaderboards", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboards();
    }, []);

    return (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-amber-50 rounded-[2rem] overflow-hidden">
            <div className="bg-black text-white p-4 flex justify-between items-center border-b-4 border-black">
                <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    <h3 className="font-black text-xl uppercase tracking-widest">Flavor Kings</h3>
                </div>
            </div>
            
            <div className="flex border-b-4 border-black bg-white">
                <button 
                    onClick={() => setActiveTab('spice')}
                    className={`flex-1 flex flex-col items-center p-3 border-r-4 border-black transition-colors ${activeTab === 'spice' ? 'bg-orange-400 text-black' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                    <Flame className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-black uppercase">Spice Lords</span>
                </button>
                <button 
                    onClick={() => setActiveTab('sugar')}
                    className={`flex-1 flex flex-col items-center p-3 border-r-4 border-black transition-colors ${activeTab === 'sugar' ? 'bg-pink-400 text-black' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                    <Cookie className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-black uppercase">Sugar Fiends</span>
                </button>
                <button 
                    onClick={() => setActiveTab('night')}
                    className={`flex-1 flex flex-col items-center p-3 transition-colors ${activeTab === 'night' ? 'bg-indigo-400 text-black' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                    <Moon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-black uppercase">Night Owls</span>
                </button>
            </div>

            <CardContent className="p-6">
                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-black" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {leaderboardData[activeTab]?.length === 0 ? (
                            <div className="text-center font-bold text-gray-500 py-8">
                                No kings here yet. Claim the throne!
                            </div>
                        ) : (
                            leaderboardData[activeTab].map((user) => (
                                <div 
                                    key={user.id} 
                                    className="bg-white border-4 border-black p-3 rounded-2xl flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 transition-transform"
                                >
                                    <div className="flex-shrink-0 w-8 text-center font-black text-2xl mr-2 text-black/30">
                                        #{user.rank}
                                    </div>
                                    <div className="relative text-black">
                                        <div className="w-12 h-12 rounded-full border-4 border-black overflow-hidden bg-gray-200">
                                            <img src={user.profilePicture || 'https://i.pravatar.cc/100'} alt={user.displayName} />
                                        </div>
                                        {user.rank === 1 && (
                                            <div className="absolute -top-3 -right-2 bg-yellow-400 border-2 border-black rounded-full p-1 rotate-12">
                                                <Crown className="w-4 h-4 text-black" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h4 className="font-black text-lg uppercase leading-none">{user.displayName}</h4>
                                        <span className="text-xs font-bold text-gray-500">{user.xp?.toLocaleString()} XP</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
