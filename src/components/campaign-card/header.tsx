"use client";

import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import type { CampaignCardData } from '@/types/campaign';

interface HeaderProps {
  data: CampaignCardData;
}

export function Header({ data }: HeaderProps) {
  const [timeLeft, setTimeLeft] = useState(data.timeRemainingDays * 24 * 60 * 60 * 1000);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1000) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [data.timeRemainingDays]);

  const formatTime = (ms: number) => {
    if (ms <= 0) return "00:00:00";

    const totalSecs = Math.floor(ms / 1000);
    const days = Math.floor(totalSecs / (24 * 3600));
    const hrs = Math.floor((totalSecs % (24 * 3600)) / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (days > 0) {
      return `${days}d`;
    } else {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between p-4 border border-neutral-900 bg-[#060606]/40 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-800 flex items-center justify-center select-none shrink-0 overflow-hidden">
            {!imageError && data.publisherProfileIcon ? (
              <img 
                src={data.publisherProfileIcon} 
                alt="Publisher Profile" 
                className="w-full h-full rounded-full object-cover" 
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-xs font-black text-zinc-500 uppercase">{data.projectName.slice(0, 2)}</span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <h3 className="text-xs md:text-sm font-black truncate tracking-tight text-white">{data.projectName}</h3>
              <CheckCircle className="w-3 md:w-3.5 h-3 md:h-3.5 text-amber-500 fill-amber-500/10 shrink-0" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] md:text-xs text-zinc-500 font-medium truncate">@{data.publisherUsername} ({data.publisherRating} / 5)</span>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center select-none text-right shrink-0">
          <span className="text-sm md:text-base font-black text-emerald-400 font-mono tracking-tight whitespace-nowrap leading-none">
            {formatTime(timeLeft)}
          </span>
          <span className="text-[6.5px] md:text-[8px] font-mono tracking-wider font-medium mt-1 text-zinc-500">
            Remaining
          </span>
        </div>
      </div>
    </div>
  );
}