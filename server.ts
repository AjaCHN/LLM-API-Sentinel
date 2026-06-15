// server.ts v2.6.2
import express from 'express';
import next from 'next';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'url';
import { performCheck } from './app/lib/monitor';
import { LATENCY_THRESHOLD } from './app/constants';
import type { ApiCheckResult } from './app/types';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Server] Missing Supabase environment variables');
  console.error('[Server] Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

if (dev) {
  console.log('[Server] Running in development mode');
}

async function hasExistingAlert(apiId: string, alertType: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('id')
      .eq('api_id', apiId)
      .eq('type', alertType)
      .eq('resolved', false)
      .limit(1);

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error('[Server] Failed to check existing alerts:', error);
    return false;
  }
}

async function runBackgroundMonitor() {
  console.log('[Monitor] Starting background check...');
  try {
    const results = await performCheck() as ApiCheckResult[];

    // Upsert API statuses
    const upsertData = results.map(result => ({
      id: result.id,
      name: result.name,
      provider: result.provider,
      url: result.url,
      status: result.status,
      latency: result.latency,
      last_checked: result.lastChecked,
      error: result.error || null,
      retries: result.retries || 0,
      error_rate: result.errorRate || 0,
      availability: result.availability || 100,
      uptime: result.uptime || 100,
      average_latency: result.averageLatency || null,
      max_latency: result.maxLatency || null,
      min_latency: result.minLatency || null,
      updated_at: new Date().toISOString()
    }));

    const { error: upsertError } = await supabase
      .from('api_status')
      .upsert(upsertData, { onConflict: 'id' });

    if (upsertError) {
      console.error('[Monitor] Failed to upsert API statuses:', upsertError);
    }

    // Insert history records
    const historyData = results.map(result => ({
      api_id: result.id,
      status: result.status,
      latency: result.latency,
      error: result.error || null,
      retries: result.retries || 0,
      timestamp: new Date().toISOString()
    }));

    const { error: historyError } = await supabase
      .from('status_history')
      .insert(historyData);

    if (historyError) {
      console.error('[Monitor] Failed to insert history records:', historyError);
    }

    // Create alerts for issues
    for (const result of results) {
      if (result.status === 'offline') {
        const hasExisting = await hasExistingAlert(result.id, 'downtime');
        if (!hasExisting) {
          const { error: alertError } = await supabase
            .from('alerts')
            .insert({
              api_id: result.id,
              api_name: result.name,
              type: 'downtime',
              message: `${result.name} is currently offline. (Auto-detected)`,
              timestamp: new Date().toISOString(),
              resolved: false
            });

          if (alertError) {
            console.error('[Monitor] Failed to create downtime alert:', alertError);
          }
        }
      } else if (result.latency > LATENCY_THRESHOLD) {
        const hasExisting = await hasExistingAlert(result.id, 'latency');
        if (!hasExisting) {
          const { error: alertError } = await supabase
            .from('alerts')
            .insert({
              api_id: result.id,
              api_name: result.name,
              type: 'latency',
              message: `${result.name} latency is high: ${result.latency}ms. (Auto-detected)`,
              timestamp: new Date().toISOString(),
              resolved: false
            });

          if (alertError) {
            console.error('[Monitor] Failed to create latency alert:', alertError);
          }
        }
      }
    }

    console.log('[Monitor] Background check completed and synced.');
  } catch (error) {
    console.error('[Monitor] Background check failed:', error);
  }
}

app.prepare().then(() => {
  const server = express();

  // Background task: Every 5 minutes
  setInterval(runBackgroundMonitor, 5 * 60 * 1000);
  // Initial check
  setTimeout(runBackgroundMonitor, 10000);

  server.all(/.*/, (req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Next.js prepare failed:', err);
  process.exit(1);
});
