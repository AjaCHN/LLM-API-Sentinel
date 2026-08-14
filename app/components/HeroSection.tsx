// app/components/HeroSection.tsx v2.8.2

import { Zap, AlertTriangle, Database, Globe } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { Badge } from '@/components/ui/badge';
import type { DashboardStats } from '@/hooks/useDashboardStats';
import { useI18n } from '@/hooks/useI18n';

interface HeroSectionProps {
  stats: DashboardStats;
}

/** 仪表盘首屏：标题、描述与实时统计卡片 */
export function HeroSection({ stats }: HeroSectionProps) {
  const { t } = useI18n();

  return (
    <section id="hero" className="relative py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center">
        <Badge
          variant="secondary"
          className="mb-6 px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/20"
        >
          <Globe className="mr-2 size-4" aria-hidden="true" />
          {t('dashboard.globalAIApiMonitoring')}
        </Badge>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t('dashboard.title')}
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-12">
          {t('dashboard.description')}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <StatCard
            icon={<Zap className="size-4 text-emerald-400" aria-hidden="true" />}
            label={t('api.online')}
            value={stats.online}
            iconBgColor="bg-emerald-500/10"
            iconTextColor="text-emerald-400"
            valueColor="text-emerald-400"
            hoverBorderColor="hover:border-primary/30"
            hoverShadowColor="hover:shadow-lg hover:shadow-primary/5"
          />

          <StatCard
            icon={<AlertTriangle className="size-4 text-amber-400" aria-hidden="true" />}
            label={t('api.degraded')}
            value={stats.degraded}
            iconBgColor="bg-amber-500/10"
            iconTextColor="text-amber-400"
            valueColor="text-amber-400"
            hoverBorderColor="hover:border-amber-500/30"
            hoverShadowColor="hover:shadow-lg hover:shadow-amber-500/5"
          />

          <StatCard
            icon={<Database className="size-4 text-destructive" aria-hidden="true" />}
            label={t('api.offline')}
            value={stats.offline}
            iconBgColor="bg-destructive/10"
            iconTextColor="text-destructive"
            valueColor="text-destructive"
            hoverBorderColor="hover:border-destructive/30"
            hoverShadowColor="hover:shadow-lg hover:shadow-destructive/5"
          />

          <StatCard
            icon={<Zap className="size-4 text-primary" aria-hidden="true" />}
            label={t('api.averageLatency')}
            value={`${stats.avgLatency}ms`}
            iconBgColor="bg-primary/10"
            iconTextColor="text-primary"
            valueColor="text-primary"
            hoverBorderColor="hover:border-primary/30"
            hoverShadowColor="hover:shadow-lg hover:shadow-primary/5"
          />
        </div>
      </div>
    </section>
  );
}
