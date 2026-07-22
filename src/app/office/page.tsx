'use client';

import OfficeSidebar from '@/components/office/OfficeSidebar';
import OfficeOverview from '@/components/office/OfficeOverview';

export default function OfficePage() {
  return (
    <main className="min-h-screen w-full bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.12),transparent_35%),linear-gradient(135deg,_#09090b,_#111827)] text-zinc-100">
      <div className="flex min-h-screen w-full flex-col xl:flex-row">
        <OfficeSidebar />
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <OfficeOverview />
        </div>
      </div>
    </main>
  );
}
