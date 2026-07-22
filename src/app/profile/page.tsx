'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, Briefcase, Building2, Sparkles, Users, Wallet } from 'lucide-react';
import { CVBuilder } from '@/components/profile/cv';
import type { ProfileSummary } from '@/lib/profile';

const statCards = [
  { label: 'Discover activity', value: '30', detail: 'applications' },
  { label: 'Approved', value: '5', detail: 'offers' },
  { label: 'Rejected', value: '10', detail: 'applications' },
  { label: 'Pending', value: '15', detail: 'reviews' },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileSummary | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) throw new Error('Request failed');
        const data = (await response.json()) as ProfileSummary | null;
        setProfile(data);
      } catch (error) {
        console.error('Failed to load profile summary from database', error);
        setProfile(null);
      }
    };

    loadProfile();
  }, []);

  const ownerName = profile?.ownerName ?? 'Martha';
  const handle = profile?.handle ?? '@martha';
  const role = profile?.role ?? 'Buyer';
  const location = profile?.location ?? 'Kampala, Uganda';
  const bio = profile?.bio ?? 'Creator-focused buyer profile.';
  const discover = profile?.discover ?? { created: 12, applied: 8, hired: 5, pending: 15, rejected: 10 };

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/30">
          <div className="bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-950 p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Profile overview
                </div>
                <h1 className="mt-4 text-3xl font-black text-white sm:text-4xl">{ownerName}</h1>
                <p className="mt-2 text-sm font-medium text-zinc-400">{handle} • {role}</p>
                <p className="mt-2 text-sm text-zinc-400">{location}</p>
                <p className="mt-4 text-sm leading-7 text-zinc-300">{bio}</p>
              </div>
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-300">
                <div className="flex items-center gap-2 text-amber-300">
                  <Wallet className="h-4 w-4" />
                  <span className="font-semibold">Activity snapshot</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between gap-4"><span>Accepted</span><span className="font-semibold text-white">{discover.hired}</span></div>
                  <div className="flex items-center justify-between gap-4"><span>Rejected</span><span className="font-semibold text-white">{discover.rejected}</span></div>
                  <div className="flex items-center justify-between gap-4"><span>Pending</span><span className="font-semibold text-white">{discover.pending}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-zinc-800 p-6 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                <p className="text-sm text-zinc-400">{card.label}</p>
                <p className="mt-2 text-2xl font-black text-white">{card.value}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.25em] text-zinc-500">{card.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-6">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-amber-300" />
                <h2 className="text-xl font-semibold text-white">Discover activity</h2>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">Created</p>
                  <p className="mt-2 text-2xl font-black text-white">{discover.created}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">Applied</p>
                  <p className="mt-2 text-2xl font-black text-white">{discover.applied}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">Hired</p>
                  <p className="mt-2 text-2xl font-black text-white">{discover.hired}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">Pending</p>
                  <p className="mt-2 text-2xl font-black text-white">{discover.pending}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-6">
              <div className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-emerald-400" />
                <h2 className="text-xl font-semibold text-white">Approvals</h2>
              </div>
              <div className="mt-5 space-y-3">
                {[
                  { title: 'CV review approved', status: 'Accepted', detail: 'Your latest profile summary passed review.' },
                  { title: 'Discover application bundle', status: 'Pending', detail: 'Awaiting final response from the recruiter team.' },
                  { title: 'Recruiter feedback', status: 'Rejected', detail: 'A recent submission needs a stronger proof of work update.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.title}</p>
                        <p className="mt-1 text-sm text-zinc-400">{item.detail}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${item.status === 'Accepted' ? 'bg-emerald-500/10 text-emerald-300' : item.status === 'Pending' ? 'bg-amber-500/10 text-amber-300' : 'bg-rose-500/10 text-rose-300'}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-sky-400" />
                <h2 className="text-xl font-semibold text-white">CV analytics</h2>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">Profile strength</p>
                  <p className="mt-2 text-2xl font-black text-white">92%</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">Keyword match</p>
                  <p className="mt-2 text-2xl font-black text-white">87%</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">Recruiter approval</p>
                  <p className="mt-2 text-2xl font-black text-white">4.8/5</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4">
                  <p className="text-sm text-zinc-400">Last update</p>
                  <p className="mt-2 text-lg font-semibold text-white">2 days ago</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-6">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-amber-300" />
                <h2 className="text-xl font-semibold text-white">CV builder</h2>
              </div>
              <div className="mt-4">
                <CVBuilder />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}