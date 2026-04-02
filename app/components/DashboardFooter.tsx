// app/components/DashboardFooter.tsx v2.4.0
'use client';

import { Zap, Settings, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function DashboardFooter() {
  const t = useTranslations();
  
  return (
    <footer id="main-footer" className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pt-8 border-t border-border/10">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">{t('footer.coverage.title')}</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          {t('footer.coverage.desc')}
        </p>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">{t('footer.ui.title')}</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          {t('footer.ui.desc')}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h4 className="text-[10px] font-bold uppercase tracking-widest">{t('footer.integrity.title')}</h4>
        </div>
        <p className="text-[11px] leading-relaxed opacity-60">
          {t('footer.integrity.desc')}
        </p>
      </div>
    </footer>
  );
}
