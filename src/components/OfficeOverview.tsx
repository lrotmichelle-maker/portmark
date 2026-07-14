import React from 'react';

export default function OfficeOverview() {
  return (
    <div className="w-full p-6 text-zinc-100">
      <h1 className="text-2xl font-bold mb-6">Office Overview</h1>
      
      {/* This is where your widgets will eventually live */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-400">Active Campaigns</h2>
          <p className="text-2xl font-bold mt-2">0</p>
        </div>
        
        <div className="p-4 border border-zinc-800 rounded-xl bg-zinc-950">
          <h2 className="text-sm font-semibold text-zinc-400">Marketplace Sales</h2>
          <p className="text-2xl font-bold mt-2">$0.00</p>
        </div>
      </div>
    </div>
  );
}