import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import type { OrderCardData } from './types';

interface HeaderProps {
  data: OrderCardData & { customStatus?: string };
  isInactive?: boolean;
}

export function Header({ data, isInactive }: HeaderProps) {
  const [targetTime] = useState(() => Date.now() + 24 * 60 * 60 * 1000);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    setTimeLeft(Math.max(0, targetTime - Date.now()));
    const timer = setInterval(() => {
      const remaining = targetTime - Date.now();
      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  const isExpired = timeLeft <= 0 || data.customStatus === 'Lapsed';

  const formatTime = (ms: number) => {
    if (ms <= 0 || data.customStatus === 'Lapsed') return '00:00:00';
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const hoursRemaining = timeLeft / (1000 * 60 * 60);
  let timerColorClass = isInactive ? 'text-zinc-600' : 'text-blue-400/80';

  if (!isInactive) {
    if (isExpired) {
      timerColorClass = 'text-zinc-600';
    } else if (hoursRemaining <= 6) {
      timerColorClass = 'text-red-500/90';
    } else if (hoursRemaining <= 12) {
      timerColorClass = 'text-emerald-400/80';
    }
  }

  let statusTitle = data.customStatus || (data.isCountered ? 'Counter Offer' : 'Standard');
  if (timeLeft <= 0 && data.customStatus !== 'Lapsed') statusTitle = 'Expired';

  let statusColorClasses = 'text-emerald-400 border-emerald-500/30';
  if (statusTitle === 'Lapsed' || isExpired) {
    statusColorClasses = 'text-zinc-500 border-zinc-800';
  } else if (statusTitle === 'Pending') {
    statusColorClasses = 'text-purple-400 border-purple-500/30';
  } else if (statusTitle === 'Counter Offer') {
    statusColorClasses = 'text-amber-400 border-amber-500/30';
  } else if (statusTitle === 'Finalized') {
    statusColorClasses = 'text-emerald-400 border-emerald-400/40';
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex justify-center select-none">
        <div className={`w-fit py-1 px-3 text-[9px] font-black uppercase tracking-widest border rounded-full transition-colors duration-300 ${statusColorClasses}`}>
          {statusTitle}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border border-neutral-900 bg-[#060606]/40 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 border border-neutral-800 flex items-center justify-center select-none shrink-0">
            <span className="text-xs font-black text-zinc-500 uppercase">
              {data.buyerName?.slice(0, 2)}
            </span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1">
              <h3 className={`text-sm font-black truncate tracking-tight transition-colors duration-300 ${isInactive ? 'text-zinc-500' : 'text-white'}`}>{data.buyerName}</h3>
              <CheckCircle className="w-3.5 h-3.5 text-amber-500 fill-amber-500/10 shrink-0" strokeWidth={2.5} />
            </div>
            <span className="text-xs text-zinc-500 font-medium truncate">@{data.buyerUsername}</span>
          </div>
        </div>

        <div className="flex flex-col items-end justify-center select-none text-right">
          <span className={`text-[10px] font-mono tracking-wider font-medium transition-colors duration-300 ${timerColorClass}`}>
            {formatTime(timeLeft)}
          </span>
          <span className="text-[8px] font-mono tracking-wider font-medium text-zinc-500 mt-1">
            left
          </span>
        </div>
      </div>
    </div>
  );
}
