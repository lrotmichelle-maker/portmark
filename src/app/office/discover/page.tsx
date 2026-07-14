'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, FileText, CircleAlert } from 'lucide-react';
import { mockJobs } from '@/components/job-card/data';
import { hasSavedCvData, recordOfficeEvent } from '@/lib/office-history';

export default function OfficeDiscoverPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState(mockJobs.slice(0, 6));

  useEffect(() => {
    setJobs(mockJobs.slice(0, 6));
  }, []);

  const handleApply = (job: (typeof mockJobs)[number]) => {
    if (!hasSavedCvData()) {
      recordOfficeEvent({
        type: 'application',
        title: 'CV missing for application',
        description: `You need to complete your CV before applying to ${job.title}.`,
        status: 'pending',
        meta: { jobId: job.id, title: job.title },
      });
      router.push('/office/cv');
      return;
    }

    recordOfficeEvent({
      type: 'application',
      title: 'Application submitted',
      description: `Your application for ${job.title} was sent to ${job.employerName}.`,
      status: 'submitted',
      meta: { jobId: job.id, title: job.title },
    });

    setJobs((prev) => prev.map((item) => (item.id === job.id ? { ...item, applicants: item.applicants + 1 } : item)));
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,_#09090b,_#111827)] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:flex-row">
        <aside className="xl:w-72">
          <div className="rounded-[28px] border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">Office</p>
            <h1 className="mt-2 text-2xl font-semibold text-white">Discover workspace</h1>
            <div className="mt-4 space-y-2">
              <Link href="/office" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">Overview</Link>
              <Link href="/office/discover" className="flex items-center gap-2 text-sm text-emerald-400">Discover</Link>
              <Link href="/office/campaign" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">Campaign</Link>
              <Link href="/office/market" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">Market</Link>
              <Link href="/office/cv" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">CV</Link>
              <Link href="/profile" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white">Profile</Link>
            </div>
          </div>
        </aside>

        <section className="flex-1 space-y-4">
          <div className="rounded-[28px] border border-zinc-800/80 bg-zinc-950/80 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-2 text-emerald-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">Discover</p>
                <h2 className="text-xl font-semibold text-white">Opportunities ready for you</h2>
              </div>
            </div>
            <p className="mt-3 text-sm text-zinc-400">Apply with your saved CV. If your CV is incomplete, you are redirected to the editor first.</p>
          </div>

          {jobs.map((job) => (
            <div key={job.id} className="rounded-[24px] border border-zinc-800/80 bg-zinc-900/70 p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-zinc-500">{job.employerName}</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{job.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm text-zinc-400">{job.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.requirements.slice(0, 4).map((skill) => (
                      <span key={skill} className="rounded-full border border-zinc-800 bg-zinc-950/70 px-2.5 py-1 text-[11px] text-zinc-400">{skill}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 lg:items-end">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-400">
                    {job.applicants} applicants • {job.accepted}/{job.requiredPeople} accepted
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApply(job)}
                    className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
                  >
                    <FileText className="h-4 w-4" />
                    Apply
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
