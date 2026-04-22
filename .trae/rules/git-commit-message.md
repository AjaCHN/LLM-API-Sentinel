---
alwaysApply: true
scene: git_message
---

# Git 提交信息规范

## 格式要求

```
<type>: <description>

[可选正文]

[可选页脚]
```

## 类型 (type)

| 类型     | 描述                 |
|---------|--------------------|
| feat    | 新增功能             |
| fix     | 修复 bug             |
| docs    | 文档更新             |
| style   | 代码风格调整         |
| refactor| 代码重构             |
| test    | 测试相关             |
| chore   | 构建/依赖/配置变更   |
| perf    | 性能优化             |
| ci      | CI/CD 配置变更       |
| revert  | 回滚提交             |

## 描述 (description)
- 简短明了，≤50字符
- 首字母小写
- 以动词开头
- 无句号结尾

## 正文 (body)
- 详细说明变更内容
- 每行 ≤72字符
- 解释变更原因和影响

## 页脚 (footer)
- 引用相关 issue/PR
- 标注 breaking changes
- 说明向后兼容性

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
- 构建默认升级 MINOR 版本
- 同步所有文件头部版本
- 提交信息包含版本变更

## 分支管理
- main (主线)
- dev (开发)
- feature/* (功能分支)
- fix/* (修复分支)
