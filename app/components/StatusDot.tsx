// app/components/StatusDot.tsx v2.6.3
// 性能优化: 将子组件提取到外部，避免每次父组件渲染时重新创建
import { memo } from 'react';
import { cn, getStatusPulseColor } from '@/lib/utils';
import type { ApiStatus } from '@/types';

interface StatusDotProps {
  status: ApiStatus['status'];
}

function StatusDotComponent({ status }: StatusDotProps) {
  const pulseColor = getStatusPulseColor(status);

  return (
    <span
      className={cn(
        'relative flex size-2.5 rounded-full',
        status === 'online' && 'bg-emerald-500',
        status === 'degraded' && 'bg-amber-500',
        status === 'offline' && 'bg-destructive',
        pulseColor,
        status !== 'online' && 'animate-pulse'
      )}
    />
  );
}

export const StatusDot = memo(StatusDotComponent);
