"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, CheckCircle2, Trophy, Star, Zap } from "lucide-react";
import { motion } from "framer-motion";

import { useGamification } from "@/context/GamificationContext";

export function StreakTracker() {
    const { streak, checkIn, hasCheckedInToday, level } = useGamification();
    const [progress, setProgress] = useState(70); // This could also be dynamic based on XP

    const handleCheckIn = () => {
        checkIn();
        setProgress(prev => Math.min(prev + 20, 100));
    };

    return (
        <Card className="overflow-hidden border-none shadow-xl relative group">
            {/* Full Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-red-500 to-pink-600" />

            {/* Decorative Patterns */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-500/20 rounded-full blur-xl -ml-5 -mb-5" />

            <CardContent className="p-6 relative z-10 text-white">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Flame className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse" />
                            <h3 className="font-bold text-lg tracking-tight">Taste Streak</h3>
                        </div>
                        <p className="text-orange-100 text-xs font-medium">Keep the fire burning!</p>
                    </div>
                    <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/30 shadow-sm">
                        <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                        <span className="text-xs font-bold">Lvl {level}</span>
                    </div>
                </div>

                {/* Main Counter */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-yellow-500 rounded-full blur-lg"
                            />
                            <div className={`relative p-4 rounded-full transition-all duration-500 ${hasCheckedInToday ? "bg-white text-orange-600 shadow-lg" : "bg-white/20 text-white backdrop-blur-sm border border-white/30"}`}>
                                <Flame className={`w-8 h-8 ${hasCheckedInToday ? "fill-orange-500" : "fill-white/50"}`} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <motion.span
                                    key={streak}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-4xl font-black tracking-tighter"
                                >
                                    {streak}
                                </motion.span>
                                <span className="text-sm font-bold text-orange-200">days</span>
                            </div>
                            <p className="text-xs text-orange-200/80">Personal Best: 12 days</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleCheckIn}
                        disabled={hasCheckedInToday}
                        className={`h-12 px-6 rounded-xl font-bold transition-all shadow-lg ${hasCheckedInToday
                            ? "bg-white/20 text-white border border-white/30 hover:bg-white/30"
                            : "bg-white text-orange-600 hover:bg-orange-50 hover:scale-105 active:scale-95"
                            }`}
                    >
                        {hasCheckedInToday ? (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center"
                            >
                                <CheckCircle2 className="w-5 h-5 mr-2" />
                                Done
                            </motion.div>
                        ) : (
                            <div className="flex items-center">
                                <Zap className="w-4 h-4 mr-2 fill-current" />
                                Check In
                            </div>
                        )}
                    </Button>
                </div>

                {/* Liquid Progress Bar */}
                <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-xs font-bold text-orange-100">
                        <span>Progress to Level {level + 1}</span>
                        <span>{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 relative"
                        >
                            <div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite]" />
                        </motion.div>
                    </div>
                </div>

                {/* Next Reward */}
                <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-3 rounded-xl border border-white/10">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg shadow-inner">
                        <Trophy className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-white">Next Reward: Spicy Badge</p>
                        <p className="text-[10px] text-orange-200">Check in for 3 more days</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
