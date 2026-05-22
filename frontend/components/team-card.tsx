'use client'

import { motion } from 'framer-motion'
import { Zap, Star, Utensils } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export interface TeamMember {
    name: string
    role: string
    favFood: string
    quote: string
    image?: string
    imageStyle?: React.CSSProperties
    stats: {
        spiceLevel: 'Low' | 'Lowkey' | 'Mild' | 'Medium' | 'Hot' | 'Extreme'
        reviews: number
        badge: string
    }
}

export function TeamCard({ member }: { member: TeamMember }) {
    const [isFlipped, setIsFlipped] = useState(false)

    return (
        <div
            className="relative w-full h-[330px] cursor-pointer group"
            style={{ perspective: '1000px' }}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <motion.div
                className="w-full h-full relative transition-all duration-500"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
                {/* FRONT SIDE */}
                <div
                    className="absolute inset-0 bg-white rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col items-center p-4 transition-all duration-200"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    {/* Background noise texture */}
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none"></div>

                    {/* Accent header */}
                    <div className="absolute top-0 left-0 right-0 h-2 bg-orange-500" />

                    {/* Neobrutalist Avatar Box */}
                    <div className="w-24 h-24 mt-4 mb-4 relative shrink-0">
                        <div className="w-full h-full relative rounded-xl bg-yellow-100 border-3 border-black shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">
                            {member.image ? (
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover object-top"
                                    style={member.imageStyle}
                                    unoptimized
                                />
                            ) : (
                                <span className="text-3xl font-black text-black">{member.name[0]}</span>
                            )}
                        </div>
                        {/* Sticker Badge */}
                        <div className="absolute -bottom-1.5 -right-1.5 bg-yellow-300 text-black text-[9px] font-black px-2 py-0.5 rotate-[-8deg] shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] border-2 border-black z-10 uppercase tracking-wider">
                            {member.stats.badge}
                        </div>
                    </div>

                    <h3 className="text-xl font-black text-black text-center mb-0.5 leading-tight">{member.name}</h3>
                    <p className="text-orange-600 font-black uppercase tracking-wider text-[10px] mb-3 px-2 py-0.5 bg-orange-50 rounded-md border border-orange-200">{member.role}</p>

                    <div className="w-full mt-auto bg-yellow-50 rounded-xl p-2.5 border-2 border-black relative">
                        <p className="text-[8px] font-black text-black/50 uppercase tracking-widest mb-0.5 text-center">Favorite Bite</p>
                        <div className="flex items-center justify-center gap-1.5 text-black font-bold text-xs">
                            <Utensils size={12} className="text-orange-500 shrink-0" />
                            <span className="truncate">{member.favFood}</span>
                        </div>
                    </div>
                </div>

                {/* BACK SIDE */}
                <div
                    className="absolute inset-0 bg-[#1E1E1E] rounded-2xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden p-4 flex flex-col text-white"
                    style={{ transform: "rotateY(180deg)", backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-orange-500" />

                    <h4 className="text-sm font-black mb-4 flex items-center gap-1.5 text-yellow-400 uppercase tracking-wider">
                        <Star className="fill-current" size={14} />
                        Player Stats
                    </h4>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-[10px] font-bold mb-1 text-gray-400 uppercase tracking-wider">
                                <span>Spice Tolerance</span>
                                <span className={member.stats.spiceLevel === 'Extreme' ? 'text-red-500 font-black' : 'text-white'}>{member.stats.spiceLevel}</span>
                            </div>
                            <div className="w-full h-3 bg-black border-2 border-black rounded-sm overflow-hidden">
                                <div
                                    className={`h-full ${member.stats.spiceLevel === 'Extreme' ? 'bg-red-600' : 'bg-orange-500'}`}
                                    style={{
                                        width: member.stats.spiceLevel === 'Low' || member.stats.spiceLevel === 'Lowkey' ? '30%' :
                                            member.stats.spiceLevel === 'Mild' ? '50%' :
                                                member.stats.spiceLevel === 'Medium' ? '75%' : '100%'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-[10px] font-bold mb-1 text-gray-400 uppercase tracking-wider">
                                <span>Street Cred</span>
                                <span>{member.stats.reviews} Reviews</span>
                            </div>
                            <div className="w-full h-3 bg-black border-2 border-black rounded-sm overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${Math.min(member.stats.reviews / 250 * 100, 100)}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto relative p-2.5 bg-white/5 rounded-xl border border-white/10">
                        <div className="absolute -left-1 -top-2 text-2xl text-orange-500/25">"</div>
                        <p className="text-[11px] italic text-gray-300 relative z-10 font-bold leading-normal">
                            {member.quote}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
