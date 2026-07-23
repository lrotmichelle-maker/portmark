'use client';

import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface ListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess?: (item: any) => void;
}

export default function ListingModal({ isOpen, onClose, onPublishSuccess }: ListingModalProps) {
  const [profileUrl, setProfileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [niche, setNiche] = useState('Growth');
  const [accountData, setAccountData] = useState<{ handle: string; followers: number; likes: number; engagementRate: number; platform: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!profileUrl.trim() || !description.trim() || !price.trim()) {
      setError('Please provide the profile link, description, and price.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ profileUrl, description, price: Number(price) || 0, niche, createdBy: 'demo-user' }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to create listing');

      setAccountData({
        handle: payload.item?.handle ?? '',
        followers: payload.item?.followers ?? 0,
        likes: payload.item?.likes ?? 0,
        engagementRate: payload.item?.engagementRate ?? 0,
        platform: payload.item?.platform ?? '',
      });
      onPublishSuccess?.(payload.item);
      setProfileUrl('');
      setDescription('');
      setPrice('');
      setNiche('Growth');
      onClose();
    } catch (error) {
      console.error('Failed to publish listing', error);
      setError(error instanceof Error ? error.message : 'Unable to publish listing right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-zinc-900 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Market</p>
            <h3 className="text-lg font-semibold text-white">Publish social account listing</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 transition-colors hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Profile link</label>
            <input
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              placeholder="https://instagram.com/yourhandle"
            />
            <p className="mt-1 text-[11px] text-zinc-500">We validate the profile and auto-fill handle, followers, likes, and engagement rate.</p>
          </div>

          {accountData && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Verified {accountData.platform} profile
              </div>
              <div className="mt-2 grid gap-2 text-[12px] text-emerald-200 sm:grid-cols-2">
                <div>Handle: @{accountData.handle}</div>
                <div>Followers: {accountData.followers.toLocaleString()}</div>
                <div>Likes: {accountData.likes.toLocaleString()}</div>
                <div>Engagement: {accountData.engagementRate}%</div>
              </div>
            </div>
          )}

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              placeholder="Describe the account and what makes it valuable"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                type="number"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Niche</label>
              <input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
                placeholder="Growth"
              />
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
          >
            {isSubmitting ? 'Publishing...' : 'Publish listing'}
          </button>
        </div>
      </div>
    </div>
  );
}
