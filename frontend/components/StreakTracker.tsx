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
        <Card className="overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-orange-500 relative group rounded-[2rem]">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

            <CardContent className="p-6 relative z-10 text-white">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="bg-black p-2 rounded-lg border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                                <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                            </div>
                            <h3 className="font-black text-xl tracking-tight uppercase">Taste Streak</h3>
                        </div>
                        <p className="text-black font-bold text-xs bg-white/20 inline-block px-2 py-0.5 rounded-md backdrop-blur-sm border border-black/10">Keep the fire burning!</p>
                    </div>
                    <div className="flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full border-2 border-white shadow-[2px_2px_0px_0px_rgba(255,255,255,0.5)] transform rotate-2">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-black uppercase tracking-wider">Lvl {level}</span>
                    </div>
                </div>

                {/* Main Counter */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative group/flame">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-yellow-400 rounded-full blur-md"
                            />
                            <div className={`relative w-20 h-20 flex items-center justify-center rounded-full border-4 border-black transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${hasCheckedInToday ? "bg-white" : "bg-black"}`}>
                                <Flame className={`w-10 h-10 ${hasCheckedInToday ? "text-orange-500 fill-orange-500" : "text-white fill-gray-800"}`} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-baseline gap-1">
                                <motion.span
                                    key={streak}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-6xl font-black tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,0.5)]"
                                >
                                    {streak}
                                </motion.span>
                                <span className="text-lg font-black text-black">DAYS</span>
                            </div>
                            <p className="text-xs font-bold text-white/90 uppercase tracking-widest">Personal Best: 12</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-black uppercase tracking-wider">Progress to Level {level + 1}</p>
                    <p className="text-xs font-black">{progress}%</p>
                </div>

                {/* Progress Bar */}
                <div className="h-6 w-full bg-black/20 rounded-full overflow-hidden border-4 border-black mb-6 relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-yellow-400 relative"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.4)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.4)_50%,rgba(255,255,255,0.4)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
                    </motion.div>
                </div>

                <Button
                    onClick={handleCheckIn}
                    disabled={hasCheckedInToday}
                    className={`w-full h-14 rounded-xl font-black text-lg uppercase tracking-wider border-4 border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 active:translate-y-0 active:shadow-none ${hasCheckedInToday
                        ? "bg-green-500 text-white hover:bg-green-500"
                        : "bg-white text-black hover:bg-gray-100"
                        }`}
                >
                    {hasCheckedInToday ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex items-center"
                        >
                            <CheckCircle2 className="w-6 h-6 mr-2" />
                            Checked In
                        </motion.div>
                    ) : (
                        <div className="flex items-center">
                            <Zap className="w-5 h-5 mr-2 fill-current" />
                            Check In Now
                        </div>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
