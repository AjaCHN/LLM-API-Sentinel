// app/components/AlertBanner.tsx v4.0.1
'use client';

import { AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AlertBannerProps {
  alerts: any[];
  onViewDetails: () => void;
}

export default function AlertBanner({ alerts, onViewDetails }: AlertBannerProps) {
  const t = useTranslations();
  
  if (alerts.length === 0) return null;

  return (
    <div id="alerts-banner" className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-500" />
        <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">
          {t('alerts.title')}: {alerts.length} active issue{alerts.length > 1 ? 's' : ''} detected
        </p>
      </div>
      <button 
        onClick={onViewDetails} 
        className="text-[10px] font-bold uppercase underline text-rose-500 hover:text-rose-600 transition-colors"
      >
        {t('alerts.viewDetails')}
      </button>
    </div>
  );
}
