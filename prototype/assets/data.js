/* LLM API Sentinel - Prototype Shared Data & i18n
 * 真实模拟数据，与 app/lib/mock-data.ts 对齐（12 个 API）
 * 文件路径: /workspace/prototype/assets/data.js
 */

// 国际化翻译（与 app/i18n/en.ts / zh.ts 对齐）
const i18n = {
  zh: {
    title: 'LLM API Sentinel v2.8.1 | 全球LLM API实时监控',
    statsOnline: '在线服务',
    statsDegraded: '降级服务',
    statsOffline: '离线服务',
    statsLatency: '平均延迟',
    alertsTitle: '活跃告警',
    alertBannerPrefix: '检测到',
    alertBannerSuffix: '个活跃问题',
    alertDetail: '查看详情',
    timeRange24h: '24小时',
    timeRange7d: '7天',
    timeRange30d: '30天',
    refreshBtn: '刷新数据',
    lastSync: '最后同步',
    apiStatus: 'API 状态监控',
    apiStatusDesc: '实时监控全球主流 LLM API 服务健康状态',
    login: '登录',
    location: '位置',
    locationRefreshing: '定位中...',
    footerCopyright: 'LLM API Sentinel. 保留所有权利。',
    docs: '文档',
    github: 'GitHub',
    issues: '问题反馈',
    privacy: '隐私政策',
    statusOnline: '在线',
    statusDegraded: '降级',
    statusOffline: '离线',
    latencyLabel: '延迟',
    availabilityLabel: '可用性',
    errorRateLabel: '错误率',
    updatedAgo: '前更新',
    needAttention: '需要关注',
    retryCount: '重试次数',
    lastSuccess: '上次成功',
    timeout: '超时',
    providerGroupUS: '国际供应商',
    providerGroupCN: '中国供应商',
    unitMs: 'ms',
    minAgo: '分钟前',
    justNow: '刚刚',
    resolve: '解决',
    noAlerts: '无活跃告警',
    lastSuccessTime: '上次成功',
    liveClock: '实时',
    lastSyncLabel: '最后同步',
    chartLegend: '图例',
    chartAriaPrefix: '延迟趋势图，展示',
    chartAriaSuffix: '个 API 的延迟变化',
  },
  en: {
    title: 'LLM API Sentinel v2.8.1 | Global LLM API Monitoring',
    statsOnline: 'Online Services',
    statsDegraded: 'Degraded Services',
    statsOffline: 'Offline Services',
    statsLatency: 'Avg Latency',
    alertsTitle: 'Active Alerts',
    alertBannerPrefix: 'Detected',
    alertBannerSuffix: 'active issues',
    alertDetail: 'View Details',
    timeRange24h: '24H',
    timeRange7d: '7D',
    timeRange30d: '30D',
    refreshBtn: 'Refresh',
    lastSync: 'Last sync',
    apiStatus: 'API Status Monitor',
    apiStatusDesc: 'Real-time monitoring of global LLM API health',
    login: 'Login',
    location: 'Location',
    locationRefreshing: 'Locating...',
    footerCopyright: 'LLM API Sentinel. All rights reserved.',
    docs: 'Docs',
    github: 'GitHub',
    issues: 'Issues',
    privacy: 'Privacy',
    statusOnline: 'Online',
    statusDegraded: 'Degraded',
    statusOffline: 'Offline',
    latencyLabel: 'Latency',
    availabilityLabel: 'Availability',
    errorRateLabel: 'Error Rate',
    updatedAgo: 'ago',
    needAttention: 'Needs Attention',
    retryCount: 'Retries',
    lastSuccess: 'Last Success',
    timeout: 'Timeout',
    providerGroupUS: 'Global Providers',
    providerGroupCN: 'China Providers',
    unitMs: 'ms',
    minAgo: 'm ago',
    justNow: 'Just now',
    resolve: 'Resolve',
    noAlerts: 'No active alerts',
    lastSuccessTime: 'Last success',
    liveClock: 'Live',
    lastSyncLabel: 'Last sync',
    chartLegend: 'Legend',
    chartAriaPrefix: 'Latency trend chart showing',
    chartAriaSuffix: 'APIs over time',
  }
};

// 延迟阈值（与 app/constants 对齐：1500ms）
const LATENCY_THRESHOLD = 1500;

// API 模拟数据（12 个，离线用真实的"重试中"语义：可用性低但非 0，错误率高但有值）
let apis = [
  { id: 'openai-gpt-4o', name: 'GPT-4o', provider: 'OpenAI', status: 'online', latency: 128, availability: 99.9, errorRate: 0.1, lastChecked: Date.now() - 120000, color: '#6366f1' },
  { id: 'anthropic-claude-3-5', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', status: 'online', latency: 89, availability: 100, errorRate: 0, lastChecked: Date.now() - 95000, color: '#8b5cf6' },
  { id: 'google-gemini-1-5', name: 'Gemini 1.5 Pro', provider: 'Google', status: 'degraded', latency: 1156, availability: 97.7, errorRate: 2.3, lastChecked: Date.now() - 180000, color: '#3b82f6' },
  { id: 'meta-llama-3', name: 'Llama 3 (Groq)', provider: 'Meta', status: 'online', latency: 45, availability: 100, errorRate: 0, lastChecked: Date.now() - 80000, color: '#f59e0b' },
  { id: 'mistral-large', name: 'Mistral Large', provider: 'Mistral', status: 'online', latency: 156, availability: 99.7, errorRate: 0.3, lastChecked: Date.now() - 110000, color: '#ef4444' },
  { id: 'moonshot-v1', name: 'Kimi (Moonshot)', provider: 'Moonshot AI', status: 'online', latency: 234, availability: 99.8, errorRate: 0.2, lastChecked: Date.now() - 130000, color: '#22c55e' },
  { id: 'zhipu-glm-4', name: 'GLM-4 (Zhipu)', provider: 'ZhipuAI', status: 'online', latency: 167, availability: 99.9, errorRate: 0.1, lastChecked: Date.now() - 150000, color: '#14b8a6' },
  { id: 'baichuan-2', name: 'Baichuan 2', provider: 'Baichuan AI', status: 'online', latency: 198, availability: 99.6, errorRate: 0.4, lastChecked: Date.now() - 200000, color: '#06b6d4' },
  { id: 'qwen-max', name: 'Qwen Max (Ali)', provider: 'Alibaba', status: 'offline', latency: 0, availability: 92.4, errorRate: 7.6, lastChecked: Date.now() - 600000, retries: 2, color: '#f97316' },
  { id: 'hunyuan-pro', name: 'Hunyuan (Tencent)', provider: 'Tencent', status: 'online', latency: 312, availability: 99.5, errorRate: 0.5, lastChecked: Date.now() - 100000, color: '#ec4899' },
  { id: 'ernie-4', name: 'Ernie 4.0 (Baidu)', provider: 'Baidu', status: 'online', latency: 287, availability: 99.7, errorRate: 0.3, lastChecked: Date.now() - 170000, color: '#84cc16' },
  { id: 'deepseek-v3', name: 'DeepSeek V3', provider: 'DeepSeek', status: 'online', latency: 178, availability: 99.9, errorRate: 0.1, lastChecked: Date.now() - 90000, color: '#6366f1' },
];

// 延迟历史数据（按时间范围生成真实差异曲线）
let chartHistoryData = [];

// 各时间范围的采样点数与标签生成器
const RANGE_CONFIG = {
  '24h': { points: 24, label: i => `${String(23 - i).padStart(2, '0')}:00` },
  '7d':  { points: 7,  label: i => ['周一','周二','周三','周四','周五','周六','周日'][6 - i] },
  '30d': { points: 30, label: i => `D-${29 - i}` },
};

function generateChartData() {
  const range = RANGE_CONFIG[currentTimeRange] || RANGE_CONFIG['24h'];
  const points = range.points;
  chartHistoryData = [];
  for (let i = 0; i < points; i++) {
    const point = { time: range.label(i) };
    apis.forEach(api => {
      if (api.status === 'offline') {
        point[api.id] = null;
        return;
      }
      // 基准延迟 + 与时间相关的真实波动（不同范围幅度不同，曲线形态各异）
      const base = api.latency;
      let variation;
      if (currentTimeRange === '24h') {
        // 日内：昼夜波动（白天高、凌晨低）+ 噪声
        const diurnal = Math.sin((i / points) * Math.PI * 2 + 1.2);
        variation = base * (1 + diurnal * 0.28) + (Math.sin(i * 1.7 + api.id.length) * 0.12 * base);
      } else if (currentTimeRange === '7d') {
        // 周内：工作日略升、周末回落
        const weekly = Math.cos((i / points) * Math.PI * 2);
        variation = base * (1 + weekly * 0.34) + (api.id.length % 3) * 6;
      } else {
        // 30 天：长期趋势 + 随机尖峰
        const trend = (i / points - 0.5) * 0.3;
        const spike = (i % 9 === 0) ? base * 0.4 : 0;
        variation = base * (1 + trend) + spike + Math.sin(i * 0.9) * 0.1 * base;
      }
      point[api.id] = Math.max(20, Math.round(variation));
    });
    chartHistoryData.push(point);
  }
  chartHistoryData.reverse();
}

// 城市模拟数据
const mockCities = [
  { city: 'Shanghai', country: 'CN' }, { city: 'Beijing', country: 'CN' },
  { city: 'Shenzhen', country: 'CN' }, { city: 'Tokyo', country: 'JP' },
  { city: 'Singapore', country: 'SG' }, { city: 'London', country: 'UK' },
  { city: 'New York', country: 'US' }, { city: 'San Francisco', country: 'US' },
  { city: 'Frankfurt', country: 'DE' }, { city: 'Sydney', country: 'AU' },
];

// Provider 图标（SVG 内联）
const providerIcons = {
  'OpenAI': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
  'Anthropic': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  'Google': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6c-2 0-4 1.5-4 4s2 4 4 4 4-1.5 4-4"/></svg>',
  'Meta': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/><path d="M8 12h8M12 8v8"/></svg>',
  'Mistral': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  'Moonshot AI': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>',
  'ZhipuAI': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>',
  'Alibaba': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7l4.5-4.5L13 7l-4.5 4.5L4 7zM11 14l4.5-4.5L20 14l-4.5 4.5L11 14z"/></svg>',
  'Tencent': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>',
  'Baidu': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>',
  'Baichuan AI': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>',
  'DeepSeek': '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12h4l3-9 3 18 3-9h4"/></svg>',
};
