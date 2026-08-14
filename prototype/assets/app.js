/* LLM API Sentinel - Prototype Shared Logic
 * 路由、主题、i18n、渲染、图表、交互
 * 文件路径: /workspace/prototype/assets/app.js
 */

let currentLang = 'zh';
let currentTheme = 'dark';
let currentTimeRange = '24h';
let currentLocation = 'Shanghai, CN';
let renderFn = null; // 当前页面的渲染函数

/* ---------------- 工具 ---------------- */
function getTheme() { return document.documentElement.classList.contains('light') ? 'light' : 'dark'; }
function setTheme(theme) {
  document.documentElement.classList.toggle('light', theme === 'light');
  currentTheme = theme;
  updateThemeIcon();
}
function getT() { return i18n[currentLang]; }
function getStatusColor(status) {
  return status === 'online' ? 'var(--color-success)'
    : status === 'degraded' ? 'var(--color-warning)'
    : 'var(--color-destructive)';
}
function getStatusText(status) {
  const t = getT();
  return status === 'online' ? t.statusOnline : status === 'degraded' ? t.statusDegraded : t.statusOffline;
}
function timeAgo(timestamp) {
  const t = getT();
  const diff = Math.max(0, Date.now() - timestamp);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return t.justNow;
  return `${minutes} ${t.minAgo}`;
}

/* ---------------- 主题 ---------------- */
function updateThemeIcon() {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const theme = getTheme();
  btn.innerHTML = theme === 'dark'
    ? '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>'
    : '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
}
function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  if (renderFn) renderFn();
}

/* ---------------- 语言 ---------------- */
function updateLangUI() {
  const t = getT();
  document.documentElement.lang = currentLang;
  document.title = t.title;

  // 语言切换按钮本身
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
  }
  // 带 data-i18n 的元素
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key] !== undefined) el.textContent = t[key];
  });
  // 带 data-i18n-placeholder 的元素
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key] !== undefined) el.placeholder = t[key];
  });
}
function toggleLang() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  updateLangUI();
  if (renderFn) renderFn();
}

/* ---------------- 位置 ---------------- */
function getCurrentLocation(callback) {
  const locEl = document.getElementById('current-location');
  if (locEl) locEl.textContent = getT().locationRefreshing;
  setTimeout(() => {
    const city = mockCities[Math.floor(Math.random() * mockCities.length)];
    currentLocation = `${city.city}, ${city.country}`;
    if (locEl) locEl.textContent = currentLocation;
    if (callback) callback();
  }, 900);
}

/* ---------------- 顶栏实时时钟 ---------------- */
function updateClock() {
  const clockEl = document.getElementById('live-clock');
  if (!clockEl) return;
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  clockEl.textContent = `${hh}:${mm}:${ss}`;
  const syncEl = document.getElementById('last-sync-time');
  if (syncEl) syncEl.textContent = `${getT().lastSyncLabel} · ${timeAgo(lastSyncTs)}`;
}
setInterval(updateClock, 1000);

/* ---------------- 统计卡片 ---------------- */
function renderStats() {
  const online = apis.filter(a => a.status === 'online').length;
  const degraded = apis.filter(a => a.status === 'degraded').length;
  const offline = apis.filter(a => a.status === 'offline').length;
  const active = online + degraded + offline;
  const avgLatency = apis.length
    ? Math.round(apis.reduce((s, a) => s + (a.latency || 0), 0) / apis.length)
    : 0;
  const t = getT();

  const stats = [
    { key: 'online', label: t.statsOnline, value: `${online}/${active}`, color: 'var(--color-success)', sub: `99.9% ${t.availabilityLabel}` },
    { key: 'degraded', label: t.statsDegraded, value: degraded, color: 'var(--color-warning)', sub: '2.3% ERR' },
    { key: 'offline', label: t.statsOffline, value: offline, color: 'var(--color-destructive)', sub: offline ? `${t.needAttention}` : t.statusOnline },
    { key: 'latency', label: t.statsLatency, value: `${avgLatency}${t.unitMs}`, color: 'var(--color-primary)', sub: `↓ 12%` },
  ];

  const wrap = document.getElementById('stats-grid');
  if (!wrap) return;
  wrap.innerHTML = stats.map((s, i) => `
    <div class="animate-fade-in-up card-hover-lift rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all" style="animation-delay:${i * 0.08}s">
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted-foreground">${s.label}</span>
        <span class="w-2.5 h-2.5 rounded-full" style="background:${s.color};box-shadow:0 0 8px ${s.color}"></span>
      </div>
      <div class="mt-3 text-3xl font-semibold tabular-nums" style="color:color-mix(in srgb, ${s.color} 80%, var(--color-foreground))">${s.value}</div>
      <div class="mt-1 text-xs text-muted-foreground">${s.sub}</div>
    </div>
  `).join('');
}

/* ---------------- 告警横幅 ---------------- */
function renderAlertsBanner() {
  const banner = document.getElementById('alerts-banner');
  if (!banner) return;
  const t = getT();
  const alerts = apis.filter(a => a.status !== 'online');
  const count = alerts.length;
  const hasDegraded = alerts.some(a => a.status === 'degraded');
  const hasOffline = alerts.some(a => a.status === 'offline');
  const bg = hasOffline ? 'var(--color-destructive)' : hasDegraded ? 'var(--color-warning)' : 'var(--color-success)';

  banner.className = `animate-fade-in-up rounded-xl p-4 border border-border backdrop-blur-sm`;
  // 浅色模式下用更高饱和度底色 + 同色文字（color-mix 提升对比度），深色模式保持柔和
  const isDark = getTheme() === 'dark';
  banner.style.background = isDark
    ? `color-mix(in srgb, ${bg} 14%, var(--color-card))`
    : `color-mix(in srgb, ${bg} 18%, var(--color-card))`;
  banner.style.borderColor = `color-mix(in srgb, ${bg} 35%, var(--color-border))`;
  banner.innerHTML = `
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-3 min-w-0">
        <span class="w-3 h-3 rounded-full animate-pulse" style="background:${bg};box-shadow:0 0 10px ${bg}"></span>
        <span class="font-medium" style="color:color-mix(in srgb, ${bg} 78%, var(--color-foreground))">
          ${count > 0 ? `${t.alertBannerPrefix} ${count} ${t.alertBannerSuffix}` : t.noAlerts}
        </span>
        <span class="text-sm text-muted-foreground truncate">
          ${alerts.map(a => `${a.name} · ${getStatusText(a.status)}`).join(' · ')}
        </span>
      </div>
      <button onclick="openAlertsDialog()" class="text-sm px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors whitespace-nowrap">
        ${t.alertDetail}
      </button>
    </div>`;
}

/* ---------------- 告警对话框 ---------------- */
function openAlertsDialog() {
  const t = getT();
  const alerts = apis.filter(a => a.status !== 'online');
  const content = `
    <div class="dialog-overlay" onclick="if(event.target===this)closeAlertsDialog()"></div>
    <div class="dialog-content w-full max-w-lg rounded-2xl border border-border bg-popover p-6 shadow-2xl">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold">${t.alertsTitle}</h3>
        <button onclick="closeAlertsDialog()" class="w-8 h-8 grid place-items-center rounded-lg hover:bg-secondary transition-colors">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div class="space-y-3">
        ${alerts.length ? alerts.map(a => `
          <div class="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
            <div class="min-w-0">
              <div class="font-medium truncate">${a.name}</div>
              <div class="text-xs text-muted-foreground">${a.provider} · ${timeAgo(a.lastChecked)} ${t.updatedAgo}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-1 rounded-full text-xs font-medium" style="background:color-mix(in srgb,${getStatusColor(a.status)} 15%,transparent);color:color-mix(in srgb,${getStatusColor(a.status)} 72%,var(--color-foreground))">${getStatusText(a.status)}</span>
              <button class="px-2.5 py-1 rounded-lg text-xs border border-border hover:bg-secondary transition-colors">${t.resolve}</button>
            </div>
          </div>`).join('') : `<div class="text-sm text-muted-foreground py-6 text-center">${t.noAlerts}</div>`}
      </div>
    </div>`;
  let host = document.getElementById('dialog-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'dialog-host';
    document.body.appendChild(host);
  }
  host.innerHTML = content;
  const dialog = host.querySelector('.dialog-content');
  if (dialog) {
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', t.alertsTitle);
    dialog.tabIndex = -1;
    dialog.focus();
  }
  document.addEventListener('keydown', escClose);
}
function closeAlertsDialog() {
  const host = document.getElementById('dialog-host');
  if (host) host.innerHTML = '';
  document.removeEventListener('keydown', escClose);
}
function escClose(e) { if (e.key === 'Escape') closeAlertsDialog(); }

/* ---------------- 延迟图表（手写 SVG：区域填充 + 图例 + hover tooltip） ---------------- */
const hiddenSeries = new Set(); // 被图例隐藏的 api.id

function renderMultiLineChart() {
  const svg = document.getElementById('latency-chart');
  if (!svg) return;
  const W = 760, H = 240, P = 36;
  const innerW = W - P * 2;
  const gridH = H - P * 2;
  const points = chartHistoryData;
  if (!points.length) return;

  const maxLatency = Math.max(
    ...points.flatMap(pt => apis.filter(a => a.status !== 'offline' && !hiddenSeries.has(a.id)).map(a => pt[a.id] || 0)),
    LATENCY_THRESHOLD
  ) * 1.15;

  const x = i => P + (i / (points.length - 1)) * innerW;
  const y = v => P + gridH - (v / maxLatency) * gridH;

  const isDark = getTheme() === 'dark';
  const grid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const axis = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)';

  // 网格线
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(f => {
    const yy = P + gridH - f * gridH;
    const val = Math.round(maxLatency * f);
    return `<line x1="${P}" y1="${yy}" x2="${W - P}" y2="${yy}" stroke="${grid}"/><text x="${P - 6}" y="${yy + 4}" text-anchor="end" fill="${axis}" font-size="10">${val}ms</text>`;
  }).join('');

  // 阈值线
  const thresholdY = y(LATENCY_THRESHOLD);
  const thresholdLine = `<line x1="${P}" y1="${thresholdY}" x2="${W - P}" y2="${thresholdY}" stroke="var(--color-warning)" stroke-width="1" stroke-dasharray="4 4" opacity="0.5"/><text x="${W - P}" y="${thresholdY - 6}" text-anchor="end" fill="var(--color-warning)" font-size="10">${LATENCY_THRESHOLD}ms</text>`;

  // 数据系列（区域填充 + 折线）
  let areas = '', lines = '';
  apis.forEach(api => {
    if (api.status === 'offline' || hiddenSeries.has(api.id)) return;
    const coords = points.map((pt, i) => {
      const val = pt[api.id];
      return val === null ? null : `${x(i).toFixed(1)},${y(val).toFixed(1)}`;
    }).filter(c => c !== null);
    if (coords.length < 2) return;
    const first = coords[0].split(',');
    const last = coords[coords.length - 1].split(',');
    const areaPath = `M ${first[0]},${P + gridH} L ${coords.join(' L ')} L ${last[0]},${P + gridH} Z`;
    areas += `<path class="chart-area" d="${areaPath}" fill="${api.color}" opacity="0.08"/>`;
    lines += `<polyline class="chart-line" data-api="${api.id}" points="${coords.join(' ')}" fill="none" stroke="${api.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>`;
  });

  // 可访问性：为图表提供文本摘要（aria）
  const seriesCount = apis.filter(a => a.status !== 'offline' && !hiddenSeries.has(a.id)).length;
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', `${getT().chartAriaPrefix} ${seriesCount} ${getT().chartAriaSuffix}`);

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.innerHTML = gridLines + thresholdLine + areas + lines;

  // 构建交互热区（垂直扫描线 + hover）
  buildChartHover(svg, points, x, y, W, H, P, gridH);
  renderChartLegend();
}

/* hover 交互：鼠标移动时定位最近点，显示 tooltip 并高亮对应系列 */
function buildChartHover(svg, points, x, y, W, H, P, gridH) {
  let guide = document.getElementById('chart-guide');
  if (!guide) {
    guide = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    guide.id = 'chart-guide';
    guide.setAttribute('stroke', 'currentColor');
    guide.setAttribute('stroke-width', '1');
    guide.setAttribute('stroke-dasharray', '3 3');
    guide.setAttribute('opacity', '0');
    guide.style.color = 'var(--color-muted-foreground)';
    svg.appendChild(guide);
  }
  const moveHandler = (ev) => {
    const rect = svg.getBoundingClientRect();
    const px = (ev.clientX - rect.left) / rect.width * W;
    let idx = Math.round((px - P) / ((W - P * 2) / (points.length - 1)));
    idx = Math.max(0, Math.min(points.length - 1, idx));
    const gx = x(idx);
    guide.setAttribute('x1', gx); guide.setAttribute('x2', gx);
    guide.setAttribute('y1', P); guide.setAttribute('y2', P + gridH);
    guide.setAttribute('opacity', '0.5');
    showChartTooltip(ev, points[idx]);
  };
  const leaveHandler = () => {
    guide.setAttribute('opacity', '0');
    hideChartTooltip();
  };
  svg.onmousemove = moveHandler;
  svg.onmouseleave = leaveHandler;
  // 触摸支持
  svg.ontouchmove = (ev) => { ev.preventDefault(); moveHandler(ev.touches[0]); };
  svg.ontouchend = leaveHandler;
}

let chartTooltipEl = null;
function showChartTooltip(ev, point) {
  if (!point) return;
  if (!chartTooltipEl) {
    chartTooltipEl = document.createElement('div');
    chartTooltipEl.className = 'chart-tooltip';
    document.body.appendChild(chartTooltipEl);
  }
  const t = getT();
  const rows = apis
    .filter(a => a.status !== 'offline' && !hiddenSeries.has(a.id) && point[a.id] != null)
    .map(a => `<div class="tt-row"><span class="tt-dot" style="background:${a.color}"></span><span>${a.name}</span><span class="tt-val">${point[a.id]}${t.unitMs}</span></div>`)
    .join('');
  chartTooltipEl.innerHTML = `<div class="tt-title">${point.time}</div>${rows}`;
  chartTooltipEl.classList.add('is-visible');
  const pad = 14;
  let left = ev.clientX + pad;
  let top = ev.clientY + pad;
  const r = chartTooltipEl.getBoundingClientRect();
  if (left + r.width > window.innerWidth - 8) left = ev.clientX - r.width - pad;
  if (top + r.height > window.innerHeight - 8) top = ev.clientY - r.height - pad;
  chartTooltipEl.style.left = `${left}px`;
  chartTooltipEl.style.top = `${top}px`;
}
function hideChartTooltip() {
  if (chartTooltipEl) chartTooltipEl.classList.remove('is-visible');
}

/* 图例：点击切换系列显隐 */
function renderChartLegend() {
  let host = document.getElementById('chart-legend');
  if (!host) return;
  const t = getT();
  host.setAttribute('role', 'group');
  host.setAttribute('aria-label', t.chartLegend);
  host.innerHTML = apis
    .filter(a => a.status !== 'offline')
    .map(a => `<button type="button" data-api="${a.id}" aria-pressed="${hiddenSeries.has(a.id) ? 'false' : 'true'}" onclick="toggleSeries('${a.id}')">
        <span class="lg-dot" style="background:${a.color}"></span>${a.name}
      </button>`).join('');
}
function toggleSeries(id) {
  if (hiddenSeries.has(id)) hiddenSeries.delete(id); else hiddenSeries.add(id);
  renderMultiLineChart();
}

/* ---------------- 时间范围 ---------------- */
function updateTimeRangeUI() {
  document.querySelectorAll('[data-range]').forEach(btn => {
    const active = btn.getAttribute('data-range') === currentTimeRange;
    btn.className = active
      ? 'px-3 py-1.5 rounded-lg text-sm font-medium bg-primary text-primary-foreground transition-all'
      : 'px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors';
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}
function setTimeRange(range) {
  currentTimeRange = range;
  const t = getT();
  const label = range === '24h' ? t.timeRange24h : range === '7d' ? t.timeRange7d : t.timeRange30d;
  const el = document.getElementById('current-range');
  if (el) el.textContent = label;
  updateTimeRangeUI();
  generateChartData();
  renderMultiLineChart();
}

/* ---------------- 刷新 ---------------- */
function refreshData() {
  const btn = document.getElementById('refresh-btn');
  if (btn) { btn.classList.add('animate-spin-once'); setTimeout(() => btn.classList.remove('animate-spin-once'), 600); }

  apis = apis.map(a => {
    if (a.status === 'offline') {
      // 离线项保持"重试中"语义：可用性不低于 5%（保留重试迹象），错误率逼近上限但不封顶到 100
      const newErr = Math.min(99.9, +(a.errorRate + Math.random() * 0.4).toFixed(2));
      const newAvail = Math.max(5, Math.min(20, +(a.availability - Math.random() * 0.3).toFixed(2)));
      return { ...a, errorRate: newErr, availability: newAvail, lastChecked: Date.now() };
    }
    const variation = (Math.random() - 0.5) * 0.4 + 1;
    const newLatency = Math.max(20, Math.round(a.latency * variation));
    const newAvail = Math.min(100, Math.max(0, +(a.availability + (Math.random() - 0.5) * 0.15).toFixed(2)));
    const newErr = Math.max(0, Math.min(100, +(a.errorRate + (Math.random() - 0.5) * 0.2).toFixed(2)));
    return { ...a, latency: newLatency, availability: newAvail, errorRate: newErr, lastChecked: Date.now() };
  });
  // 重算历史曲线，使趋势与刷新后的最新延迟基线保持一致
  generateChartData();

  generateChartData();
  if (renderFn) renderFn();
  const clock = document.getElementById('last-sync-time');
  if (clock) clock.textContent = getT().justNow;
  lastSyncTs = Date.now();
}
let lastSyncTs = Date.now();

/* ---------------- 导航守卫（占位） ---------------- */
function navigate(href) {
  // 原型内仅做轻量提示，真实路由由 Next.js 承载
  console.log('[prototype] navigate ->', href);
}

/* ---------------- 初始化 ---------------- */
function appInit(render) {
  renderFn = render;
  updateLangUI();
  updateThemeIcon();
  updateTimeRangeUI();
  updateClock();
  render();
}
