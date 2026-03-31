# UI 组件库

本项目使用 `shadcn/ui` 和 Tailwind CSS 构建组件。

## DashboardHeader (头部组件)
```tsx
// app/components/DashboardHeader.tsx
export default function DashboardHeader({ user, alerts, ... }) {
  return (
    <header className="flex justify-between p-4 border-b">
      <h1 className="text-xl font-bold">LLM Sentinel</h1>
      {/* ... */}
    </header>
  );
}
```

## ApiStatusGrid (状态网格)
```tsx
// app/components/ApiStatusGrid.tsx
export default function ApiStatusGrid({ statuses }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statuses.map(s => <StatusCard key={s.id} status={s} />)}
    </div>
  );
}
```

## AlertsDropdown (告警下拉组件)
```tsx
// app/components/AlertsDropdown.tsx
export default function AlertsDropdown({ alerts, onClose, onResolve }: { alerts: Alert[], onClose: () => void, onResolve: (id: string) => void }) {
  return (
    <div id="alerts-dropdown" className="absolute right-0 mt-2 w-72 sm:w-80 bg-card border border-border rounded-lg shadow-xl z-50 overflow-hidden">
      <div className="p-3 border-b border-border flex justify-between items-center bg-card/80">
        <span className="text-[10px] font-bold uppercase tracking-widest">Active Alerts</span>
        <button onClick={onClose} className="opacity-50 hover:opacity-100"><X className="w-4 h-4" /></button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {/* 告警列表或空状态 */}
      </div>
    </div>
  );
}
```
