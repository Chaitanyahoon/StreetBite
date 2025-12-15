"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Share2, RefreshCw, Star, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { ZodiacSelector } from "./ZodiacSelector";

interface ZodiacData {
    zodiacSign: string;
    prediction: string;
    luckyDish: string;
    luckyTime: string;
    challenge: string;
}

const ZODIAC_INFO: Record<string, { emoji: string; element: string; color: string; bg: string }> = {
    "Aries": { emoji: "♈", element: "Fire", color: "from-red-500 to-orange-500", bg: "bg-red-50" },
    "Taurus": { emoji: "♉", element: "Earth", color: "from-green-600 to-emerald-500", bg: "bg-green-50" },
    "Gemini": { emoji: "♊", element: "Air", color: "from-yellow-500 to-amber-500", bg: "bg-yellow-50" },
    "Cancer": { emoji: "♋", element: "Water", color: "from-blue-400 to-cyan-400", bg: "bg-blue-50" },
    "Leo": { emoji: "♌", element: "Fire", color: "from-orange-500 to-yellow-500", bg: "bg-orange-50" },
    "Virgo": { emoji: "♍", element: "Earth", color: "from-green-500 to-teal-500", bg: "bg-green-50" },
    "Libra": { emoji: "♎", element: "Air", color: "from-pink-500 to-rose-500", bg: "bg-pink-50" },
    "Scorpio": { emoji: "♏", element: "Water", color: "from-purple-600 to-indigo-600", bg: "bg-purple-50" },
    "Sagittarius": { emoji: "♐", element: "Fire", color: "from-purple-500 to-pink-500", bg: "bg-purple-50" },
    "Capricorn": { emoji: "♑", element: "Earth", color: "from-gray-700 to-slate-600", bg: "bg-gray-50" },
    "Aquarius": { emoji: "♒", element: "Air", color: "from-blue-500 to-purple-500", bg: "bg-blue-50" },
    "Pisces": { emoji: "♓", element: "Water", color: "from-teal-500 to-cyan-500", bg: "bg-teal-50" }
};

export function ZodiacCard() {
    const [selectedSign, setSelectedSign] = useState<string | null>(null);
    const [data, setData] = useState<ZodiacData | null>(null);
    const [loading, setLoading] = useState(false);
    const [xpClaimed, setXpClaimed] = useState(false);

    const fetchHoroscopeBySign = async (sign: string) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://localhost:8081/api/zodiac/sign/${sign}`);
            setData(response.data);
            setSelectedSign(sign);
            setXpClaimed(false);
        } catch (error) {
            console.error("Error fetching horoscope:", error);
            // Fallback for demo if backend is not running
            setData({
                zodiacSign: sign,
                prediction: "Today is a great day to try something spicy! Your taste buds are craving adventure.",
                luckyDish: "Masala Dosa",
                luckyTime: "7:00 PM",
                challenge: "Eat something with green chutney"
            });
            setSelectedSign(sign);
            setXpClaimed(false);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeDate = () => {
        setSelectedSign(null);
        setData(null);
        setXpClaimed(false);
    };

    const handleClaimXP = () => {
        setXpClaimed(true);
        toast.success("Challenge Completed! +10 XP 🌟");
    };

    const handleShare = async () => {
        if (navigator.share && data) {
            try {
                await navigator.share({
                    title: `My Food Horoscope for ${data.zodiacSign} 🔮`,
                    text: `Today's Prediction: ${data.prediction}\nLucky Dish: ${data.luckyDish}\nPlay the Zodiac Game on StreetBite!`,
                    url: window.location.href,
                });
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            toast.info("Sharing not supported on this device");
        }
    };

    if (loading) return (
        <Card className="w-full max-w-2xl mx-auto h-64 flex items-center justify-center bg-white/50 backdrop-blur-sm border-none shadow-soft">
            <div className="flex flex-col items-center gap-3 animate-pulse">
                <Sparkles className="w-8 h-8 text-orange-400 animate-spin-slow" />
                <p className="text-muted-foreground font-medium">Consulting the stars... 🔮</p>
            </div>
        </Card>
    );

    if (!selectedSign || !data) {
        return <ZodiacSelector onSelect={fetchHoroscopeBySign} />;
    }

    const zodiacInfo = ZODIAC_INFO[data.zodiacSign] || ZODIAC_INFO["Aries"];

    return (
        <Card className="w-full max-w-2xl mx-auto overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-[2rem]">
            {/* Background Pattern */}
            <div className={`absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] -z-10`} />

            <CardHeader className="pb-2 pt-6 px-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${zodiacInfo.color} flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black transform rotate-3 transition-transform hover:rotate-0`}>
                            <span className="text-5xl text-white drop-shadow-md">{zodiacInfo.emoji}</span>
                        </div>
                        <div>
                            <CardTitle className="text-4xl font-black text-black tracking-tight uppercase">
                                {data.zodiacSign}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider bg-black text-white border-2 border-black`}>
                                    {zodiacInfo.element}
                                </span>
                                <span className="text-xs text-gray-500 font-bold flex items-center gap-1 uppercase tracking-wide bg-gray-100 px-2 py-1 rounded-lg border-2 border-gray-200">
                                    <Moon className="w-3 h-3" /> Horoscope
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleChangeDate}
                            className="text-xs h-9 px-3 hover:bg-orange-50 text-gray-500 hover:text-black font-bold border-2 border-gray-200 hover:border-black rounded-xl transition-all"
                        >
                            <RefreshCw className="w-3 h-3 mr-1.5" />
                            Change
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 border-2 border-gray-200 hover:border-black rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all" onClick={handleShare}>
                            <Share2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-6 pb-8 px-6 space-y-6">
                <div className="relative bg-orange-50 p-6 rounded-3xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Sparkles className="absolute -top-3 -right-3 w-8 h-8 text-orange-400 fill-orange-400 stroke-black stroke-2 animate-pulse" />
                    <p className="text-xl font-bold text-black leading-relaxed text-center font-serif">
                        "{data.prediction}"
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 border-2 border-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <span className="text-xl">🍽️</span>
                            </div>
                            <p className="text-xs font-black text-orange-600 uppercase tracking-wide">Lucky Dish</p>
                        </div>
                        <p className="text-lg font-black text-black pl-1">{data.luckyDish}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform group">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 border-2 border-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <span className="text-xl">⏰</span>
                            </div>
                            <p className="text-xs font-black text-blue-600 uppercase tracking-wide">Lucky Time</p>
                        </div>
                        <p className="text-lg font-black text-black pl-1">{data.luckyTime}</p>
                    </div>
                </div>

                <div className="bg-yellow-300 rounded-3xl p-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="bg-white rounded-[20px] p-5 border-2 border-black">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Star className="w-6 h-6 text-yellow-400 fill-yellow-400 stroke-black stroke-2 animate-pulse" />
                                <h4 className="text-base font-black text-black uppercase tracking-tight">Daily Challenge</h4>
                            </div>
                            <span className="text-xs font-black text-white bg-orange-500 px-3 py-1 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">+10 XP</span>
                        </div>
                        <p className="text-sm text-gray-800 font-bold mb-5 pl-8 border-l-4 border-gray-200">{data.challenge}</p>
                        <Button
                            onClick={handleClaimXP}
                            disabled={xpClaimed}
                            className={`w-full h-12 rounded-xl font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black transition-all hover:-translate-y-1 active:translate-y-0 active:shadow-none ${xpClaimed
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-black text-white hover:bg-gray-800"
                                }`}
                        >
                            {xpClaimed ? (
                                <span className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Challenge Completed!
                                </span>
                            ) : "Claim Reward"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
