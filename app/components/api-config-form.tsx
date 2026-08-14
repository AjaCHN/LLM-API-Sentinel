// app/components/api-config-form.tsx v2.9.0
'use client';

import { Plus, Server } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { ApiConfigItem } from './api-config-validation';

interface ApiConfigFormProps {
  newApi: Omit<ApiConfigItem, 'id'>;
  onChange: (api: Omit<ApiConfigItem, 'id'>) => void;
  onAdd: () => void;
}

/** 新增 API 表单（名称/提供方/URL） */
export function ApiConfigForm({ newApi, onChange, onAdd }: ApiConfigFormProps) {
  const { t } = useI18n();

  return (
    <div className="mt-2 rounded-lg border-2 border-dashed p-4">
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="secondary" className="gap-1.5">
          <Server className="size-3" />
          {t('config.addApi')}
        </Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-api-name">{t('config.name')}</Label>
        <Input
          id="new-api-name"
          value={newApi.name}
          onChange={(e) => onChange({ ...newApi, name: e.target.value })}
          placeholder="GPT-4o"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-api-provider">{t('config.provider')}</Label>
        <Input
          id="new-api-provider"
          value={newApi.provider}
          onChange={(e) => onChange({ ...newApi, provider: e.target.value })}
          placeholder="OpenAI"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-api-url">{t('config.url')}</Label>
        <Input
          id="new-api-url"
          type="url"
          value={newApi.url}
          onChange={(e) => onChange({ ...newApi, url: e.target.value })}
          placeholder="https://api.openai.com/v1/models"
        />
      </div>
      <div className="sm:col-span-3">
        <Button className="mt-1 gap-1.5" onClick={onAdd}>
          <Plus className="size-4" />
          {t('config.addApi')}
        </Button>
      </div>
      </div>
    </div>
  );
}
