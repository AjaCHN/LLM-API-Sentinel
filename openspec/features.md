# 功能规格文档

## 1. 功能总览

LLM API Sentinel 是一个全球主流大模型 API 实时监控系统，提供以下核心功能模块：

| 功能模块 | 状态 | 优先级 |
|---------|------|--------|
| **全球 API 监控** | 已实现 | 高 |
| **历史数据可视化** | 已实现 | 高 |
| **智能告警系统** | 已实现 | 高 |
| **用户认证** | 已实现 | 高 |
| **主题切换** | 已实现 | 中 |
| **API 配置管理** | 已实现 | 中 |
| **国际化支持** | 已实现 | 中 |
| **地理位置检测** | 已实现 | 低 |

## 2. 功能详细规格

### 2.1 全球 API 监控

**功能描述**：实时监控全球主流 AI 供应商的 API 状态和延迟

**监控范围**：

| 区域 | API | Provider | 状态 |
|-----|-----|----------|------|
| 美国 | GPT-4o | OpenAI | ✅ |
| 美国 | Claude 3.5 Sonnet | Anthropic | ✅ |
| 美国 | Gemini 1.5 Pro | Google | ✅ |
| 美国 | Llama 3 | Meta (Groq) | ✅ |
| 美国 | Mistral Large | Mistral | ✅ |
| 中国 | Kimi | Moonshot | ✅ |
| 中国 | GLM-4 | ZhipuAI | ✅ |
| 中国 | Baichuan 2 | Baichuan | ✅ |
| 中国 | Qwen Max | Alibaba | ✅ |
| 中国 | Hunyuan | Tencent | ✅ |
| 中国 | Ernie 4.0 | Baidu | ✅ |
| 中国 | DeepSeek V3 | DeepSeek | ✅ |

**监控指标**：
- **状态**：online / offline / degraded
- **延迟**：毫秒级响应时间
- **错误率**：最近一段时间的错误百分比
- **可用性**：API 可用时间百分比
- **正常运行时间**：累计正常运行时间

**监控频率**：
- 后台自动检查：每 5 分钟
- 手动检查：用户可随时触发

### 2.2 历史数据可视化

**功能描述**：使用交互式图表展示 API 性能历史趋势

**图表类型**：
- **面积图**：展示延迟随时间变化趋势
- **折线图**：显示多个 API 的对比
- **数据点限制**：最多显示最近 50 个数据点

**交互功能**：
- 悬停显示详细信息
- 图例点击切换显示/隐藏
- 自动更新数据

**时间范围**：
- 默认显示最近 1 小时
- 支持自定义时间范围

### 2.3 智能告警系统

**功能描述**：自动检测 API 异常并生成告警通知

**告警类型**：

| 类型 | 触发条件 | 严重程度 |
|-----|---------|---------|
| **宕机告警** | API 状态为 offline | critical |
| **延迟告警** | 延迟 > 1500ms | medium/high |
| **错误告警** | 连续多次请求失败 | high |

**告警规则**：
- 同一类型的未解决告警不会重复创建
- 延迟阈值基于历史数据动态评估
- 告警严重程度：critical > high > medium > low

**告警操作**：
- 查看活跃告警列表
- 标记告警为已解决
- 自动清理已解决超过 90 天的告警

### 2.4 用户认证

**功能描述**：使用 Google OAuth 进行用户身份验证

**认证流程**：
1. 用户点击登录按钮
2. 跳转到 Google 认证页面
3. 用户授权后返回应用
4. 获取用户信息并存储会话

**权限控制**：
- 公开数据：所有用户可查看 API 状态
- 敏感操作：需要登录才能执行手动检查
- 管理员操作：需要管理员权限才能写入数据

**会话管理**：
- 使用 Supabase Auth 管理会话
- 自动刷新令牌
- 支持单点登录

### 2.5 主题切换

**功能描述**：支持深色/浅色主题切换

**主题模式**：
- **系统模式**：跟随系统设置
- **深色模式**：暗色背景，浅色文字
- **浅色模式**：浅色背景，暗色文字

**切换方式**：
- 点击头部主题切换按钮
- 自动检测系统主题偏好
- 主题偏好持久化到本地存储

### 2.6 API 配置管理

**功能描述**：允许用户自定义 API 检查配置

**配置项**：
- 添加自定义 API 端点
- 删除已有 API
- 修改检查 URL
- 重置为默认配置

**配置持久化**：
- 配置保存到 localStorage
- 支持导出/导入配置
- 配置变更后自动生效

### 2.7 国际化支持

**功能描述**：支持多语言切换

**支持语言**：
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

**翻译范围**：
- 页面标题和描述
- 按钮和菜单文本
- 状态和告警消息
- 错误提示信息

**切换方式**：
- 通过语言选择器切换
- URL 参数自动检测
- 浏览器语言自动检测

### 2.8 地理位置检测

**功能描述**：显示用户当前地理位置

**检测方式**：
- 使用浏览器 Geolocation API
- 自动获取经纬度
- 解析城市和国家信息

**缓存策略**：
- 地理位置信息缓存 24 小时
- 缓存过期后重新获取
- 用户可手动刷新

## 3. 功能依赖关系

```mermaid
graph TD
    subgraph Core[核心功能]
        Auth[用户认证]
        Monitor[API 监控]
        Data[数据存储]
    end
    
    subgraph Features[功能模块]
        Dashboard[仪表盘]
        Charts[历史图表]
        Alerts[告警系统]
        Config[API 配置]
        Theme[主题切换]
        I18n[国际化]
        Geo[地理位置]
    end
    
    Auth --> Dashboard
    Auth --> Config
    
    Monitor --> Dashboard
    Monitor --> Charts
    Monitor --> Alerts
    
    Data --> Dashboard
    Data --> Charts
    Data --> Alerts
    
    Dashboard --> Theme
    Dashboard --> I18n
    Dashboard --> Geo
```

**依赖说明**：
| 功能 | 依赖 | 说明 |
|-----|------|------|
| Dashboard | Auth, Monitor, Data | 需要认证状态、监控数据 |
| Charts | Monitor, Data | 需要历史监控数据 |
| Alerts | Monitor, Data | 需要监控结果生成告警 |
| Config | Auth | 需要登录才能修改配置 |
| Theme | Dashboard | 依赖仪表盘展示 |
| I18n | Dashboard | 依赖仪表盘展示 |
| Geo | Dashboard | 依赖仪表盘展示 |

## 4. 功能优先级

### 4.1 优先级矩阵

| 优先级 | 功能 | 原因 |
|--------|------|------|
| **P0** | API 状态监控 | 核心功能，必须正常工作 |
| **P0** | 历史数据展示 | 核心功能，用户核心需求 |
| **P0** | 告警系统 | 核心功能，及时通知异常 |
| **P1** | 用户认证 | 安全需求，保护敏感操作 |
| **P1** | 主题切换 | 用户体验，提高可用性 |
| **P2** | API 配置 | 进阶功能，部分用户需要 |
| **P2** | 国际化 | 扩展需求，多语言支持 |
| **P3** | 地理位置 | 辅助功能，增强体验 |

### 4.2 功能版本路线图

```mermaid
timeline
    title LLM API Sentinel 功能版本路线图
    section v1.0.0
        "核心监控功能" : 2024-01
        "基本状态显示" : 2024-01
        "简单图表" : 2024-01
    section v2.0.0
        "全球 API 覆盖" : 2024-02
        "深色模式" : 2024-02
        "响应式设计" : 2024-02
        "地理位置" : 2024-02
    section v2.1.0
        "实时告警" : 2024-03
        "告警管理" : 2024-03
    section v2.2.0
        "后台监控任务" : 2024-03
        "Express 服务器" : 2024-03
    section v2.4.0
        "安全增强" : 2024-04
        "国际化" : 2024-04
    section v2.5.0
        "数据缓存" : 2024-05
        "API 配置" : 2024-05
        "指标计算" : 2024-05
    section v2.6.1
        "组件优化" : 2024-06
        "错误处理增强" : 2024-06
    section v2.7.0
        "SEO 与 GEO 增强" : 2024-07
        "Schema.org 结构化数据" : 2024-07
        "多语言 SEO 支持" : 2024-07
        "统一错误日志规范" : 2024-07
```

## 5. 功能交互流程

### 5.1 监控流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant Client as 前端
    participant Supabase as Supabase
    participant Monitor as 后台监控
    
    Note over Monitor: 每 5 分钟自动执行
    Monitor->>Monitor: 批量检查 API
    Monitor->>Supabase: 更新 API 状态
    Monitor->>Supabase: 添加历史记录
    
    Supabase-->>Client: 实时推送更新
    Client->>Client: 更新状态显示
    
    User->>Client: 点击"立即检查"
    Client->>Client: 检查登录状态
    
    alt 已登录
        Client->>Client: 执行手动检查
        Client->>Supabase: 更新状态
    else 未登录
        Client->>Client: 显示登录提示
    end
```

### 5.2 告警处理流程

```mermaid
sequenceDiagram
    participant Monitor as 监控
    participant Supabase as Supabase
    participant Client as 前端
    participant User as 用户
    
    Monitor->>Monitor: 检测到异常
    Monitor->>Supabase: 创建告警
    
    Supabase-->>Client: 推送告警
    Client->>Client: 更新告警计数
    Client->>Client: 显示告警横幅
    
    User->>Client: 点击告警铃铛
    Client->>Client: 显示告警列表
    
    User->>Client: 点击"解决"
    Client->>Supabase: 更新告警状态
    Supabase-->>Client: 同步更新
```

### 5.3 主题切换流程

```mermaid
sequenceDiagram
    participant User as 用户
    participant Client as 前端
    participant Storage as localStorage
    
    User->>Client: 点击主题切换按钮
    Client->>Client: 切换主题状态
    Client->>Storage: 保存主题偏好
    Client->>Client: 应用主题样式
```

## 6. 功能非功能需求

### 6.1 性能要求

| 指标 | 目标 | 说明 |
|-----|------|------|
| 页面加载时间 | < 2 秒 | 首屏加载 |
| API 检查延迟 | < 6 秒 | 单个 API 检查 |
| 并发检查数量 | 5 | 最大并发数 |
| 图表渲染 | < 500ms | 50 个数据点 |

### 6.2 可用性要求

| 指标 | 目标 | 说明 |
|-----|------|------|
| 监控覆盖率 | 100% | 所有配置的 API |
| 告警准确率 | > 95% | 减少误报 |
| 数据更新延迟 | < 10 秒 | 实时同步 |

### 6.3 安全要求

| 要求 | 说明 |
|-----|------|
| 数据加密 | HTTPS 传输 |
| 访问控制 | 基于角色的权限 |
| 敏感信息 | 不存储密码/Tokens |

### 6.4 兼容性要求

| 平台 | 版本 |
|-----|------|
| Chrome | 最新 2 版 |
| Firefox | 最新 2 版 |
| Safari | 最新 2 版 |
| Edge | 最新 2 版 |

## 7. 功能验收标准

### 7.1 API 监控功能

**验收标准**：
- [ ] 所有 12 个 API 都能被正确监控
- [ ] 状态显示正确（online/offline/degraded）
- [ ] 延迟显示准确（毫秒级）
- [ ] 后台每 5 分钟自动检查
- [ ] 支持手动触发检查

### 7.2 历史数据可视化

**验收标准**：
- [ ] 图表显示最近 50 个数据点
- [ ] 支持多个 API 对比显示
- [ ] 悬停显示详细信息
- [ ] 图例点击切换显示

### 7.3 智能告警系统

**验收标准**：
- [ ] API 宕机时生成告警
- [ ] 延迟过高时生成告警
- [ ] 相同类型告警不重复创建
- [ ] 支持标记告警为已解决

### 7.4 用户认证

**验收标准**：
- [ ] 支持 Google OAuth 登录
- [ ] 未登录用户无法执行手动检查
- [ ] 登录状态持久化
- [ ] 支持登出功能

### 7.5 主题切换

**验收标准**：
- [ ] 支持深色/浅色/系统模式
- [ ] 主题切换即时生效
- [ ] 主题偏好持久化

### 7.6 API 配置管理

**验收标准**：
- [ ] 支持添加自定义 API
- [ ] 支持删除 API
- [ ] 配置持久化到 localStorage
- [ ] 支持重置为默认配置

### 7.7 国际化支持

**验收标准**：
- [ ] 支持 16 种语言（en/zh-cn/zh-tw/ar/cs/es/hi/id/it/nl/pl/sv/th/tr/ru/vi）
- [ ] 自动检测浏览器语言
- [ ] 语言切换即时生效
- [ ] 所有用户可见文本都已翻译

### 7.8 地理位置检测

**验收标准**：
- [ ] 自动获取地理位置
- [ ] 显示城市和国家
- [ ] 缓存 24 小时
- [ ] 支持手动刷新