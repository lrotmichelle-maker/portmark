'use client';

import React, { useState } from 'react';
import type { OrderCardProps } from './types';
import { Header } from './header';
import { Content } from './content';
import { Sentiment } from './sentiment';
import { Footer } from './footer';
import { useNegotiationContext } from '@/context/NegotiationContext';

export default function OrderCard({ data, onAccept, onCounter, onDecline, onCounterToggle, activeAction }: OrderCardProps) {
  const [counterPrice, setCounterPrice] = useState('');
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { sessions } = useNegotiationContext();
  const session = sessions[(data as any).cardId ?? (data as any).id];
  const sellerCounterCount = session?.sellerCounterCount ?? 0;

  const isInactive = session ? ['passed', 'declined', 'timed-out'].includes(session.status) : Boolean(data.isInactive);
  const isCounterActive = activeAction === 'counter' || isCounterOpen;

  const handleCounterToggle = () => {
    setIsCounterOpen((v) => !v);
    setValidationError(null);
    if (onCounterToggle) onCounterToggle();
  };

  const getSellerMinPrice = () => {
    const originalPrice = data.originalPrice || 0;
    if (sellerCounterCount === 0) return originalPrice * 0.65;
    if (sellerCounterCount === 1) return originalPrice * 0.75;
    if (sellerCounterCount === 2) return originalPrice * 0.90;
    return originalPrice;
  };

  const handleInputChange = (val: string) => {
    setCounterPrice(val);
    setValidationError(null);
    if (!val.trim()) return;
    const price = parseFloat(val);
    if (Number.isNaN(price)) return;

    const minPrice = getSellerMinPrice();
    let maxOffLabel = '35%';
    if (sellerCounterCount === 1) maxOffLabel = '25%';
    else if (sellerCounterCount === 2) maxOffLabel = '10%';

    if (price < minPrice) {
      setValidationError(`Minimum offer $${minPrice.toFixed(2)} (max ${maxOffLabel} off)`);
    }
  };

  const submitCounter = () => {
    const price = parseFloat(counterPrice);
    if (!Number.isNaN(price) && price > 0 && !validationError) {
      if (onCounter) onCounter(price);
      setCounterPrice('');
      setIsCounterOpen(false);
    }
  };

  return (
    <div className={`flex h-full flex-col rounded-[28px] border border-zinc-800/80 bg-black p-5 shadow-2xl transition-all duration-300 ease-in-out ${isInactive ? 'opacity-60 grayscale bg-neutral-900/40 pointer-events-none' : ''}`}>
      <div className="space-y-2 border-b border-neutral-800 pb-4">
        <Header data={data as any} isInactive={isInactive} />
      </div>

      <div className="flex-1 space-y-4 py-4">
        <Content data={data as any} isInactive={isInactive} />

        {data.orderDescription ? (
          <div className="rounded-2xl border border-neutral-900/70 bg-[#0B0B0B]/90 px-3 py-2.5 text-sm text-zinc-300">
            {data.orderDescription}
          </div>
        ) : null}

        <div className="flex items-center justify-between rounded-2xl border border-neutral-900/70 bg-[#0B0B0B]/90 px-3 py-2.5 text-xs text-zinc-400">
          <span>Received</span>
          <span>{data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '—'}</span>
        </div>
      </div>

      <div className="mt-auto pt-4">
        {isInactive ? (
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-3 py-2 text-center text-xs uppercase tracking-[0.2em] text-red-400">
            {session?.status === 'passed' ? 'Passed' : session?.status === 'declined' ? 'Declined' : 'Timed out'}
          </div>
        ) : data.status === 'pending' && isCounterActive ? (
          <div className="space-y-2">
            <input
              type="number"
              placeholder={`Min: $${getSellerMinPrice().toFixed(2)}`}
              value={counterPrice}
              onChange={(e) => handleInputChange(e.target.value)}
              className={`w-full rounded-lg border bg-neutral-900 p-2 text-sm text-white placeholder-zinc-500 ${validationError ? 'border-red-500/50' : 'border-neutral-800'}`}
            />
            {validationError && (
              <p className="text-[10px] font-bold text-red-500">{validationError}</p>
            )}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => submitCounter()}
                disabled={!!validationError}
                className="flex-1 rounded-lg bg-amber-500/10 px-2 py-2 text-xs font-bold text-amber-500 transition-colors hover:bg-amber-500 hover:text-white disabled:opacity-40 disabled:pointer-events-none"
              >
                Send Counter
              </button>
              <button
                type="button"
                onClick={() => {
                  setCounterPrice('');
                  handleCounterToggle();
                }}
                className="rounded-lg bg-neutral-900/60 px-2 py-2 text-xs font-bold text-zinc-400 transition-colors hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : data.status === 'pending' ? (
          <Footer data={data as any} onDecline={onDecline} onCounter={() => handleCounterToggle()} onAccept={() => onAccept(data.offeredPrice || data.originalPrice || 0)} isInactive={isInactive} activeAction={activeAction} />
        ) : (
          <div className="rounded-xl border border-neutral-900/70 px-3 py-2 text-center text-xs uppercase tracking-[0.2em] text-zinc-500">
            Order {data.status}
          </div>
        )}
      </div>
    </div>
  );
}
