'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess?: (item: any) => void;
}

export default function CampaignModal({ isOpen, onClose, onPublishSuccess }: CampaignModalProps) {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [nicheHashtag, setNicheHashtag] = useState('growth');
  const [totalBudget, setTotalBudget] = useState('1000');
  const [timeRemainingDays, setTimeRemainingDays] = useState('14');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const validateProjectName = (name: string) => {
    if (!name.trim()) return 'Campaign name cannot be empty.';
    if (name.length > 16) return 'Campaign name must be 16 characters or fewer.';
    if (/^[ .]/.test(name)) return 'Campaign name cannot start with a space or period.';
    if(/[\p{Emoji}]/u.test(name)) return 'Campaign name cannot contain emojis or icons.';
    if (/[^a-zA-Z0-9 .\-]/.test(name)) return 'Only letters, numbers, spaces, dot and hyphen are allowed.';
    if (/\s{2,}/.test(name)) return 'Campaign name cannot contain consecutive spaces.';
    if (/\.{2,}/.test(name)) return 'Campaign name cannot contain consecutive periods.';
    if (/[\-\.]{2,}/.test(name)) return 'Campaign name cannot contain consecutive special characters.';
    if (/[ .]$/.test(name)) return 'Campaign name cannot end with a space or period.';
    return '';
  };

  const [startDate, setStartDate] = useState('');
  const [minPayout, setMinPayout] = useState('0');
  const [maxPayout, setMaxPayout] = useState('0');

  const handleSubmit = async () => {
    const nameErr = validateProjectName(projectName);
    if (nameErr) {
      setError(nameErr);
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description.');
      return;
    }

    // start date validation
    if (startDate) {
      const sd = new Date(startDate);
      const now = new Date();
      now.setHours(0,0,0,0);
      if (sd < now) {
        setError('Start date cannot be in the past.');
        return;
      }
    }

    const minP = Number(minPayout) || 0;
    const maxP = Number(maxPayout) || 0;
    if (minP < 0 || maxP < 0) { setError('Payout values must be positive'); return; }
    if (maxP > 0 && minP > maxP) { setError('Min payout cannot exceed max payout'); return; }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/secure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({
          mode: 'create_campaign',
          title: projectName,
          description,
          category,
          nicheHashtag,
          totalBudget: Number(totalBudget) || 1000,
          timeRemainingDays: Number(timeRemainingDays) || 14,
          startDate: startDate || null,
          minPayout: Number(minPayout) || 0,
          maxPayout: Number(maxPayout) || 0,
        }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to create campaign');

      onPublishSuccess?.({
        id: String(payload.item?.id ?? Date.now()),
        projectName,
        publisherUsername: 'demo-user',
        publisherRating: 4.8,
        timeRemainingDays: Number(timeRemainingDays) || 14,
        nicheHashtag,
        description,
        category,
        status: 'Active',
        communitySize: 12000,
        viewsGenerated: 10000,
        likesGenerated: 1500,
        totalBudget: Number(totalBudget) || 1000,
        budgetUsed: 0,
        highestMcp: 100,
        hasJoined: false,
        startDate: startDate || undefined,
        minPayout: Number(minPayout) || undefined,
        maxPayout: Number(maxPayout) || undefined,
      });

      setProjectName('');
      setDescription('');
      setCategory('Technology');
      setNicheHashtag('growth');
      setTotalBudget('1000');
      setTimeRemainingDays('14');
      onClose();
    } catch (error) {
      console.error('Failed to create campaign', error);
      setError(error instanceof Error ? error.message : 'Unable to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-zinc-900 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Campaign</p>
            <h3 className="text-lg font-semibold text-white">Create campaign</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 transition-colors hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Campaign name</label>
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              placeholder="e.g. Summer product launch"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              placeholder="Describe the campaign goals and audience"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              >
                <option value="Technology">Technology</option>
                <option value="Lifestyle">Lifestyle</option>
                <option value="Gaming">Gaming</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Sports">Sports</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Niche</label>
              <input
                value={nicheHashtag}
                onChange={(e) => setNicheHashtag(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
                placeholder="growth"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Start date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Min payout</label>
              <input
                type="number"
                value={minPayout}
                onChange={(e) => setMinPayout(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
                placeholder="0"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Max payout</label>
              <input
                type="number"
                value={maxPayout}
                onChange={(e) => setMaxPayout(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Budget</label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
                placeholder="1000"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Days remaining</label>
              <input
                type="number"
                value={timeRemainingDays}
                onChange={(e) => setTimeRemainingDays(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
                placeholder="14"
              />
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`rounded-xl border px-6 py-2 text-sm font-semibold transition-all ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'} text-emerald-400 border-emerald-600/30 bg-transparent`} 
            style={{ transition: 'all 180ms ease' }}
          >
            {isSubmitting ? 'Publishing...' : 'Publish campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}
