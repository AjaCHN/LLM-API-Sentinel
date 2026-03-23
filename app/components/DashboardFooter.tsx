// app/components/DashboardFooter.tsx v3.4.7
'use client';

import { useTranslations } from 'next-intl';
import { Zap, Settings, ShieldCheck } from 'lucide-react';

export default function DashboardFooter() {
  const t = useTranslations('footer');
  return (
    <footer id="main-footer" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-8 border-t border-border/10">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">{t('coverage')}</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          {t('coverageDesc')}
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">{t('ui')}</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          {t('uiDesc')}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">{t('integrity')}</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          {t('integrityDesc')}
        </p>
      </div>
    </footer>
  );
}
