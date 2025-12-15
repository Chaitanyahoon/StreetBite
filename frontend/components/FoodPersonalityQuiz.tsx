"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UtensilsCrossed, RefreshCw, Share2, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

const QUESTIONS = [
    {
        id: 1,
        text: "It's pouring rain outside. What hits the spot?",
        options: [
            { text: "Steaming Hot Vada Pav", sub: "With extra red chutney 🔥", type: "spicy" },
            { text: "Warm Gulab Jamun", sub: "Soaked in rose syrup 🌹", type: "sweet" },
            { text: "Buttery Masala Toast", sub: "Loaded with cheese 🧀", type: "cheesy" }
        ]
    },
    {
        id: 2,
        text: "What's the most satisfying texture?",
        options: [
            { text: "The CRUNCH", sub: "Crispy Pani Puri shells", type: "spicy" },
            { text: "The MELT", sub: "Creamy Malai Kulfi", type: "sweet" },
            { text: "The STRETCH", sub: "Gooey Cheese Dosa", type: "cheesy" }
        ]
    },
    {
        id: 3,
        text: "Pick your ideal food vibe:",
        options: [
            { text: "Noisy Street Corner", sub: "Chaos & flavor explosion", type: "spicy" },
            { text: "Late Night Dessert Run", sub: "Sweet endings with friends", type: "sweet" },
            { text: "Lazy Sunday Breakfast", sub: "Comfort food & chill", type: "cheesy" }
        ]
    }
];

export const RESULTS = {
    spicy: {
        title: "The Heat Seeker",
        subtitle: "Bold. Fiery. Unstoppable.",
        desc: "You live for the thrill. Like a spicy Thecha, your personality is intense, memorable, and wakes people up!",
        color: "from-orange-500 to-red-600",
        icon: "🔥",
        bg: "bg-orange-950"
    },
    sweet: {
        title: "The Sweet Soul",
        subtitle: "Warm. Joyful. Delightful.",
        desc: "You bring the good vibes. You're the Jalebi of your group—twisty, fun, and making everything better.",
        color: "from-pink-500 to-rose-600",
        icon: "✨",
        bg: "bg-pink-950"
    },
    cheesy: {
        title: "The Comfort King",
        subtitle: "Reliable. Chill. Classic.",
        desc: "You're the definition of comfort. Like extra cheese on a Pav Bhaji, you make life richer and smoother.",
        color: "from-yellow-400 to-amber-500",
        icon: "👑",
        bg: "bg-yellow-950"
    }
};

export function FoodPersonalityQuiz() {
    const [view, setView] = useState<'intro' | 'question' | 'result'>('intro');
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<string[]>([]);
    const [result, setResult] = useState<keyof typeof RESULTS | null>(null);
    const [mounted, setMounted] = useState(false);

    // Load saved result on mount
    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem("tasteArchetype");
            if (saved && RESULTS[saved as keyof typeof RESULTS]) {
                setResult(saved as keyof typeof RESULTS);
                setView('result');
            }
        }
    }, []);

    if (!mounted) return null;

    const handleStart = () => setView('question');

    const handleAnswer = (type: string) => {
        const newAnswers = [...answers, type];
        setAnswers(newAnswers);

        if (currentQ < QUESTIONS.length - 1) {
            setCurrentQ(currentQ + 1);
        } else {
            calculateResult(newAnswers);
        }
    };

    const calculateResult = (finalAnswers: string[]) => {
        const counts: Record<string, number> = {};
        finalAnswers.forEach(a => counts[a] = (counts[a] || 0) + 1);
        const winner = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

        setResult(winner as keyof typeof RESULTS);
        setView('result');
        localStorage.setItem("tasteArchetype", winner);
        window.dispatchEvent(new Event("storage"));
    };

    const resetQuiz = () => {
        setView('intro');
        setAnswers([]);
        setCurrentQ(0);
        // Do not clear result to allow exit animation to complete safely

        localStorage.removeItem("tasteArchetype");
        window.dispatchEvent(new Event("storage"));
    };

    const shareResult = () => {
        toast.success("Archetype copied to clipboard");
    };

    return (
        <Card className="overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white text-black relative rounded-[2rem]">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <CardContent className="p-8 relative z-10 min-h-[450px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {(() => {
                        switch (view) {
                            case 'intro':
                                return (
                                    <motion.div
                                        key="intro"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-center space-y-8"
                                    >
                                        <div className="relative w-24 h-24 mx-auto">
                                            <div className="absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-50 animate-pulse" />
                                            <div className="relative w-full h-full bg-black rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                                                <Sparkles className="w-10 h-10 text-yellow-300 fill-yellow-300" />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="inline-block px-4 py-1.5 bg-yellow-300 border-2 border-black rounded-full mb-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transform -rotate-2">
                                                <span className="text-xs font-black uppercase tracking-wider text-black">What's your vibe?</span>
                                            </div>
                                            <h3 className="text-4xl font-black tracking-tighter text-black uppercase">
                                                Taste Archetype
                                            </h3>
                                            <p className="text-sm text-gray-500 font-bold tracking-widest uppercase mt-2">
                                                Discover your culinary soul
                                            </p>
                                        </div>

                                        <Button
                                            onClick={handleStart}
                                            className="w-full bg-black text-white hover:bg-gray-800 font-black tracking-widest uppercase py-6 shadow-[4px_4px_0px_0px_rgba(128,128,128,1)] border-4 border-black hover:shadow-[2px_2px_0px_0px_rgba(128,128,128,1)] hover:translate-y-0.5 transition-all duration-300 text-lg rounded-xl"
                                        >
                                            Begin Analysis
                                        </Button>
                                    </motion.div>
                                );
                            case 'question':
                                return (
                                    <motion.div
                                        key={`q-${currentQ}`}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex justify-between items-end border-b-4 border-black pb-4">
                                            <span className="text-xs text-black font-black tracking-[0.2em] bg-yellow-300 px-2 py-1 rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">QUERY {currentQ + 1}</span>
                                            <div className="flex gap-1.5">
                                                {QUESTIONS.map((_, idx) => (
                                                    <div key={idx} className={`h-2 w-8 rounded-full border-2 border-black transition-colors duration-300 ${idx === currentQ ? 'bg-black' : idx < currentQ ? 'bg-gray-400' : 'bg-gray-100'}`} />
                                                ))}
                                            </div>
                                        </div>

                                        <h4 className="text-2xl font-black text-black text-center leading-tight uppercase tracking-tight">
                                            {QUESTIONS[currentQ].text}
                                        </h4>

                                        <div className="space-y-3">
                                            {QUESTIONS[currentQ].options.map((option, idx) => (
                                                <motion.button
                                                    key={idx}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleAnswer(option.type)}
                                                    className="w-full p-4 text-left rounded-xl border-2 border-black hover:bg-orange-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="text-lg font-black text-black group-hover:text-orange-600 transition-colors leading-none mb-1">
                                                                {option.text}
                                                            </div>
                                                            <div className="text-xs text-gray-500 font-bold uppercase tracking-wide group-hover:text-black">
                                                                {option.sub}
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-black opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 duration-200" />
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            case 'result':
                                // Defensive check: ensure result exists
                                if (!result || !RESULTS[result]) return null;
                                return (
                                    <motion.div
                                        key="result"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.5 }}
                                        className="text-center space-y-6"
                                    >
                                        <div className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-br ${RESULTS[result].color} flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6 border-4 border-black relative group hover:scale-105 transition-transform`}>
                                            <span className="text-6xl filter drop-shadow-md">{RESULTS[result].icon}</span>
                                            <div className="absolute -top-2 -right-2 bg-black text-white text-xs font-black px-2 py-1 rounded-lg border-2 border-white transform rotate-12">
                                                MATCH!
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-3xl font-black text-black mb-2 uppercase tracking-tight">{RESULTS[result].title}</h3>
                                            <div className="inline-block px-4 py-1.5 rounded-xl bg-black text-white border-2 border-black mb-5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] transform -rotate-1">
                                                <p className="text-[10px] uppercase tracking-[0.2em] font-black">
                                                    {RESULTS[result].subtitle}
                                                </p>
                                            </div>
                                            <div className="bg-yellow-50 p-4 rounded-xl border-2 border-black">
                                                <p className="text-sm text-black leading-relaxed font-bold font-serif italic">
                                                    "{RESULTS[result].desc}"
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                            <Button variant="ghost" onClick={resetQuiz} className="flex-1 text-black font-bold hover:bg-gray-100 border-2 border-black rounded-xl">
                                                <RefreshCw className="w-4 h-4 mr-2" /> RESTART
                                            </Button>
                                            <Button onClick={shareResult} className="flex-1 bg-yellow-400 text-black font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 rounded-xl transition-all">
                                                <Share2 className="w-4 h-4 mr-2" /> SHARE
                                            </Button>
                                        </div>
                                    </motion.div>
                                );
                            default:
                                return null;
                        }
                    })()}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
