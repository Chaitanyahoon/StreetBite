"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flame, Star, TrendingUp, UtensilsCrossed } from "lucide-react";
import { RESULTS } from "./FoodPersonalityQuiz";

interface UserStats {
    xp: number;
    level: number;
    rank: number;
    displayName: string;
}

export function UserStats() {
    const [archetype, setArchetype] = useState<keyof typeof RESULTS | null>(null);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadArchetype = () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem("tasteArchetype");
                if (saved && RESULTS[saved as keyof typeof RESULTS]) {
                    setArchetype(saved as keyof typeof RESULTS);
                } else {
                    setArchetype(null);
                }
            }
        };

        loadArchetype();
        window.addEventListener("storage", loadArchetype);
        return () => window.removeEventListener("storage", loadArchetype);
    }, []);

    useEffect(() => {
        fetchUserStats();
    }, []);

    const fetchUserStats = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/gamification/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch user stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const statItems = stats ? [
        { label: "Total XP", value: stats.xp.toLocaleString(), icon: Trophy, color: "text-yellow-500" },
        { label: "Streak", value: "0 days", icon: Flame, color: "text-orange-500" },
        { label: "Badges", value: "0", icon: Star, color: "text-purple-500" },
        { label: "Rank", value: `#${stats.rank}`, icon: TrendingUp, color: "text-blue-500" },
    ] : [];

    return (
        <Card className="bg-[#1a103c] border-none shadow-xl relative overflow-hidden ring-1 ring-white/10">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <CardContent className="pt-6 pb-4 relative z-10">
                <div className="text-center mb-6">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-400 to-pink-600 flex items-center justify-center text-4xl mb-3 shadow-[0_0_20px_rgba(249,115,22,0.3)] relative border-2 border-white/10">
                        👤
                        {archetype && (
                            <div className="absolute -bottom-2 -right-2 bg-[#1a103c] text-white text-sm p-1.5 rounded-full border border-white/20 shadow-lg" title={RESULTS[archetype].title}>
                                {RESULTS[archetype].icon}
                            </div>
                        )}
                    </div>
                    <h3 className="font-black text-xl text-white tracking-tight">
                        {loading ? "Loading..." : stats?.displayName || "Your Stats"}
                    </h3>
                    <p className="text-xs text-indigo-200 uppercase tracking-widest font-medium mt-1">
                        {stats ? `Level ${stats.level} Foodie` : "Level 1 Foodie"}
                    </p>

                    {archetype && (
                        <div className="mt-4 inline-block px-4 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <UtensilsCrossed className="w-3 h-3 text-orange-400" />
                                <span className="text-[10px] font-bold text-orange-100 uppercase tracking-[0.15em]">
                                    {RESULTS[archetype].title}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="text-center text-white/50 text-sm py-4">Loading stats...</div>
                ) : stats ? (
                    <div className="grid grid-cols-2 gap-3">
                        {statItems.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-white/5 p-3 rounded-xl text-center border border-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm group">
                                    <Icon className={`w-5 h-5 mx-auto mb-2 ${stat.color} group-hover:scale-110 transition-transform duration-300`} />
                                    <div className="text-lg font-black text-white">{stat.value}</div>
                                    <div className="text-[10px] text-indigo-200 uppercase tracking-wider font-medium">{stat.label}</div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-white/50 text-sm py-4">Log in to see your stats</div>
                )}
            </CardContent>
        </Card>
    );
}
