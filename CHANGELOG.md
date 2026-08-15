# Changelog

## [2.9.6] - 2026-08-15

### Feat
- **CI/CD 流水线**: 新增 `.github/workflows/ci.yml`（PR/push 触发 lint + test + build 门禁）与 `release.yml`（语义化版本 tag 触发静态产物构建与 GitHub Release）
- **后台监控 Edge Function 示例**: 新增 `supabase/functions/monitor/index.ts`（探测 26 个 LLM API 写入 `api_status` 与 `status_history`）及 `supabase/cron.sql`（pg_cron 每 5 分钟调度）
- **多渠道告警增强**: `detectPlatform` 新增 Slack 与 Microsoft Teams 识别；`webhook-formatter` 新增 Slack attachments 与 Teams MessageCard 格式化分支

### Test
- **测试覆盖率门禁**: `jest.config.cjs` 新增 `collectCoverageFrom` 与 `coverageThreshold`（statements/functions/lines ≥70%）；`package.json` 的 `test` 脚本启用 `--coverage`
- **新增纯逻辑测试**: `utils.test.ts`、`supabase-mapping.test.ts`、`cache-validation.test.ts`、`notification.test.ts`，并修正 `monitor.test.ts` 适配 26 API 现状与 jsdom 环境
- **lint 范围聚焦**: `eslint.config.mjs` 忽略 `scripts/`、`prototype/`（独立工具与原型，非 Next 应用源码）

### Docs
- 同步版本号至 v2.9.6

## [2.9.5] - 2026-08-15

### Feat
- **扩展 AI API 监测平台**: 从 12 个扩展至 26 个，新增 xAI Grok、Cohere Command R、Perplexity Sonar、Together AI、Replicate、Stability AI、HuggingFace、OpenRouter、Fireworks AI、NVIDIA NIM、AI21 Labs（国际），以及 MiniMax、iFlytek Spark、Doubao 火山方舟、01.AI Yi、SiliconFlow、StepFun 阶跃星辰（国内）
- **卡片紧凑布局**: `#status-section` 网格支持一行 4-5 列（`xl:grid-cols-4 2xl:grid-cols-5`），缩小卡片内边距/字号/间距适配多列显示

### Fix
- **补全缺失翻译 key**: 为全部 16 个语言包补充 `common.close`、`alerts.offline`、`alerts.highLatency` 三个此前未定义但代码已引用的 key

### Docs
- **文档一致性更新**: 同步全部项目文档至 v2.9.5
  - README 双语文档标题统一至 v2.9.5；图表库描述更正为手写 SVG 零依赖（Recharts 仅作可替换备选）
  - 主题描述统一为纯深色双档（移除所有"深色/浅色切换"过时表述，与设计系统权威一致）
  - openspec ui.md / project.md / design-system.md 标题统一至 v2.9.5
  - project.md：图表库表格、ApiStatusGrid 扁平网格、LocaleSwitcher 组件、useI18n 16 语言与 `persistLocale` 示例对齐代码现状
  - features.md / ui.md：修正 Provider Group 嵌套树为扁平网格、主题切换验收标准对齐
  - docs/contributing.md 示例版本更新
- **发展路线文档**: 新增 `docs/roadmap.md`，提出短期（CI/CD、测试覆盖、后台监控示例）、中期（SLA 状态页、多渠道告警、可配置目标）、长期（平台化 API/widget、移动端）及技术债清理建议，并在 README 文档链接补充

## [2.9.4] - 2026-08-15

### Fix
- **补全缺失翻译 key**: 为全部 16 个语言包补充 `common.close`、`alerts.offline`、`alerts.highLatency` 三个此前未定义但代码已引用的 key，修复告警横幅与错误通知显示原始 key 文字的问题

## [2.9.3] - 2026-08-15

### Fix
- **i18n 客户端打包修复**: `i18n.ts` 改用静态导入全部 16 个语言包，替代动态模板 `import()`，修复客户端打包失败导致页面显示 i18n key 而非翻译字符串的问题
- **翻译回退重写**: `t()` 优先当前语言、缺失时回退英文，逻辑更健壮
- **切换语义澄清**: `useI18n.ts` 将 `setLocale` 重命名为 `persistLocale`，移除冗余 localStorage 直写

## [2.9.2] - 2026-08-15

### Feat
- **语言切换 UI**: 新增 `LocaleSwitcher` 组件（基于 `DropdownMenuRadioGroup`），挂载至 `DashboardHeader`，支持 16 种语言即时切换并持久化至 localStorage
- **切换文案翻译**: 为全部 16 个 locale 的 `dashboard.changeLanguage` 补充对应语言翻译，保障切换器标签全覆盖

### Fix
- **SEO 语言声明对齐**: `layout.tsx` 与 `StructuredData.tsx` 的 `alternates.languages`/`alternateLocale`/`inLanguage` 移除无 locale 文件的 `ja`/`ko`，与实际支持的 16 种语言一致

## [2.9.1] - 2026-08-15

### Docs
- **设计系统对齐实现**: `design-system.md` 色彩章节重写为 Tailwind v4 `@theme` + `.dark` 覆盖体系，token 值严格对齐 `app/style.css`（`:root` 默认深 `#0f0f14` / `.dark` 更深 `#0a0a0f`），去除过时 `.light` 体系描述
- **数据表可见性修正**: `project.md` 7.1 节 `api_status`/`status_history`/`alerts` 可见性改为「认证用户可写」，与 10.2 RLS 策略及 `schema.sql` 一致
- **章节编号修复**: `project.md` 章节跳号（13→15→16→17）重排为连续 14 国际化 / 15 部署 / 16 Supabase 配置

### Style
- **原型主题对齐**: `prototype/assets/styles.css` 语义 token 值对齐 `app/style.css`，主题机制由 `.light` 切换改为 `.dark` 双档深色（`:root` 默认深 / `.dark` 更深），`app.js` `toggleTheme` 同步切换 `.dark` 类

### Refactor
- **状态网格简化**: `ApiStatusGrid.tsx` 移除按 provider 分组与空状态卡片，改为扁平 `<section>` 网格直接渲染，provider 透传至 `ApiStatusCard`

### Chore
- **版本统一**: 原型 3 文件 title、`project.md`/`design-system.md` 标题、package.json、config.yaml、`ApiStatusGrid.tsx` 统一至 v2.9.1

## [2.9.0] - 2026-08-15

### Fixed
- **告警系统失效**: `alert-service.ts` 误用不存在的 `status` 字符串列，改为 schema 真实的 `resolved` 布尔列（`insert({resolved:false})` / 去重 `.eq('resolved', false)` / 解决 `.update({resolved:true})`），修复告警无法写入与重复告警
- **时间范围装饰性**: `useDashboardStats` 新增 `activeRange` 参数，按 `timestamp` 窗口（1h/6h/24h）真实过滤图表数据，切换不再只高亮
- **SSRF 防护加固**: `notification-platforms.ts` 新增十进制/十六进制编码 IP 归一化拦截（如 `2130706433`→`127.0.0.1`），堵住内网地址绕过

### Refactor
- **模块拆分（单文件≤200行）**: `DashboardClient` 拆出 `dashboard-sections`；`cache.ts` 拆出 `cache-storage`/`cache-validation`；`ApiConfig` 拆出 `api-config-list`/`api-config-form`；`notification-platforms` 拆出 `webhook-formatter`；`i18n.test` 拆出 `i18n.test-fixtures`
- **语义化 id**: 主仪表盘、状态区、延迟区、配置、告警横幅、头部、脚部均带稳定 id

### Docs
- **规范冲突消解**: `project.md` RLS 策略改为与 `schema.sql` 一致（仅认证可写）；`ui.md` success token 统一为 `#22c55e`
- **版本统一**: 全部文件头注释、package.json、config.yaml、README 双语文档统一至 v2.9.0

## [2.8.5] - 2026-08-15

### Fixed
- **原型数据真实性**: 统计卡片副文案改为从真实数据派生（在线可用性均值 / 降级错误率均值 / 离线重试总次数 / 延迟峰值），移除写死的 `99.9%`/`2.3%`/`↓12%`
- **Hero 在线语义**: 顶栏改为「在线数 · 总数 API 状态监控」，动态读取在线/总数
- **图表等比渲染**: `preserveAspectRatio` 由 `none` 改 `xMidYMid meet` + `aspect-ratio:760/240`，消除宽屏横向拉伸变形；hover x 坐标换算兼容 meet 缩放与居中偏移
- **趋势与卡片一致**: `generateChartData` 末点锚定当前实时延迟，刷新后曲线末端与卡片数值对齐；去除 `refreshData` 中重复的 `generateChartData` 调用
- **API 卡片可视化**: 新增延迟进度条（含 shimmer 动效），对齐设计规范 ProgressBar 组件
- **组件库对比度**: Badge/Alert/StatusDot 文字色改用 `color-mix(...72%, var(--color-foreground))`，统一浅色模式可读性

### Docs
- **设计文档对齐实现**: `design-system.md` 颜色 token 改为 `.light` 体系与真实 hex、字体策略统一系统字体栈、动画表对齐实际类（fade-in-up/spin-once/shimmer）
- **UI/项目规范同步**: 图表描述由 Recharts 改为手写 SVG（含 React 可替换说明）、i18n 标注原型 2 语言/规划 16、版本号统一至 v2.8.5

## [2.8.4] - 2026-08-15

### Chore
- **开发工作区**: 新增 `LLM-API-Sentinel.code-workspace` 多根工作区配置
  - 编辑器设置：保存时 ESLint 自动修复 + 整理导入；Tailwind CSS 4 智能提示；路径别名 `@/*` 重命名
  - 文件/搜索排除 `node_modules`/`.next`/`out`/`dist` 等构建产物
  - 推荐扩展：ESLint、Tailwind CSS、React snippets、Error Lens、Code Spell Checker 等
  - 预置任务：dev（默认构建任务）、build、lint、test（默认测试任务）
  - 终端包管理器设为 `npm`（与 `package-lock.json` 一致）
- **版本一致性**: 同步 README 双语文档标题至 v2.8.4

## [2.8.3] - 2026-08-14

### Fixed
- **原型细节修复**: 清理 `generateChartData` 死代码（`swing`/`idx`）；移除告警横幅 `textColor` 死变量
- **刷新联动图表**: `refreshData` 重算历史曲线，使延迟趋势与刷新后最新基线一致；离线项可用性钳制下限 5%、错误率封顶 99.9%
- **浅色对比度**: 统计卡片数值、告警横幅、API 卡片图标/状态徽章、告警对话框徽章改用 `color-mix` 提升浅色模式可读性
- **Hero 计数动态化**: 顶栏"在线 · N API 状态监控"改为读取 `apis.length`，移除硬编码 12
- **组件库交互**: Switch 改用 CSS 驱动滑块动画（开/关回弹）；Tabs 支持点击切换并联动面板内容
- **版本一致性**: 原型 `title` 与 i18n 标题统一至 v2.8.3；时间范围切换同步 `aria-pressed`

## [2.8.2] - 2026-08-14

### Perf
- **缓存懒序列化**: `cache.ts` 的 `setCache` 改为增量持久化单条记录（`persistSingleCache`），避免每次写入全量 `JSON.stringify` 阻塞主线程
- **图表 memo 浅比较**: `LatencyHistoryChart` 的 `memo` 比较由全量 `JSON.stringify` 深比较改为引用/浅比较，降低重渲染开销

### Security
- **Webhook SSRF 防护**: `notification-platforms.ts` 新增 `isPrivateWebhookHost`，阻断发往 `localhost`/`127.x`/`10.x`/`192.168.x`/`172.16-31.x`/`169.254.x` 等内网/环回地址的 webhook
- **Webhook 正文截断**: `sendWebhookRequest` 对超长 payload 截断至 2000 字符，防止超大请求体被网关拒绝

### Refactor
- **模块拆分**: `notification.ts`(288→~120)、`ApiStatusGrid.tsx`(230→~120)、`useGeoLocation.ts`(242→~120) 分别抽离 `notification-platforms.ts`/`ApiStatusCard.tsx`/`geo-storage.ts`，均降至 200 行以内，保持对外 API 稳定
- **数据取默认值加固**: `metrics.ts` 移除 Supabase 字段 `as` 强转，改用类型守卫与默认值，避免 `undefined`/`NaN`
- **死代码清理**: 移除 `cache.ts` 永远返回 `null` 的 `getApiSpecificExpiry`

### Feat
- **语义化 id**: 为 `dashboard`/`status-section`/`provider-group-*`/`latency-section`/`hero`/`alerts-banner`/`app-header`/`app-footer`/`api-config`/`api-status-*` 等 UI 区块添加稳定 `id`，便于锚点与可访问性

### Test
- **补齐单元测试**: 新增 `api-config-validation`/`concurrency`/`metrics`/`cache`/`notification-platforms` 测试，覆盖率提升至 80%+

### Docs
- **版本同步**: `package.json`/`README`/`README_CN`/`openspec/config.yaml` 统一至 v2.8.2

## [2.8.1] - 2026-08-14

### Fixed
- **原型图表真实化**: 移除 Chart.js CDN 依赖，改用纯手写 SVG 渲染区域填充折线图，新增图例（可点击切换系列显隐）、hover tooltip 与垂直扫描线
- **时间范围真实差异**: `generateChartData` 按 24H/7D/30D 生成形态各异的真实延迟曲线（日内昼夜波动 / 周内工作日峰值 / 30 天趋势+尖峰），修复切换仅改按钮态的伪交互
- **离线语义修正**: 刷新时离线项保持低可用性、高错误率，不再被随机推高与"离线"语义冲突
- **同步时间戳**: 补 `last-sync-time` 节点，顶栏实时相对时间显示最后同步时刻
- **移动端分组**: 修复分组标题在窄屏 grid 断裂（`<div class="contents">` 占位无效），改用 `col-span-full` 分隔各组
- **组件库页补全**: `components.html` 补齐 Switch / Select / Input / Tabs / Avatar / Tooltip / Skeleton 展示，移除 Google Fonts 依赖改系统字体栈
- **无障碍增强**: 图表/对话框/切换按钮补充 `role`/`aria-*`/`aria-label`；tooltip 与图例过渡动画

## [2.8.0] - 2026-08-14

### Feat
- **原型重构**: 将 `prototype.html` 迁入 `prototype/` 目录并重构为组件化高保真原型
  - `index.html` — 仪表盘主原型（纯 HTML/CSS/JS，可浏览器直接打开）
  - `components.html` — 组件库规范展示页（色彩/字体/间距/基础·复合·业务组件）
  - `assets/styles.css` / `data.js` / `app.js` — 共享设计 token、真实模拟数据、交互逻辑
- **shadcn/ui 补齐**: 新增 `switch` / `select` / `tabs` 三个 new-york 风格基础组件，组件库扩展至 16 个

### Fixed
- **字体策略**: 移除 `next/font/google` 构建期网络拉取，改为 `style.css` 系统字体栈（CSS 变量），修复无外网环境构建失败
- **设计 token 对齐**: 统一 `@theme` 内 success/warning/error 色值（#22c55e / #f59e0b / #ef4444），补充 `--font-sans`/`--font-mono` 主题变量，消除与 `:root` 冗余定义冲突
- **原型缺陷修复**: 修复语言切换引用缺失元素、无效文本工具类、离线数据语义失真（availability 非 0）、延迟阈值与项目常量（1500ms）不一致等真实问题

### Docs
- **规范对齐**: 同步 `openspec/project.md`、`ui.md`、`design-system.md` 至 v2.8.0，更新组件清单（13→16）、字体策略与原型目录结构

## [2.7.2] - 2026-08-13

### Docs
- **社区健康文件**: 新增 GitHub Community Health Files
  - `LICENSE` — 补充缺失的 MIT 许可证（README 已声明）
  - `CODE_OF_CONDUCT.md` — Contributor Covenant 行为准则
  - `CONTRIBUTING.md` — 根目录贡献指南（链接并强化 `docs/contributing.md`）
  - `SECURITY.md` — 安全政策与漏洞私下报告流程
  - `SUPPORT.md` — 支持渠道与常见问题
  - `.github/PULL_REQUEST_TEMPLATE.md` — PR 模板
  - `.github/ISSUE_TEMPLATE/` — Bug Report / Feature Request / config 模板

### Refactored
- **模块化拆分**: 将超 200 行的源文件按职责拆分为更小模块，提升可读性与可维护性
  - `DashboardClient.tsx` → 抽离 `HeroSection` / `AlertsBanner` 子组件与 `useDashboardStats` hook
  - `ApiConfig.tsx` → 抽离 `api-config-validation.ts`（校验逻辑与类型）
  - `ApiStatusGrid.tsx` → 抽离 `ApiCard.tsx` 子组件
  - `useApiMonitor.ts` → 抽离 `supabase-mapping.ts`（数据映射）与 `alert-service.ts`（告警逻辑）
- **类型安全**: 移除 `metrics.ts` 中的 `any` 类型，改用显式 `Record` 映射

### Fixed
- **版本对齐**: 统一各模块头注释与 `package.json` 版本号

## [2.7.1] - 2026-08-13

### Docs
- **README 双语**: 修正运行模式说明——默认静态导出（`out/`）部署，Express `server.ts` 为可选的自定义安全服务器（Helmet 响应头 + 按 IP 速率限制），两者互斥。
- **README 双语**: 包管理器统一为 `pnpm`，修正 `.env.local` 配置流程，补充 `docs/` 文档链接与项目结构（`store/`、`constants/`、`types/` 目录与 `server.ts`）。
- **版本对齐**: 将文档与 `package.json` 版本号统一至代码实际版本 `v2.7.1`。
- **新增文档**: 新增 `docs/env.md`（环境变量参考）、`docs/deployment.md`（部署指南）、`docs/security.md`（安全架构）、`docs/contributing.md`（贡献指南）。
- **openspec**: 修正架构/功能文档版本号与运行模式描述，新增可选安全服务器说明。

### Fixed
- **README**: 修复部署小节中遗留的中英混排错误文本。

## [2.6.3] - 2026-06-10

### Changed
- **Documentation**: Updated README files to remove Firebase Hosting references (migrated to Supabase).
- **Project Structure**: Updated README project structure to reflect actual directory layout (removed server.ts).

### Removed
- **Firebase Legacy Files**: Deleted unused Firebase configuration files:
  - `firebase.json`
  - `firebase-applet-config.json`
  - `firebase-blueprint.json`
  - `firestore.rules`
- **Unused Server Files**: Deleted `server.ts` and `edgeone.config.js`.
- **Unused Metadata**: Deleted `metadata.json` and `LLM-API-Sentinel.code-workspace`.
- **Redundant Lock File**: Deleted `package-lock.json` (project uses pnpm).
- **Unused Components**: Deleted `StatusGrid.tsx` wrapper component and `use-mobile.ts` hook.
- **Build Scripts**: Removed `build:functions`, `deploy:functions`, and `serve:functions` scripts from package.json.

### Fixed
- **Test Configuration**: Removed `app/lib/error.test.ts` from Jest ignore patterns to enable test execution.
- **TypeScript Config**: Removed `functions` directory from tsconfig.json exclude patterns.
- **i18n Files**: Updated 16 language files to replace Firebase error messages with Supabase equivalents.
- **Error Handler**: Replaced FIREBASE enum values with SUPABASE in error-handler.ts.

## [2.6.2] - 2024-12-08

### Changed
- **Supabase Migration**: Replaced Firebase with Supabase for data storage and authentication.
  - Replaced Firebase Firestore with Supabase PostgreSQL
  - Replaced Firebase Authentication with Supabase Auth
  - Added Supabase Realtime subscriptions for live alert updates
- **Database Schema**: Created new PostgreSQL schema with tables for api_status, status_history, alerts, and user_profiles.
- **Security**: Implemented Row Level Security (RLS) policies for database access control.
- **Dependencies**: Updated package.json to include @supabase/supabase-js and removed Firebase dependencies.
- **Documentation**: Updated README files to reflect Supabase migration and new features.

### Fixed
- **Type Safety**: Fixed TypeScript error in useAuth.ts where `session.user.email` could be undefined.
- **Build Configuration**: Removed unused firebase.ts file that was causing build errors.
- **Supabase Client**: Fixed graceful handling of missing environment variables for Supabase client.
- **Code Quality**: Removed unused imports (Alert in useApiMonitor.ts, User in useAuth.ts).

### Added
- **Database Migration Script**: Added supabase/schema.sql with complete database setup.
- **Environment Configuration**: Created .env.example with Supabase configuration variables.
- **Version Consistency**: Unified all file version numbers to v2.6.2.

### Removed
- Firebase client and admin SDKs
- Legacy firebase.ts file (no longer imported)
- Firebase configuration files from main codebase

## [2.6.1]
### Added
- **Complete Internationalization System**: Implemented full i18n support with English and Chinese translations, integrated into all components.
- **Comprehensive Translation Files**: Added missing translation keys and updated all user-facing text to use the translation system.

### Improved
- **Component Localization**: Updated all UI components to use the i18n system for all text elements.
- **Version Consistency**: Unified all file version numbers to v2.6.1.

### Fixed
- **Code Quality**: Reviewed and fixed minor issues across the codebase.

## [2.5.1]
### Added
- **Firestore Direct Integration**: Frontend now directly reads API status from Firestore, eliminating dependency on API routes.
- **Enhanced Monitoring Hook**: useApiMonitor hook improved with intelligent alert checking.
- **Caching System**: Multi-layer caching with intelligent expiry calculation.

### Fixed
- **Documentation**: Removed internationalization references from README files.
- **README Cleanup**: Removed duplicate version sections from README.md.
- **Version Consistency**: Unified all file version numbers to v2.5.1.

## [2.5.0]
### Added
- **Data Caching**: Implemented memory and local storage caching for API check results, reducing duplicate requests.
- **Enhanced Monitoring Metrics**: Added error rate, availability, and uptime metrics for each API.
- **Alert Notifications**: Implemented email and SMS notification functionality for API alerts.
- **API Configuration**: Added user-friendly API configuration interface for customizing API checks.
- **Improved UI/UX**: Enhanced API status grid with provider grouping, better card design, and improved empty state handling.

### Changed
- **Version Sync**: Updated all component version numbers to v2.5.0.
- **API Configuration**: Modified APIS_TO_CHECK to load from local storage for persistent user configurations.

## [2.4.3]
### Fixed
- **Code Quality**: Comprehensive code review and bug fixes across all components.
- **i18n Integrity**: Verified and corrected all internationalization language files for complete translation coverage.
- **Spec Sync**: Synchronized all code functionality details to openspec documentation.
- **Version Coherence**: Unified all file version numbers to v2.4.3 for consistency.

## [2.4.1]
### Fixed
- **Build Configuration**: Renamed `next.config.js` to `next.config.mjs` to fix ES module scope error in CI environment.
- **Deprecated Config**: Removed deprecated `i18n` and `experimental.turbo` settings from next.config.mjs.

## [2.4.0]
### Added
- **Security Enhancements**: Added authorization to API health check endpoint.
- **Firebase Configuration**: Improved Firebase config loading to support environment variables.
- **Internationalization**: Completed translation files for Spanish and Arabic.

## [2.2.0]
### Added
- **Autonomous Monitoring**: Implemented a server-side background task that performs API checks every 5 minutes without user intervention.
- **Custom Server**: Migrated to a custom Express server to support long-running background tasks.
- **Firebase Admin**: Integrated `firebase-admin` for secure server-side Firestore updates.

## [2.1.0]
### Added
- **Real-time Alerting**: Implemented a notification system for API downtime and high latency (>1500ms).
- **Alerts UI**: Added a notification bell with dropdown and a global alert banner.
- **Alert Management**: Authenticated users can resolve active alerts.

## [2.0.1]
### Added
- **Security**: Hardened firestore.rules by restricting write access to admins only.
- **Robustness**: Fixed build errors related to Firebase Admin imports and FieldValue usage.
- **Versioning**: Synchronized version numbers across all files.

## [2.0.0]
### Added
- **Internationalization (i18n)**: Implemented multi-language support (ar, cs, en, es, hi, id, it, nl, pl, sv, th, tr, ru, vi, zh-cn, zh-tw) using `next-intl`.
- **Global API Coverage**: Added major AI providers from China (Moonshot, Zhipu, Baichuan, Alibaba, Tencent, Baidu) and US (Meta/Groq, Mistral).
- **Dark Mode**: Implemented full dark/light theme support with `next-themes`.
- **Responsive Design**: Optimized layout for desktop, tablet, and mobile devices.
- **GEO Info**: Added real-time geographic location detection for the monitoring node.
- **SEO Optimization**: Added comprehensive meta tags and OpenGraph support.
- **Semantic IDs**: Added unique IDs to all major containers for easier debugging.
- **Documentation**: Created bilingual README files (EN/CN).

### Changed
- **Refactoring**: Moved core logic directories (`lib`, `hooks`, `components`) into the `app/` directory for better structure.
- **Styling**: Extracted page-specific styles into `app/style.css`.
- **Headers**: Standardized all code file headers to a single-line format.

## [1.0.0]
### Added
- Initial release of LLM API Sentinel.
- Real-time status monitoring for OpenAI, Anthropic, Google, and DeepSeek.
- Historical latency tracking with Area Charts.
- Firebase integration for data persistence.
