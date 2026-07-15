// app/components/AlertsDropdown.tsx v2.7.0
'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Alert } from '@/types';
import { useI18n } from '@/hooks/useI18n';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface AlertsDropdownProps {
  alerts: Alert[];
  show: boolean;
  onClose: () => void;
  resolveAlert: (id: string) => void;
}

function severityTone(severity: Alert['severity']): string {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'text-destructive';
    case 'medium':
      return 'text-amber-500';
    default:
      return 'text-blue-400';
  }
}

export default function AlertsDropdown({
  alerts,
  show,
  onClose,
  resolveAlert,
}: AlertsDropdownProps) {
  const { t } = useI18n();

  return (
    <Dialog open={show} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('alerts.activeAlerts')}</DialogTitle>
          <DialogDescription>
            {alerts.length === 0
              ? t('alerts.noActiveAlerts')
              : `${alerts.length} ${t('alerts.activeIssues')}`}
          </DialogDescription>
        </DialogHeader>

        {alerts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <CheckCircle2 className="size-8 text-emerald-500" />
            <p className="text-sm text-muted-foreground">{t('alerts.noActiveAlerts')}</p>
          </div>
        ) : (
          <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto">
            {alerts.map((alert) => (
              <Card key={alert.id} className="transition-colors hover:bg-muted/40">
                <CardContent className="flex items-start justify-between gap-4 p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className={`mt-0.5 size-5 ${severityTone(alert.severity)}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{alert.apiName}</p>
                      {alert.message && (
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                      )}
                      {alert.error && (
                        <p className="mt-1 text-xs text-destructive">
                          {t('alerts.error')}: {alert.error}
                        </p>
                      )}
                      {alert.latency && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t('alerts.latency')}: {alert.latency}ms
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    {t('alerts.resolve')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
