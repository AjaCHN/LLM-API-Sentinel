// app/components/ApiConfig.tsx v2.6.3
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, Edit } from 'lucide-react';
import { APIS_TO_CHECK } from '../constants';
import { useI18n } from '../hooks/useI18n';

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
    url: ''
  });

  // 从本地存储加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('apiConfig');
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig));
      } catch (error) {
        console.error('Failed to parse API config:', error);
        setConfig([...APIS_TO_CHECK]);
      }
    } else {
      setConfig([...APIS_TO_CHECK]);
    }
  }, []);

  // 保存配置到本地存储
  const saveConfig = () => {
    localStorage.setItem('apiConfig', JSON.stringify(config));
    setIsEditing(false);
  };

  // 添加新 API
  const addApi = () => {
    if (newApi.name && newApi.provider && newApi.url) {
      const newId = `${newApi.provider.toLowerCase().replace(/\s+/g, '-')}-${newApi.name.toLowerCase().replace(/\s+/g, '-')}`;
      setConfig([...config, { ...newApi, id: newId }]);
      setNewApi({ name: '', provider: '', url: '' });
    }
  };

  // 删除 API
  const removeApi = (id: string) => {
    setConfig(config.filter(api => api.id !== id));
  };

  // 重置为默认配置
  const resetToDefault = () => {
    setConfig([...APIS_TO_CHECK]);
  };

  return (
    <div id="api-config-container" className="bg-card rounded-lg border border-border/20 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">{t('config.apiConfiguration')}</h2>
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={saveConfig}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Save className="w-3 h-3 mr-1" />
              {t('config.save')}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-muted text-muted-foreground hover:bg-muted/80"
            >
              <X className="w-3 h-3 mr-1" />
              {t('config.cancel')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-muted text-muted-foreground hover:bg-muted/80"
          >
            <Edit className="w-3 h-3 mr-1" />
            {t('config.edit') || 'Edit'}
          </button>
        )}
      </div>

      <div className="space-y-4">
        {config.map((api) => (
          <div key={api.id} className="flex items-center justify-between p-3 border border-border/20 rounded-md">
            <div>
              <p className="font-medium">{api.name}</p>
              <p className="text-xs text-muted-foreground">{api.provider}</p>
              <p className="text-xs font-mono text-muted-foreground truncate max-w-md">{api.url}</p>
            </div>
            {isEditing && (
              <button
                onClick={() => removeApi(api.id)}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="border-2 border-dashed border-border/30 rounded-md p-4">
            <h3 className="text-sm font-medium mb-3">{t('config.addApi')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">{t('config.name')}</label>
                <input
                  type="text"
                  value={newApi.name}
                  onChange={(e) => setNewApi({ ...newApi, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., GPT-4o"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">{t('config.provider')}</label>
                <input
                  type="text"
                  value={newApi.provider}
                  onChange={(e) => setNewApi({ ...newApi, provider: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., OpenAI"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">{t('config.url')}</label>
                <input
                  type="url"
                  value={newApi.url}
                  onChange={(e) => setNewApi({ ...newApi, url: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., https://api.openai.com/v1/models"
                />
              </div>
              <button
                onClick={addApi}
                className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('config.addApi')}
              </button>
            </div>
          </div>
        )}

        {isEditing && (
          <button
            onClick={resetToDefault}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {t('config.reset') || 'Reset to default configuration'}
          </button>
        )}
      </div>
    </div>
  );
}
