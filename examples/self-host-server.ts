// examples/self-host-server.ts v2.10.30
// 安全加固: 添加 helmet 安全头、禁用 x-powered-by、错误处理中间件、body 大小限制
import express from 'express';
import helmet from 'helmet';
import next from 'next';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'url';
import { performCheck } from '../app/lib/monitor';
import { LATENCY_THRESHOLD } from '../app/constants';
import type { ApiCheckResult } from '../app/types';

const dev = process.env.NODE_ENV !== 'production';
const isProduction = process.env.NODE_ENV === 'production';

function log(level: 'info' | 'warn' | 'error', message: string, extra: Record<string, unknown> = {}) {
  const entry = { time: new Date().toISOString(), level, message, ...extra };
  if (dev) {
    console.log(`[${level.toUpperCase()}]`, message, Object.keys(extra).length ? extra : '');
  } else {
    console.log(JSON.stringify(entry));
  }
}

interface RateLimiter {
  hit(ip: string): Promise<{ allowed: boolean; retryAfter?: number; remaining: number }>;
}

class MemoryRateLimiter implements RateLimiter {
  private map = new Map<string, { count: number; resetTime: number }>();
  private windowMs = 60 * 1000;
  private max = 100;

  async hit(ip: string) {
    const now = Date.now();
    const entry = this.map.get(ip);
    if (!entry || now > entry.resetTime) {
      this.map.set(ip, { count: 1, resetTime: now + this.windowMs });
      return { allowed: true, remaining: this.max - 1 };
    }
    if (entry.count >= this.max) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        remaining: 0,
      };
    }
    entry.count++;
    return { allowed: true, remaining: this.max - entry.count };
  }

  startCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [ip, entry] of this.map.entries()) {
        if (now > entry.resetTime) this.map.delete(ip);
      }
    }, 5 * 60 * 1000);
  }
}

class RedisRateLimiter implements RateLimiter {
  private url: string;
  private token: string;
  private windowMs = 60 * 1000;
  private max = 100;

  constructor(url: string, token: string) {
    this.url = url;
    this.token = token;
  }

  async hit(ip: string) {
    try {
      // Upstash Redis REST API-compatible request; works with any REST-redis provider.
      // Uses INCR + EXPIRE for a sliding-window counter keyed per IP.
      const key = `rate-limit:${ip}`;
      const res = await fetch(`${this.url}/incr/${key}`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      if (!res.ok) throw new Error(`upstash ${res.status}`);
      const { result: count } = (await res.json()) as { result: number };

      if (count === 1) {
        await fetch(`${this.url}/expire/${key}/${Math.floor(this.windowMs / 1000)}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
      }

      if (count > this.max) {
        return { allowed: false, retryAfter: 60, remaining: 0 };
      }
      return { allowed: true, remaining: this.max - count };
    } catch (err) {
      // Fallback: allow the request; alert via structured log.
      log('warn', 'Rate limiter unavailable, falling back to permissive', { err: String(err) });
      return { allowed: true, remaining: this.max };
    }
  }
}

const rateLimiter: RateLimiter = (() => {
  const redisUrl = process.env.RATE_LIMIT_REDIS_URL;
  const redisToken = process.env.RATE_LIMIT_REDIS_TOKEN;
  if (redisUrl && redisToken) {
    log('info', 'Using Redis/Upstash rate limiter');
    return new RedisRateLimiter(redisUrl, redisToken);
  }
  log('info', 'Using in-memory rate limiter (single instance only)');
  const ml = new MemoryRateLimiter();
  ml.startCleanup();
  return ml;
})();

async function rateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = (req.ip || req.socket.remoteAddress || 'unknown').toString();
  const result = await rateLimiter.hit(ip);
  if (!result.allowed) {
    log('warn', 'Rate limit exceeded', { ip, retryAfter: result.retryAfter });
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please try again later.',
      retryAfter: result.retryAfter,
    });
    return;
  }
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  next();
}

const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || '3000', 10);

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  log('error', 'Missing Supabase environment variables');
  log('error', 'Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for server-side operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

if (dev) {
  log('info', 'Running in development mode');
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
    log('error', 'Failed to check existing alerts', { error: String(error) });
    return false;
  }
}

async function runBackgroundMonitor() {
  log('info', 'Starting background check...');
  try {
    const results = (await performCheck()) as ApiCheckResult[];

    // Upsert API statuses
    const upsertData = results.map((result) => ({
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
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('api_status')
      .upsert(upsertData, { onConflict: 'id' });

    if (upsertError) {
      log('error', 'Failed to upsert API statuses', { error: String(upsertError) });
    }

    // Insert history records
    const historyData = results.map((result) => ({
      api_id: result.id,
      status: result.status,
      latency: result.latency,
      error: result.error || null,
      retries: result.retries || 0,
      timestamp: new Date().toISOString(),
    }));

    const { error: historyError } = await supabase
      .from('status_history')
      .insert(historyData);

    if (historyError) {
      log('error', 'Failed to insert history records', { error: String(historyError) });
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
              resolved: false,
            });

          if (alertError) {
            log('error', 'Failed to create downtime alert', { error: String(alertError) });
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
              resolved: false,
            });

          if (alertError) {
            log('error', 'Failed to create latency alert', { error: String(alertError) });
          }
        }
      }
    }

    log('info', 'Background check completed and synced.');
  } catch (error) {
    log('error', 'Background check failed', { error: String(error) });
  }
}

app
  .prepare()
  .then(() => {
    const server = express();

    // 安全加固: 禁用 X-Powered-By 头，防止信息泄露
    server.disable('x-powered-by');

    // 安全加固: Helmet 安全头中间件
    // 配置 CSP 和其他安全头以防御 XSS、点击劫持等攻击
    server.use(helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'default-src': ["'self'"],
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            'https://www.googletagmanager.com',
          ],
          'style-src': [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
          ],
          'font-src': [
            "'self'",
            'https://fonts.gstatic.com',
            'data:',
          ],
          'img-src': [
            "'self'",
            'data:',
            'https://*.supabase.co',
            'https://lh3.googleusercontent.com',
            'https://picsum.photos',
          ],
          'connect-src': [
            "'self'",
            'https://*.supabase.co',
            'https://ipapi.co',
            'https://*.openai.com',
            'https://*.anthropic.com',
            'https://*.google.com',
          ],
          'frame-ancestors': ["'none'"],
        },
      },
      // 其他安全头
      xFrameOptions: { action: 'deny' },
      xContentTypeOptions: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }));

    // 安全加固: 手动设置 Permissions-Policy 头（Helmet v8 不包含此中间件）
    server.use((req, res, next) => {
      res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()',
      );
      next();
    });

    // 安全加固: 限制请求体大小，防止 DoS 攻击
    server.use(express.json({ limit: '100kb' }));
    server.use(express.urlencoded({ extended: true, limit: '100kb' }));

    // 安全增强: 应用速率限制中间件
    server.use(rateLimitMiddleware);

    // Background task: Every 5 minutes
    setInterval(runBackgroundMonitor, 5 * 60 * 1000);
    // Initial check
    setTimeout(runBackgroundMonitor, 10000);

    server.all(/.*/, (req, res) => {
      const parsedUrl = parse(req.url!, true);
      handle(req, res, parsedUrl);
    });

    // 安全加固: 自定义 404 处理（避免默认 Express 错误页面泄露信息）
    server.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found.',
      });
    });

    // 安全加固: 全局错误处理中间件
    // 生产环境不返回堆栈信息，防止信息泄露
    server.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
      log('error', 'Unhandled error', {
        error: err.message,
        path: req.path,
        method: req.method,
        // 生产环境不记录堆栈，开发环境可记录
        ...(dev ? { stack: err.stack } : {}),
      });

      if (isProduction) {
        // 生产环境：返回通用错误信息，不泄露细节
        res.status(500).json({
          error: 'Internal Server Error',
          message: 'An unexpected error occurred.',
        });
      } else {
        // 开发环境：返回详细错误信息便于调试
        res.status(500).json({
          error: 'Internal Server Error',
          message: err.message,
          stack: err.stack,
        });
      }
    });

    server.listen(port, () => {
      log('info', `Ready on http://localhost:${port}`);
      log('info', `Security headers enabled via helmet`, { production: isProduction });
    });
  })
  .catch((err) => {
    log('error', 'Next.js prepare failed', { error: String(err) });
    process.exit(1);
  });
