'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface SentimentProps {
    costlyVotes: number;
}

export default function Sentiment({ costlyVotes }: SentimentProps) {
    const maxVotes = 100;
    const x = costlyVotes;

    let message = "";
    let colorClass = "";
    let bgClass = "";

    // Threshold logic
    if (x < 20) {
        message = "Not Fair";
        colorClass = "text-emerald-500";
        bgClass = "bg-emerald-500";
    } else if (x >= 20 && x < 40) {
        message = "Too Expensive";
        colorClass = "text-yellow-400";
        bgClass = "bg-yellow-400";
    } else if (x >= 40 && x < 65) {
        message = "Exorbitant";
        colorClass = "text-amber-500";
        bgClass = "bg-amber-500";
    } else {
        message = "Out of Market";
        colorClass = "text-red-500";
        bgClass = "bg-red-500";
    }

    return (
        <div className="w-full flex flex-col gap-1.5 px-0.5 mt-2 text-left">
            <div className="flex items-center justify-between text-[11px] font-bold tracking-wide uppercase">
                {/* Structure: Prefix, Icon, Message */}
                <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">Bad Fit:</span>
                    <AlertTriangle className={`w-3.5 h-3.5 ${colorClass}`} />
                    <span className={`${colorClass}`}>{message}</span>
                </div>

                {/* Vote Count shares the dynamic colorClass */}
                <div className={`font-mono ${colorClass}`}>
                    {x} <span className="opacity-70">/ {maxVotes}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/40">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${bgClass}`}
                    style={{ width: `${Math.min((x / maxVotes) * 100, 100)}%` }}
                />
            </div>
        </div>
    );
}
