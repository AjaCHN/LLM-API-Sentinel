// app/components/ApiConfigModal.tsx v1.2.0
'use client';

import { useState } from 'react';
import { ApiConfig } from '../lib/monitor';

export default function ApiConfigModal({ api, onClose, onSave }: { api: any, onClose: () => void, onSave: (config: ApiConfig) => void }) {
  const [config, setConfig] = useState<ApiConfig>({ 
    ...api, 
    id: api.originalId || api.id 
  });

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border p-6 rounded-lg w-full max-w-md space-y-4">
        <h2 className="font-bold text-lg">Configure {api.name}</h2>
        
        <div>
          <label className="text-xs font-mono opacity-50 uppercase">Interval (ms)</label>
          <input 
            type="number" 
            value={config.interval} 
            onChange={e => setConfig({...config, interval: parseInt(e.target.value)})}
            className="w-full bg-background border border-border rounded p-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-mono opacity-50 uppercase">Timeout (ms)</label>
          <input 
            type="number" 
            value={config.timeout || 6000} 
            onChange={e => setConfig({...config, timeout: parseInt(e.target.value)})}
            className="w-full bg-background border border-border rounded p-2 text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-mono opacity-50 uppercase">Custom Body (JSON)</label>
          <textarea 
            value={config.customBody || ''} 
            onChange={e => setConfig({...config, customBody: e.target.value})}
            className="w-full bg-background border border-border rounded p-2 text-sm h-24 font-mono"
            placeholder='{"prompt": "Hello"}'
          />
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm font-bold uppercase border border-border rounded hover:bg-muted">Cancel</button>
          <button onClick={() => onSave(config)} className="px-4 py-2 text-sm font-bold uppercase bg-foreground text-background rounded hover:opacity-90">Save</button>
        </div>
      </div>
    </div>
  );
}
