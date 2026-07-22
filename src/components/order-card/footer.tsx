'use client';

import React from 'react';
import { X, RefreshCw, Check } from 'lucide-react';
import type { OrderCardData } from './types';

interface FooterProps {
  data: OrderCardData & { customStatus?: string };
  onDecline: () => void;
  onCounter: () => void;
  onAccept: () => void;
  isInactive?: boolean;
  activeAction?: 'decline' | 'counter' | 'accept' | null;
}

export function Footer({ data, onDecline, onCounter, onAccept, isInactive, activeAction }: FooterProps) {
  const isLocked = Boolean(isInactive || data.customStatus === 'Lapsed' || data.customStatus === 'Finalized');

  const getBtnClasses = (color: 'red' | 'amber' | 'emerald', isActive: boolean, isDisabled: boolean) => {
    const base = 'group flex items-center justify-center gap-1 py-2 px-2 border rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-150 active:scale-[0.98] truncate';

    const themes = {
      red: 'bg-transparent text-red-500 border-red-900/40 hover:bg-red-600 hover:text-white hover:border-red-500 active:bg-red-600 active:text-white',
      amber: 'bg-transparent text-amber-500 border-amber-900/40 hover:bg-amber-500 hover:text-white hover:border-amber-500 active:bg-amber-500 active:text-white',
      emerald: 'bg-transparent text-emerald-400 border-emerald-900/40 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 active:bg-emerald-600 active:text-white',
    } as const;

    const activeClass = isActive ? 'bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08)]' : '';
    const disabledClass = isDisabled ? 'opacity-40 cursor-not-allowed' : '';

    return `${base} ${themes[color]} ${activeClass} ${disabledClass}`;
  };

  const isDisabled = isLocked || data.customStatus === 'Pending' || data.customStatus === 'Processing' || data.customStatus === 'Processing...';

  return (
    <div className={`w-full select-none ${isLocked ? 'opacity-70' : ''}`}>
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={onDecline} disabled={isDisabled} className={getBtnClasses('red', activeAction === 'decline', isDisabled)}>
          <X className="w-3 h-3 shrink-0 stroke-[3] transition-colors duration-200" />
          Decline
        </button>

        <button type="button" onClick={onCounter} disabled={isDisabled} className={getBtnClasses('amber', activeAction === 'counter', isDisabled)}>
          <RefreshCw className="w-3 h-3 shrink-0 stroke-[3] transition-colors duration-200" />
          Counter
        </button>

        <button type="button" onClick={onAccept} disabled={isDisabled} className={getBtnClasses('emerald', activeAction === 'accept', isDisabled)}>
          <Check className="w-3 h-3 shrink-0 stroke-[3] transition-colors duration-200" />
          Accept
        </button>
      </div>
    </div>
  );
}
