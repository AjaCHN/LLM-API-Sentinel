// app/components/ApiConfig.tsx v2.6.3
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Edit, Server } from 'lucide-react';
import { APIS_TO_CHECK } from '@/constants';
import { useI18n } from '@/hooks/useI18n';
import { cn } from '@/lib/utils';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface ApiConfigItem {
  id: string;
  name: string;
  provider: string;
  url: string;
}

// 输入验证和清理函数
const MAX_INPUT_LENGTH = 100;
const MAX_URL_LENGTH = 200;

function sanitizeInput(input: string): string {
  // 移除潜在的 HTML/JS 标签和特殊字符
  return input
    .replace(/[<>\"\'`]/g, '')
    .trim()
    .slice(0, MAX_INPUT_LENGTH);
}

function validateUrl(url: string): boolean {
  // 验证 URL 格式和协议
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

// 验证后的 API 配置接口
interface ValidatedApiConfigItem {
  id: string;
  name: string;
  provider: string;
  url: string;
  isValid: boolean;
}

function validateApiConfig(config: ApiConfigItem[]): ValidatedApiConfigItem[] {
  return config.map(api => ({
    ...api,
    isValid: validateUrl(api.url) && api.name.length > 0 && api.provider.length > 0
  }));
}

export default function ApiConfig() {
  const { t } = useI18n();
  const [config, setConfig] = useState<ValidatedApiConfigItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newApi, setNewApi] = useState<Omit<ApiConfigItem, 'id'>>({
    name: '',
    provider: '',
    url: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const savedConfig = localStorage.getItem('apiConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(validateApiConfig(parsed));
      } catch {
        setConfig(validateApiConfig([...APIS_TO_CHECK]));
      }
    } else {
      setConfig(validateApiConfig([...APIS_TO_CHECK]));
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem('apiConfig', JSON.stringify(config));
    setIsEditing(false);
  };

  const addApi = () => {
    setValidationError(null);
    
    const sanitizedName = sanitizeInput(newApi.name);
    const sanitizedProvider = sanitizeInput(newApi.provider);
    const sanitizedUrl = newApi.url.trim().slice(0, MAX_URL_LENGTH);
    
    if (!sanitizedName || !sanitizedProvider) {
      setValidationError(t('config.errorNameRequired'));
      return;
    }
    
    if (!validateUrl(sanitizedUrl)) {
      setValidationError(t('config.errorInvalidUrl'));
      return;
    }
    
    const id = `${sanitizedProvider.toLowerCase().replace(/\s+/g, '-')}-${sanitizedName
      .toLowerCase()
      .replace(/\s+/g, '-')}`;
    
    setConfig([...config, { id, name: sanitizedName, provider: sanitizedProvider, url: sanitizedUrl, isValid: true }]);
    setNewApi({ name: '', provider: '', url: '' });
  };

  const removeApi = (id: string) => {
    setConfig(config.filter((api) => api.id !== id));
  };

  const resetToDefault = () => {
    setConfig(validateApiConfig([...APIS_TO_CHECK]));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{t('config.apiConfiguration')}</CardTitle>
          <CardDescription className="mt-1">
            {config.length} {t('api.apis')}
          </CardDescription>
        </div>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" onClick={saveConfig} className="gap-1.5">
              <Save className="size-4" />
              {t('config.save')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)} className="gap-1.5">
              <X className="size-4" />
              {t('config.cancel')}
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)} className="gap-1.5">
            <Edit className="size-4" />
            {t('config.edit')}
          </Button>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {validationError && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            {validationError}
          </div>
        )}
        {config.map((api) => (
          <div
            key={api.id}
            className={cn(
              "flex items-center justify-between gap-4 rounded-lg border p-3",
              !api.isValid && "border-destructive/50 bg-destructive/5"
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
                onClick={() => removeApi(api.id)}
                aria-label="remove api"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            )}
          </div>
        ))}

        {isEditing && (
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
                  onChange={(e) => setNewApi({ ...newApi, name: e.target.value })}
                  placeholder="GPT-4o"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-api-provider">{t('config.provider')}</Label>
                <Input
                  id="new-api-provider"
                  value={newApi.provider}
                  onChange={(e) => setNewApi({ ...newApi, provider: e.target.value })}
                  placeholder="OpenAI"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="new-api-url">{t('config.url')}</Label>
                <Input
                  id="new-api-url"
                  type="url"
                  value={newApi.url}
                  onChange={(e) => setNewApi({ ...newApi, url: e.target.value })}
                  placeholder="https://api.openai.com/v1/models"
                />
              </div>
            </div>
            <Button className="mt-3 gap-1.5" onClick={addApi}>
              <Plus className="size-4" />
              {t('config.addApi')}
            </Button>
          </div>
        )}
      </CardContent>

      {isEditing && (
        <CardFooter>
          <Button variant="ghost" size="sm" onClick={resetToDefault}>
            {t('config.reset')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
