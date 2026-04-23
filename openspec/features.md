# Features Specification

## 2.4.3
### Added
- **Smart Alerting System**: Implemented intelligent alert rules that check for existing unresolved alerts of the same type before creating new ones.
- **Alert Severity Levels**: Added dynamic severity assessment based on latency values (low: >1500ms, medium: >2250ms, high: >3000ms).
- **Performance Optimizations**: 
  - Frontend: Added React.memo for components and useMemo for cached calculations
  - Frontend: Limited chart data points to 50 for better rendering performance
  - Frontend: Implemented 24-hour local cache for geographic location data
  - Backend: Added concurrent request limiting (MAX_CONCURRENT = 5)
  - Backend: Implemented API check retry mechanism with exponential backoff
  - Backend: Optimized Firestore operations with batch writes

### Fixed
- **Code Quality**: Comprehensive code review and bug fixes across all components.
- **i18n Integrity**: Verified and corrected all internationalization language files for complete translation coverage.
- **Spec Sync**: Synchronized all code functionality details to openspec documentation.
- **Version Coherence**: Unified all file version numbers to v2.4.3 for consistency.
- **Project Naming**: Updated package.json name from "ai-studio-applet" to "llm-api-sentinel" for consistency.

## 2.4.2
### Fixed
- **Version Sync**: Unified all file version numbers to v2.4.2 for consistency.
- **i18n Files**: Updated language files with correct version in subtitles.

## 2.4.1
### Fixed
- **Build Configuration**: Renamed `next.config.js` to `next.config.mjs` to fix ES module scope error in CI environment.
- **Deprecated Config**: Removed deprecated `i18n` and `experimental.turbo` settings from next.config.mjs.

## 2.4.0
### Added
- **Security Enhancements**: Added authorization to API health check endpoint.
- **Firebase Configuration**: Improved Firebase config loading to support environment variables.
- **Internationalization**: Completed translation files for Spanish and Arabic.

## 2.2.0
### Added
- **Autonomous Monitoring**: Implemented a server-side background task that performs API checks every 5 minutes without user intervention.
- **Custom Server**: Migrated to a custom Express server to support long-running background tasks.
- **Firebase Admin**: Integrated `firebase-admin` for secure server-side Firestore updates.

## 2.1.0
### Added
- **Real-time Alerting**: Implemented a notification system for API downtime and high latency (>1500ms).
- **Alerts UI**: Added a notification bell with dropdown and a global alert banner.
- **Alert Management**: Authenticated users can resolve active alerts.

## 2.0.1
- **Security**: Hardened firestore.rules by restricting write access to admins only.
- **Robustness**: Fixed build errors related to Firebase Admin imports and FieldValue usage.
- **Versioning**: Synchronized version numbers across all files.

## 2.0.0
- **Global API Coverage**: Added major AI providers from China (Moonshot, Zhipu, Baichuan, Alibaba, Tencent, Baidu) and US (Meta/Groq, Mistral).
- **Dark Mode**: Implemented full dark/light theme support with `next-themes`.
- **Responsive Design**: Optimized layout for desktop, tablet, and mobile devices.
- **GEO Info**: Added real-time geographic location detection for the monitoring node.
- **SEO Optimization**: Added comprehensive meta tags and OpenGraph support.
- **Semantic IDs**: Added unique IDs to all major containers for easier debugging.
- **Documentation**: Created bilingual README files (EN/CN).
