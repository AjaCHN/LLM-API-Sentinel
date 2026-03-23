# Changelog

## [3.4.7]
### Added
- **Internationalization (i18n)**: Checked and completed all language files for 20+ languages.
- **Robustness**: Added error handling for undefined throughput in metrics calculation and chart rendering.
- **Documentation**: Updated README.md, README_CN.md, and openspec/features.md with new features.
- **Versioning**: Synchronized version numbers across all code files to v3.4.7.

## [3.4.6]
### Fixed
- **Firestore Permissions**: 移除了客户端 `useDashboardData` 中错误的 Firestore 写操作，API 状态更新现完全由服务器端处理，解决了 `Missing or insufficient permissions` 错误。

## [3.4.5]
### Fixed
- **Firebase Initialization**: 修复了 Firestore 持久化离线状态错误，将 Firebase 配置源从环境变量切换为 `firebase-applet-config.json`，确保了配置的准确性与实时同步。

## [3.4.4]
### Fixed
- **Static Asset Loading**: 移除了自定义服务器中错误的静态文件路由配置，交由 Next.js 内置处理器处理，修复了 `Uncaught SyntaxError: Unexpected token '<'` 错误。

## [3.4.3]
### Added
- **Language Switcher**: 在顶部导航栏新增了中英文语言切换功能。

## [3.4.2]
### Added
- **Localization**: 完善了 Profile 和 Settings 页面的中英文翻译，补全了相关语言包。

## [3.4.1]
### Fixed
- **Firestore Connectivity**: 简化了 Firestore 初始化配置，移除了可能导致冲突的实验性标志，并增强了配置校验逻辑。

## [3.4.0]
### Fixed
- **Firestore Connectivity**: 进一步优化了 Firestore 初始化配置，增加了 `useFetchStreams: false` 以提高在容器化环境中的连接稳定性。
- **Diagnostics**: 增强了连接测试逻辑，增加了详细的配置状态检查日志，帮助定位 Secrets 配置问题。

## [3.3.9]
### Added
- **User Profile**: 新增了详细的个人资料页面 (`/profile`)，展示账户详情、加入时间及地理位置。
- **User Options**: 引入了 `UserDropdown` 组件，集成个人资料、设置与退出登录入口，提升用户体验。
- **Settings**: 新增了设置页面 (`/settings`)，支持用户自定义告警阈值、刷新频率及通知偏好。
- **Persistence**: 用户偏好设置现在持久化存储在 Firestore 的 `user_preferences` 集合中。

## [3.3.8]
### Fixed
- **Firebase Initialization**: 修复了 `experimentalForceLongPolling` 和 `experimentalAutoDetectLongPolling` 不能同时使用的配置冲突错误。

## [3.3.7]
### Fixed
- **Firestore Connectivity**: 增加了重试机制和配置脱敏显示。
- **Robustness**: 优化了初始化配置，增加了对 `window` 的检查，以确保连接验证仅在客户端执行。

## [3.3.6]
### Fixed
- **Firestore Connectivity**: 增加了对 Firebase 配置完整性的检查。
- **Stability**: 在 Firestore 初始化中禁用了 `useFetchStreams`，并增加了配置缺失的详细错误提示，以解决“客户端离线”问题。

## [3.3.5]
### Fixed
- **Firestore Connectivity**: Improved error logging for `NOT_FOUND` issues. The `testConnection` function now explicitly reports the current Project ID and Database ID when a connection fails, helping users identify misconfigured Secrets in AI Studio.

## [3.3.4]
### Fixed
- **Preview 404s**: Moved `page.tsx` and `layout.tsx` to `app/[locale]` directory to correctly align with `next-intl` routing, resolving 404 errors in the preview environment.

## [3.3.3]
### Fixed
- **Preview 404s**: Re-added explicit static file serving (`/_next/static`, `/public`) in `server.ts` to ensure assets load correctly in the preview iframe.

## [3.3.2]
### Refactored
- **Codebase**: Split `useDashboardData.ts` into `useAuth.ts`, `useTasks.ts`, and `firestoreUtils.ts` to improve maintainability and reduce file size.

## [3.3.1]
### Fixed
- **Root Layout Rendering**: Removed `notFound()` call from `i18n/request.ts` to prevent rendering errors in the root layout. Now defaults to English locale when an invalid locale is encountered.

## [3.3.0]
### Fixed
- **Custom Domain 404s**: Enhanced `server.ts` with explicit static file serving for `_next/static` and `public` folders. Added request logging for better diagnostics.

## [3.2.0]
### Fixed
- **Root Layout Error**: Removed `notFound()` call from `app/layout.tsx` which is not allowed in Next.js root layouts. Simplified message loading logic.

## [3.1.0]
### Fixed
- **next-intl Configuration**: Fixed "Couldn't find next-intl config file" error by correctly configuring `next-intl/plugin` in `next.config.ts` and moving the configuration to the standard `i18n/request.ts` path.
- **Recovery**: Restored `app/page.tsx` which was accidentally deleted.

## [3.0.0]
### Changed
- **URL Cleanup**: Removed locale prefix from URLs (e.g., `/en/` -> `/`). Multi-language support is now handled via cookies/headers without cluttering the URL.
- **Project Structure**: Moved routes from `app/[locale]` to root `app` directory for cleaner architecture.

## [2.6.0]
### Fixed
- **SDK Log Suppression**: Set Firestore log level to `error` to suppress internal SDK logs regarding transient stream cancellations (`CANCELLED: Disconnecting idle stream`). This ensures the console remains clean while still reporting critical failures.

## [2.5.0]
### Fixed
- **Log Noise Reduction**: Updated `handleFirestoreError` to explicitly suppress `CANCELLED` and `idle stream` logs in the console. These are transient SDK behaviors that don't impact functionality but create log clutter.

## [2.4.0]
### Fixed
- **Firestore Stability**: Forced long polling and disabled auto-detection to prevent `CANCELLED: Disconnecting idle stream` errors in containerized environments.
- **Error Handling**: Refined `handleFirestoreError` to suppress transient SDK-internal logs while maintaining visibility for critical security/quota errors.

## [2.3.0]
### Added
- **Task Management**: Implemented a comprehensive task status feature (todo, inProgress, done) with real-time Firestore sync.
- **Security Rules**: Hardened Firestore rules with domain-specific validators and strict schema enforcement.
- **Error Boundaries**: Added global React Error Boundary to catch and display detailed Firestore permission errors.

## [2.1.0]
### Added
- **Custom Check Strategy**: Added support for custom intervals and check strategies (ping vs full request) per API.
- **Throughput Tracking**: Added calculation and visualization for API throughput (requests per second).
- **External Alerts**: Integrated Nodemailer and Axios to send alerts via Email and Enterprise WeChat when availability drops below 95%.

## [2.0.2]
### Changed
- **Configuration**: Moved Firebase configuration from `firebase-applet-config.json` to environment variables for better security and flexibility.

## [2.0.1]
### Added
- **Security**: Hardened firestore.rules by restricting write access to admins only.
- **Robustness**: Fixed build errors related to Firebase Admin imports and FieldValue usage.
- **Versioning**: Synchronized version numbers across all files.

## [2.0.0]
### Added
- **Internationalization (i18n)**: Implemented multi-language support (ar, cs, en, es, hi, id, it, nl, pl, sv, th, tr, ru, vi, zh-cn, zh-tw) using `next-intl`.

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

## [2.0.0]
### Added
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
