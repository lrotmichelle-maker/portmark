'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AdvertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublishSuccess?: (item: any) => void;
}

export default function AdvertModal({ isOpen, onClose, onPublishSuccess }: AdvertModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technology');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please provide a title and description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'demo-user' },
        body: JSON.stringify({ title, description, category, createdBy: 'demo-user' }),
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to create advert');

      onPublishSuccess?.({
        id: String(payload.item?.id ?? Date.now()),
        projectName: title,
        description,
        category,
        status: 'Active',
        publisherUsername: 'demo-user',
        publisherRating: 4.7,
        timeRemainingDays: 14,
        nicheHashtag: 'growth',
        communitySize: 12000,
        viewsGenerated: 10000,
        likesGenerated: 1500,
        totalBudget: 1000,
        budgetUsed: 0,
        highestMcp: 100,
        hasJoined: false,
      });
      setTitle('');
      setDescription('');
      setCategory('Technology');
      onClose();
    } catch (error) {
      console.error('Failed to publish advert', error);
      alert('Unable to publish advert right now.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-zinc-900 pb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500">Campaign</p>
            <h3 className="text-lg font-semibold text-white">Create an advert</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 transition-colors hover:text-zinc-300">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Advert title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              placeholder="e.g. Brand awareness push"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-zinc-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/60 p-2.5 text-sm text-zinc-200 outline-none"
              placeholder="Describe the campaign offer"
            />
          </div>

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
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-400 transition-colors hover:bg-blue-500/20"
          >
            {isSubmitting ? 'Publishing...' : 'Publish advert'}
          </button>
        </div>
      </div>
    </div>
  );
}
