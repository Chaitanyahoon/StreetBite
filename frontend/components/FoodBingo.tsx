"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Grid3x3, Trophy, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

import { useGamification } from "@/context/GamificationContext";

interface BingoItem {
    id: number;
    name: string;
    emoji: string;
    completed: boolean;
}

const FOOD_ITEMS = [
    { id: 1, name: "Vada Pav", emoji: "🥪" },
    { id: 2, name: "Pani Puri", emoji: "🫓" },
    { id: 3, name: "Samosa", emoji: "🥟" },
    { id: 4, name: "Dosa", emoji: "🥞" },
    { id: 5, name: "Chaat", emoji: "🥗" },
    { id: 6, name: "Momos", emoji: "🥟" },
    { id: 7, name: "Pav Bhaji", emoji: "🍲" },
    { id: 8, name: "Misal", emoji: "🍜" },
    { id: 9, name: "Kebab", emoji: "🍖" },
    { id: 10, name: "Biryani", emoji: "🍛" },
    { id: 11, name: "Rolls", emoji: "🌯" },
    { id: 12, name: "Bhajiya", emoji: "🍤" },
    { id: 13, name: "Jalebi", emoji: "🧡" },
    { id: 14, name: "Kulfi", emoji: "🍦" },
    { id: 15, name: "Bhel", emoji: "🥣" },
    { id: 16, name: "Tikki", emoji: "🥔" },
    { id: 17, name: "Chole", emoji: "🫓" },
    { id: 18, name: "Poha", emoji: "🍚" },
    { id: 19, name: "Upma", emoji: "🥣" },
    { id: 20, name: "Idli", emoji: "⚪" },
    { id: 21, name: "Vada", emoji: "🍩" },
    { id: 22, name: "Chai", emoji: "☕" },
    { id: 23, name: "Lassi", emoji: "🥤" },
    { id: 24, name: "Juice", emoji: "🧃" },
    { id: 25, name: "Frankie", emoji: "🌮" }
];

export function FoodBingo() {
    const { performAction } = useGamification();
    const [grid, setGrid] = useState<BingoItem[]>([]);
    const [completedLines, setCompletedLines] = useState(0);
    const [totalXP, setTotalXP] = useState(0);
    const [showCelebration, setShowCelebration] = useState(false);

    // Calculate completedCount here to avoid reference errors
    const completedCount = grid.filter(item => item.completed).length;

    useEffect(() => {
        const saved = localStorage.getItem("foodBingoGrid");
        const savedXP = localStorage.getItem("bingoXP");

        if (saved) {
            setGrid(JSON.parse(saved));
        } else {
            resetBingo();
        }
        if (savedXP) {
            setTotalXP(parseInt(savedXP));
        }
    }, []);

    const resetBingo = () => {
        const shuffled = [...FOOD_ITEMS].sort(() => Math.random() - 0.5);
        const newGrid = shuffled.map(item => ({ ...item, completed: false }));
        setGrid(newGrid);
        setCompletedLines(0);
        setShowCelebration(false);
        localStorage.setItem("foodBingoGrid", JSON.stringify(newGrid));
        toast.success("New Bingo card generated!");
    };

    const toggleItem = (id: number) => {
        const newGrid = grid.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        );
        setGrid(newGrid);
        localStorage.setItem("foodBingoGrid", JSON.stringify(newGrid));

        const lines = checkCompletedLines(newGrid);
        if (lines > completedLines) {
            const xpGained = (lines - completedLines) * 50;
            const newXP = totalXP + xpGained;
            setTotalXP(newXP);
            localStorage.setItem("bingoXP", newXP.toString());

            // Award XP via backend
            performAction('complete_challenge');

            // Show celebration and auto-hide
            setShowCelebration(true);
            setTimeout(() => setShowCelebration(false), 3000);

            toast.success(`BINGO! +${xpGained} XP 🎉`, {
                style: { background: '#10B981', color: 'white' }
            });
        }
        setCompletedLines(lines);
    };

    const checkCompletedLines = (currentGrid: BingoItem[]): number => {
        let lines = 0;
        // Rows
        for (let i = 0; i < 5; i++) {
            if (currentGrid.slice(i * 5, (i + 1) * 5).every(item => item.completed)) lines++;
        }
        // Columns
        for (let i = 0; i < 5; i++) {
            if ([0, 1, 2, 3, 4].every(row => currentGrid[row * 5 + i].completed)) lines++;
        }
        // Diagonals
        if ([0, 6, 12, 18, 24].every(index => currentGrid[index].completed)) lines++;
        if ([4, 8, 12, 16, 20].every(index => currentGrid[index].completed)) lines++;

        return lines;
    };

    if (grid.length === 0) return null;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg shadow-purple-200">
                        <Grid3x3 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 leading-none text-sm">Food Bingo</h3>
                        <p className="text-[10px] text-gray-500 font-medium mt-0.5">Collect 'em all!</p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.5 }}
                    onClick={resetBingo}
                    className="h-8 w-8 flex items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                </motion.button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-2">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-2 rounded-xl border border-blue-100 text-center shadow-sm">
                    <div className="text-lg font-black text-blue-600 leading-none mb-0.5">{completedCount}</div>
                    <div className="text-[8px] font-bold text-blue-400 uppercase tracking-widest">Found</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 p-2 rounded-xl border border-purple-100 text-center shadow-sm relative overflow-hidden">
                    <div className="text-lg font-black text-purple-600 leading-none mb-0.5">{completedLines}</div>
                    <div className="text-[8px] font-bold text-purple-400 uppercase tracking-widest">Lines</div>
                    {completedLines > 0 && <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-purple-500 rounded-full m-1.5 animate-ping" />}
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-2 rounded-xl border border-orange-100 text-center shadow-sm">
                    <div className="text-lg font-black text-orange-600 leading-none mb-0.5">{totalXP}</div>
                    <div className="text-[8px] font-bold text-orange-400 uppercase tracking-widest">XP</div>
                </div>
            </div>

            {/* Bingo Grid */}
            <div className="relative p-1 bg-gray-200 rounded-xl shadow-inner">
                <div className="grid grid-cols-5 gap-0.5">
                    {grid.map((item) => (
                        <motion.button
                            key={item.id}
                            whileHover={{ scale: 0.95 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleItem(item.id)}
                            className={`aspect-square flex flex-col items-center justify-center p-0.5 rounded-lg transition-all duration-200 relative overflow-hidden ${item.completed
                                ? "bg-emerald-500 shadow-inner ring-1 ring-emerald-600/20"
                                : "bg-white shadow-sm hover:shadow-md"
                                }`}
                        >
                            <span className={`text-base mb-0.5 filter transition-transform duration-300 ${item.completed ? "scale-110 drop-shadow-md" : "grayscale opacity-80"}`}>
                                {item.emoji}
                            </span>
                            <span className={`text-[8px] font-bold leading-tight text-center line-clamp-1 w-full px-0.5 ${item.completed ? "text-white" : "text-gray-500"
                                }`}>
                                {item.name}
                            </span>
                        </motion.button>
                    ))}
                </div>

                {/* Bingo Celebration Overlay */}
                <AnimatePresence>
                    {showCelebration && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.5, y: 20 }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white px-6 py-2 rounded-full shadow-2xl border-2 border-white/50 flex items-center gap-2 whitespace-nowrap z-30"
                        >
                            <Trophy className="w-4 h-4 fill-current animate-bounce" />
                            <span className="text-sm font-black tracking-widest drop-shadow-md">BINGO!</span>
                            <Sparkles className="w-4 h-4 animate-spin" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
