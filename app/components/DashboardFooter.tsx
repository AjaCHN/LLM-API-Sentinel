// app/components/DashboardFooter.tsx v2.7.0
'use client';

import { Zap, ShieldCheck, Settings } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

import { Separator } from '@/components/ui/separator';

export default function DashboardFooter() {
  const { t } = useI18n();

  return (
    <footer className="flex flex-col gap-6 pt-8">
      <Separator />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Zap className="size-4 text-primary" aria-hidden="true" />
            <span>{t('footer.globalCoverage')}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('footer.globalCoverageDesc')}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Settings className="size-4 text-primary" aria-hidden="true" />
            <span>{t('footer.ui')}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('footer.uiDesc')}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            <span>{t('footer.dataIntegrity')}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {t('footer.dataIntegrityDesc')}
          </p>
        </div>
      </div>
    </footer>
  );
}
