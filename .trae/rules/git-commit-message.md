---
alwaysApply: true
scene: git_message
---

# Git 提交信息规范

## 提交信息格式

提交信息必须遵循以下格式：

```
<type>: <description>

[optional body]

[optional footer]
```

## 类型 (type) 规范

| 类型     | 描述                     |
|---------|--------------------------|
| feat    | 新增功能                 |
| fix     | 修复 bug                 |
| docs    | 文档更新                 |
| style   | 代码风格调整             |
| refactor| 代码重构                 |
| test    | 测试相关                 |
| chore   | 构建/依赖/配置等变更     |
| perf    | 性能优化                 |
| ci      | CI/CD 配置变更           |
| revert  | 回滚提交                 |

## 描述 (description) 规范

- 简短明了，不超过 50 个字符
- 首字母小写
- 以动词开头
- 不使用句号结尾

## 正文 (body) 规范

- 详细描述变更内容
- 每行不超过 72 个字符
- 解释变更的原因和影响

## 页脚 (footer) 规范

- 引用相关的 issue 或 PR
- 标注 breaking changes
- 说明变更的向后兼容性

## 示例

```
feat: 添加音频源类型切换功能

- 支持麦克风、文件和 URL 三种音频源
- 优化音频上下文管理
- 修复音频设备切换问题

Closes #123
```

```
fix: 修复 3D 可视化模式切换错误

- 移除已废弃的 VORTEX 模式
- 更新 3D 场景列表
- 优化 Three.js 资源管理

Closes #456
```

## 版本控制

- 每次执行构建默认升级 MINOR 版本号
- 所有文件头部版本需同步
- 提交信息中应包含版本变更信息

## 分支管理

- main (主线)
- dev (开发)
- feature/* (功能分支)
- fix/* (修复分支)
