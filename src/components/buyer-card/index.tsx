'use client';

import type { BuyerCardData } from '@/types';
import { formatCompactValue } from '@/lib/currency';
import { Heart, Users, ShoppingBag, ArrowRight, Eye } from 'lucide-react';

interface BuyerCardProps {
  data: BuyerCardData;
}

export default function BuyerCard({ data }: BuyerCardProps) {
  return (
    <div className="rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">{data.title}</p>
          <h2 className="mt-2 text-xl font-black text-white truncate">{data.sellerName}</h2>
          <p className="text-sm text-zinc-400">{data.handle}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-zinc-900 text-sm font-black text-zinc-300">
          {data.sellerName?.slice(0, 2).toUpperCase()}
        </div>
      </div>

      <p className="text-sm leading-relaxed text-zinc-400 mb-6">{data.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-3xl bg-zinc-900/80 p-4">
          <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500">Followers</p>
          <p className="mt-3 text-lg font-black text-emerald-400">{formatCompactValue(data.followers)}</p>
        </div>
        <div className="rounded-3xl bg-zinc-900/80 p-4">
          <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500">Likes</p>
          <p className="mt-3 text-lg font-black text-red-400">{formatCompactValue(data.likes)}</p>
        </div>
      </div>

      <div className="grid gap-3 border-t border-zinc-800 pt-4 text-sm text-zinc-400">
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-400" />
            ER
          </span>
          <span className="font-black text-white">{Math.round(data.erCurrentRatio)}:1</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-sky-400" />
            V/L
          </span>
          <span className="font-black text-white">{Math.round(data.vlCurrentRatio)}:1</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-amber-400" />
            Value
          </span>
          <span className="font-black text-white">${data.value.toLocaleString()}</span>
        </div>
      </div>

      <button className="mt-6 inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-500/20">
        View details <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
