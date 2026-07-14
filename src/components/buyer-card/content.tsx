import React from 'react';
import { Users, ShoppingCart, Triangle, Eye, Heart } from 'lucide-react';
import type { BuyerCardData } from '@/types';

interface ContentProps {
    data: BuyerCardData;
    isInactive?: boolean;
}

export function Content({ data, isInactive }: ContentProps) {
    let erIconColor = "text-zinc-500 fill-zinc-500/10";
    if (data.erCurrentRatio > data.erPreviousRatio) {
        erIconColor = "text-emerald-500 fill-emerald-500/20";
    } else if (data.erPreviousRatio > data.erCurrentRatio) {
        erIconColor = "text-red-500 fill-red-500/20";
    }

    let vlIconColor = "text-zinc-500 fill-zinc-500/10";
    if (data.vlCurrentRatio > data.vlPreviousRatio) {
        vlIconColor = "text-emerald-500 fill-emerald-500/20";
    } else if (data.vlPreviousRatio > data.vlCurrentRatio) {
        vlIconColor = "text-red-500 fill-red-500/20";
    }

    return (
        <div className="bg-zinc-950/20 border border-neutral-900 rounded-2xl p-3.5 flex flex-col gap-4">
            <div className="flex flex-col gap-2 px-0.5">
                <p className={`text-xs leading-relaxed font-normal transition-colors duration-300 ${isInactive ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {data.description}
                </p>

                <div className="select-none flex items-center gap-1.5 py-0.5">
                    <svg
                        className="w-3.5 h-3.5 text-zinc-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a15.3 15.3 0 00-4 9 15.3 15.3 0 004 9M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9" />
                    </svg>
                    <span className={`text-[11px] font-extrabold tracking-tight transition-colors duration-300 ${isInactive ? 'text-zinc-500' : 'text-amber-400/90'}`}>
                        {data.handle}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    {/* Followers card block */}
                    <div className="flex items-center gap-3 bg-[#0B0B0B]/90 border border-neutral-800/80 rounded-xl px-3 py-2.5 shadow-sm">
                        <Users className="w-4 h-4 text-emerald-500/40 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider leading-none mb-1">
                                Followers
                            </span>
                            <span className={`text-xs md:text-sm font-black font-mono tracking-tight leading-none transition-colors duration-300 ${isInactive ? 'text-zinc-500' : 'text-emerald-400'}`}>
                                {data.followers}
                            </span>
                        </div>
                    </div>

                    {/* Value card block */}
                    <div className="flex items-center gap-3 bg-[#0B0B0B]/90 border border-neutral-800/80 rounded-xl px-3 py-2.5 shadow-sm">
                        <ShoppingCart className="w-4 h-4 text-emerald-500/80 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider leading-none mb-1">
                                Value
                            </span>
                            <span className={`text-xs md:text-sm font-black font-mono tracking-tight leading-none transition-colors duration-300 ${isInactive ? 'text-zinc-500' : 'text-emerald-400'}`}>
                                {data.value}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-900/80 px-0.5">
                    {/* ER Row item */}
                    <div className="flex items-center gap-1.5">
                        <Triangle className={`w-3.5 h-3.5 shrink-0 ${erIconColor}`} strokeWidth={2.5} />
                        <div className="flex items-center gap-1 text-xs">
                            <span className="text-zinc-500 font-bold uppercase tracking-tight select-none">ER</span>
                            <span className={`font-black font-mono tracking-tight transition-colors duration-300 ${isInactive ? 'text-zinc-500' : 'text-white'}`}>
                                {Math.round(data.erCurrentRatio)}:1
                            </span>
                        </div>
                    </div>

                    {/* Likes Row item */}
                    <div className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500/10 shrink-0" strokeWidth={2.5} />
                        <div className="flex items-center gap-1 text-xs">
                            <span className="text-zinc-500 font-bold uppercase tracking-tight select-none">Likes</span>
                            <span className={`font-black font-mono tracking-tight transition-colors duration-300 ${isInactive ? 'text-zinc-500' : 'text-white'}`}>
                                {data.likes}
                            </span>
                        </div>
                    </div>

                    {/* V/L Row item */}
                    <div className="flex items-center gap-1.5">
                        <Eye className={`w-3.5 h-3.5 shrink-0 ${vlIconColor}`} strokeWidth={2.5} />
                        <div className="flex items-center gap-1 text-xs">
                            <span className="text-zinc-500 font-bold uppercase tracking-tight select-none">V/L</span>
                            <span className={`font-black font-mono tracking-tight transition-colors duration-300 ${isInactive ? 'text-zinc-500' : 'text-white'}`}>
                                {Math.round(data.vlCurrentRatio)}:1
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}