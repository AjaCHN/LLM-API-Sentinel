# UI 组件规范文档

## 1. 设计原则

### 1.1 核心原则
| 原则 | 说明 |
|-----|------|
| **一致性** | 所有组件使用统一的设计语言和交互模式 |
| **响应式** | 适配桌面、平板、移动端设备 |
| **可访问性** | 支持键盘导航和屏幕阅读器 |
| **性能优先** | 优化渲染性能，减少不必要的重渲染 |
| **国际化** | 支持多语言切换 |

### 1.2 设计系统
- **样式框架**: Tailwind CSS 4.1.11
- **图标库**: Lucide React
- **颜色系统**: 自定义深色/浅色主题
- **动画**: CSS transitions + motion 库

## 2. 组件 API 规范

### 2.1 DashboardHeader

**功能**：显示品牌信息、告警铃铛、主题切换、地理位置、用户登录状态

**Props**：
```typescript
interface DashboardHeaderProps {
  user: User | null;
  alerts: Alert[];
  showAlerts: boolean;
  setShowAlerts: (show: boolean) => void;
  theme: string | undefined;
  setTheme: (theme: string) => void;
  geo: GeoLocation | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
}
```

**事件处理**：
| 事件 | 触发条件 | 处理函数 |
|-----|---------|---------|
| 点击告警铃铛 | 用户点击告警图标 | `setShowAlerts(!showAlerts)` |
| 点击主题切换 | 用户点击主题图标 | `setTheme(theme === 'dark' ? 'light' : 'dark')` |
| 点击登录 | 用户点击登录按钮 | `login()` |
| 点击登出 | 用户点击登出按钮 | `logout()` |

### 2.2 StatusGrid

**功能**：以网格形式展示所有 API 状态卡片，支持供应商分组

**Props**：
```typescript
interface StatusGridProps {
  statuses: ApiStatus[];
}
```

**内部结构**：
```
StatusGrid
├── Provider Group (按 provider 分组)
│   ├── Provider Header (provider 名称)
│   └── ApiCard (API 状态卡片)
└── Empty State (无数据时显示)
```

### 2.3 ApiStatusGrid

**功能**：旧版状态网格组件，保留用于兼容性

**Props**：
```typescript
interface ApiStatusGridProps {
  statuses: ApiStatus[];
}
```

### 2.4 ApiCard (内部组件)

**功能**：单个 API 状态卡片，显示状态、延迟、指标等信息

**Props**：
```typescript
interface ApiCardProps {
  status: ApiStatus;
  color: string;
}
```

**显示内容**：
| 元素 | 显示条件 | 说明 |
|-----|---------|------|
| 状态标签 | 始终显示 | online/green, offline/red, degraded/yellow |
| 延迟数值 | 始终显示 | 单位 ms |
| 延迟进度条 | 始终显示 | 超过阈值变橙色 |
| 错误率 | `errorRate !== undefined` | 显示百分比 |
| 可用性 | `availability !== undefined` | 显示百分比 |
| 重试次数 | `retries > 0` | 显示警告图标 |

### 2.5 LatencyHistoryChart

**功能**：使用 Recharts AreaChart 展示历史延迟数据

**Props**：
```typescript
interface LatencyHistoryChartProps {
  chartData: ChartDataPoint[];
  statuses: ApiStatus[];
  getApiColor: (id: string) => string;
}
```

**性能优化**：
- 限制显示最近 50 个数据点
- 使用 React.memo 避免不必要重渲染
- 使用 useMemo 缓存图表配置

### 2.6 AlertsDropdown

**功能**：显示活跃告警列表，支持告警解决

**Props**：
```typescript
interface AlertsDropdownProps {
  alerts: Alert[];
  show: boolean;
  onClose: () => void;
  resolveAlert: (id: string) => void;
}
```

**告警严重程度样式**：
| 严重程度 | 颜色 | 图标 |
|---------|------|------|
| `critical` | 红色 | AlertTriangle |
| `high` | 红色 | AlertTriangle |
| `medium` | 橙色 | AlertTriangle |
| `low` | 蓝色 | Info |

### 2.7 ApiConfig

**功能**：允许用户自定义 API 检查配置

**Props**：无

**功能特性**：
- 从 localStorage 加载配置
- 支持添加/删除 API
- 支持重置为默认配置
- 配置变更后自动保存

### 2.8 ThemeProvider

**功能**：管理深色/浅色主题切换

**Props**：继承 `NextThemesProvider`

**配置选项**：
```typescript
{
  attribute: "class",
  defaultTheme: "system",
  enableSystem: true,
  disableTransitionOnChange: true
}
```

## 3. 样式规范

### 3.1 颜色系统

#### 浅色主题
| 颜色变量 | 值 | 用途 |
|---------|---|------|
| `--background` | #E4E3E0 | 页面背景 |
| `--foreground` | #141414 | 文字颜色 |
| `--card` | #FFFFFF | 卡片背景 |
| `--card-foreground` | #141414 | 卡片文字 |
| `--primary` | #141414 | 主色调 |
| `--primary-foreground` | #E4E3E0 | 主色文字 |
| `--muted` | #F4F4F5 | 次要背景 |
| `--muted-foreground` | #71717A | 次要文字 |
| `--border` | #141414 | 边框 |
| `--destructive` | #EF4444 | 错误/删除 |

#### 深色主题
| 颜色变量 | 值 | 用途 |
|---------|---|------|
| `--background` | #0C0C0C | 页面背景 |
| `--foreground` | #E4E3E0 | 文字颜色 |
| `--card` | #141414 | 卡片背景 |
| `--card-foreground` | #E4E3E0 | 卡片文字 |
| `--primary` | #E4E3E0 | 主色调 |
| `--primary-foreground` | #141414 | 主色文字 |
| `--muted` | #27272A | 次要背景 |
| `--muted-foreground` | #A1A1AA | 次要文字 |
| `--border` | #E4E3E0 | 边框 |
| `--destructive` | #7F1D1D | 错误/删除 |

### 3.2 间距系统

| 间距 | Tailwind 类 | 像素值 | 用途 |
|-----|-----------|-------|------|
| xs | `p-1` | 4px | 小元素间距 |
| sm | `p-2` | 8px | 紧凑间距 |
| md | `p-3` | 12px | 默认间距 |
| lg | `p-4` | 16px | 较大间距 |
| xl | `p-6` | 24px | 大间距 |
| 2xl | `p-8` | 32px | 极大间距 |

### 3.3 字体系统

| 字体 | 变量 | 用途 |
|-----|------|------|
| Inter | `--font-sans` | 正文、标题 |
| JetBrains Mono | `--font-mono` | 代码、时间显示 |

**字体大小**：
| 大小 | Tailwind | 像素 | 用途 |
|-----|---------|-----|------|
| 9px | `text-[9px]` | 9px | 极小号文字 |
| 10px | `text-[10px]` | 10px | 小号标签 |
| 11px | `text-[11px]` | 11px | 辅助文字 |
| 12px | `text-xs` | 12px | 小文字 |
| 14px | `text-sm` | 14px | 正文 |
| 16px | `text-base` | 16px | 基础文字 |
| 18px | `text-lg` | 18px | 小标题 |
| 20px | `text-xl` | 20px | 标题 |
| 24px | `text-2xl` | 24px | 大标题 |

### 3.4 圆角系统

| 圆角 | Tailwind | 像素 | 用途 |
|-----|---------|-----|------|
| 无 | `rounded-none` | 0 | 直角 |
| sm | `rounded-sm` | 4px | 小圆角 |
| md | `rounded-md` | 6px | 默认圆角 |
| lg | `rounded-lg` | 8px | 较大圆角 |
| full | `rounded-full` | 50% | 圆形 |

### 3.5 阴影系统

| 阴影 | Tailwind | 效果 | 用途 |
|-----|---------|------|------|
| sm | `shadow-sm` | 轻微阴影 | 卡片悬停 |
| md | `shadow-md` | 中等阴影 | 卡片默认 |
| lg | `shadow-lg` | 较大阴影 | 弹窗 |

## 4. 交互规范

### 4.1 按钮交互

**状态样式**：
| 状态 | 样式 |
|-----|------|
| 默认 | 背景透明，边框 |
| 悬停 | 背景色反转，文字色反转 |
| 禁用 | 透明度降低，cursor not-allowed |
| 加载 | 显示加载状态，禁用点击 |

**按钮类型**：
| 类型 | 样式 | 用途 |
|-----|------|------|
| 主按钮 | 实心背景 | 主要操作 |
| 次按钮 | 边框样式 | 次要操作 |
| 危险按钮 | 红色样式 | 删除/危险操作 |

### 4.2 卡片交互

**状态样式**：
| 状态 | 样式 |
|-----|------|
| 默认 | 边框半透明 |
| 悬停 | 边框高亮，阴影增强 |
| 选中 | 边框颜色变化 |

### 4.3 表单交互

**输入框状态**：
| 状态 | 样式 |
|-----|------|
| 默认 | 边框默认色 |
| 聚焦 | 边框高亮，ring 效果 |
| 错误 | 边框红色 |
| 成功 | 边框绿色 |

**表单验证**：
- 实时验证：输入时即时反馈
- 提交验证：提交前完整验证
- 错误提示：清晰的错误信息

### 4.4 动画效果

**过渡动画**：
| 动画 | 时长 | 用途 |
|-----|------|------|
| 颜色过渡 | 300ms | 主题切换、悬停效果 |
| 位置过渡 | 200ms | 卡片移动、弹窗显示 |
| 淡入淡出 | 500ms | 页面加载、元素显示 |

**微动画**：
- 告警数量徽章：脉冲动画
- 按钮悬停：缩放效果
- 图表数据更新：平滑过渡

## 5. 响应式规范

### 5.1 断点定义

| 断点 | Tailwind | 屏幕宽度 | 设备类型 |
|-----|---------|---------|---------|
| sm | `sm:` | ≥640px | 手机横屏 |
| md | `md:` | ≥768px | 平板 |
| lg | `lg:` | ≥1024px | 小桌面 |
| xl | `xl:` | ≥1280px | 桌面 |

### 5.2 布局适配

#### DashboardHeader
| 断点 | 布局 |
|-----|------|
| <640px | 垂直排列，品牌在上，控制在下 |
| ≥640px | 水平排列，品牌在左，控制在右 |

#### StatusGrid
| 断点 | 列数 |
|-----|------|
| <640px | 1 列 |
| 640px-768px | 2 列 |
| 768px-1024px | 3 列 |
| ≥1024px | 4 列 |

#### LatencyHistoryChart
| 断点 | 高度 |
|-----|------|
| <640px | 200px |
| ≥640px | 250px |
| ≥1024px | 350px |

### 5.3 内容适配

| 元素 | 移动端 | 桌面端 |
|-----|------|------|
| 地理位置 | 隐藏 | 显示 |
| 用户信息 | 仅显示头像/按钮 | 显示完整信息 |
| 告警横幅 | 简化文案 | 完整文案 |
| 图表图例 | 水平滚动 | 正常显示 |

## 6. 国际化规范

### 6.1 翻译文件结构

```
locales/
├── en.json    # 英文
└── zh-cn.json # 中文
```

### 6.2 翻译 Key 命名

| 前缀 | 用途 |
|-----|------|
| `dashboard.` | 仪表盘相关 |
| `api.` | API 状态相关 |
| `alerts.` | 告警相关 |
| `config.` | 配置相关 |
| `errors.` | 错误信息 |
| `history.` | 历史数据相关 |

### 6.3 翻译最佳实践

- 保持翻译 Key 简洁
- 使用点分隔层级
- 支持复数形式
- 避免硬编码字符串
- 使用模板字符串支持动态内容

## 7. 可访问性规范

### 7.1 ARIA 属性

| 组件 | ARIA 属性 | 说明 |
|-----|---------|------|
| 按钮 | `role="button"` | 按钮角色 |
| 卡片 | `role="region"` | 区域角色 |
| 告警 | `role="alert"` | 告警角色 |
| 下拉菜单 | `role="menu"` | 菜单角色 |
| 状态标签 | `aria-label` | 状态描述 |

### 7.2 键盘导航

| 按键 | 功能 |
|-----|------|
| Tab | 焦点切换 |
| Enter | 激活按钮/链接 |
| Escape | 关闭弹窗/下拉 |
| Arrow keys | 导航下拉菜单 |

### 7.3 颜色对比度

- 文本与背景对比度 ≥ 4.5:1
- 大文本对比度 ≥ 3:1
- 按钮文字对比度 ≥ 4.5:1

## 8. 组件使用示例

### 8.1 基本布局

```tsx
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  <DashboardHeader 
    user={user}
    alerts={alerts}
    showAlerts={showAlerts}
    setShowAlerts={setShowAlerts}
    theme={theme}
    setTheme={setTheme}
    geo={geo}
    login={login}
    logout={logout}
    resolveAlert={resolveAlert}
  />
  
  <main className="p-4 md:p-6 max-w-7xl mx-auto">
    <StatusGrid statuses={statuses} />
    <LatencyHistoryChart 
      chartData={chartData} 
      statuses={statuses} 
      getApiColor={getApiColor} 
    />
  </main>
  
  <DashboardFooter />
</ThemeProvider>
```

### 8.2 API 状态卡片

```tsx
<div className="group rounded-lg bg-card border border-border/20 hover:border-border/50 transition-all">
  <div className="p-4">
    <div className="flex items-center justify-between">
      <h3 className="font-medium">{api.name}</h3>
      <span className={`px-3 py-1 rounded-full text-xs ${statusClass}`}>
        {statusText}
      </span>
    </div>
    <div className="mt-4">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>延迟</span>
        <span className={latencyClass}>{api.latency}ms</span>
      </div>
      <div className="h-1.5 w-full bg-muted rounded-full mt-1">
        <div 
          className={progressClass}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </div>
  </div>
</div>
```

### 8.3 告警下拉菜单

```tsx
{show && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-bold">活跃告警</h3>
        <button onClick={onClose} className="text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
          <p className="text-sm text-muted-foreground">暂无活动告警</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => (
            <div key={alert.id} className="border border-border rounded-md p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{alert.apiName}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
                <button onClick={() => resolveAlert(alert.id)}>
                  解决
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
)}
```