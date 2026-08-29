/* LLM API Sentinel - Prototype Shared Logic
 * 路由、主题、i18n、渲染、图表、交互
 * 文件路径: /workspace/prototype/assets/app.js
 */

let currentLang = 'zh';
let currentTheme = 'dark'; // 'dark' = 更深档(.dark)，'default' = 默认深(:root)
let currentTimeRange = '24h';
let currentLocation = 'Shanghai, CN';
let renderFn = null; // 当前页面的渲染函数

/* ---------------- 工具 ---------------- */
function getTheme() { return document.documentElement.classList.contains('dark') ? 'dark' : 'default'; }
function setTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  currentTheme = theme;
  updateThemeIcon();
}
function getT() { return i18n[currentLang]; }
// 统一的 alpha 混色工具：对齐 design-system §2.3 语义 alpha 思路，集中管理 color-mix
function alpha(color, pct, target) {
  return `color-mix(in srgb, ${color} ${pct}%, ${target})`;
}

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
  const t = getT();
  const theme = getTheme();
  const isDark = theme === 'dark';
  btn.innerHTML = isDark
    ? '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>'
    : '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
  // 无障碍：动态反映当前主题与目标动作（随语言更新）
  const label = isDark ? t.themeToDefault : t.themeToDark;
  btn.setAttribute('aria-label', label);
  btn.setAttribute('title', label);
}
function toggleTheme() {
  setTheme(getTheme() === 'dark' ? 'default' : 'dark');
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
  const onlineApis = apis.filter(a => a.status === 'online');
  const avgAvail = onlineApis.length
    ? (onlineApis.reduce((s, a) => s + a.availability, 0) / onlineApis.length).toFixed(1)
    : '—';
  const degradedApis = apis.filter(a => a.status === 'degraded');
  const avgErr = degradedApis.length
    ? (degradedApis.reduce((s, a) => s + a.errorRate, 0) / degradedApis.length).toFixed(1)
    : '0';
  const totalRetries = apis.reduce((s, a) => s + (a.retries || 0), 0);
  // 峰值延迟涵盖所有非离线 API（含 degraded，否则会漏掉最慢的真实峰值）
  const reachableApis = apis.filter(a => a.status !== 'offline');
  const peakLatency = reachableApis.length
    ? Math.max(...reachableApis.map(a => a.latency))
    : 0;
  const t = getT();

  const stats = [
    { key: 'online', label: t.statsOnline, value: `${online}/${active}`, color: 'var(--color-success)', sub: `${avgAvail}% ${t.availabilityLabel}` },
    { key: 'degraded', label: t.statsDegraded, value: degraded, color: 'var(--color-warning)', sub: `${avgErr}% ERR` },
    { key: 'offline', label: t.statsOffline, value: offline, color: 'var(--color-destructive)', sub: offline > 0 ? `${totalRetries}× ${t.retryUnit}` : t.allNormal },
    { key: 'latency', label: t.statsLatency, value: `${avgLatency}${t.unitMs}`, color: 'var(--color-primary)', sub: `${t.peakLabel} ${peakLatency}${t.unitMs}` },
  ];

  const wrap = document.getElementById('stats-grid');
  if (!wrap) return;
  wrap.innerHTML = stats.map((s, i) => `
    <div class="animate-fade-in-up card-hover-lift rounded-xl border border-border bg-card p-5 hover:shadow-lg transition-all" style="animation-delay:${i * 0.08}s">
      <div class="flex items-center justify-between">
        <span class="text-sm text-muted-foreground">${s.label}</span>
        <span class="w-2.5 h-2.5 rounded-full" style="background:${s.color};box-shadow:0 0 8px ${s.color}"></span>
      </div>
      <div class="mt-3 text-3xl font-semibold tabular-nums" style="color:alpha(${s.color}, 80, var(--color-foreground))">${s.value}</div>
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
    ? alpha(bg, 14, 'var(--color-card)')
    : alpha(bg, 18, 'var(--color-card)');
  banner.style.borderColor = alpha(bg, 35, 'var(--color-border)');
  banner.innerHTML = `
    <div class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-3 min-w-0">
        <span class="w-3 h-3 rounded-full animate-pulse" style="background:${bg};box-shadow:0 0 10px ${bg}"></span>
        <span class="font-medium" style="color:alpha(${bg}, 78, var(--color-foreground))">
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
              <span class="px-2 py-1 rounded-full text-xs font-medium" style="background:alpha(${getStatusColor(a.status)}, 15, transparent);color:alpha(${getStatusColor(a.status)}, 72, var(--color-foreground))">${getStatusText(a.status)}</span>
              <button onclick="resolveAlert('${a.id}')" class="px-2.5 py-1 rounded-lg text-xs border border-border hover:bg-secondary transition-colors" aria-label="${t.resolve} ${a.name}">${t.resolve}</button>
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
    // 焦点置于对话框内首个可聚焦元素（无障碍）
    const focusable = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    (focusable[0] || dialog).focus();
  }
  document.addEventListener('keydown', escClose);
  document.addEventListener('keydown', tabTrap);
}
// 轻量 mock：将对应告警标记为已解决（在线）并从列表移除，刷新横幅与卡片
function resolveAlert(id) {
  const target = apis.find(a => a.id === id);
  if (!target) return;
  target.status = 'online';
  target.availability = 100;
  target.errorRate = 0;
  target.lastChecked = Date.now();
  if (renderFn) renderFn();
  renderAlertsBanner();
  closeAlertsDialog();
}
function closeAlertsDialog() {
  const host = document.getElementById('dialog-host');
  if (host) host.innerHTML = '';
  document.removeEventListener('keydown', escClose);
  document.removeEventListener('keydown', tabTrap);
}
function escClose(e) { if (e.key === 'Escape') closeAlertsDialog(); }
// 焦点陷阱：Tab / Shift+Tab 在对话框内循环，避免焦点逃出到背景
function tabTrap(e) {
  if (e.key !== 'Tab') return;
  const dialog = document.querySelector('#dialog-host .dialog-content');
  if (!dialog) return;
  const focusable = [...dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.disabled && el.offsetParent !== null);
  if (!focusable.length) { e.preventDefault(); return; }
  const first = focusable[0], last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

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

  // 可访问性：为图表提供文本摘要（aria-label + 内部 <title> 双保险）
  const seriesCount = apis.filter(a => a.status !== 'offline' && !hiddenSeries.has(a.id)).length;
  const ariaText = `${getT().chartAriaPrefix} ${seriesCount} ${getT().chartAriaSuffix}`;
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', ariaText);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.innerHTML = `<title>${ariaText}</title>` + gridLines + thresholdLine + areas + lines;

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
    // meet 等比缩放：以较小缩放比为准，并居中偏移，得到 viewBox 内真实 x
    const scale = Math.min(rect.width / W, rect.height / H);
    const drawnW = W * scale, drawnH = H * scale;
    const offX = (rect.width - drawnW) / 2;
    const offY = (rect.height - drawnH) / 2;
    const px = (ev.clientX - rect.left - offX) / scale;
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
  if (btn) {
    btn.classList.add('animate-spin-once');
    btn.setAttribute('aria-busy', 'true');
    setTimeout(() => { btn.classList.remove('animate-spin-once'); btn.setAttribute('aria-busy', 'false'); }, 600);
  }

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
  if (renderFn) renderFn();
  // 仅更新同步时间戳，DOM 文本交由 updateClock 统一刷新（避免与每秒时钟竞态）
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
  // prototype.html 不注入自定义渲染时回退到内置 renderAll（高保真原型）
  renderFn = render || renderAll;
  // 默认应用更深一档深色主题（与 app/style.css 的 .dark 档一致）
  if (getTheme() !== 'dark') setTheme('dark');
  updateLangUI();
  updateThemeIcon();
  updateTimeRangeUI();
  updateClock();
  renderFn();
  // 同步初始时间范围文案（覆盖 index.html 中硬编码的 24H）
  setTimeRange(currentTimeRange);
}

/* =====================================================================
 * 高保真原型 (prototype.html) 专用渲染与交互
 * 仅当 renderAll 作为 appInit 回退时触发；index.html 注入自定义 render 时不会调用。
 * ===================================================================== */

// 内置默认渲染编排
function renderAll() {
  updateHeaderUI();
  renderStats();
  renderAlertsBanner();
  renderAlertsIcon();
  renderMultiLineChart();
  renderChartLegend();
  renderLiveFeed();
  renderApiGrid();
  renderLogs();
}

// 顶栏与图表静态文案（按语言/主题同步）
function updateHeaderUI() {
  const t = getT();
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('header-subtitle', currentLang === 'zh' ? '全球 LLM API 实时监控' : 'Global LLM API monitoring');
  set('chart-title', t.latencyLabel + (currentLang === 'zh' ? '趋势' : ' trend'));
  set('chart-subtitle', currentLang === 'zh' ? '各 API 响应延迟（ms）' : 'Per-API response latency (ms)');
  set('feed-title', t.feedTitle);
  set('api-grid-title', t.apiGridTitle);
  set('logs-title', t.logsTitle);
  set('empty-text', t.emptyText);
  set('settings-title', t.settingsTitle);
  set('detail-title', t.detailTitle);
  set('chart-range-label', { '1h': currentLang === 'zh' ? '最近 1 小时' : 'Last 1 hour', '24h': currentLang === 'zh' ? '最近 24 小时' : 'Last 24 hours', '7d': currentLang === 'zh' ? '最近 7 天' : 'Last 7 days', '30d': currentLang === 'zh' ? '最近 30 天' : 'Last 30 days' }[currentTimeRange]);
  const langBtn = document.getElementById('langBtn');
  if (langBtn) langBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    const isDark = getTheme() === 'dark';
    themeBtn.innerHTML = isDark
      ? '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>'
      : '<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>';
    const label = isDark ? t.themeToDefault : t.themeToDark;
    themeBtn.setAttribute('aria-label', label);
    themeBtn.setAttribute('title', label);
  }
  set('settings-theme-label', currentLang === 'zh' ? '深色模式' : 'Dark mode');
  set('settings-theme-sub', currentLang === 'zh' ? '切换浅色 / 深色外观' : 'Toggle light / dark appearance');
  set('settings-lang-label', currentLang === 'zh' ? '语言' : 'Language');
  // 语言说明标注 app 真实支持 16 种语言（原型预览仅 zh/en 子集）
  set('settings-lang-sub', currentLang === 'zh' ? '中文 / English（app 支持 16 种语言）' : 'Chinese / English (app supports 16 languages)');
  set('settings-alert-label', currentLang === 'zh' ? '桌面通知' : 'Desktop notifications');
  set('settings-alert-sub', currentLang === 'zh' ? '离线 / 降级时提醒' : 'Alert on offline / degraded');
  set('settings-auto-label', currentLang === 'zh' ? '自动刷新' : 'Auto refresh');
  set('settings-auto-sub', currentLang === 'zh' ? '每 30 秒拉取一次' : 'Poll every 30s');
  const sLangBtn = document.getElementById('settings-lang-btn');
  if (sLangBtn) sLangBtn.textContent = currentLang === 'zh' ? 'EN' : '中';
  syncSettingsSwitch();
}

// 告警铃铛徽标计数
function renderAlertsIcon() {
  const badge = document.getElementById('alerts-badge');
  if (!badge) return;
  const alerts = apis.filter(a => a.status !== 'online');
  const n = alerts.length;
  badge.textContent = n;
  badge.classList.toggle('hidden', n === 0);
}

// 实时动态
function renderLiveFeed() {
  const el = document.getElementById('live-feed');
  if (!el) return;
  const t = getT();
  const events = apis.filter(a => a.status !== 'offline').slice(0, 8)
    .map(a => ({ api: a, at: a.lastChecked })).sort((x, y) => y.at - x.at);
  el.innerHTML = events.map(e => {
    const color = getStatusColor(e.api.status);
    const dotCls = e.api.status === 'online' ? 'status-dot-online' : e.api.status === 'degraded' ? 'status-dot-degraded' : 'status-dot-offline';
    const label = e.api.status === 'degraded' ? (currentLang === 'zh' ? '延迟偏高' : 'High latency') : (currentLang === 'zh' ? '检测正常' : 'Healthy');
    return `<div class="flex items-start gap-2.5 rounded-lg p-2 hover:bg-secondary/60 transition-colors">
      <span class="mt-1.5 h-2 w-2 rounded-full ${dotCls}" style="background:${color}"></span>
      <div class="min-w-0 flex-1">
        <div class="text-xs font-medium truncate">${e.api.name}</div>
        <div class="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <span>${label}</span><span class="opacity-50">·</span><span class="tabular-nums">${e.api.latency}ms</span><span class="opacity-50">·</span><span>${timeAgo(e.at)}</span>
        </div>
      </div>
    </div>`;
  }).join('');
}

// API 网格（可搜索 + 空状态）
let apiSearchTerm = '';
function filterApis(value) {
  apiSearchTerm = (value || '').trim().toLowerCase();
  renderApiGrid();
}
function renderApiGrid() {
  const el = document.getElementById('api-grid');
  const empty = document.getElementById('api-empty');
  if (!el) return;
  const t = getT();
  const list = apis.filter(a => !apiSearchTerm || a.name.toLowerCase().includes(apiSearchTerm) || a.provider.toLowerCase().includes(apiSearchTerm));
  if (empty) empty.classList.toggle('hidden', list.length > 0);
  el.innerHTML = list.map(a => {
    const color = getStatusColor(a.status);
    const dotCls = a.status === 'online' ? 'status-dot-online' : a.status === 'degraded' ? 'status-dot-degraded' : 'status-dot-offline';
    const availW = Math.max(2, Math.min(100, a.availability));
    return `<button onclick="openDetail('${a.id}')" aria-label="${a.name} ${t.detailTitle}" class="text-left rounded-xl bg-secondary border border-border p-3.5 transition-colors hover:border-primary/40">
      <div class="flex items-center justify-between gap-2 mb-2.5">
        <div class="flex items-center gap-2 min-w-0">
          <span class="h-2.5 w-2.5 rounded-full flex-none ${dotCls}" style="background:${color}"></span>
          <span class="text-sm font-medium truncate">${a.name}</span>
        </div>
        <span class="text-[11px] px-2 py-0.5 rounded-full" style="background:alpha(${color}, 16, transparent);color:${color}">${getStatusText(a.status)}</span>
      </div>
      <div class="flex items-baseline gap-1">
        <span class="text-xl font-semibold tabular-nums">${a.status === 'offline' ? '—' : a.latency}</span>
        <span class="text-xs text-muted-foreground">${a.status === 'offline' ? '' : 'ms'}</span>
      </div>
      <div class="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div class="h-full rounded-full" style="width:${availW}%;background:${color}"></div>
      </div>
      <div class="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>${t.availabilityLabel} ${a.availability}%</span>
        <span>${timeAgo(a.lastChecked)}</span>
      </div>
    </button>`;
  }).join('');
}

// 事件日志时间线
function renderLogs() {
  const el = document.getElementById('logs-list');
  const cnt = document.getElementById('logs-count');
  if (!el) return;
  const t = getT();
  const meta = {
    offline:   { color: 'var(--color-destructive)', icon: 'M18 6 6 18M6 6l12 12' },
    degraded:  { color: 'var(--color-warning)',     icon: 'M12 9v4M12 17h.01' },
    recovered: { color: 'var(--color-success)',     icon: 'M20 6 9 17l-5-5' },
    checked:   { color: 'var(--color-info)',        icon: 'M9 12l2 2 4-4' },
  };
  if (cnt) cnt.textContent = `${logs.length} ${currentLang === 'zh' ? '条' : 'events'}`;
  el.innerHTML = logs.map(l => {
    const api = apis.find(a => a.id === l.apiId);
    const m = meta[l.type] || meta.checked;
    return `<li class="ml-4">
      <span class="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border border-border" style="background:${m.color}22">
        <svg viewBox="0 0 24 24" class="w-2.5 h-2.5" fill="none" stroke="${m.color}" stroke-width="3"><path d="${m.icon}"/></svg>
      </span>
      <div class="rounded-xl bg-secondary/50 border border-border px-3 py-2">
        <div class="flex items-center justify-between gap-2">
          <span class="text-sm font-medium">${api ? api.name : l.apiId}</span>
          <span class="text-[11px] text-muted-foreground tabular-nums">${timeAgo(l.ts)}</span>
        </div>
        <div class="text-xs mt-0.5" style="color:${m.color}">${t[l.msg]}</div>
      </div>
    </li>`;
  }).join('');
}

// 详情抽屉
function openDetail(id) {
  const drawer = document.getElementById('detail-drawer');
  const overlay = document.getElementById('detail-drawer-overlay');
  if (!drawer) return;
  renderDetail(id);
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-open');
}
function closeDetail() {
  const drawer = document.getElementById('detail-drawer');
  const overlay = document.getElementById('detail-drawer-overlay');
  if (!drawer) return;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('is-open');
}
function renderDetail(id) {
  const el = document.getElementById('detail-content');
  if (!el) return;
  const t = getT();
  const a = apis.find(x => x.id === id);
  if (!a) return;
  const color = getStatusColor(a.status);
  const availW = Math.max(2, Math.min(100, a.availability));
  const R = 52, C = 2 * Math.PI * R;
  const off = C * (1 - a.availability / 100);
  el.innerHTML = `
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="h-3 w-3 rounded-full flex-none" style="background:${color}"></span>
        <div class="min-w-0">
          <h2 class="text-base font-semibold truncate">${a.name}</h2>
          <p class="text-xs text-muted-foreground">${a.provider}</p>
        </div>
      </div>
      <button onclick="closeDetail()" aria-label="close" class="p-1.5 rounded-lg hover:bg-secondary transition-colors">
        <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div class="flex items-center gap-5 mb-5">
      <svg viewBox="0 0 120 120" class="w-24 h-24 -rotate-90">
        <circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--color-border)" stroke-width="10"/>
        <circle cx="60" cy="60" r="${R}" fill="none" stroke-width="10" stroke-linecap="round"
          stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" style="stroke:${color};transition:stroke-dashoffset .8s cubic-bezier(0.16,1,0.3,1)"/>
        <text x="60" y="60" text-anchor="middle" dominant-baseline="central" transform="rotate(90 60 60)" fill="var(--color-foreground)" font-size="18" font-weight="600">${a.availability}%</text>
      </svg>
      <div class="space-y-1.5 text-sm">
        <div><span class="text-muted-foreground">${t.availabilityLabel}</span> <span class="font-medium tabular-nums">${a.availability}%</span></div>
        <div><span class="text-muted-foreground">${t.errorRateLabel}</span> <span class="font-medium tabular-nums">${a.errorRate}%</span></div>
        <div><span class="text-muted-foreground">${t.lastSyncLabel}</span> <span class="font-medium">${timeAgo(a.lastChecked)}</span></div>
      </div>
    </div>
    <div class="grid grid-cols-2 gap-3">
      ${metricBox(t.latencyLabel, a.status === 'offline' ? '—' : a.latency + 'ms', color)}
      ${metricBox(t.providerLabel, a.provider, 'var(--color-foreground)')}
      ${metricBox(t.regionLabel, currentLang === 'zh' ? '全球' : 'Global', 'var(--color-foreground)')}
      ${metricBox(t.statusOnline, getStatusText(a.status), color)}
    </div>`;
}
function metricBox(label, value, color) {
  return `<div class="rounded-xl bg-secondary border border-border p-3">
    <div class="text-[11px] text-muted-foreground mb-1">${label}</div>
    <div class="text-sm font-semibold truncate" style="color:${color}">${value}</div>
  </div>`;
}

// 设置抽屉
function openSettings() {
  const drawer = document.getElementById('settings-drawer');
  const overlay = document.getElementById('settings-drawer-overlay');
  if (!drawer) return;
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  overlay.classList.add('is-open');
}
function closeSettings() {
  const drawer = document.getElementById('settings-drawer');
  const overlay = document.getElementById('settings-drawer-overlay');
  if (!drawer) return;
  drawer.classList.remove('is-open');
  drawer.setAttribute('aria-hidden', 'true');
  overlay.classList.remove('is-open');
}
// 同步设置抽屉内开关 / 语言按钮状态
function syncSettingsSwitch() {
  const sw = document.getElementById('settings-theme-switch');
  if (sw) sw.setAttribute('aria-checked', getTheme() === 'dark' ? 'true' : 'false');
  const sLang = document.getElementById('settings-lang-btn');
  if (sLang) sLang.textContent = currentLang === 'zh' ? 'EN' : '中';
}

