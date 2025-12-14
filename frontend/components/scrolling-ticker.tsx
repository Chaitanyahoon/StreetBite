'use client'

import { motion } from 'framer-motion'

export function ScrollingTicker() {
    const items = [
        "Vada Pav", "Misal Pav", "Pani Puri", "Momos", "Pav Bhaji", "Dosa", "Kathi Roll",
        "Samosa", "Chole Bhature", "Bhel Puri", "Vada Pav", "Misal Pav", "Pani Puri", "Momos"
    ]

    return (
        <div className="w-full overflow-hidden bg-primary py-4 border-y-4 border-black">
            <div className="flex whitespace-nowrap">
                <motion.div
                    className="flex gap-12"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 20
                    }}
                >
                    {[...items, ...items, ...items].map((item, idx) => (
                        <span key={idx} className="text-4xl font-black text-black uppercase tracking-tighter flex items-center gap-6">
                            {item} <span className="text-2xl text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">●</span>
                        </span>
                    ))}
                </motion.div>
            </div>
        </div>
    )
}
