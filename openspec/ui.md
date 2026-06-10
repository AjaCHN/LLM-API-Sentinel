# UI 组件规范文档 (v2.6.3 - Apple Style)

## 1. 设计原则

### 1.1 核心原则
参考 Apple 官网 (apple.com.cn) 的设计风格，强调：

| 原则 | 说明 |
|-----|------|
| **极简主义** | 大量留白、清晰层次、去除冗余元素 |
| **大图展示** | Hero 区域采用全屏标题布局 |
| **清晰层次** | 通过间距、大小、颜色建立视觉层级 |
| **一致性** | 所有组件使用统一的设计语言和交互模式 |
| **响应式** | 适配桌面、平板、移动端设备 |
| **可访问性** | 支持键盘导航和屏幕阅读器 |
| **性能优先** | 优化渲染性能，减少不必要的重渲染 |
| **国际化** | 支持多语言切换 |

### 1.2 设计系统
- **样式框架**: Tailwind CSS 4.1.11
- **图标库**: Lucide React
- **颜色系统**: Apple 风格深色/浅色主题
- **动画**: 平滑 CSS transitions

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

**设计特点**：
- 大量留白 (px-6 md:px-10 lg:px-16)
- 圆角按钮 (rounded-2xl)
- 毛玻璃效果 (backdrop-blur-xl)
- 简洁的控制按钮

### 2.2 ApiStatusGrid

**功能**：以网格形式展示所有 API 状态卡片，支持供应商分组

**Props**：
```typescript
interface ApiStatusGridProps {
  statuses: ApiStatus[];
}
```

**内部结构**：
```
ApiStatusGrid
├── Provider Group (按 provider 分组)
│   ├── Provider Header (provider 名称 + 图标)
│   └── ApiCard (API 状态卡片)
└── Empty State (无数据时显示)
```

**设计特点**：
- Apple 风格圆角卡片 (rounded-3xl)
- 状态圆点指示器 (status-dot)
- 悬停效果 (apple-card)
- 交错动画入场

### 2.3 LatencyHistoryChart

**功能**：使用 Recharts AreaChart 展示历史延迟数据

**Props**：
```typescript
interface LatencyHistoryChartProps {
  chartData: ChartDataPoint[];
  statuses: ApiStatus[];
  getApiColor: (id: string) => string;
}
```

**设计特点**：
- 圆角容器 (rounded-3xl)
- 柔和的网格线
- Apple 风格 Tooltip

### 2.4 AlertsDropdown

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
| 严重程度 | 颜色 |
|---------|------|
| `critical` | #FF3B30 |
| `high` | #FF3B30 |
| `medium` | #FF9500 |
| `low` | #007AFF |

### 2.5 ApiConfig

**功能**：允许用户自定义 API 检查配置

**Props**：无

### 2.6 ThemeProvider

**功能**：管理深色/浅色主题切换

## 3. 样式规范

### 3.1 颜色系统

#### 浅色主题 (Apple Style)
| 颜色变量 | 值 | 用途 |
|---------|---|------|
| `--background` | #F5F5F7 | 页面背景 |
| `--foreground` | #1D1D1F | 文字颜色 |
| `--card` | #FFFFFF | 卡片背景 |
| `--card-foreground` | #1D1D1F | 卡片文字 |
| `--primary` | #007AFF | 主色调 (Apple Blue) |
| `--primary-foreground` | #FFFFFF | 主色文字 |
| `--secondary` | #FFFFFF | 次要背景 |
| `--muted` | #F5F5F7 | 次要背景 |
| `--muted-foreground` | #86868B | 次要文字 |
| `--border` | #D1D1D6 | 边框 |
| `--success` | #34C759 | 成功/在线状态 |
| `--warning` | #FF9500 | 警告/降级状态 |
| `--error` | #FF3B30 | 错误/离线状态 |

#### 深色主题 (Apple Style)
| 颜色变量 | 值 | 用途 |
|---------|---|------|
| `--background` | #000000 | 页面背景 |
| `--foreground` | #FFFFFF | 文字颜色 |
| `--card` | #1C1C1E | 卡片背景 |
| `--card-foreground` | #FFFFFF | 卡片文字 |
| `--primary` | #0A84FF | 主色调 (Apple Blue Dark) |
| `--primary-foreground` | #000000 | 主色文字 |
| `--secondary` | #1C1C1E | 次要背景 |
| `--muted` | #1C1C1E | 次要背景 |
| `--muted-foreground` | #98989D | 次要文字 |
| `--border` | #38383A | 边框 |
| `--success` | #30D158 | 成功/在线状态 |
| `--warning` | #FF9F0A | 警告/降级状态 |
| `--error` | #FF453A | 错误/离线状态 |

### 3.2 圆角系统 (Apple Style)

| 圆角 | Tailwind | 像素 | 用途 |
|-----|---------|-----|------|
| 2xl | `rounded-2xl` | 20px | 按钮、小组件 |
| 3xl | `rounded-3xl` | 28px | 卡片、面板 |
| full | `rounded-full` | 50% | 状态圆点、标签 |

### 3.3 间距系统 (Apple Style)

| 间距 | Tailwind | 像素值 | 用途 |
|-----|-----------|-------|------|
| sm | `gap-3` | 12px | 小间距 |
| md | `gap-5` | 20px | 默认间距 |
| xl | `gap-10` | 40px | 大间距 |
| section | `space-y-12` | 48px | Section 分隔 |

### 3.4 字体系统

| 字体 | 变量 | 用途 |
|-----|------|------|
| Inter | `--font-sans` | 正文、标题 |
| SF Mono | `--font-mono` | 代码、时间显示 |

**字体大小**：
| 大小 | Tailwind | 像素 | 用途 |
|-----|---------|-----|------|
| 10px | `text-[10px]` | 10px | 标签、辅助文字 |
| 14px | `text-sm` | 14px | 正文 |
| 16px | `text-base` | 16px | 基础文字 |
| 18px | `text-lg` | 18px | 小标题 |
| 24px | `text-2xl` | 24px | 标题 |
| 36px+ | `text-4xl/5xl/6xl` | 36px+ | Hero 标题 |

### 3.5 阴影系统

| 阴影 | 效果 | 用途 |
|-----|------|------|
| hover | 0 20px 40px rgba(0, 0, 0, 0.08) | 卡片悬停 |

## 4. 交互规范

### 4.1 Apple 风格按钮

**CSS 类**: `apple-button`

**状态样式**：
| 状态 | 样式 |
|-----|------|
| 默认 | 背景填充色 |
| 悬停 | 轻微透明度变化 |
| 点击 | 轻微缩放 (scale 0.96) |
| 禁用 | 透明度 0.5，cursor not-allowed |

**按钮类型**：
| 类型 | 样式 | 用途 |
|-----|------|------|
| 主按钮 | `bg-primary text-primary-foreground` | 主要操作 |
| 次按钮 | `bg-secondary hover:bg-muted` | 次要操作 |
| 危险按钮 | `bg-error text-white` | 危险操作 |

### 4.2 Apple 风格卡片

**CSS 类**: `apple-card`

**状态样式**：
| 状态 | 样式 |
|-----|------|
| 默认 | 细边框、圆角、无阴影 |
| 悬停 | 向上平移 6px、阴影增强 |

### 4.3 状态圆点指示器

**CSS 类**: `status-dot`

**功能**：
- 圆点状态指示
- 脉冲动画效果 (pulse-gentle)
- 外层光晕扩展

### 4.4 动画效果

**过渡动画**：
| 动画 | 时长 | 缓动 | 用途 |
|-----|------|------|------|
| 颜色过渡 | 500ms | cubic-bezier(0.4, 0, 0.2, 1) | 主题切换 |
| 位置过渡 | 350ms | cubic-bezier(0.25, 0.1, 0.25, 1) | 卡片移动 |
| 淡入上移 | 800ms | cubic-bezier(0.25, 0.1, 0.25, 1) | 页面加载 |

**交错动画类**：
- `stagger-1` 至 `stagger-8`

**CSS 动画**：
```css
@keyframes pulse-gentle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.1); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes scale-in-gentle {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

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
| <1024px | 水平排列，紧凑间距 |
| ≥1024px | 水平排列，更大边距 (lg:px-16) |

#### ApiStatusGrid
| 断点 | 列数 |
|-----|------|
| <640px | 1 列 |
| 640px-768px | 2 列 |
| 768px-1024px | 3 列 |
| ≥1024px | 4 列 |

### 5.3 内容适配

| 元素 | 移动端 | 桌面端 |
|-----|------|------|
| Hero 标题 | text-4xl | text-5xl/6xl |
| 地理位置 | 隐藏 | 显示 |
| 副标题 | 显示 | 显示 |

## 6. 页面布局

### 6.1 主页面结构

```
Dashboard
├── Header (固定顶部)
├── Hero Section (居中标题 + 渐变背景)
├── Alerts Banner (条件显示)
├── API Status Grid Section
├── Latency History Chart Section
└── Footer
```

### 6.2 间距

- 页面边距: px-6 md:px-10 lg:px-16
- 垂直间距: py-12 md:py-16
- Section 间距: space-y-12

## 7. 版本历史

### v3.0.0 (当前版本)
- ✨ Apple 风格全面重构
- 🎨 全新配色系统 (F5F5F7 背景)
- 🎯 极简主义设计 (大量留白)
- 💫 优雅动画效果
- 📱 优化响应式布局
- 🍎 圆角设计统一 (rounded-3xl)
- ✨ Hero Section 新增渐变背景

### v2.6.2
- 🐛 修复构建错误
- 📦 Firebase 移除
- 🎨 配色微调

### v2.6.1
- ✨ 初始版本