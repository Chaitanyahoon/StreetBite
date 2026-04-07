"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface PollOption {
    id: number;
    text: string;
}

const POLL_POOL = [
    {
        question: "Best Street Food Companion?",
        options: [
            { id: 1, text: "Masala Chai" },
            { id: 2, text: "Thums Up" },
            { id: 3, text: "Filter Coffee" },
            { id: 4, text: "Sugarcane Juice" }
        ]
    },
    {
        question: "Spiciest Dish Challenge?",
        options: [
            { id: 1, text: "Misal Pav" },
            { id: 2, text: "Schezwan Vada Pav" },
            { id: 3, text: "Kolhapuri Thali" },
            { id: 4, text: "Thecha Bhakri" }
        ]
    },
    {
        question: "Late Night Craving?",
        options: [
            { id: 1, text: "Maggi" },
            { id: 2, text: "Egg Burji" },
            { id: 3, text: "Momos" },
            { id: 4, text: "Shawarma" }
        ]
    }
];

const getPollStorageKey = (suffix: string) => {
    const today = new Date().toISOString().slice(0, 10);
    return `dailyPoll:${today}:${suffix}`;
};

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
    const [selectedOption, setSelectedOption] = useState<number | null>(() => {
        if (typeof window === 'undefined') return null;

        const savedVote = localStorage.getItem(getPollStorageKey("selection"));
        return savedVote ? parseInt(savedVote, 10) : null;
    });
    const [hasVoted, setHasVoted] = useState(() => selectedOption !== null);
    const [votes, setVotes] = useState<number[]>(() => {
        if (typeof window === 'undefined') {
            return POLL_DATA.options.map(() => 0);
        }

        const savedVotes = localStorage.getItem(getPollStorageKey("counts"));
        if (!savedVotes) {
            return POLL_DATA.options.map(() => 0);
        }

        try {
            const parsedVotes = JSON.parse(savedVotes);
            if (Array.isArray(parsedVotes) && parsedVotes.length === POLL_DATA.options.length) {
                return parsedVotes.map((vote) => typeof vote === "number" ? vote : 0);
            }
        } catch {
            localStorage.removeItem(getPollStorageKey("counts"));
        }

        return POLL_DATA.options.map(() => 0);
    });

    const handleVote = (index: number) => {
        if (hasVoted) return;

        const newVotes = [...votes];
        newVotes[index] += 1;
        setVotes(newVotes);
        setSelectedOption(index);
        setHasVoted(true);

        localStorage.setItem(getPollStorageKey("selection"), index.toString());
        localStorage.setItem(getPollStorageKey("counts"), JSON.stringify(newVotes));
        toast.success("Vote saved on this device");
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
                    {options.map((option: PollOption, index) => {
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
                    <span>{totalVotes} local votes</span>
                    <span>Stored on this device</span>
                </div>
            </CardContent>
        </Card>
    );
}
