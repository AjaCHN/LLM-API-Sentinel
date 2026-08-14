// app/components/ApiConfig.tsx v2.9.0
'use client';

import { useState, useEffect } from 'react';
import { Save, X, Edit } from 'lucide-react';
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
import { ApiConfigList } from './api-config-list';
import { ApiConfigForm } from './api-config-form';
import {
  sanitizeInput,
  validateUrl,
  validateApiConfig,
  MAX_URL_LENGTH,
} from './api-config-validation';
import type { ApiConfigItem, ValidatedApiConfigItem } from './api-config-validation';

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
    <Card id="api-config">
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
        <ApiConfigList config={config} isEditing={isEditing} onRemove={removeApi} />

        {isEditing && <ApiConfigForm newApi={newApi} onChange={setNewApi} onAdd={addApi} />}
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
