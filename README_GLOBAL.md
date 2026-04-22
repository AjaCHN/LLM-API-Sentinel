# 使用全局依赖运行项目

由于 npm 本身损坏，需要先修复 npm 安装，然后全局安装依赖。

## 修复 npm

1. 下载并重新安装 Node.js：https://nodejs.org/
2. 或者使用 Node Version Manager (nvm) 来管理 Node.js 版本

## 全局安装依赖

```bash
# 安装核心依赖
npm install -g next@^14.2.13 react@^18.2.0 react-dom@^18.2.0 typescript@5.9.3 tailwindcss@4.1.11

# 安装其他依赖
npm install -g @google/genai@^1.17.0 @hookform/resolvers@^5.2.1 autoprefixer@^10.4.21 class-variance-authority@^0.7.1 clsx@^2.1.1 date-fns@^4.1.0 express@^5.2.1 firebase@^12.10.0 firebase-admin@^13.7.0 lucide-react@^0.553.0 motion@^12.23.24 next-themes@^0.4.6 postcss@^8.5.6 recharts@^3.8.0 tailwind-merge@^3.3.1

# 安装开发依赖
npm install -g @tailwindcss/postcss@4.1.11 @tailwindcss/typography@^0.5.19 @testing-library/jest-dom@^6.9.1 @testing-library/react@^16.3.2 @types/express@^5.0.6 @types/jest@^30.0.0 @types/node@^20.19.37 @types/react@^18.2.66 @types/react-dom@^18.2.22 eslint@^8.57.0 eslint-config-next@14.2.13 firebase-tools@^15.0.0 jest@^30.3.0 jest-environment-jsdom@^30.3.0 ts-jest@^29.4.6 tw-animate-css@^1.4.0
```

## 运行项目

### 开发模式

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 启动生产服务器

```bash
npm start
```

## 配置说明

- **全局依赖**：通过 `.npmrc` 配置强制使用全局包
- **输出目录**：构建文件将存储在 `%USERPROFILE%\.next` 目录
- **无本地 node_modules**：项目目录不会创建 `node_modules` 文件夹

## 注意事项

- 确保全局依赖版本与 `package.json` 中指定的版本一致
- 如果遇到模块解析问题，可能需要添加环境变量 `NODE_PATH` 指向全局 node_modules 目录
- 某些依赖可能需要本地安装才能正常工作，特别是那些需要编译的依赖
