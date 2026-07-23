'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CampaignCardData } from '@/types/campaign';

export default function ManageCampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/secure');
        const payload = await response.json();
        const list = (payload.campaigns ?? []).map((item: any) => ({
          id: String(item.id),
          publisherProfileIcon: '/images/publisher-placeholder.png',
          projectName: item.projectName ?? item.title ?? 'Campaign',
          publisherUsername: item.publisherUsername ?? item.createdBy ?? 'demo-user',
          publisherRating: 4.8,
          timeRemainingDays: 14,
          nicheHashtag: 'growth',
          description: item.description ?? '',
          category: item.category ?? 'Technology',
          status: item.status ?? 'Active',
          communitySize: 12000,
          viewsGenerated: 10000,
          likesGenerated: 1500,
          totalBudget: 1000,
          budgetUsed: 0,
          highestMcp: 100,
          hasJoined: Boolean(item.hasJoined ?? false),
        }));
        setCampaigns(list);
      } catch (error) {
        console.error('Unable to load managed campaigns', error);
      }
    };

    load();
  }, []);

  const pauseCampaign = (id: string) => {
    setCampaigns((prev) => prev.map((item) => item.id === id ? { ...item, status: item.status.toLowerCase() === 'paused' ? 'Active' : 'Paused' } : item));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Manage</p>
          <h1 className="text-3xl font-bold">My campaigns</h1>
        </div>
        <Link href="/campaign" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900">Back</Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-sm text-zinc-400">No campaigns to manage yet.</div>
        ) : campaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{campaign.projectName}</h2>
              <span className={`rounded-full px-3 py-1 text-xs ${campaign.status.toLowerCase() === 'paused' ? 'bg-zinc-800 text-zinc-400' : 'bg-emerald-500/15 text-emerald-400'}`}>{campaign.status}</span>
            </div>
            <p className="mt-3 text-sm text-zinc-400">{campaign.description}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => pauseCampaign(campaign.id)} className="rounded-lg border border-zinc-700 px-3 py-2 text-sm hover:bg-zinc-900">{campaign.status.toLowerCase() === 'paused' ? 'Resume' : 'Pause'}</button>
              <button onClick={() => deleteCampaign(campaign.id)} className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
