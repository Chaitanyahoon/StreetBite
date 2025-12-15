"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ZodiacSelectorProps {
    onSelect: (sign: string) => void;
}

export function ZodiacSelector({ onSelect }: ZodiacSelectorProps) {
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");

    const getZodiacSign = (day: number, month: number): string => {
        if ((month == 1 && day >= 20) || (month == 2 && day <= 18)) return "Aquarius";
        if ((month == 2 && day >= 19) || (month == 3 && day <= 20)) return "Pisces";
        if ((month == 3 && day >= 21) || (month == 4 && day <= 19)) return "Aries";
        if ((month == 4 && day >= 20) || (month == 5 && day <= 20)) return "Taurus";
        if ((month == 5 && day >= 21) || (month == 6 && day <= 20)) return "Gemini";
        if ((month == 6 && day >= 21) || (month == 7 && day <= 22)) return "Cancer";
        if ((month == 7 && day >= 23) || (month == 8 && day <= 22)) return "Leo";
        if ((month == 8 && day >= 23) || (month == 9 && day <= 22)) return "Virgo";
        if ((month == 9 && day >= 23) || (month == 10 && day <= 22)) return "Libra";
        if ((month == 10 && day >= 23) || (month == 11 && day <= 21)) return "Scorpio";
        if ((month == 11 && day >= 22) || (month == 12 && day <= 21)) return "Sagittarius";
        if ((month == 12 && day >= 22) || (month == 1 && day <= 19)) return "Capricorn";
        return "Unknown";
    };

    const handleSubmit = () => {
        const d = parseInt(day);
        const m = parseInt(month);

        if (!day || !month || isNaN(d) || isNaN(m) || d < 1 || d > 31 || m < 1 || m > 12) {
            toast.error("Please enter a valid date and month.");
            return;
        }

        const sign = getZodiacSign(d, m);
        if (sign === "Unknown") {
            toast.error("Could not determine zodiac sign.");
            return;
        }

        // No backend save - just return the sign
        onSelect(sign);
        toast.success(`You are a ${sign}! 🌟`);
    };

    return (
        <Card className="w-full max-w-md mx-auto mb-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white rounded-[2rem] overflow-hidden transform hover:-translate-y-1 transition-transform">
            <div className="bg-yellow-300 py-4 text-center border-b-4 border-black">
                <CardTitle className="text-2xl font-black text-black uppercase tracking-tight">🌟 Discover Your Foodtaar</CardTitle>
            </div>

            <CardHeader className="text-center pt-6 pb-2 px-6">
                <CardDescription className="text-base font-bold text-gray-500">
                    Enter your birth date to reveal your food personality!
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2 pb-8 px-8">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="day" className="font-black text-black uppercase tracking-wider text-xs ml-1">Day</Label>
                        <Input
                            id="day"
                            type="number"
                            placeholder="DD"
                            min="1"
                            max="31"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            className="h-12 border-2 border-black rounded-xl text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:ring-offset-0 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all bg-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="month" className="font-black text-black uppercase tracking-wider text-xs ml-1">Month</Label>
                        <Input
                            id="month"
                            type="number"
                            placeholder="MM"
                            min="1"
                            max="12"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="h-12 border-2 border-black rounded-xl text-lg font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-visible:ring-0 focus-visible:ring-offset-0 focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all bg-white"
                        />
                    </div>
                </div>

                <Button
                    className="w-full h-14 text-lg bg-black text-white hover:bg-gray-800 font-black uppercase tracking-widest border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all active:translate-y-0 active:shadow-none"
                    onClick={handleSubmit}
                    disabled={!day || !month}
                >
                    Reveal My Sign 🔮
                </Button>
            </CardContent>
        </Card>
    );
}
