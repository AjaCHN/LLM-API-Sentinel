// app/components/StatCard.tsx v2.7.0
'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBgColor: string;
  iconTextColor: string;
  valueColor: string;
  hoverBorderColor: string;
  hoverShadowColor: string;
}

export function StatCard({
  icon,
  label,
  value,
  iconBgColor,
  iconTextColor,
  valueColor,
  hoverBorderColor,
  hoverShadowColor
}: StatCardProps) {
  return (
    <div 
      className={cn(
        'group relative rounded-xl bg-card/50 backdrop-blur-sm border border-border/30 p-4 transition-shadow duration-300',
        hoverBorderColor,
        hoverShadowColor
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconBgColor)}>
          {icon}
        </div>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={cn('text-2xl font-bold group-hover:scale-110 transition-transform', valueColor)}>
        {value}
      </p>
    </div>
  );
}