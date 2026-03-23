// app/components/AlertConfig.tsx v3.5.1
'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

export default function AlertConfig({ apiId, initialConfig }: { apiId: string, initialConfig: any }) {
  const [config, setConfig] = useState(initialConfig);

  const handleSave = async () => {
    // Implement save logic to firestore
    console.log('Saving config:', config);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Alert Settings</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Latency Threshold (ms)</Label>
          <Input type="number" value={config.latencyThreshold} onChange={(e) => setConfig({...config, latencyThreshold: Number(e.target.value)})} />
        </div>
        <div className="space-y-2">
          <Label>Availability Threshold (%)</Label>
          <Input type="number" value={config.availabilityThreshold} onChange={(e) => setConfig({...config, availabilityThreshold: Number(e.target.value)})} />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Switch checked={config.enableEmailAlerts} onCheckedChange={(checked) => setConfig({...config, enableEmailAlerts: checked})} />
          <Label>Email Alerts</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={config.enableInAppAlerts} onCheckedChange={(checked) => setConfig({...config, enableInAppAlerts: checked})} />
          <Label>In-App Alerts</Label>
        </div>
      </div>
      <Button onClick={handleSave}>Save Settings</Button>
    </div>
  );
}
