"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const POLL_POOL = [
    {
        question: "Best Street Food Companion?",
        options: [
            { id: 1, text: "Masala Chai ☕", votes: 45 },
            { id: 2, text: "Thums Up 🥤", votes: 32 },
            { id: 3, text: "Filter Coffee 🥯", votes: 28 },
            { id: 4, text: "Sugarcane Juice 🎋", votes: 15 }
        ]
    },
    {
        question: "Spiciest Dish Challenge?",
        options: [
            { id: 1, text: "Misal Pav 🌶️", votes: 62 },
            { id: 2, text: "Schezwan Vada Pav 🔥", votes: 41 },
            { id: 3, text: "Kolhapuri Thali 🥵", votes: 35 },
            { id: 4, text: "Thecha Bhakri 🌋", votes: 22 }
        ]
    },
    {
        question: "Late Night Craving?",
        options: [
            { id: 1, text: "Maggi 🍜", votes: 89 },
            { id: 2, text: "Egg Burji 🥚", votes: 54 },
            { id: 3, text: "Momos 🥟", votes: 47 },
            { id: 4, text: "Shawarma 🌯", votes: 63 }
        ]
    }
];

// Get a poll based on the day of the year to rotate content daily
const getDailyPoll = () => {
    const today = new Date();
    // Simple hash: Day of year (0-365) % pool length
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    return POLL_POOL[dayOfYear % POLL_POOL.length];
};

const POLL_DATA = getDailyPoll();

export function DailyPoll() {
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [votes, setVotes] = useState<number[]>(POLL_DATA.options.map(o => o.votes));

    // Load voting state
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedVote = localStorage.getItem("dailyPollVote");
            if (savedVote) {
                setSelectedOption(parseInt(savedVote));
                setHasVoted(true);
            }
        }
    }, []);

    const handleVote = (index: number) => {
        if (hasVoted) return;

        const newVotes = [...votes];
        newVotes[index] += 1;
        setVotes(newVotes);
        setSelectedOption(index);
        setHasVoted(true);

        localStorage.setItem("dailyPollVote", index.toString());
        toast.success("Vote recorded! +5 XP");
    };

    const currentPoll = POLL_DATA;
    const options = currentPoll.options;
    const totalVotes = votes.reduce((a, b) => a + b, 0);

    return (
        <Card className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden ring-0 rounded-[2rem]">
            <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="flex items-center gap-3 text-xl text-black">
                    <div className="p-2 bg-black rounded-lg transform -rotate-2">
                        <BarChart2 className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-black uppercase tracking-tight">Daily Poll</span>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-2 px-6 pb-6 relative z-10">
                <h3 className="text-xl font-black text-black mb-6 leading-tight uppercase">
                    {currentPoll.question}
                </h3>
                <div className="space-y-3">
                    {options.map((option, index) => {
                        const isSelected = selectedOption === index;
                        const percentage = totalVotes > 0 ? Math.round((votes[index] / totalVotes) * 100) : 0;

                        return (
                            <button
                                key={index}
                                onClick={() => handleVote(index)}
                                disabled={hasVoted}
                                className={`w-full text-left p-0 rounded-xl border-2 transition-all relative overflow-hidden group ${hasVoted
                                    ? isSelected
                                        ? "border-black bg-orange-100 ring-2 ring-black ring-offset-2"
                                        : "border-black bg-white opacity-60"
                                    : "border-black bg-white hover:bg-orange-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    }`}
                            >
                                {/* Progress Bar Background */}
                                {hasVoted && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        className={`absolute inset-0 h-full opacity-20 ${isSelected ? "bg-orange-500" : "bg-gray-300"}`}
                                    />
                                )}

                                <div className="relative z-10 p-4 flex justify-between items-center">
                                    <span className={`font-bold text-sm ${isSelected ? "text-orange-900" : "text-black"}`}>
                                        {option.text}
                                    </span>
                                    {hasVoted && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-black text-sm text-black">{percentage}%</span>
                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-600 fill-orange-100" />}
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <div className="mt-6 flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wide">
                    <span>{totalVotes} votes</span>
                    <span>Resets in 12h</span>
                </div>
            </CardContent>
        </Card>
    );
}
