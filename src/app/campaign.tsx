import React, { useState } from 'react';
import CampaignCard from '@/components/campaign-card';
import type { CampaignCardData } from '@/types/campaign-card';
import { Plus, Search, SlidersHorizontal } from 'lucide-react';

// Mock data for demonstration
const initialCampaigns: CampaignCardData[] = [
  {
    id: '1',
    publisherProfileIcon: '/path/to/publisher1.jpg',
    projectName: 'Summer Fashion Campaign',
    publisherUsername: 'fashionista',
    publisherRating: 4.8,
    timeRemainingDays: 10,
    nicheHashtag: 'fashion, summer, style',
    description: 'Looking for influencers to promote our new summer collection. Must have a strong engagement in fashion.',
    category: 'Lifestyle',
    status: 'Active',
    communitySize: 150000,
    viewsGenerated: 1200000,
    likesGenerated: 80000,
    totalBudget: 5000,
    budgetUsed: 1500,
    highestMcp: 250,
    hasJoined: false,
  },
  {
    id: '2',
    publisherProfileIcon: '/path/to/publisher2.jpg',
    projectName: 'Gaming Gear Launch',
    publisherUsername: 'gamepro',
    publisherRating: 4.5,
    timeRemainingDays: 5,
    nicheHashtag: 'gaming, tech, review',
    description: 'Seeking gamers to review our new line of gaming peripherals. High reach on Twitch/YouTube preferred.',
    category: 'Gaming',
    status: 'Active',
    communitySize: 300000,
    viewsGenerated: 3500000,
    likesGenerated: 150000,
    totalBudget: 10000,
    budgetUsed: 8000,
    highestMcp: 500,
    hasJoined: true,
  },
];

export default function CampaignMobilePage() {
  const [campaigns, setCampaigns] = useState<CampaignCardData[]>(initialCampaigns);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'newest',
    status: 'all',
    category: 'all',
    niche: 'all',
  });

  const handleJoinCampaign = (id: string) => {
    console.log(`Joined campaign: ${id}`);
    // Here you would typically make an API call to join the campaign
  };

  const handleExitCampaign = (id: string) => {
    console.log(`Exited campaign: ${id}`);
    // Here you would typically make an API call to exit the campaign
  };

  const handleCreateCampaign = () => {
    console.log('Open form to create new campaign');
    const newCampaign: CampaignCardData = {
      id: String(campaigns.length + 1),
      publisherProfileIcon: '/path/to/new_publisher.jpg',
      projectName: 'New Mobile Campaign',
      publisherUsername: 'mobilepublisher',
      publisherRating: 3.5,
      timeRemainingDays: 7,
      nicheHashtag: 'mobile, app, review',
      description: 'Promoting a new mobile application. Looking for short-form video creators.',
      category: 'Technology',
      status: 'Active',
      communitySize: 50000,
      viewsGenerated: 100000,
      likesGenerated: 5000,
      totalBudget: 2000,
      budgetUsed: 100,
      highestMcp: 80,
      hasJoined: false,
    };
    setCampaigns((prev) => [...prev, newCampaign]);
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.publisherUsername.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filters.status === 'all' || campaign.status.toLowerCase() === filters.status;
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

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <button
          onClick={handleCreateCampaign}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search creator..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-amber-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="p-2 bg-zinc-800 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors"
        >
          <SlidersHorizontal className="w-5 h-5 text-zinc-300" />
        </button>
      </div>

      {filtersOpen && (
        <div className="flex flex-col gap-4 mb-6 animate-in slide-in-from-top-4 duration-200">
          <select
            className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-amber-500 text-sm"
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
            className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-amber-500 text-sm"
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            value={filters.status}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
          </select>

          <select
            className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-amber-500 text-sm"
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
            className="px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-amber-500 text-sm"
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
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {filteredCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            data={campaign}
            onJoinCampaign={handleJoinCampaign}
            onExitCampaign={handleExitCampaign}
          />
        ))}
      </div>
    </div>
  );
}
