# UI 组件库

本项目使用 Tailwind CSS 4 构建组件，结合 Lucide React 图标库。

## DashboardHeader (头部组件)
显示品牌信息、告警铃铛、主题切换、地理位置、用户登录状态。

```tsx
// app/components/DashboardHeader.tsx
export default function DashboardHeader({ 
  user, 
  alerts, 
  showAlerts, 
  setShowAlerts, 
  theme, 
  setTheme, 
  geo, 
  login, 
  logout, 
  resolveAlert 
}) {
  return (
    <header className="flex justify-between p-4 border-b">
      <h1 className="text-xl font-bold">LLM Sentinel</h1>
      {/* 告警铃铛、主题切换、地理位置、登录按钮 */}
    </header>
  );
}
```

## StatusGrid (状态网格)
以网格形式展示所有 API 状态卡片，支持在线/离线/延迟过高三种状态显示。使用颜色区分：绿色(在线)、红色(离线)、橙色(延迟过高)。

```tsx
// app/components/StatusGrid.tsx
export default function StatusGrid({ statuses }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statuses.map(s => <StatusCard key={s.id} status={s} />)}
    </div>
  );
}
```

## ApiStatusGrid (旧版状态网格)
保留用于兼容性，新功能使用 StatusGrid。

## ApiConfig (API 配置组件)
允许用户自定义 API 检查配置，配置持久化到本地存储。

```tsx
// app/components/ApiConfig.tsx
export default function ApiConfig() {
  // 管理用户自定义的 API 配置
  // 支持添加、编辑、删除 API
  // 配置保存到 localStorage
}
```

## LatencyHistoryChart (延迟历史图表)
使用 Recharts AreaChart 展示历史延迟数据，限制显示最近 50 个数据点以优化性能。

```tsx
// app/components/LatencyHistoryChart.tsx
export default function LatencyHistoryChart({ chartData, statuses, getApiColor }) {
  return (
    <div className="h-64 w-full">
      <AreaChart data={chartData}>
        {/* 图表内容 */}
      </AreaChart>
    </div>
  );
}
```

## AlertsDropdown (告警下拉)
显示活跃告警列表，支持告警标记为已解决，根据严重程度显示不同颜色。

```tsx
// app/components/AlertsDropdown.tsx
export default function AlertsDropdown({ alerts, resolveAlert, onClose }) {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded shadow-lg">
      {/* 告警列表 */}
    </div>
  );
}
```

## ThemeProvider (主题提供者)
使用 next-themes 管理深色/浅色主题切换，支持系统主题自动检测。

```tsx
// app/components/ThemeProvider.tsx
export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider {...props}>
      {children}
    </NextThemesProvider>
  );
}
```

## DashboardFooter (页脚)
显示全局覆盖、自适应 UI、数据完整性等特性说明。

## 通用组件样式指南
- 使用 Tailwind CSS 4 utility-first 样式
- 支持深色/浅色主题切换
- 响应式设计，适配桌面、平板、移动端
- 动画效果使用 motion 库
