// app/components/ControlBar.tsx v4.0.1
'use client';

import { Globe } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { cn } from '../lib/utils';

interface ControlBarProps {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  regions: any[];
  lastUpdate: Date | null;
  runCheck: () => void;
  isChecking: boolean;
  user: any;
}

export default function ControlBar({
  selectedRegion,
  setSelectedRegion,
  regions,
  lastUpdate,
  runCheck,
  isChecking,
  user
}: ControlBarProps) {
  const t = useTranslations();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card border border-border p-4 rounded-lg">
      <div className="flex items-center gap-2">
        <Globe className="w-4 h-4 opacity-50" />
        <span className="text-xs font-mono uppercase opacity-50 tracking-widest">Region:</span>
        <div className="flex bg-background border border-border rounded-md p-0.5 ml-2">
          {regions.map(region => (
            <button
              key={region.id}
              onClick={() => setSelectedRegion(region.id)}
              className={cn(
                "px-3 py-1 text-[10px] uppercase tracking-wider rounded-sm transition-colors",
                selectedRegion === region.id ? "bg-foreground text-background font-bold" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {region.name}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        {lastUpdate && (
          <span className="text-[10px] font-mono opacity-50">
            {t('status.sync')}: {format(lastUpdate, 'HH:mm:ss')}
          </span>
        )}
        <button 
          onClick={runCheck}
          disabled={isChecking || !user}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 border border-border text-[10px] font-bold uppercase tracking-widest transition-all rounded-md",
            isChecking ? "opacity-50 cursor-not-allowed" : "hover:bg-foreground hover:text-background",
            !user && "opacity-30 cursor-not-allowed"
          )}
        >
          {isChecking ? t('status.checking') : t('status.trigger')}
        </button>
      </div>
    </div>
  );
}
