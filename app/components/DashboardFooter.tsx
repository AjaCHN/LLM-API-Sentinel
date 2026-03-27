// app/components/DashboardFooter.tsx v2.3.0
'use client';

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
          Real-time monitoring of LLM APIs across multiple regions worldwide.
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">Modern UI</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          Responsive design with dark mode support and smooth animations.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">Data Integrity</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          Secure data collection and storage with Firebase integration.
        </p>
      </div>
    </footer>
  );
}
