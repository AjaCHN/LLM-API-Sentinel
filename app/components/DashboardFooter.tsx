// app/components/DashboardFooter.tsx v3.4.7
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
          Monitoring major AI providers across US and China. We track reachability and latency for OpenAI, Anthropic, Google, Moonshot, Zhipu, and more.
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">Adaptive UI</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          Optimized for all devices. Features dark/light mode switching and high-readability typography for technical monitoring environments.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">Data Integrity</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          Historical data is persisted via Firebase. Manual triggers require authentication to prevent API abuse while maintaining public transparency.
        </p>
      </div>
    </footer>
  );
}
