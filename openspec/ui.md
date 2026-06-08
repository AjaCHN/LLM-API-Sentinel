# UI 组件规范文档 (v3.0.0 - Apple Style)

## 1. 设计原则

### 1.1 核心原则
| 原则 | 说明 |
|-----|------|
| **极简主义** | 参考 Apple 设计语言，强调简洁、清晰、充足留白 |
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
- 大量留白 (px-6 md:px-10, py-5)
- 圆角按钮 (rounded-2xl)
- 渐变品牌背景
- 简洁的控制按钮

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

**功能**：新版 Apple 风格状态网格组件

**Props**：
```typescript
interface ApiStatusGridProps {
  statuses: ApiStatus[];
}
```

**设计特点**：
- Apple 风格圆角卡片 (rounded-3xl)
- 状态圆点指示器 (status-dot)
- 悬停效果 (apple-card)
- 交错动画入场

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
| 状态圆点 | 始终显示 | status-dot 带脉冲效果 |
| 延迟数值 | 始终显示 | 大号字体 (text-xl) |
| 延迟进度条 | 始终显示 | 高度 1.5px |
| 错误率 | `errorRate !== undefined` | 圆角背景卡片 |
| 可用性 | `availability !== undefined` | 圆角背景卡片 |
| 重试次数 | `retries > 0` | 状态胶囊 |

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

**设计特点**：
- 圆角容器 (rounded-3xl)
- 移除轴线和刻度线
- 柔和的网格线
- Apple 风格 Tooltip

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
| `critical` | #FF3B30 | AlertTriangle |
| `high` | #FF3B30 | AlertTriangle |
| `medium` | #FF9500 | AlertTriangle |
| `low` | #007AFF | Info |

### 2.7 ApiConfig

**功能**：允许用户自定义 API 检查配置

**Props**：无

### 2.8 ThemeProvider

**功能**：管理深色/浅色主题切换

## 3. 样式规范

### 3.1 颜色系统

#### 浅色主题 (Apple Style)
| 颜色变量 | 值 | 用途 |
|---------|---|------|
| `--background` | #FFFFFF | 页面背景 |
| `--foreground` | #000000 | 文字颜色 |
| `--card` | #FFFFFF | 卡片背景 |
| `--card-foreground` | #000000 | 卡片文字 |
| `--primary` | #007AFF | 主色调 (Apple Blue) |
| `--primary-foreground` | #FFFFFF | 主色文字 |
| `--secondary` | #F5F5F7 | 次要背景 |
| `--muted` | #F5F5F7 | 次要背景 |
| `--muted-foreground` | #86868B | 次要文字 |
| `--accent` | #F5F5F7 | 强调背景 |
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
| 2xl | `rounded-2xl` | 16px | 按钮、小组件 |
| 3xl | `rounded-3xl` | 24px | 卡片、面板 |
| full | `rounded-full` | 50% | 状态圆点、标签 |

### 3.3 间距系统 (Apple Style)

| 间距 | Tailwind | 像素值 | 用途 |
|-----|-----------|-------|------|
| sm | `gap-3` | 12px | 小间距 |
| md | `gap-4` | 16px | 默认间距 |
| lg | `gap-5` | 20px | 较大间距 |
| xl | `gap-6` | 24px | 大间距 |
| 2xl | `gap-10` | 40px | 极大间距 (section 分隔) |

### 3.4 字体系统

| 字体 | 变量 | 用途 |
|-----|------|------|
| System | `--font-sans` | 正文、标题 (Apple SF Pro 风格) |
| JetBrains Mono | `--font-mono` | 代码、时间显示 |

**字体大小**：
| 大小 | Tailwind | 像素 | 用途 |
|-----|---------|-----|------|
| 11px | `text-xs` | 11px | 辅助文字、标签 |
| 14px | `text-sm` | 14px | 正文 |
| 16px | `text-base` | 16px | 基础文字 |
| 18px | `text-lg` | 18px | 小标题 |
| 20px | `text-xl` | 20px | 标题 |
| 36px | `text-4xl` | 36px | Hero 标题 |

### 3.5 阴影系统

| 阴影 | Tailwind | 效果 | 用途 |
|-----|---------|------|------|
| sm | `shadow-sm` | 轻微阴影 | 卡片默认 |

## 4. 交互规范

### 4.1 Apple 风格按钮

**CSS 类**: `apple-button`

**状态样式**：
| 状态 | 样式 |
|-----|------|
| 默认 | 背景填充色 |
| 悬停 | 轻微透明度变化 |
| 点击 | 轻微缩放 (scale 0.97) |
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
| 默认 | 细边框、圆角、轻微阴影 |
| 悬停 | 向上平移 4px、阴影增强 |

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
| 颜色过渡 | 500ms | cubic-bezier(0.4, 0, 0.2, 1) | 主题切换、悬停效果 |
| 位置过渡 | 300ms | cubic-bezier(0.25, 0.1, 0.25, 1) | 卡片移动、悬停效果 |
| 淡入上移 | 600ms | cubic-bezier(0.25, 0.1, 0.25, 1) | 页面加载、元素显示 |

**交错动画类**：
- `stagger-1` 至 `stagger-8`

**CSS 动画**：
```css
@keyframes pulse-gentle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
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
| <640px | 320px |
| ≥640px | 420px |

### 5.3 内容适配

| 元素 | 移动端 | 桌面端 |
|-----|------|------|
| Hero 标题 | text-4xl | text-5xl |
| 地理位置 | 隐藏 | 显示 |
| 用户信息 | 仅显示头像/按钮 | 显示完整信息 |
| 图表图例 | 水平滚动 | 正常显示 |

## 6. 国际化规范

### 6.1 翻译文件结构

```
locales/
├── en.json       # English
├── zh-cn.json    # 简体中文
├── zh-tw.json    # 繁體中文
├── ar.json       # العربية
├── cs.json       # Čeština
├── es.json       # Español
├── hi.json       # हिन्दी
├── id.json       # Bahasa Indonesia
├── it.json       # Italiano
├── nl.json       # Nederlands
├── pl.json       # Polski
├── sv.json       # Svenska
├── th.json       # ไทย
├── tr.json       # Türkçe
├── ru.json       # Русский
└── vi.json       # Tiếng Việt
```

### 6.2 支持的语言

| 语言代码 | 语言名称 | 本地名称 |
|---------|---------|--------|
| en | English | English |
| zh-cn | 简体中文 | 简体中文 |
| zh-tw | 繁体中文 | 繁體中文 |
| ar | 阿拉伯语 | العربية |
| cs | 捷克语 | Čeština |
| es | 西班牙语 | Español |
| hi | 印地语 | हिन्दी |
| id | 印度尼西亚语 | Bahasa Indonesia |
| it | 意大利语 | Italiano |
| nl | 荷兰语 | Nederlands |
| pl | 波兰语 | Polski |
| sv | 瑞典语 | Svenska |
| th | 泰语 | ไทย |
| tr | 土耳其语 | Türkçe |
| ru | 俄语 | Русский |
| vi | 越南语 | Tiếng Việt |

## 7. 页面布局

### 7.1 主页面结构

```
Dashboard
├── Header (固定顶部)
├── Hero Section (居中标题)
├── Alerts Banner (条件显示)
├── API Status Grid Section
├── Latency History Chart Section
└── Footer
```

### 7.2 间距

- 页面边距: px-6 md:px-10
- 垂直间距: py-10
- Section 间距: space-y-12

## 8. 版本历史

### v3.0.0 (当前版本)
- ✨ Apple 风格全面重构
- 🎨 全新配色系统
- 🎯 极简主义设计
- 💫 优雅动画效果
- 📱 优化响应式布局
- 🍎 圆角设计统一
- ✨ Hero Section 新增

### v2.6.2
- 🐛 修复构建错误
- 📦 Firebase 移除
- 🎨 配色微调

### v2.6.1
- ✨ 初始版本
