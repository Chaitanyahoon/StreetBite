"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Swords, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useGamification } from "@/context/GamificationContext";
import { vendorApi, type ApiVendor } from "@/lib/api";

interface Vendor extends Pick<ApiVendor, 'id' | 'name' | 'description' | 'rating' | 'image'> {}

export function VendorBattle() {
    const { performAction } = useGamification();
    const [pair, setPair] = useState<[Vendor, Vendor] | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<0 | 1 | null>(null);
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
                    { ...shuffled[0] },
                    { ...shuffled[1] }
                ]);
            } else {
                setPair(null);
            }
        } catch (error) {
            console.error("Failed to fetch vendors for battle", error);
            setPair(null);
        } finally {
            setLoading(false);
        }

        setHasVoted(false);
        setSelectedIndex(null);
    };

    const handleVote = (index: 0 | 1) => {
        if (hasVoted || !pair) return;

        setSelectedIndex(index);
        setHasVoted(true);
        performAction('complete_challenge');

        toast.success(`Voted for ${pair[index].name}!`, {
            description: "Saved for this round.",
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
            <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-br from-cyan-900 to-emerald-900 text-white min-h-[300px] flex items-center justify-center">
                <div className="text-center">
                    <Swords className="w-10 h-10 mx-auto mb-4 animate-pulse text-yellow-400" />
                    <p className="text-cyan-200">Setting up the arena...</p>
                </div>
            </Card>
        );
    }

    if (!pair) {
        return (
            <Card className="overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white relative group h-full flex flex-col rounded-[2rem]">
                <CardContent className="p-6 flex min-h-[300px] items-center justify-center text-center">
                    <div>
                        <Swords className="mx-auto mb-4 h-10 w-10 text-orange-500" />
                        <h3 className="text-xl font-black uppercase text-black">No live vendor battle yet</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            This card only runs when live vendor data is available from the backend.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white relative group h-full flex flex-col rounded-[2rem]">
            <div className="absolute inset-0 bg-[radial-gradient(#f3f4f6_1px,transparent_1px)] [background-size:18px_18px] opacity-60" />

            <CardContent className="p-6 relative z-10 flex flex-col h-full">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-black rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] -rotate-2">
                            <Swords className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-2xl tracking-tight text-black uppercase">Food Face-off</h3>
                            <p className="text-xs text-black/60 font-black uppercase tracking-[0.18em] flex items-center gap-2">
                                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                                Vote to earn XP
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSkip}
                        className="h-10 px-4 rounded-full border-2 border-black bg-white font-black uppercase tracking-[0.14em] text-xs"
                    >
                        Skip <X className="w-4 h-4 ml-1" />
                    </Button>
                </div>
                <div className="flex-1 flex flex-col sm:flex-row items-stretch justify-center gap-8 sm:gap-16 relative py-4">
                    {/* VS Badge */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-black text-white font-black flex items-center justify-center border-4 border-white shadow-[0_0_0_4px_black] text-lg sm:text-xl -rotate-12 transform scale-110">
                            VS
                        </div>
                    </div>

                    {pair.map((vendor, index) => (
                        <motion.div
                            key={vendor.id}
                            className={`w-full sm:flex-1 relative cursor-pointer group/card ${hasVoted && index !== selectedIndex ? "opacity-50 grayscale" : ""}`}
                            whileHover={{ scale: hasVoted ? 1 : 1.02, y: hasVoted ? 0 : -4 }}
                            whileTap={{ scale: hasVoted ? 1 : 0.96 }}
                            onClick={() => handleVote(index as 0 | 1)}
                        >
                            <div className={`h-full bg-white rounded-[2rem] p-6 border-4 border-black transition-all duration-300 flex flex-col justify-between ${!hasVoted ? "hover:bg-yellow-50 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" : "shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"}`}>
                                <div className="text-center flex flex-col items-center justify-center gap-4">
                                    <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-gray-100 to-gray-50 flex items-center justify-center text-4xl border-4 ${hasVoted && index === selectedIndex ? "border-green-500 bg-green-50 shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover/card:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow"} overflow-hidden relative`}>
                                        {vendor.image ? (
                                            <Image
                                                src={vendor.image}
                                                alt={vendor.name}
                                                fill
                                                unoptimized
                                                sizes="128px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="transform group-hover/card:scale-110 transition-transform duration-300 text-2xl font-black text-black">SB</span>
                                        )}
                                    </div>
                                    
                                    <h3 className="font-black text-xl sm:text-2xl leading-tight text-black w-full min-h-[3.5rem] flex items-center justify-center uppercase tracking-tight break-words px-2">
                                        {vendor.name}
                                    </h3>
                                    
                                    {!hasVoted && (
                                        <div className="mt-2 text-center w-full">
                                            <span className="inline-block rounded-xl border-4 border-black bg-emerald-400 px-6 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover/card:bg-yellow-400 group-hover/card:translate-y-1 group-hover/card:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all">
                                                Tap to vote
                                            </span>
                                        </div>
                                    )}

                                    <AnimatePresence>
                                        {hasVoted && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0, scale: 0.5 }}
                                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                                className="mt-2"
                                            >
                                                {index === selectedIndex ? (
                                                    <div className="flex items-center justify-center gap-1 text-xs text-white font-bold mt-1 bg-green-500 px-3 py-1 rounded-full border-2 border-black shadow-sm">
                                                        <Trophy className="w-3 h-3" />
                                                        YOUR PICK
                                                    </div>
                                                ) : (
                                                    <div className="rounded-full border-2 border-black bg-white px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-black">
                                                        Next round
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

                {hasVoted && (
                    <div className="mt-8 rounded-2xl border-2 border-black bg-orange-50 px-4 py-3 text-center text-sm font-medium text-black">
                        Battle results are local to this round until live voting is connected.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
