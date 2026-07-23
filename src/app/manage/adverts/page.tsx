'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdvertItem {
  id: string;
  projectName: string;
  description: string;
  category: string;
  status: string;
}

export default function ManageAdvertsPage() {
  const [items, setItems] = useState<AdvertItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch('/api/secure');
        const payload = await response.json();
        setItems((payload.campaigns ?? []).map((item: any) => ({
          id: String(item.id),
          projectName: item.projectName ?? item.title ?? 'Campaign',
          description: item.description ?? '',
          category: item.category ?? 'Technology',
          status: item.status ?? 'Active',
        })));
      } catch (error) {
        console.error('Unable to load adverts', error);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Manage</p>
          <h1 className="text-3xl font-bold">Adverts</h1>
        </div>
        <Link href="/campaign" className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-900">Back</Link>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-sm text-zinc-400">No adverts published yet.</div>
        ) : items.map((item) => (
          <div key={item.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{item.projectName}</h2>
              <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs text-blue-400">{item.status}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{item.description}</p>
            <p className="mt-3 text-xs uppercase tracking-[0.25em] text-zinc-500">{item.category}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
