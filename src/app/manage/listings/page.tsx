'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ListingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  status: string;
}

export default function ManageListingsPage() {
  const [items, setItems] = useState<ListingItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/secure');
        const payload = await response.json();
        setItems((payload.marketListings ?? []).map((item: any) => ({
          id: String(item.id),
          title: item.title ?? 'Market listing',
          description: item.description ?? '',
          price: item.price ?? 0,
          status: item.status ?? 'open',
        })));
      } catch (error) {
        console.error('Unable to load listings', error);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Manage</p>
          <h1 className="text-3xl font-bold">My listings</h1>
        </div>
        <Link href="/market" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900">Back</Link>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-sm text-zinc-400">No listings published yet.</div>
        ) : items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{item.title}</h2>
              <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-400">{item.status}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-zinc-500">Price: {item.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
