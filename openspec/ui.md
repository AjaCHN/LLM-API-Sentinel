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
