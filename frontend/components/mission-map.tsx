'use client'

import { motion } from 'framer-motion'
import { MapPin, ChefHat, Star } from 'lucide-react'

export function MissionMap() {
    return (
        <div className="relative w-full h-[500px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
            {/* Grid Background */}
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: `linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Radar Scanner Effect */}
            <motion.div
                className="absolute inset-0 origin-bottom-left bg-gradient-to-tr from-primary/5 via-primary/0 to-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "50% 50%" }}
            />

            {/* Pulsing Central Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                    <div className="relative z-10 w-4 h-4 bg-primary rounded-full shadow-[0_0_20px_rgba(249,115,22,0.5)]" />
                </div>
            </div>

            {/* Pop-up Vendors */}
            <VendorNode x="20%" y="30%" delay={0} icon={<ChefHat size={16} />} />
            <VendorNode x="70%" y="20%" delay={2} icon={<MapPin size={16} />} />
            <VendorNode x="80%" y="60%" delay={4} icon={<Star size={16} />} />
            <VendorNode x="30%" y="80%" delay={6} icon={<ChefHat size={16} />} />
            <VendorNode x="50%" y="40%" delay={1} icon={<MapPin size={16} />} />
            <VendorNode x="10%" y="60%" delay={5} icon={<Star size={16} />} />
            <VendorNode x="90%" y="85%" delay={3} icon={<MapPin size={16} />} />

            {/* Decorative overlaid text */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="font-mono text-xs text-primary/70">
                    <div>SCANNING_SECTOR_07</div>
                    <div>VENDORS_DETECTED: 124</div>
                    <div className="active-blink">STATUS: ONLINE</div>
                </div>
            </div>
        </div>
    )
}

function VendorNode({ x, y, delay, icon }: { x: string, y: string, delay: number, icon: any }) {
    return (
        <motion.div
            className="absolute"
            style={{ left: x, top: y }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: [0, 1.2, 1],
                opacity: [0, 1, 1],
            }}
            transition={{
                duration: 0.5,
                delay: delay,
                repeat: Infinity,
                repeatDelay: 8
            }}
        >
            <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-md animate-pulse" />
                <div className="relative w-8 h-8 bg-slate-900 border border-primary/50 text-primary rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                    {icon}
                </div>

                {/* Tooltip on Hover */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap border border-slate-700">
                    Unmapped Vendor Found
                </div>
            </div>
        </motion.div>
    )
}
