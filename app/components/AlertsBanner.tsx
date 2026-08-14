// app/components/AlertsBanner.tsx v2.8.2

import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type { Alert as AlertType } from '@/types';
import type { DashboardStats } from '@/hooks/useDashboardStats';
import { useI18n } from '@/hooks/useI18n';

interface AlertsBannerProps {
  alerts: AlertType[];
  stats: DashboardStats;
  onViewDetails: () => void;
}

/** 存在活跃告警时展示的横幅 */
export function AlertsBanner({ alerts, stats, onViewDetails }: AlertsBannerProps) {
  const { t } = useI18n();

  if (alerts.length === 0) return null;

  return (
    <section id="alerts-banner" className="-mt-4 mb-8">
      <Alert className="border-destructive/30 bg-destructive/5 backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <AlertTitle className="text-base font-semibold">
              {t('alerts.alertsLabel')}: {alerts.length} {alerts.length > 1 ? t('alerts.activeIssuesPlural') : t('alerts.activeIssues')} {t('alerts.detected')}
            </AlertTitle>
            <AlertDescription className="mt-1 text-sm">
              {stats.offline} {t('alerts.offline')} · {stats.degraded} {t('alerts.highLatency')}
            </AlertDescription>
          </div>
          <Button
            variant="destructive"
            onClick={onViewDetails}
            className="whitespace-nowrap shadow-lg shadow-destructive/20"
          >
            {t('alerts.viewDetails')}
          </Button>
        </div>
      </Alert>
    </section>
  );
}
