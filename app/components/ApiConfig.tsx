'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Edit, Server } from 'lucide-react';
import { APIS_TO_CHECK } from '@/constants';
import { useI18n } from '@/hooks/useI18n';

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

export default function ApiConfig() {
  const { t } = useI18n();
  const [config, setConfig] = useState<ApiConfigItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newApi, setNewApi] = useState<Omit<ApiConfigItem, 'id'>>({
    name: '',
    provider: '',
    url: '',
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem('apiConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch {
        setConfig([...APIS_TO_CHECK]);
      }
    } else {
      setConfig([...APIS_TO_CHECK]);
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem('apiConfig', JSON.stringify(config));
    setIsEditing(false);
  };

  const addApi = () => {
    if (!newApi.name || !newApi.provider || !newApi.url) return;
    const id = `${newApi.provider.toLowerCase().replace(/\s+/g, '-')}-${newApi.name
      .toLowerCase()
      .replace(/\s+/g, '-')}`;
    setConfig([...config, { ...newApi, id }]);
    setNewApi({ name: '', provider: '', url: '' });
  };

  const removeApi = (id: string) => {
    setConfig(config.filter((api) => api.id !== id));
  };

  const resetToDefault = () => {
    setConfig([...APIS_TO_CHECK]);
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
        {config.map((api) => (
          <div
            key={api.id}
            className="flex items-center justify-between gap-4 rounded-lg border p-3"
          >
            <div className="min-w-0">
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
