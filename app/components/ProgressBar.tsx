// 性能优化: 将子组件提取到外部，避免每次父组件渲染时重新创建
import { memo } from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  variant: 'success' | 'warning' | 'danger';
  showLabel?: boolean;
}

function ProgressBarComponent({ value, variant, showLabel = false }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  
  const gradientClass = variant === 'success'
    ? 'from-emerald-500 to-emerald-400'
    : variant === 'warning'
      ? 'from-amber-500 to-amber-400'
      : 'from-red-500 to-red-400';

  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground">
          {Math.round(clamped)}%
        </span>
      )}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
            gradientClass
          )}
          style={{ width: `${clamped}%` }}
        />
        <div 
          className="absolute inset-y-0 left-0 rounded-full opacity-30"
          style={{ 
            width: `${clamped}%`,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            animation: 'shimmer 2s infinite'
          }}
        />
      </div>
    </div>
  );
}

export const ProgressBar = memo(ProgressBarComponent);
