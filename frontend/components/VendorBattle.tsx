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

        toast.success(`Voted for ${pair[index].name}!`);
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
        <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-indigo-900 to-purple-900 text-white relative group">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <CardContent className="p-6 relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-500/30">
                            <Swords className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl tracking-tight text-white">Food Face-off</h3>
                            <p className="text-xs text-indigo-200 font-medium">Vote & Earn XP</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkip}
                        className="text-indigo-200 hover:text-white hover:bg-white/10"
                    >
                        Skip <X className="w-3 h-3 ml-1" />
                    </Button>
                </div>

                <div className="flex items-center justify-between gap-8 relative">
                    {/* VS Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <div className="w-12 h-12 rounded-full bg-white text-indigo-900 font-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] border-4 border-indigo-900 text-base">
                            VS
                        </div>
                    </div>

                    {pair.map((vendor, index) => (
                        <motion.div
                            key={vendor.id}
                            className={`flex-1 relative cursor-pointer group/card ${hasVoted && index !== (votes[0] > votes[1] ? 0 : 1) ? "opacity-50 grayscale" : ""}`}
                            whileHover={{ scale: hasVoted ? 1 : 1.02 }}
                            whileTap={{ scale: hasVoted ? 1 : 0.98 }}
                            onClick={() => handleVote(index as 0 | 1)}
                        >
                            <div className={`bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10 transition-all duration-300 ${!hasVoted && "hover:bg-white/20 hover:border-white/30 hover:shadow-lg"}`}>
                                <div className="text-center">
                                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center text-4xl shadow-lg mb-3 ring-4 ${hasVoted && index === (votes[0] > votes[1] ? 0 : 1) ? "ring-yellow-400" : "ring-white"} overflow-hidden`}>
                                        {vendor.image ? (
                                            <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>🏪</span>
                                        )}
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight mb-1 text-white truncate w-full">
                                        {vendor.name}
                                    </h3>

                                    <AnimatePresence>
                                        {hasVoted && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="mt-2"
                                            >
                                                <div className="text-2xl font-black text-yellow-400">
                                                    {percentages[index]}%
                                                </div>
                                                {percentages[index] > percentages[index === 0 ? 1 : 0] && (
                                                    <div className="flex items-center justify-center gap-1 text-xs text-yellow-200 font-bold mt-1">
                                                        <Trophy className="w-3 h-3" />
                                                        Winning
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

                {/* Health Bars */}
                {hasVoted && (
                    <div className="mt-6 flex gap-1 h-2 rounded-full overflow-hidden bg-black/20">
                        <motion.div
                            initial={{ width: "50%" }}
                            animate={{ width: `${percentages[0]}%` }}
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500"
                        />
                        <motion.div
                            initial={{ width: "50%" }}
                            animate={{ width: `${percentages[1]}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
