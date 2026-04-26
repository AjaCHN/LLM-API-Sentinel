// app/lib/concurrency.ts v2.5.0
import { MAX_CONCURRENT_REQUESTS } from '../constants';
import { RequestOptions, QueueItem, NetworkQuality } from '../types';

// 并发管理器类
export class ConcurrencyManager<T> {
  private queue: QueueItem<T>[] = [];
  private activeRequests: number = 0;
  private concurrencyLimit: number;
  private isProcessing: boolean = false;
  private networkQuality: NetworkQuality = 'good';

  constructor(concurrencyLimit: number = MAX_CONCURRENT_REQUESTS) {
    this.concurrencyLimit = concurrencyLimit;
    this.updateNetworkQuality();
  }

  // 更新网络质量
  private updateNetworkQuality(): void {
    // 这里可以实现基于网络状况的动态调整
    // 例如，使用 navigator.connection API 或基于请求响应时间
    if (typeof navigator !== 'undefined' && (navigator as any).connection) {
      const connection = (navigator as any).connection;
      const downlink = connection.downlink || 10;
      const rtt = connection.rtt || 100;

      if (downlink >= 10 && rtt < 50) {
        this.networkQuality = 'excellent';
        this.concurrencyLimit = Math.min(8, MAX_CONCURRENT_REQUESTS * 2);
      } else if (downlink >= 5 && rtt < 100) {
        this.networkQuality = 'good';
        this.concurrencyLimit = MAX_CONCURRENT_REQUESTS;
      } else if (downlink >= 2 && rtt < 200) {
        this.networkQuality = 'fair';
        this.concurrencyLimit = Math.max(2, Math.floor(MAX_CONCURRENT_REQUESTS / 2));
      } else {
        this.networkQuality = 'poor';
        this.concurrencyLimit = 1;
      }
    }
  }

  // 添加请求到队列
  add(fn: () => Promise<T>, options: RequestOptions = {}): Promise<T> {
    return new Promise((resolve, reject) => {
      const queueItem: QueueItem<T> = {
        fn,
        options: {
          priority: options.priority || 'medium',
          timeout: options.timeout || 30000,
          retries: options.retries || 0,
          retryDelay: options.retryDelay || 1000,
          ...options
        },
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.queue.push(queueItem);
      this.processQueue();
    });
  }

  // 处理队列
  private processQueue(): void {
    if (this.isProcessing) return;
    if (this.queue.length === 0) return;
    if (this.activeRequests >= this.concurrencyLimit) return;

    this.isProcessing = true;

    // 按优先级和时间戳排序队列
    this.queue.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.options.priority!] - priorityOrder[b.options.priority!];
      if (priorityDiff !== 0) return priorityDiff;
      return a.timestamp - b.timestamp;
    });

    while (this.queue.length > 0 && this.activeRequests < this.concurrencyLimit) {
      const item = this.queue.shift();
      if (item) {
        this.processRequest(item);
      }
    }

    this.isProcessing = false;
  }

  // 处理单个请求
  private async processRequest(item: QueueItem<T>): Promise<void> {
    this.activeRequests++;

    try {
      // 添加超时处理
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Request timed out after ${item.options.timeout}ms`));
        }, item.options.timeout);
      });

      const result = await Promise.race([item.fn(), timeoutPromise]);
      item.resolve(result);
    } catch (error) {
      // 处理重试
      if (item.options.retries! > 0) {
        item.options.retries!--;
        await new Promise(resolve => setTimeout(resolve, item.options.retryDelay!));
        this.queue.unshift(item);
      } else {
        item.reject(error);
      }
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  // 清除队列
  clear(): void {
    this.queue = [];
  }

  // 获取队列长度
  getQueueLength(): number {
    return this.queue.length;
  }

  // 获取活跃请求数
  getActiveRequests(): number {
    return this.activeRequests;
  }

  // 获取当前并发限制
  getConcurrencyLimit(): number {
    return this.concurrencyLimit;
  }

  // 获取网络质量
  getNetworkQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    return this.networkQuality;
  }
}

// 创建全局并发管理器实例
export const concurrencyManager = new ConcurrencyManager();

// 批量处理函数
export async function processBatch<T>(
  items: T[],
  processor: (item: T) => Promise<any>,
  options: RequestOptions = {}
): Promise<any[]> {
  const results = [];
  
  for (const item of items) {
    results.push(concurrencyManager.add(() => processor(item), options));
  }
  
  return Promise.all(results);
}
