"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Flame, Star, TrendingUp, UtensilsCrossed } from "lucide-react";
import { RESULTS } from "./FoodPersonalityQuiz";
import { useGamification, getXPForLevel, getXPForNextLevel, getXPProgressInCurrentLevel } from "@/context/GamificationContext";

interface UserStats {
    xp: number;
    level: number;
    rank: number;
    displayName: string;
}

export function UserStats() {
    const { xp, level, rank, displayName, streak } = useGamification();
    const [archetype, setArchetype] = useState<keyof typeof RESULTS | null>(null);
    const [profilePicture, setProfilePicture] = useState<string>('');

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

        const loadProfilePicture = () => {
            if (typeof window !== 'undefined') {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    try {
                        const user = JSON.parse(userStr);
                        setProfilePicture(user.profilePicture || '');
                    } catch (e) {
                        console.error('Error parsing user data:', e);
                    }
                }
            }
        };

        loadArchetype();
        loadProfilePicture();
        window.addEventListener("storage", loadArchetype);
        window.addEventListener("user-updated", loadProfilePicture);
        return () => {
            window.removeEventListener("storage", loadArchetype);
            window.removeEventListener("user-updated", loadProfilePicture);
        };
    }, []);

    // Calculate XP progress with scaled leveling
    const xpProgress = getXPProgressInCurrentLevel(xp, level);
    const xpNeeded = getXPForNextLevel(level) - xp;

    const statItems = [
        { label: "Total XP", value: xp.toLocaleString(), icon: Trophy, color: "text-yellow-500" },
        { label: "Streak", value: `${streak} days`, icon: Flame, color: "text-orange-500" },
        { label: "Badges", value: "0", icon: Star, color: "text-purple-500" },
        { label: "Rank", value: `#${rank || '-'}`, icon: TrendingUp, color: "text-blue-500" },
    ];

    return (
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden rounded-[2rem]">
            <CardContent className="pt-8 pb-6 relative z-10">
                <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto rounded-full bg-yellow-300 flex items-center justify-center text-5xl mb-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative border-4 border-black overflow-hidden group">
                        {profilePicture ? (
                            <img
                                src={profilePicture.startsWith('http') || profilePicture.startsWith('/') ? profilePicture : `/avatars/${profilePicture}`}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '';
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    (e.target as HTMLImageElement).nextElementSibling?.remove();
                                }}
                            />
                        ) : (
                            <span className="group-hover:scale-110 transition-transform block">👤</span>
                        )}
                        {archetype && (
                            <div className="absolute -bottom-1 -right-1 bg-white text-black text-lg p-1.5 rounded-full border-2 border-black shadow-sm z-10" title={RESULTS[archetype].title}>
                                {RESULTS[archetype].icon}
                            </div>
                        )}
                    </div>
                    <h3 className="font-black text-2xl text-black tracking-tight uppercase">
                        {displayName || "Your Stats"}
                    </h3>
                    <div className="inline-block px-3 py-1 bg-black text-white text-xs font-black uppercase tracking-widest mt-2 rounded-lg border-2 border-black transform -rotate-2">
                        {`Level ${level} Foodie`}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-40 mx-auto mt-4 h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-black relative">
                        <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(xpProgress, 100)}%` }}
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:10px_10px]" />
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold mt-1.5 uppercase tracking-wide">
                        {`${xpNeeded} XP to next level`}
                    </p>

                    {archetype && (
                        <div className="mt-5 inline-block px-4 py-2 bg-yellow-50 rounded-xl border-2 border-black hover:-translate-y-1 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-center gap-2">
                                <UtensilsCrossed className="w-4 h-4 text-black" />
                                <span className="text-xs font-black text-black uppercase tracking-wider">
                                    {RESULTS[archetype].title}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 px-2">
                    {statItems.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white p-3 rounded-xl text-center border-2 border-black hover:bg-orange-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 group">
                                <Icon className={`w-5 h-5 mx-auto mb-2 text-black group-hover:scale-110 transition-transform duration-300`} />
                                <div className="text-lg font-black text-black leading-none mb-1">{stat.value}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
