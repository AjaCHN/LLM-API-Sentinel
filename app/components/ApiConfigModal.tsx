// app/components/ApiConfigModal.tsx v4.0.1
'use client';

import { useState } from 'react';
import { ApiConfig } from '@/lib/monitor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ApiConfigModal({ api, onClose, onSave }: { api: any, onClose: () => void, onSave: (config: ApiConfig) => void }) {
  const [config, setConfig] = useState<ApiConfig>({ 
    ...api, 
    id: api.originalId || api.id 
  });

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="font-bold text-lg">Configure {api.name}</h2>
        
        <div className="space-y-2">
          <Label className="text-xs font-mono opacity-50 uppercase">Interval (ms)</Label>
          <Input 
            type="number" 
            value={config.interval} 
            onChange={e => setConfig({...config, interval: parseInt(e.target.value)})}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono opacity-50 uppercase">Timeout (ms)</Label>
          <Input 
            type="number" 
            value={config.timeout || 6000} 
            onChange={e => setConfig({...config, timeout: parseInt(e.target.value)})}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-mono opacity-50 uppercase">Custom Body (JSON)</Label>
          <textarea 
            value={config.customBody || ''} 
            onChange={e => setConfig({...config, customBody: e.target.value})}
            className="w-full bg-background border border-border rounded p-2 text-sm h-24 font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder='{"prompt": "Hello"}'
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(config)}>Save</Button>
        </div>
      </div>
    </div>
  );
}
