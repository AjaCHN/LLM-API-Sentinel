# LLM API Sentinel 设计系统 (v2.7.0)

## 1. 设计哲学

### 1.1 核心理念
- **极简主义**: 去除一切非必要元素，每个像素都有其存在的意义
- **功能优先**: 数据可视化和状态监控是核心，UI 服务于信息传递
- **深度沉浸**: Dark Indigo 暗色主题营造专注的监控环境

### 1.2 美学方向
- **风格**: 极简工业风 + 数据仪表盘美学
- **参考**: Vercel Dashboard + Linear App + Cloudflare Analytics
- **情绪**: 冷静、专业、可信、高科技

---

## 2. 色彩系统

### 2.1 主色调 (Dark Indigo)
| Token | Hex | 用途 |
|-------|-----|------|
| `--primary` | `#6366f1` | 主色、按钮、链接、高亮 |
| `--primary-foreground` | `#ffffff` | 主色上的文字 |
| `--primary-dark` | `#4f46e5` | 主色悬停状态 |

### 2.2 功能色
| Token | Hex | 用途 |
|-------|-----|------|
| `--success` | `#10b981` | 在线、正常状态 |
| `--warning` | `#f59e0b` | 降级、警告状态 |
| `--destructive` | `#ef4444` | 离线、错误状态 |
| `--info` | `#3b82f6` | 信息提示 |

### 2.3 中性色 (暗色主题)
| Token | Hex | 用途 |
|-------|-----|------|
| `--background` | `#0a0a0f` | 页面背景 |
| `--card` | `#13131f` | 卡片背景 |
| `--card-foreground` | `#f1f5f9` | 卡片文字 |
| `--popover` | `#1a1a2e` | 弹出层背景 |
| `--muted` | `#1e1e2d` | 禁用、次要背景 |
| `--muted-foreground` | `#94a3b8` | 次要文字 |
| `--border` | `#27273a` | 边框 |
| `--ring` | `#6366f1` | 焦点环 |

### 2.4 渐变系统
```css
/* 主渐变 */
--gradient-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);

/* 卡片表面渐变 */
--gradient-surface: linear-gradient(180deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%);

/* 状态渐变 */
--gradient-success: linear-gradient(135deg, #10b981 0%, #34d399 100%);
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
--gradient-destructive: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
```

---

## 3. 字体系统

### 3.1 字体选择
- **Display / Heading**: `Geist` 或 `Satoshi` - 现代几何无衬线，用于大标题
- **Body / UI**: `Geist Mono` 或 `JetBrains Mono` - 等宽字体用于数据，增强技术感
- **Fallback**: `system-ui, -apple-system, sans-serif`

> **注意**: 项目禁止使用 Inter、Roboto、Arial 等通用字体。

### 3.2 字号层级
| Token | Size | Line Height | Weight | Letter Spacing | 用途 |
|-------|------|-------------|--------|----------------|------|
| `--text-hero` | 48px / 3rem | 1.1 | 700 | -0.02em | 页面主标题 |
| `--text-h1` | 36px / 2.25rem | 1.2 | 600 | -0.02em | 区块标题 |
| `--text-h2` | 24px / 1.5rem | 1.3 | 600 | -0.01em | 卡片标题 |
| `--text-h3` | 18px / 1.125rem | 1.4 | 500 | 0 | 小节标题 |
| `--text-body` | 14px / 0.875rem | 1.5 | 400 | 0 | 正文 |
| `--text-small` | 12px / 0.75rem | 1.5 | 400 | 0 | 辅助文字、标签 |
| `--text-mono` | 13px / 0.8125rem | 1.4 | 500 | 0 | 数据、时间、代码 |

### 3.3 排版规则
- 标题使用负字距 (`tracking-tight`)
- 数据使用等宽字体 (`font-mono`)，确保数字对齐
- 数字比较使用 `font-variant-numeric: tabular-nums`
- 中文内容行高增加至 1.75

---

## 4. 间距系统

### 4.1 基础单位
基础单位为 `4px`，所有间距基于此倍数：

| Token | Value | 用途 |
|-------|-------|------|
| `--space-1` | 4px | 图标内边距、微小间距 |
| `--space-2` | 8px | 紧凑元素间距 |
| `--space-3` | 12px | 表单控件间距 |
| `--space-4` | 16px | 标准内边距 |
| `--space-5` | 20px | 卡片内边距 |
| `--space-6` | 24px | 区块间距 |
| `--space-8` | 32px | 大区块间距 |
| `--space-10` | 40px | 区域间距 |
| `--space-12` | 48px | 页面级间距 |

### 4.2 布局网格
- **桌面端**: 12 列网格，列间距 24px
- **平板端**: 8 列网格，列间距 16px
- **移动端**: 4 列网格，列间距 12px
- **最大容器宽度**: 1280px
- **页面水平内边距**: 24px (桌面) / 16px (移动)

---

## 5. 图标系统

### 5.1 图标库
- **Lucide React**: 主要图标库，统一使用 `size-4` (16px) 和 `size-5` (20px)
- **自定义状态图标**: 在线(圆点)、降级(三角)、离线(叉号)

### 5.2 图标规范
- 按钮内图标使用 `size-4`
- 卡片标题图标使用 `size-5`
- 装饰性图标必须添加 `aria-hidden="true"`
- 功能图标必须添加 `aria-label`

---

## 6. 动效系统

### 6.1 动画原则
- **尊重用户偏好**: 所有动画必须支持 `prefers-reduced-motion`
- **性能优先**: 仅使用 `transform` 和 `opacity` 属性动画
- **有目的性**: 动画用于引导注意力，而非装饰

### 6.2 缓动函数
| Token | Value | 用途 |
|-------|-------|------|
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | 默认过渡 |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | 进入动画 |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | 退出动画 |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | 弹性效果 |

### 6.3 持续时间
| Token | Value | 用途 |
|-------|-------|------|
| `--duration-fast` | 150ms | 微交互（hover、focus） |
| `--duration-normal` | 200ms | 标准过渡 |
| `--duration-slow` | 300ms | 较大状态变化 |
| `--duration-enter` | 400ms | 入场动画 |

### 6.4 入场动画
```css
/* 淡入上滑 */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 滑入右侧 */
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(12px); }
  to { opacity: 1; transform: translateX(0); }
}
```

---

## 7. 组件规范

### 7.1 按钮 (Button)
- **Primary**: `bg-primary text-primary-foreground shadow-lg shadow-primary/20`
- **Secondary**: `bg-secondary text-secondary-foreground`
- **Ghost**: `hover:bg-muted`
- **尺寸**: 高度 36px (sm), 40px (default), 44px (lg)
- **圆角**: `rounded-md` (6px)
- **焦点**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

### 7.2 卡片 (Card)
- **背景**: `bg-card/50 backdrop-blur-sm`
- **边框**: `border border-border/30`
- **圆角**: `rounded-xl` (12px)
- **悬停**: `hover:shadow-md hover:border-primary/20`
- **间距**: 内边距 20px

### 7.3 状态点 (Status Dot)
- **在线**: `bg-emerald-500` + `motion-safe:animate-pulse`
- **降级**: `bg-amber-500`
- **离线**: `bg-destructive`
- **尺寸**: 8px 圆点

### 7.4 进度条 (Progress Bar)
- **高度**: 6px
- **圆角**: 全圆角
- **过渡**: `transition-[width] duration-1000`
- **渐变**: 根据状态使用对应渐变

### 7.5 表格 (Table)
- **表头**: `text-muted-foreground text-xs uppercase tracking-wider`
- **行高**: 48px
- **悬停**: `hover:bg-muted/50`
- **边框**: 仅底部边框

---

## 8. 响应式断点

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| `sm` | 640px | 基础移动端适配 |
| `md` | 768px | 侧边栏展开、2列网格 |
| `lg` | 1024px | 3列网格、完整导航 |
| `xl` | 1280px | 4列网格、最大容器宽度 |

---

## 9. 交互模式

### 9.1 错误处理
- **Toast 通知**: 右上角滑入，自动消失
- **行内错误**: 表单字段下方红色文字
- **全局错误**: Error Boundary 降级页面

### 9.2 加载状态
- **骨架屏**: 使用 `bg-muted` 脉冲动画
- **按钮加载**: 图标替换为旋转的 `RefreshCw`
- **数据加载**: 卡片内容区域显示骨架屏

### 9.3 空状态
- **图标**: 大尺寸 muted 图标
- **标题**: "暂无数据" 或对应翻译
- **操作**: 提供刷新或重试按钮

### 9.4 主题切换
- **Dark**: 默认主题，暗色背景
- **Light**: 浅色变体（可选）
- **切换动画**: 全局过渡 300ms

---

## 10. 文件位置

- 样式变量: [app/style.css](file:///workspace/app/style.css)
- 全局样式: [app/globals.css](file:///workspace/app/globals.css)
- shadcn 配置: [components.json](file:///workspace/components.json)
- UI 组件: [app/components/ui/](file:///workspace/app/components/ui/)
- 业务组件: [app/components/](file:///workspace/app/components/)
