// app/components/api-config-list.tsx v2.9.0
'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ValidatedApiConfigItem } from './api-config-validation';

interface ApiConfigListProps {
  config: ValidatedApiConfigItem[];
  isEditing: boolean;
  onRemove: (id: string) => void;
}

/** 已配置 API 列表（只读/可删除态） */
export function ApiConfigList({ config, isEditing, onRemove }: ApiConfigListProps) {
  return (
    <>
      {config.map((api) => (
        <div
          key={api.id}
          className={cn(
            'flex items-center justify-between gap-4 rounded-lg border p-3',
            !api.isValid && 'border-destructive/50 bg-destructive/5'
          )}
        >
          <div className="min-w-0">
            {/* 使用 textContent 安全渲染，防止 XSS */}
            <p className="truncate text-sm font-medium">{api.name}</p>
            <p className="truncate text-xs text-muted-foreground">{api.provider}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{api.url}</p>
          </div>
          {isEditing && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onRemove(api.id)}
              aria-label="remove api"
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          )}
        </div>
      ))}

    </>
  );
}
