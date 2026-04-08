// tests/e2e/homepage.test.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display API statuses', async ({ page }) => {
    // 测试主页面加载和状态显示
    await page.goto('http://localhost:3000');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 检查页面标题
    await expect(page).toHaveTitle(/LLM API Sentinel/);
    
    // 检查是否显示API状态网格
    await expect(page.locator('#api-cards-container')).toBeVisible();
    
    // 检查是否显示延迟历史图表
    await expect(page.locator('#history-chart-section')).toBeVisible();
  });
  
  test('should toggle dark/light mode', async ({ page }) => {
    // 测试主题切换
    await page.goto('http://localhost:3000');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 查找主题切换按钮并点击
    const themeToggle = page.locator('button[aria-label*="theme"]');
    await themeToggle.click();
    
    // 验证主题是否切换（通过检查body类名或其他主题相关元素）
    await expect(page.locator('html')).toHaveClass(/dark/);
  });
  
  test('should display alerts in dropdown', async ({ page }) => {
    // 测试告警显示
    await page.goto('http://localhost:3000');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 查找告警按钮并点击
    const alertsButton = page.locator('button[aria-label*="alerts"]');
    await alertsButton.click();
    
    // 检查告警下拉菜单是否显示
    const alertsDropdown = page.locator('#alerts-dropdown');
    await expect(alertsDropdown).toBeVisible();
  });
});
