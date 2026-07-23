'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ActivityItem {
  id: string;
  entityType: string;
  entityId: number;
  actorId: string;
  action: string;
  message: string;
  createdAt: unknown;
}

interface JoinedCampaign {
  id: string;
  projectName: string;
  description: string;
  category: string;
  status: string;
}

export default function CampaignActivityPage() {
  const [joinedCampaigns, setJoinedCampaigns] = useState<JoinedCampaign[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/secure');
        const payload = await response.json();
        setJoinedCampaigns(payload.joinedCampaigns ?? []);
        setActivity(payload.activity ?? []);
      } catch (error) {
        console.error('Unable to load campaign activity', error);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Campaign workspace</p>
          <h1 className="text-3xl font-bold">Joined campaigns & activity</h1>
        </div>
        <Link href="/campaign" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900">
          Back to campaigns
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="mb-4 text-xl font-semibold">Joined campaigns</h2>
          {joinedCampaigns.length === 0 ? (
            <p className="text-sm text-zinc-400">No joined campaigns yet. Join one from the campaign list to see it here.</p>
          ) : (
            <div className="space-y-4">
              {joinedCampaigns.map((campaign) => (
                <div key={campaign.id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{campaign.projectName}</h3>
                    <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-400">{campaign.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{campaign.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.25em] text-zinc-500">{campaign.category}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="mb-4 text-xl font-semibold">Recent activity</h2>
          {activity.length === 0 ? (
            <p className="text-sm text-zinc-400">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3">
                  <p className="text-sm font-medium">{item.action}</p>
                  <p className="mt-1 text-sm text-zinc-400">{item.message}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.25em] text-zinc-500">
                    {item.actorId} • {String(item.createdAt ?? '')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
