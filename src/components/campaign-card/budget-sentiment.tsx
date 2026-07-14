import React from 'react';
import type { CampaignCardData } from '@/types/campaign-card';

interface BudgetSentimentProps {
  data: CampaignCardData;
}

export function BudgetSentiment({ data }: BudgetSentimentProps) {
  const percentageUsed = Math.min(Math.round((data.budgetUsed / data.totalBudget) * 100), 100);
  const remainingBudget = data.totalBudget - data.budgetUsed;

  const formatAmount = (val: number) => {
    return val % 1 === 0 ? `$${val}` : `$${val.toFixed(2)}`;
  };

  return (
    <div className="w-full flex flex-col gap-1.5 px-0.5 mt-0.5">
      <div className="flex items-center gap-1 text-[11px] font-bold tracking-wide uppercase">
        <span className="text-zinc-500 select-none mr-0.5">Budget:</span>
        <div className="flex items-center gap-1 text-emerald-400 font-black">
          <span>{formatAmount(data.budgetUsed)}</span>
        </div>
        <span className="text-zinc-600">/</span>
        <div className="flex items-center gap-1 text-blue-400 font-black">
          <span>{formatAmount(remainingBudget)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full">
        <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800/40 relative">
          <div
            className="h-full rounded-full transition-all duration-500 bg-emerald-500"
            style={{ width: `${percentageUsed}%` }}
          />
        </div>
        <div className="text-[10px] font-mono text-zinc-500 font-bold tracking-tight shrink-0 select-none">
          {percentageUsed}%
        </div>
      </div>
    </div>
  );
}