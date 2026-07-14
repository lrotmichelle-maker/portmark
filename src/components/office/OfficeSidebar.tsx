'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OfficeSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Overview', href: '/office' },
    { label: 'Campaign', href: '/office/campaign' },
    { label: 'Discover', href: '/office/discover' },
    { label: 'Market', href: '/office/market' },
    { label: 'CV', href: '/office/cv' },
  ];

  return (
    <aside className="w-48 bg-black border-r border-neutral-800 h-screen sticky top-0">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-neutral-800'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
