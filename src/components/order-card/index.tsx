'use client';

import React, { useState } from 'react';
import type { OrderCardProps } from './types';
import { Header } from './header';
import { Content } from './content';
import { Sentiment } from './sentiment';
import { Footer } from './footer';

export default function OrderCard({ data, onAccept, onCounter, onDecline, onCounterToggle, activeAction }: OrderCardProps) {
  const [counterPrice, setCounterPrice] = useState('');
  const [isCounterOpen, setIsCounterOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const isCounterActive = activeAction === 'counter' || isCounterOpen;

  const handleCounterToggle = () => {
    setIsCounterOpen((v) => !v);
    if (onCounterToggle) onCounterToggle();
  };

  const submitCounter = () => {
    const price = parseFloat(counterPrice);
    if (!Number.isNaN(price) && price > 0) {
      if (onCounter) onCounter(price);
      setCounterPrice('');
      setIsCounterOpen(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-[28px] border border-zinc-800/80 bg-black p-5 shadow-2xl transition-all duration-300 ease-in-out">
      <div className="space-y-2 border-b border-neutral-800 pb-4">
        <Header data={data as any} isInactive={Boolean(data.isInactive)} />
      </div>

      <div className="flex-1 space-y-4 py-4">
        <Content data={data as any} isInactive={Boolean(data.isInactive)} />

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
        {data.status === 'pending' && isCounterActive ? (
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Counter price"
              value={counterPrice}
              onChange={(e) => setCounterPrice(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-2 text-sm text-white placeholder-zinc-500"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => submitCounter()}
                className="flex-1 rounded-lg bg-amber-500/10 px-2 py-2 text-xs font-bold text-amber-500 transition-colors hover:bg-amber-500 hover:text-white"
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
          <Footer data={data as any} onDecline={onDecline} onCounter={() => handleCounterToggle()} onAccept={() => onAccept(data.originalPrice || 0)} isInactive={Boolean(data.isInactive)} activeAction={activeAction} />
        ) : (
          <div className="rounded-xl border border-neutral-900/70 px-3 py-2 text-center text-xs uppercase tracking-[0.2em] text-zinc-500">
            Order {data.status}
          </div>
        )}
      </div>
    </div>
  );
}
