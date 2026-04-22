#!/usr/bin/env node

import { readFileSync } from 'fs';

// 读取 package.json
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

// 合并所有依赖
const allDeps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies
};

// 生成全局安装命令
const depsList = Object.entries(allDeps)
  .map(([name, version]) => `${name}@${version}`)
  .join(' ');

console.log('全局安装所有依赖...');
console.log(`npm install -g ${depsList}`);

// 执行安装命令
import { execSync } from 'child_process';
try {
  execSync(`npm install -g ${depsList}`, { stdio: 'inherit' });
  console.log('\n✅ 所有依赖已全局安装成功！');
} catch (error) {
  console.error('\n❌ 安装失败:', error.message);
  process.exit(1);
}
