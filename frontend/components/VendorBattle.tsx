"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Swords, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useGamification } from "@/context/GamificationContext";
import { vendorApi } from "@/lib/api";

interface Vendor {
    id: number;
    name: string;
    description?: string;
    rating?: number;
    image?: string;
    votes?: number;
}

export function VendorBattle() {
    const { performAction } = useGamification();
    const [pair, setPair] = useState<[Vendor, Vendor] | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [votes, setVotes] = useState<[number, number]>([0, 0]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        generateNewBattle();
    }, []);

    const generateNewBattle = async () => {
        setLoading(true);
        try {
            const vendors = await vendorApi.getAll();
            if (vendors && vendors.length >= 2) {
                const shuffled = [...vendors].sort(() => Math.random() - 0.5);
                setPair([
                    { ...shuffled[0], votes: Math.floor(Math.random() * 50) + 20 },
                    { ...shuffled[1], votes: Math.floor(Math.random() * 50) + 20 }
                ]);
            }
        } catch (error) {
            console.error("Failed to fetch vendors for battle", error);
        } finally {
            setLoading(false);
        }

        // Reset vote state for new battle
        setHasVoted(false);
        setVotes([0, 0]);
    };

    const handleVote = (index: 0 | 1) => {
        if (hasVoted || !pair) return;

        const newVotes: [number, number] = [...votes];
        newVotes[index] += 1;
        setVotes(newVotes);
        setHasVoted(true);

        // Award XP via backend
        performAction('complete_challenge');

        toast.success(`Voted for ${pair[index].name}!`, {
            description: "You earned 50 XP! 🌟",
            style: {
                background: '#10B981',
                color: 'white',
                border: 'none',
                fontWeight: 'bold'
            },
            icon: '✅'
        });
    };

    const handleSkip = () => {
        generateNewBattle();
    };

    if (loading) {
        return (
            <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-indigo-900 to-purple-900 text-white min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                    <Swords className="w-10 h-10 mx-auto mb-4 animate-pulse text-yellow-400" />
                    <p className="text-indigo-200">Setting up the arena...</p>
                </div>
            </Card>
        );
    }

    if (!pair) return null;

    const totalVotes = (pair[0].votes || 0) + votes[0] + (pair[1].votes || 0) + votes[1];
    const percentages = [
        Math.round(((pair[0].votes || 0) + votes[0]) / totalVotes * 100) || 50,
        Math.round(((pair[1].votes || 0) + votes[1]) / totalVotes * 100) || 50
    ];

    return (
        <Card className="overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white relative group h-full flex flex-col rounded-[2rem]">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

            <CardContent className="p-6 relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-black rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transform -rotate-3">
                            <Swords className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-2xl tracking-tight text-black uppercase">Food Face-off</h3>
                            <p className="text-sm text-gray-600 font-bold flex items-center gap-1">
                                <Sparkles className="w-4 h-4 text-orange-500" /> Vote & Earn XP
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkip}
                        className="text-black font-bold hover:bg-gray-100 h-10 px-4 rounded-xl border-2 border-transparent hover:border-black transition-all"
                    >
                        Skip <X className="w-4 h-4 ml-1" />
                    </Button>
                </div>

                <div className="flex-1 flex items-center justify-between gap-4 relative min-h-[200px]">
                    {/* VS Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <div className="w-16 h-16 rounded-full bg-black text-white font-black flex items-center justify-center border-4 border-white shadow-[0_0_0_4px_black] text-xl transform rotate-12">
                            VS
                        </div>
                    </div>

                    {pair.map((vendor, index) => (
                        <motion.div
                            key={vendor.id}
                            className={`flex-1 relative cursor-pointer group/card h-full ${hasVoted && index !== (votes[0] > votes[1] ? 0 : 1) ? "opacity-50 grayscale" : ""}`}
                            whileHover={{ scale: hasVoted ? 1 : 1.02, y: hasVoted ? 0 : -4 }}
                            whileTap={{ scale: hasVoted ? 1 : 0.96 }}
                            onClick={() => handleVote(index as 0 | 1)}
                        >
                            <div className={`h-full bg-white rounded-2xl p-4 border-4 border-black transition-all duration-300 ${!hasVoted ? "hover:bg-yellow-50 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"}`}>
                                <div className="text-center flex flex-col items-center justify-center h-full gap-4">
                                    <div className={`w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl border-4 ${hasVoted && index === (votes[0] > votes[1] ? 0 : 1) ? "border-green-500 bg-green-50" : "border-black"} overflow-hidden`}>
                                        {vendor.image ? (
                                            <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="transform group-hover/card:scale-110 transition-transform duration-300">🏪</span>
                                        )}
                                    </div>
                                    <h3 className="font-black text-lg leading-tight text-black w-full line-clamp-2 min-h-[3rem] flex items-center justify-center uppercase">
                                        {vendor.name}
                                    </h3>

                                    <AnimatePresence>
                                        {hasVoted && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                                className="mt-2"
                                            >
                                                <div className="text-3xl font-black text-black">
                                                    {percentages[index]}%
                                                </div>
                                                {percentages[index] > percentages[index === 0 ? 1 : 0] && (
                                                    <div className="flex items-center justify-center gap-1 text-xs text-white font-bold mt-1 bg-green-500 px-3 py-1 rounded-full border-2 border-black shadow-sm">
                                                        <Trophy className="w-3 h-3" />
                                                        WINNER
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Voting Bars */}
                {hasVoted && (
                    <div className="mt-8 flex gap-2 h-4 rounded-full overflow-hidden bg-white border-4 border-black p-0.5">
                        <motion.div
                            initial={{ width: "50%" }}
                            animate={{ width: `${percentages[0]}%` }}
                            className="h-full bg-orange-500 rounded-l-sm"
                        />
                        <motion.div
                            initial={{ width: "50%" }}
                            animate={{ width: `${percentages[1]}%` }}
                            className="h-full bg-blue-500 rounded-r-sm"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
