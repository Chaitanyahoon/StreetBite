'use client'

import { motion } from 'framer-motion'
import { Zap, Star, Utensils, Flame } from 'lucide-react'
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
        spiceLevel: 'Low' | 'Mild' | 'Medium' | 'Hot' | 'Extreme'
        reviews: number
        badge: string
    }
}

export function TeamCard({ member }: { member: TeamMember }) {
    const [isFlipped, setIsFlipped] = useState(false)

    return (
        <div
            className="relative w-full h-[400px] cursor-pointer group"
            style={{ perspective: '1000px' }}
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <motion.div
                className="w-full h-full relative transition-all duration-500"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
            >
                {/* FRONT SIDE */}
                <div
                    className="absolute inset-0 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden flex flex-col items-center p-6"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    {/* Background noise texture */}
                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] mix-blend-multiply pointer-events-none"></div>

                    {/* Holographic header */}
                    <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-orange-100 to-transparent -z-10" />

                    {/* Avatar Circle Wrapper */}
                    <div className="w-32 h-32 mt-8 mb-6 relative group-hover:scale-105 transition-transform duration-300">
                        <div className="w-full h-full relative rounded-full bg-slate-900 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                            {member.image ? (
                                <Image
                                    src={member.image}
                                    alt={member.name}
                                    fill
                                    className="object-cover object-top"
                                    style={member.imageStyle}
                                />
                            ) : (
                                <span className="text-4xl font-black text-white">{member.name[0]}</span>
                            )}
                        </div>
                        {/* Sticker Badge */}
                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-xs font-black px-2 py-1 rotate-[-10deg] shadow-sm border border-black/10 z-10">
                            {member.stats.badge}
                        </div>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 text-center mb-1">{member.name}</h3>
                    <p className="text-primary font-bold uppercase tracking-wider text-xs mb-6">{member.role}</p>

                    <div className="w-full mt-auto bg-slate-50 rounded-xl p-4 border border-slate-100 relative">
                        {/* Tape effect */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-orange-200/50 rotate-[-2deg]" />

                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 text-center">Favorite Bite</p>
                        <div className="flex items-center justify-center gap-2 text-slate-800 font-bold">
                            <Utensils size={14} className="text-orange-500" />
                            {member.favFood}
                        </div>
                    </div>
                </div>

                {/* BACK SIDE */}
                <div
                    className="absolute inset-0 bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden p-8 flex flex-col text-white"
                    style={{ transform: "rotateY(180deg)", backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-orange-500" />

                    <h4 className="text-xl font-black mb-6 flex items-center gap-2 text-primary">
                        <Star className="fill-current" size={20} />
                        Player Stats
                    </h4>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-sm font-bold mb-1 text-slate-400">
                                <span>Spice Tolerance</span>
                                <span className={member.stats.spiceLevel === 'Extreme' ? 'text-red-500' : 'text-white'}>{member.stats.spiceLevel}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${member.stats.spiceLevel === 'Extreme' ? 'bg-red-600' : 'bg-primary'}`}
                                    style={{
                                        width: member.stats.spiceLevel === 'Low' ? '30%' :
                                            member.stats.spiceLevel === 'Mild' ? '50%' :
                                                member.stats.spiceLevel === 'Medium' ? '75%' : '100%'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm font-bold mb-1 text-slate-400">
                                <span>Street Cred</span>
                                <span>{member.stats.reviews} Reviews</span>
                            </div>
                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${Math.min(member.stats.reviews / 200 * 100, 100)}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto relative p-4 bg-white/10 rounded-xl border border-white/5">
                        <div className="absolute -left-2 -top-2 text-4xl text-primary/20">"</div>
                        <p className="text-sm italic text-slate-300 relative z-10 font-medium leading-relaxed">
                            {member.quote}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
