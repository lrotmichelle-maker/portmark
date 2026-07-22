"use client";

import React, { useEffect, useState } from 'react';
import CampaignCard from '@/components/campaign-card';
import type { CampaignCardData } from '@/types/campaign';
import { Plus } from 'lucide-react';
import { recordOfficeEvent } from '@/lib/office-history';

export default function CampaignPage() {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    status: 'all',
    category: 'all',
    niche: 'all',
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState<'sort_status' | 'cat_niche' | null>(null);
  const [popover, setPopover] = useState<{
    show: boolean;
    label: string;
    count: number;
  } | null>(null);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns');
        if (!response.ok) throw new Error('Request failed');
        const data = (await response.json()) as CampaignCardData[];
        setCampaigns(data);
      } catch (error) {
        console.error('Failed to load campaigns from database', error);
        setCampaigns([]);
      }
    };

    loadCampaigns();
  }, []);

  const triggerCounterPopover = (label: string, count: number) => {
    setPopover({
      show: true,
      label,
      count,
    });
    const timer = setTimeout(() => {
      setPopover(null);
    }, 2500);
    return () => clearTimeout(timer);
  };

  const handleSearchTrigger = () => {
    setSearchTerm(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchTrigger();
    }
  };

  const handleJoinCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hasJoined: true } : c))
    );
    recordOfficeEvent({ type: 'campaign', title: 'Campaign joined', description: 'You joined a campaign.', status: 'active' });
  };

  const handleExitCampaign = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, hasJoined: false } : c))
    );
    recordOfficeEvent({ type: 'campaign', title: 'Campaign left', description: 'You left a campaign.', status: 'updated' });
  };

  const handleCreateCampaign = () => {
    const newCampaign: CampaignCardData = {
      id: String(campaigns.length + 1),
      publisherProfileIcon: '/path/to/new_publisher.jpg',
      projectName: 'New Test Campaign',
      publisherUsername: 'testpublisher',
      publisherRating: 4.0,
      timeRemainingDays: 14,
      nicheHashtag: 'test, new, demo',
      description: 'This is a newly created test campaign.',
      category: 'Technology',
      status: 'Active',
      communitySize: 10000,
      viewsGenerated: 50000,
      likesGenerated: 2000,
      totalBudget: 1000,
      budgetUsed: 0,
      highestMcp: 100,
      hasJoined: false,
    };
    setCampaigns((prev) => [...prev, newCampaign]);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.publisherUsername.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          campaign.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || campaign.status.toLowerCase() === filters.status.toLowerCase();
    const matchesCategory = filters.category === 'all' || campaign.category.toLowerCase() === filters.category.toLowerCase();
    const matchesNiche = filters.niche === 'all' || campaign.nicheHashtag.toLowerCase().includes(filters.niche.toLowerCase());

    return matchesSearch && matchesStatus && matchesCategory && matchesNiche;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return parseInt(b.id) - parseInt(a.id);
      case 'highest_budget':
        return b.totalBudget - a.totalBudget;
      case 'highest_available_budget':
        return (b.totalBudget - b.budgetUsed) - (a.totalBudget - a.budgetUsed);
      case 'highest_mcp':
        return b.highestMcp - a.highestMcp;
      case 'most_paid_out':
        return b.budgetUsed - a.budgetUsed;
      case 'most_creators':
        return b.communitySize - a.communitySize;
      case 'less_influencer':
        return a.communitySize - b.communitySize;
      default:
        return 0;
    }
  });

  const getAlternatives = (query: string): CampaignCardData[] => {
    if (!query) return [];
    const scored = campaigns.map((c) => {
      let score = 0;
      const q = query.toLowerCase();
      const username = c.publisherUsername.toLowerCase();
      const project = c.projectName.toLowerCase();
      const niche = c.nicheHashtag.toLowerCase();
      const category = c.category.toLowerCase();

      if (username.includes(q)) score += 10;
      if (project.includes(q)) score += 8;
      if (category.includes(q)) score += 5;
      if (niche.includes(q)) score += 4;

      const words = q.split(/[\s,]+/).filter(Boolean);
      words.forEach((word) => {
        if (username.includes(word)) score += 3;
        if (project.includes(word)) score += 2;
        if (niche.includes(word)) score += 1;
      });

      return { campaign: c, score };
    });

    scored.sort((a, b) => b.score - a.score);

    let filtered = scored.filter((item) => item.score > 0).map((item) => item.campaign);
    if (filtered.length === 0) {
      filtered = campaigns;
    }
    return filtered.slice(0, 3);
  };

  const alternatives = filteredCampaigns.length === 0 ? getAlternatives(searchTerm) : [];

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Campaigns</h1>

      {/* Mobile Filter & Search Container with Glass Background */}
      <div className="md:hidden sticky top-4 z-20 backdrop-blur-md bg-zinc-950/75 border border-zinc-800/60 rounded-2xl p-4 shadow-xl mb-6 flex flex-col gap-3 relative">
        {/* Floating popover for filter counter */}
        {popover?.show && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-2xl flex items-center gap-1.5 animate-bounce z-50 whitespace-nowrap backdrop-blur-md">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
            <span>{popover.label}: <strong>{popover.count}</strong> campaigns</span>
          </div>
        )}

        {/* Grouped dropdowns side by side */}
        <div className="flex gap-2">
          {/* Group 1: Sort & Status */}
          <div className="relative flex-1">
            <button
              onClick={() => setMobileMenuOpen(mobileMenuOpen === 'sort_status' ? null : 'sort_status')}
              className="w-full text-left px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs font-black truncate text-zinc-300 flex items-center justify-between cursor-pointer"
            >
              <span>Sort & Status</span>
              <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-amber-400 uppercase tracking-tight">
                {filters.status === 'all' ? 'All' : filters.status}
              </span>
            </button>

            {mobileMenuOpen === 'sort_status' && (
              <div className="absolute left-0 right-0 mt-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-30 flex flex-col gap-3 backdrop-blur-xl">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Sort By</label>
                  <select
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-amber-500 text-white cursor-pointer"
                    onChange={(e) => {
                      setFilters({ ...filters, sortBy: e.target.value });
                      const sortLabel = e.target.options[e.target.selectedIndex].text;
                      triggerCounterPopover(sortLabel, filteredCampaigns.length);
                      setMobileMenuOpen(null);
                    }}
                    value={filters.sortBy}
                  >
                    <option value="newest">Newest</option>
                    <option value="highest_budget">Highest Budget</option>
                    <option value="highest_available_budget">Highest Available Budget</option>
                    <option value="highest_mcp">Highest MCP</option>
                    <option value="most_paid_out">Most Paid Out</option>
                    <option value="most_creators">Most Creators</option>
                    <option value="less_influencer">Less Influencer</option>
                  </select>
                </div>
                
                <div className="h-px bg-zinc-800/60" />

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-amber-500 text-white cursor-pointer"
                    onChange={(e) => {
                      setFilters({ ...filters, status: e.target.value });
                      const count = campaigns.filter(c => e.target.value === 'all' || c.status.toLowerCase() === e.target.value.toLowerCase()).length;
                      const statusLabel = e.target.options[e.target.selectedIndex].text;
                      triggerCounterPopover(statusLabel, count);
                      setMobileMenuOpen(null);
                    }}
                    value={filters.status}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Group 2: Category & Niche */}
          <div className="relative flex-1">
            <button
              onClick={() => setMobileMenuOpen(mobileMenuOpen === 'cat_niche' ? null : 'cat_niche')}
              className="w-full text-left px-3 py-2 bg-zinc-900/80 border border-zinc-800 rounded-lg text-xs font-black truncate text-zinc-300 flex items-center justify-between cursor-pointer"
            >
              <span>Category & Niche</span>
              <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-amber-400 uppercase tracking-tight">
                {filters.category === 'all' ? 'All' : filters.category}
              </span>
            </button>

            {mobileMenuOpen === 'cat_niche' && (
              <div className="absolute left-0 right-0 mt-2 p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-30 flex flex-col gap-3 backdrop-blur-xl">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Category</label>
                  <select
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-amber-500 text-white cursor-pointer"
                    onChange={(e) => {
                      setFilters({ ...filters, category: e.target.value });
                      const count = campaigns.filter(c => e.target.value === 'all' || c.category.toLowerCase() === e.target.value.toLowerCase()).length;
                      const catLabel = e.target.options[e.target.selectedIndex].text;
                      triggerCounterPopover(catLabel, count);
                      setMobileMenuOpen(null);
                    }}
                    value={filters.category}
                  >
                    <option value="all">All Categories</option>
                    <option value="lifestyle">Lifestyle</option>
                    <option value="gaming">Gaming</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="sports">Sports</option>
                    <option value="education">Education</option>
                    <option value="technology">Technology</option>
                    <option value="luxury">Luxury</option>
                    <option value="music">Music</option>
                  </select>
                </div>

                <div className="h-px bg-zinc-800/60" />

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Niche</label>
                  <select
                    className="w-full px-2.5 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-xs focus:outline-none focus:border-amber-500 text-white cursor-pointer"
                    onChange={(e) => {
                      setFilters({ ...filters, niche: e.target.value });
                      const count = campaigns.filter(c => e.target.value === 'all' || c.nicheHashtag.toLowerCase().includes(e.target.value.toLowerCase())).length;
                      const nicheLabel = e.target.options[e.target.selectedIndex].text;
                      triggerCounterPopover(nicheLabel, count);
                      setMobileMenuOpen(null);
                    }}
                    value={filters.niche}
                  >
                    <option value="all">All Niches</option>
                    <option value="duet">#duet</option>
                    <option value="sound">#sound</option>
                    <option value="ugc">#ugc</option>
                    <option value="logo">#logo</option>
                    <option value="clipping">#clipping</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search bar */}
        <div className="flex gap-2 w-full">
          <input
            type="text"
            placeholder="Search by creator or project..."
            className="flex-1 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-amber-500 text-xs text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSearchTrigger}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-[10px] tracking-wider rounded-lg transition-all shrink-0 cursor-pointer"
          >
            Search
          </button>
        </div>
      </div>

      {/* Desktop Filter & Search Container */}
      <div className="hidden md:flex flex-wrap items-center gap-4 mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by creator or project..."
            className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-amber-500 text-sm text-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSearchTrigger}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-black uppercase text-xs tracking-wider rounded-lg transition-all cursor-pointer"
          >
            Search
          </button>
        </div>

        <select
          className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-amber-500 text-white cursor-pointer"
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          value={filters.sortBy}
        >
          <option value="newest">Newest</option>
          <option value="highest_budget">Highest Budget</option>
          <option value="highest_available_budget">Highest Available Budget</option>
          <option value="highest_mcp">Highest MCP</option>
          <option value="most_paid_out">Most Paid Out</option>
          <option value="most_creators">Most Creators</option>
          <option value="less_influencer">Less Influencer</option>
        </select>

        <select
          className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-amber-500 text-white cursor-pointer"
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          value={filters.status}
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
        </select>

        <select
          className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-amber-500 text-white cursor-pointer"
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          value={filters.category}
        >
          <option value="all">All Categories</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="gaming">Gaming</option>
          <option value="entertainment">Entertainment</option>
          <option value="sports">Sports</option>
          <option value="education">Education</option>
          <option value="technology">Technology</option>
          <option value="luxury">Luxury</option>
          <option value="music">Music</option>
        </select>

        <select
          className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-amber-500 text-white cursor-pointer"
          onChange={(e) => setFilters({ ...filters, niche: e.target.value })}
          value={filters.niche}
        >
          <option value="all">All Niches</option>
          <option value="duet">#duet</option>
          <option value="sound">#sound</option>
          <option value="ugc">#ugc</option>
          <option value="logo">#logo</option>
          <option value="clipping">#clipping</option>
        </select>

        <button
          onClick={handleCreateCampaign}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ml-auto"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCampaigns.length > 0 ? (
          filteredCampaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              data={campaign}
              onJoinCampaign={handleJoinCampaign}
              onExitCampaign={handleExitCampaign}
            />
          ))
        ) : (
          <div className="col-span-full py-16 text-center bg-zinc-900/30 rounded-3xl border border-zinc-850 p-8 backdrop-blur-sm">
            <p className="text-zinc-400 mb-8 text-base">No campaigns match your search for "{searchTerm}".</p>
            
            {alternatives.length > 0 && (
              <div>
                <h3 className="text-xs font-black text-amber-500 mb-6 uppercase tracking-widest">Suggested Alternatives</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center max-w-6xl mx-auto text-left">
                  {alternatives.map((campaign) => (
                    <CampaignCard
                      key={campaign.id}
                      data={campaign}
                      onJoinCampaign={handleJoinCampaign}
                      onExitCampaign={handleExitCampaign}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
