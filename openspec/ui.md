# UI 组件库 (v4.0.5)

本项目使用 `shadcn/ui` 和 Tailwind CSS 4 构建组件，确保高度可定制和一致的视觉体验。

## 核心组件

### DashboardHeader (头部导航)
包含应用 Logo、语言切换器 (`LanguageSwitcher`)、主题切换器 (`ThemeProvider`)、告警下拉菜单 (`AlertsDropdown`) 以及用户下拉菜单 (`UserDropdown`)。

### ApiStatusGrid (状态网格)
以网格形式展示所有受监控 API 的实时状态卡片，支持响应式布局（移动端单列，桌面端多列）。

### LatencyHistoryChart (延迟历史图表)
使用 `Recharts` 渲染的交互式面积图，展示 API 过去一段时间的延迟和吞吐量趋势。已修复 `ResponsiveContainer` 在某些布局下的尺寸计算问题（通过添加 `min-h` 和 `relative` 定位）。

### MetricsComparisonChart (指标对比图表)
直观对比不同 API 的平均延迟、峰值延迟 (P95) 和平均吞吐量 (RPS)。

### ErrorBoundary (错误边界)
全局错误捕获组件，当子组件发生崩溃（如 Firestore 权限不足）时，显示带有错误详情和重试按钮的优雅降级 UI。

## 样式规范
- **颜色**: 严格依赖 Tailwind 主题变量（如 `bg-background`, `text-primary`, `border-border`），支持深色模式。
- **图标**: 统一使用 `lucide-react` 图标库。
- **动画**: 使用 `motion` (Framer Motion) 实现平滑的路由过渡和组件交互动画。
