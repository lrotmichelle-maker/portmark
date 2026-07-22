import React from 'react';
import { AlertTriangle } from 'lucide-react';
import type { OfferCardData } from './types';

interface SentimentProps {
    data: OfferCardData;
    isInactive?: boolean;
}

export function Sentiment({ data, isInactive }: SentimentProps) {
    const currentVotes = data.sentimentRate ?? 72;
    const maxVotes = 100;

    const safeMax = maxVotes <= 0 ? 100 : maxVotes;
    const percentage = Math.min(Math.round((currentVotes / safeMax) * 100), 100);

    let label = "Out of market reach";
    let textColor = "text-red-500";
    let barColor = "bg-red-500";

    if (percentage < 20) {
        label = "Price is not fair";
        textColor = "text-blue-400";
        barColor = "bg-blue-500";
    } else if (percentage < 40) {
        label = "Over valued";
        textColor = "text-orange-400";
        barColor = "bg-orange-500";
    } else if (percentage < 69) {
        label = "Very expensive";
        textColor = "text-rose-700";
        barColor = "bg-rose-800";
    } else {
        label = "Out of market reach";
        textColor = "text-red-500";
        barColor = "bg-red-500";
    }

    return (
        <div className="w-full flex flex-col gap-1.5 px-0.5 mt-0.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase">
                <span className="text-zinc-500 select-none">Bad Fit:</span>

                {/* Icons and labels remain color-vibrant */}
                <div className={`flex items-center gap-1 ${textColor} font-black`}>
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                    <span>{label}</span>
                </div>
            </div>

            <div className="flex items-center gap-2.5 w-full">
                {/* Progress bar structure switches to flat zinc configuration if inactive */}
                <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/40 relative">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isInactive ? 'bg-zinc-700' : barColor}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <div className="text-[10px] font-mono text-zinc-500 font-bold tracking-tight shrink-0 select-none">
                    {currentVotes} / {maxVotes} votes
                </div>
            </div>
        </div>
    );
}
