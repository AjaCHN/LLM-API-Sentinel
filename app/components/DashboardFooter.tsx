'use client';

import { Zap, ShieldCheck, Settings } from 'lucide-react';

import { Separator } from '@/components/ui/separator';

export default function DashboardFooter() {
  return (
    <footer className="flex flex-col gap-6 pt-8">
      <Separator />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Zap className="size-4 text-primary" />
            <span>Global Coverage</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Monitoring major AI providers in the US and China.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings className="size-4 text-primary" />
            <span>UI</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, Tailwind CSS, shadcn/ui, and Recharts.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-primary" />
            <span>Data Integrity</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Historical data persisted via Supabase PostgreSQL.
          </p>
        </div>
      </div>
    </footer>
  );
}
