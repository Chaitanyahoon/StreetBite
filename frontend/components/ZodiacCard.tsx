"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Share2, RefreshCw, Star, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { zodiacApi } from "@/lib/api";
import { ZodiacSelector } from "./ZodiacSelector";
import { playSelect, playSuccess, triggerHaptic } from "@/lib/sound-effects";

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
    "Scorpio": { emoji: "♏", element: "Water", color: "from-emerald-600 to-cyan-600", bg: "bg-emerald-50" },
    "Sagittarius": { emoji: "♐", element: "Fire", color: "from-emerald-500 to-pink-500", bg: "bg-emerald-50" },
    "Capricorn": { emoji: "♑", element: "Earth", color: "from-gray-700 to-slate-600", bg: "bg-gray-50" },
    "Aquarius": { emoji: "♒", element: "Air", color: "from-blue-500 to-emerald-500", bg: "bg-blue-50" },
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
            const responseData = await zodiacApi.getHoroscope(sign);
            setData(responseData);
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
        playSelect();
        triggerHaptic(50);
        setSelectedSign(null);
        setData(null);
        setXpClaimed(false);
    };

    const handleClaimXP = () => {
        playSuccess();
        triggerHaptic([100, 50, 150]);
        setXpClaimed(true);
        toast.success("Challenge Completed! +10 XP 🌟");
    };

    const handleShare = async () => {
        playSelect();
        triggerHaptic(30);
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

            <CardHeader className="pb-2 pt-4 px-4 sm:pt-6 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${zodiacInfo.color} flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] sm:border-4 border-black transform rotate-3 transition-transform hover:rotate-0`}>
                            <span className="text-3xl sm:text-5xl text-white drop-shadow-md">{zodiacInfo.emoji}</span>
                        </div>
                        <div>
                            <CardTitle className="text-2xl xs:text-3xl sm:text-4xl font-black text-black tracking-tight uppercase">
                                {data.zodiacSign}
                            </CardTitle>
                            <div className="flex items-center gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                                <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wider bg-black text-white border-2 border-black`}>
                                    {zodiacInfo.element}
                                </span>
                                <span className="text-[10px] sm:text-xs text-gray-500 font-bold flex items-center gap-1 uppercase tracking-wide bg-gray-100 px-2 py-0.5 sm:py-1 rounded-lg border-2 border-gray-200">
                                    <Moon className="w-3 h-3" /> Horoscope
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 self-end sm:self-start">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleChangeDate}
                            className="text-[11px] sm:text-xs h-8 sm:h-9 px-2.5 sm:px-3 hover:bg-orange-50 text-gray-500 hover:text-black font-bold border-2 border-gray-200 hover:border-black rounded-xl transition-all"
                        >
                            <RefreshCw className="w-3 h-3 mr-1.5" />
                            Change
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 border-2 border-gray-200 hover:border-black rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all flex items-center justify-center" onClick={handleShare}>
                            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-4 pb-6 px-4 sm:pt-6 sm:pb-8 sm:px-6 space-y-4 sm:space-y-6">
                <div className="relative bg-orange-50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-[3px] sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Sparkles className="absolute -top-2.5 -right-2.5 w-6 h-6 sm:w-8 sm:h-8 text-orange-400 fill-orange-400 stroke-black stroke-2 animate-pulse" />
                    <p className="text-base sm:text-xl font-bold text-black leading-relaxed text-center font-serif">
                        "{data.prediction}"
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border-[3px] sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-transform group">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-100 border-2 border-black flex items-center justify-center group-hover:scale-105 transition-transform shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <span className="text-sm sm:text-xl">🍽️</span>
                            </div>
                            <p className="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-wide">Lucky Dish</p>
                        </div>
                        <p className="text-sm xs:text-base sm:text-lg font-black text-black pl-0.5">{data.luckyDish}</p>
                    </div>

                    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 border-[3px] sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-transform group">
                        <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-100 border-2 border-black flex items-center justify-center group-hover:scale-105 transition-transform shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <span className="text-sm sm:text-xl">⏰</span>
                            </div>
                            <p className="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-wide">Lucky Time</p>
                        </div>
                        <p className="text-sm xs:text-base sm:text-lg font-black text-black pl-0.5">{data.luckyTime}</p>
                    </div>
                </div>

                <div className="bg-yellow-300 rounded-[20px] sm:rounded-3xl p-0.5 border-[3px] sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="bg-white rounded-[18px] sm:rounded-[20px] p-4 sm:p-5 border-2 border-black">
                        <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Star className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-yellow-400 fill-yellow-400 stroke-black stroke-2 animate-pulse" />
                                <h4 className="text-sm sm:text-base font-black text-black uppercase tracking-tight">Daily Challenge</h4>
                            </div>
                            <span className="text-[10px] sm:text-xs font-black text-white bg-orange-500 px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg border-2 border-black shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">+10 XP</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-800 font-bold mb-4 sm:mb-5 pl-4 sm:pl-8 border-l-4 border-gray-200">{data.challenge}</p>
                        <Button
                            onClick={handleClaimXP}
                            disabled={xpClaimed}
                            className={`w-full h-11 sm:h-12 rounded-xl font-black uppercase tracking-wider shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-[3px] sm:border-4 border-black transition-all hover:-translate-y-0.5 sm:hover:-translate-y-1 active:translate-y-0 active:shadow-none ${xpClaimed
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-black text-white hover:bg-gray-800"
                                }`}
                        >
                            {xpClaimed ? (
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Challenge Completed!
                                </span>
                            ) : <span className="text-xs sm:text-sm">Claim Reward</span>}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
