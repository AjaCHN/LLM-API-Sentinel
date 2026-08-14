# Changelog

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
