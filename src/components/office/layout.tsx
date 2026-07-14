// src/app/office/layout.tsx
export default function OfficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* FIXED SIDE MENU */}
      <aside className="w-64 border-r border-zinc-800 hidden md:block shrink-0">
        <nav className="p-4">
          {/* Your menu links here */}
        </nav>
      </aside>
      
      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}