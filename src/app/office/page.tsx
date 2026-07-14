'use client';

import OfficeSidebar from '@/components/office/OfficeSidebar';
import OfficeOverview from '@/components/office/OfficeOverview';

export default function OfficePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,_#09090b,_#111827)] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 xl:flex-row">
        <OfficeSidebar />
        <div className="flex-1">
          <OfficeOverview />
        </div>
      </div>
    </main>
  );
}
