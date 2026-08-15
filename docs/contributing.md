# 贡献指南 (Contributing)

感谢你为 LLM API Sentinel 做出贡献！请遵循以下规范，确保协作顺畅、历史清晰。

## 1. 开发环境

```bash
pnpm install
cp .env.example .env.local   # 填入你的 Supabase 凭证
pnpm dev                     # 启动开发服务器 http://localhost:3000
```

常用脚本：

| 命令 | 作用 |
|------|------|
| `pnpm dev` | 开发模式 |
| `pnpm build` | 静态导出构建（输出 `out/`） |
| `pnpm lint` | ESLint 检查 |
| `pnpm test` | Jest 单元测试 |
| `pnpm test:watch` | 监听模式测试 |

## 2. 分支策略

| 分支 | 用途 |
|------|------|
| `main` | 生产环境代码 |
| `dev` | 集成分支 |
| `feature/*` | 新功能开发 |
| `fix/*` | 缺陷修复 |

## 3. 提交规范

提交信息遵循 **Conventional Commits**：

```
<type>: <description>

[可选正文]

[可选页脚]
```

类型：`feat` / `fix` / `docs` / `style` / `refactor` / `test` / `chore` / `perf` / `ci` / `revert`

- 描述简短（≤50 字符）、首字母小写、动词开头、无句号。
- 涉及版本变更时，在正文或页脚标注新版本号。

示例：

```
docs: 完善部署与环境变量文档

- 新增 docs/env.md 与 docs/deployment.md
- 澄清静态导出与可选安全服务器两种运行模式

版本: v2.9.4
```

## 4. 版本号规则 (SemVer)

每次修改（新增/删除/修改代码或文档）都需升级版本号：

- **patch**（x.y.Z+1）：修复、文档、重构、样式、配置、依赖等任意修改。
- **minor**（x.Y+1.0）：向后兼容的新功能。
- **major**（X+1.0.0）：破坏性变更。

需同步更新的单一来源：

- `package.json` 的 `version` 字段
- `openspec/config.yaml` 的 `Version`
- 被改动文件的头注释 `// path vX.Y.Z`（仅改动的文件）
- `CHANGELOG.md` 新增对应版本小节
- README / README_CN 版本徽章

## 5. 代码规范

- 关键逻辑添加中文注释。
- 函数超过 20 行考虑拆分；源文件超过 200 行按职责拆分为子模块。
- TypeScript 启用 strict 模式，避免 `any`。
- 正确捕获和处理 Promise 异常。
- 无 `console.log` / `debugger` 残留。
- 国际化文本提取到 `app/locales/` 翻译文件。

## 6. 提交前检查

- [ ] `pnpm lint` 通过
- [ ] `pnpm test` 通过
- [ ] 版本号已同步升级
- [ ] `CHANGELOG.md` 已更新
- [ ] 文档与代码事实一致

## 7. 文档约定

本项目文档分两层：

- **规范文档** `openspec/`：架构、数据模型、UI、功能、设计系统、变更提案。
- **补充文档** `docs/`：环境变量、部署、安全、贡献指南。

修改架构或功能时，请同步更新对应 `openspec/` 文档，保持规范与实现一致。
