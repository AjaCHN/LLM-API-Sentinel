// app/components/DashboardFooter.tsx v2.4.3
'use client';

import React from 'react';
import { Zap, Settings, ShieldCheck } from 'lucide-react';

export default function DashboardFooter() {
  return (
    <footer id="main-footer" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-8 border-t border-border/10">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">Global Coverage</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          Monitoring major AI providers in the US and China.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">UI</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          Built with Next.js, Tailwind CSS, and Recharts.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">Data Integrity</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          Historical data persisted via Firebase.
        </p>
      </div>
    </footer>
  );
}