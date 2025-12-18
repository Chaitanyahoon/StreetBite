"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Crown, Sparkles, RefreshCw } from "lucide-react";
import Image from "next/image";

interface User {
    id: number;
    name: string;
    xp: number;
    level: number;
    avatar: string;
    profilePicture?: string;
}

import { gamificationApi } from "@/lib/api";
import { useEffect, useState } from "react";
import { useGamification, getLevelFromXP } from "@/context/GamificationContext";

export function Leaderboard() {
    const { xp, level, rank, displayName } = useGamification();
    const [leaderboard, setLeaderboard] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userProfilePic, setUserProfilePic] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);

        // Load user profile picture
        const userStr = localStorage.getItem('user');
        if (userStr) {
            try {
                const user = JSON.parse(userStr);
                setUserProfilePic(user.profilePicture || '');
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchLeaderboard(true);
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const fetchLeaderboard = async (silent = false) => {
        if (!silent) setLoading(true);
        setRefreshing(true);

        try {
            const data = await gamificationApi.getLeaderboard();
            const formattedData = data.map((user: any, index: number) => ({
                id: user.id,
                name: user.displayName || "Anonymous",
                xp: user.xp || 0,
                level: getLevelFromXP(user.xp || 0), // Use scaled level calculation
                avatar: getAvatarForRank(index + 1),
                profilePicture: user.profilePicture
            }));
            setLeaderboard(formattedData);
        } catch (error) {
            console.error("Failed to fetch leaderboard", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const getAvatarForRank = (rank: number) => {
        if (rank === 1) return "👑";
        if (rank === 2) return "🌟";
        if (rank === 3) return "🔥";
        return "👤";
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-5 h-5 text-yellow-500 fill-yellow-500 animate-pulse" />;
            case 2: return <Medal className="w-5 h-5 text-gray-400 fill-gray-100" />;
            case 3: return <Medal className="w-5 h-5 text-orange-600 fill-orange-100" />;
            default: return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
        }
    };

    const getRankStyles = (rank: number) => {
        switch (rank) {
            case 1: return "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-sm scale-[1.02]";
            case 2: return "bg-white border-gray-100";
            case 3: return "bg-white border-orange-100";
            default: return "bg-white/50 border-transparent hover:bg-white hover:shadow-sm";
        }
    };

    return (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white rounded-[2rem]">
            <CardHeader className="pb-4 border-b-4 border-black bg-yellow-300 p-6">
                <CardTitle className="text-xl flex items-center justify-between text-black">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black rounded-lg transform -rotate-3 hover:rotate-0 transition-transform">
                            <Trophy className="w-6 h-6 text-yellow-300" />
                        </div>
                        <div>
                            <span className="block text-xl font-black uppercase tracking-tight">Top Foodies</span>
                            <span className="block text-xs font-bold text-black/60 uppercase tracking-wide">Weekly Ranking</span>
                        </div>
                    </div>
                    <button
                        onClick={() => fetchLeaderboard()}
                        disabled={refreshing}
                        className="p-2 hover:bg-black hover:text-white rounded-lg transition-colors disabled:opacity-50 border-2 border-black bg-white"
                        title="Refresh leaderboard"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 px-6">
                {loading ? (
                    <div className="text-center py-8 text-gray-500 font-bold animate-pulse">Loading rankings...</div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 font-bold">No players yet. Be the first!</div>
                ) : (
                    leaderboard.map((user, index) => (
                        <div
                            key={user.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 border-black transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 bg-white`}
                        >
                            <div className="flex items-center justify-center w-8 font-black text-xl text-black">
                                {index + 1}
                            </div>

                            <div className="relative">
                                <div className={`w-12 h-12 relative rounded-full flex items-center justify-center text-xl border-2 border-black overflow-hidden ${index === 0 ? 'bg-yellow-100 ring-2 ring-yellow-400 ring-offset-2' : 'bg-gray-100'}`}>
                                    {user.profilePicture ? (
                                        <Image
                                            src={user.profilePicture.startsWith('http') || user.profilePicture.startsWith('/') ? user.profilePicture : `/avatars/${user.profilePicture}`}
                                            alt={user.name}
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <span>{user.avatar}</span>
                                    )}
                                </div>
                                {index === 0 && (
                                    <div className="absolute -top-3 -right-2 transform rotate-12">
                                        <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="font-black text-base text-black truncate flex items-center gap-2">
                                    {user.name}
                                    {index < 3 && <span className="text-[10px] px-2 py-0.5 rounded-full bg-black text-white font-bold uppercase tracking-wider">TOP {index + 1}</span>}
                                </div>
                                <div className="text-xs text-gray-500 font-bold uppercase tracking-wide">
                                    Level {user.level} {index === 0 ? "🔥" : ""}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-lg font-black text-black">
                                    {user.xp.toLocaleString()}
                                </div>
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-wider">XP</div>
                            </div>
                        </div>
                    ))
                )}

                {isAuthenticated && (
                    <div className="pt-4 border-t-2 border-dashed border-gray-300 mt-2">
                        <div className="flex items-center justify-between p-4 bg-black rounded-xl shadow-[4px_4px_0px_0px_#9ca3af] text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 relative rounded-full bg-white flex items-center justify-center text-lg border-2 border-gray-500 overflow-hidden">
                                    {userProfilePic ? (
                                        <Image
                                            src={userProfilePic.startsWith('http') || userProfilePic.startsWith('/') ? userProfilePic : `/avatars/${userProfilePic}`}
                                            alt="You"
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <span>👤</span>
                                    )}
                                </div>
                                <div>
                                    <div className="font-bold text-sm text-yellow-400">You ({displayName || 'User'})</div>
                                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Level {level}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-black text-white">{xp.toLocaleString()}</div>
                                <div className="text-[10px] text-gray-500 font-bold">#{rank > 0 ? rank : '-'}</div>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
