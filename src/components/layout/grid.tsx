import React from 'react';

interface GridProps {
  children: React.ReactNode;
  className?: string;
}

export default function Grid({ children, className = "" }: GridProps) {
  return (
    /* DYNAMIC RESPONSIVE MULTI-COLUMN ENGINE:
      - grid-cols-1: Single column on compact phone screens.
      - sm:grid-cols-2: 2 columns on standard size smartphones & small portrait tablets.
      - md:grid-cols-3: 🚀 Triggers early 3-column split for tri-folds, mini-PCs, & widescreen tablets (≥768px).
      - xl:grid-cols-3: Retains clean 3-column layout balance up to full desktop views.
      - auto-rows-fr: Forces uniform row heights so cards align symmetrically across columns.
    */
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full auto-rows-fr max-w-sm sm:max-w-none mx-auto ${className}`}>
      {children}
    </div>
  );
}