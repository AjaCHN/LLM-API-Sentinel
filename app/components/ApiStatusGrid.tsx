// app/components/ApiStatusGrid.tsx v2.6.0
'use client';

import React, { useMemo } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, BarChart3, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { LATENCY_THRESHOLD } from '../constants';
import { ApiStatus } from '../types';
import { useI18n } from '../hooks/useI18n';

// US providers list for grouping
const US_PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral'];
const CHINA_PROVIDERS = ['Moonshot', 'ZhipuAI', 'Baichuan', 'Alibaba', 'Tencent', 'Baidu', 'DeepSeek'];

export default function ApiStatusGrid({ statuses }: { statuses: ApiStatus[] }) {
  const { t } = useI18n();
  
  const { usApis, chinaApis } = useMemo(() => {
    const us: ApiStatus[] = [];
    const china: ApiStatus[] = [];
    
    statuses.forEach(api => {
      if (US_PROVIDERS.includes(api.provider)) {
        us.push(api);
      } else if (CHINA_PROVIDERS.includes(api.provider)) {
        china.push(api);
      } else {
        // Default to US if not in either list
        us.push(api);
      }
    });
    
    return { usApis: us, chinaApis: china };
  }, [statuses]);

  const getProgressBarColor = (latency: number, status: string) => {
    if (status === 'offline') return 'bg-red-500';
    if (status === 'degraded') return 'bg-amber-500';
    if (latency > LATENCY_THRESHOLD) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const renderApiCards = (apis: ApiStatus[], startIndex: number) => {
    return apis.map((api, idx) => {
      const animationDelay = `${(startIndex + idx) * 0.1}s`;
      return (
        <div 
          key={api.id} 
          id={`api-card-${api.id}`} 
          className="group bg-card border border-border/20 hover:border-border/50 transition-all duration-200 shadow-sm hover:shadow-md rounded-lg p-4 animate-fade-in"
          style={{ animationDelay }}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">{api.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{api.provider}</p>
            </div>
            <span 
              className={cn(
                'flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium',
                api.status === 'online' 
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : api.status === 'degraded'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
              )}
            >
              {api.status === 'online' ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{t('api.online')}</span>
                </>
              ) : api.status === 'degraded' ? (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  <span>{t('api.degraded')}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3" />
                  <span>{t('api.offline')}</span>
                </>
              )}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{t('api.latency')}</span>
                <span className={cn(
                  'font-medium',
                  api.latency >= LATENCY_THRESHOLD && api.status !== 'offline' ? 'text-amber-500' : 'text-foreground'
                )}>
                  {api.status === 'offline' ? t('api.timeout') : `${api.latency}ms`}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    getProgressBarColor(api.latency, api.status)
                  )}
                  style={{ 
                    width: api.status === 'offline' ? '100%' : `${Math.min((api.latency / LATENCY_THRESHOLD) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>

            {api.errorRate !== undefined && (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{t('api.errorRate')}</span>
                  <span className="font-medium text-foreground">{api.errorRate}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${api.errorRate}%` }}
                  />
                </div>
              </div>
            )}

            {api.availability !== undefined && (
              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{t('api.availability')}</span>
                  <span className="font-medium text-foreground">{api.availability}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${api.availability}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/20 pt-3 mt-4">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{t('api.lastChecked')}: {new Date(api.lastChecked).toLocaleTimeString()}</span>
            </div>
            {api.retries && api.retries > 0 && (
              <div className={cn(
                'flex items-center gap-1',
                api.status === 'offline' ? 'text-red-500' : 'text-amber-500'
              )}>
                <AlertTriangle className="h-3 w-3" />
                <span>{api.retries} {t('api.retries')}</span>
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  const hasApis = usApis.length > 0 || chinaApis.length > 0;

  return (
    <div id="api-cards-container" className="space-y-6">
      {hasApis ? (
        <>
          {usApis.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">US Providers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {renderApiCards(usApis, 0)}
              </div>
            </div>
          )}
          
          {chinaApis.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">China Providers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {renderApiCards(chinaApis, usApis.length)}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full border border-dashed border-border/30 p-8 md:p-16 text-center rounded-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">{t('api.noApiConfigured')}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('api.addApiHint')}
          </p>
        </div>
      )}
    </div>
  );
}