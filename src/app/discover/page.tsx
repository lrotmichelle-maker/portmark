'use client'; // Required since we are handling live search state inputs and sorting

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Briefcase, Flame, ArrowUpWideNarrow, UserCheck, Timer } from 'lucide-react';
import JobCard from '@/components/job-card';
import Grid from '@/components/layout/grid'; 
import RecruitModal from '@/components/layout/recruit-modal'; // Imported our new pop-out form modal
import type { JobOffer } from '@/components/job-card/data';
import { hasSavedCvData, recordOfficeEvent } from '@/lib/office-history';

type SortFilter = 'newest' | 'applicants' | 'payment' | 'vacants';

export default function DiscoverPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState<SortFilter>('newest');
  const [isRecruitOpen, setIsRecruitOpen] = useState(false); // Controls pop-out form engine visibility
  const [jobsList, setJobsList] = useState<JobOffer[]>([]);

  // 1. Filter Engine (Executes First)
  const filteredJobs = jobsList.filter((job) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true; 

    const matchesName = job.employerName?.toLowerCase().includes(query);
    const matchesTitle = job.title?.toLowerCase().includes(query);
    
    const matchesRequirements = Array.isArray(job.requirements) && job.requirements.some((skill: string) =>
      skill.toLowerCase().includes(query)
    );
    
    const matchesRequiredCount = job.requiredPeople?.toString() === query;

    return matchesName || matchesTitle || matchesRequirements || matchesRequiredCount;
  });

  React.useEffect(() => {
    const loadJobs = async () => {
      try {
        const response = await fetch('/api/discover');
        if (!response.ok) throw new Error('Request failed');
        const jobs = (await response.json()) as JobOffer[];
        setJobsList(jobs);
      } catch (error) {
        console.error('Failed to load discover jobs from database', error);
        setJobsList([]);
      }
    };

    loadJobs();
  }, []);

  const handleApplyJob = (job: JobOffer) => {
    if (!hasSavedCvData()) {
      recordOfficeEvent({
        type: 'application',
        title: 'CV needed before applying',
        description: `Please complete your CV before applying to ${job.title}.`,
        status: 'pending',
        meta: { jobId: job.id, title: job.title },
      });
      router.push('/office/cv');
      return;
    }

    setJobsList((prev) => prev.map((item) => (item.id === job.id ? { ...item, applicants: item.applicants + 1 } : item)));
    recordOfficeEvent({
      type: 'application',
      title: 'Application submitted',
      description: `You applied to ${job.title} at ${job.employerName}.`,
      status: 'submitted',
      meta: { jobId: job.id, title: job.title },
    });
  };

  // Check if a search query was typed but no records were found
  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasNoMatches = hasSearchQuery && filteredJobs.length === 0;

  // 2. Sorting Engine Sorting Rules Strategy (Only runs if search matches exist)
  const sortedJobs = hasNoMatches 
    ? [] 
    : [...filteredJobs].sort((a, b) => {
        switch (activeSort) {
          case 'applicants':
            // Applicants ordered from lowest to highest
            return (a.applicants || 0) - (b.applicants || 0);
          case 'payment':
            // Ordered from highest to lowest
            const salaryA = (a.maxSalary || 0) as number;
            const salaryB = (b.maxSalary || 0) as number;
            return salaryB - salaryA;
          case 'vacants':
            // Ordered from highest to lowest
            const spotsLeftA = (a.requiredPeople || 0) - (a.accepted || 0);
            const spotsLeftB = (b.requiredPeople || 0) - (b.accepted || 0);
            return spotsLeftB - spotsLeftA;
          case 'newest':
          default:
            return Number(b.id) - Number(a.id);
        }
      });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 bg-transparent">
      
      {/* 🚀 ACTION CONTAINER: Placed search bar and Recruit button side-by-side */}
      <div className="w-full max-w-2xl mx-auto mb-4 flex items-center gap-3">
        
        {/* Sleek, Instant Live Search Bar Container */}
        <div className="flex-1 flex items-center gap-2 bg-zinc-950/40 border border-zinc-800 rounded-2xl p-2.5 focus-within:border-zinc-700/80 transition-all duration-200">
          <Search className="w-4 h-4 text-zinc-500 shrink-0 ml-1" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search roles, skills, companies..."
            className="w-full bg-transparent border-0 outline-none text-zinc-200 placeholder-zinc-500 text-xs sm:text-sm min-w-0 focus:ring-0 focus:outline-none"
          />
          
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-zinc-500 hover:text-zinc-300 p-1 rounded-full transition-colors duration-150 mr-1"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ➕ RECRUIT BUTTON NEXT TO SEARCH BAR */}
        <button
          type="button"
          onClick={() => setIsRecruitOpen(true)}
          className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-4 py-3 rounded-2xl transition-all duration-150 font-bold uppercase text-[10px] tracking-widest shrink-0"
        >
          <Briefcase className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Recruit</span>
        </button>
      </div>

      {/* 🧭 SINGLE ROW BADGE CHIP FILTERS */}
      <div className="w-full max-w-2xl mx-auto mb-10 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-2 pb-2">
        
        <button
          type="button"
          disabled={hasNoMatches}
          onClick={() => setActiveSort('newest')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all duration-150 ${
            hasNoMatches
              ? 'bg-transparent text-zinc-700 border-zinc-900 cursor-not-allowed opacity-40'
              : activeSort === 'newest'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <Timer className="w-3.5 h-3.5 shrink-0" />
          <span>Newest</span>
        </button>

        <button
          type="button"
          disabled={hasNoMatches}
          onClick={() => setActiveSort('applicants')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all duration-150 ${
            hasNoMatches
              ? 'bg-transparent text-zinc-700 border-zinc-900 cursor-not-allowed opacity-40'
              : activeSort === 'applicants'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <ArrowUpWideNarrow className="w-3.5 h-3.5 shrink-0" />
          <span>Applicants</span>
        </button>

        <button
          type="button"
          disabled={hasNoMatches}
          onClick={() => setActiveSort('payment')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all duration-150 ${
            hasNoMatches
              ? 'bg-transparent text-zinc-700 border-zinc-900 cursor-not-allowed opacity-40'
              : activeSort === 'payment'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5 shrink-0" />
          <span>Payment</span>
        </button>

        <button
          type="button"
          disabled={hasNoMatches}
          onClick={() => setActiveSort('vacants')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all duration-150 ${
            hasNoMatches
              ? 'bg-transparent text-zinc-700 border-zinc-900 cursor-not-allowed opacity-40'
              : activeSort === 'vacants'
              ? 'bg-white text-black border-white'
              : 'bg-transparent text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 shrink-0" />
          <span>Vacants</span>
        </button>

      </div>

      {/* Grid Rendering Zone */}
      {sortedJobs.length > 0 ? (
        <Grid>
          {sortedJobs.map((job) => (
            <JobCard key={job.id} job={job} onApply={handleApplyJob} />
          ))}
        </Grid>
      ) : (
        <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
          <p className="text-zinc-500 text-sm font-medium">No active listings match your search criteria.</p>
          <button 
            type="button"
            onClick={() => {
              setSearchQuery('');
              setActiveSort('newest');
            }}
            className="mt-3 text-xs text-emerald-400 font-bold underline cursor-pointer bg-transparent border-0 outline-none"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* RECRUIT INTAKE OVERLAY ENGINE */}
      <RecruitModal 
        isOpen={isRecruitOpen} 
        onClose={() => setIsRecruitOpen(false)} 
      />

    </div>
  );
}