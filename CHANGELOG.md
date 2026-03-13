# Changelog

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
