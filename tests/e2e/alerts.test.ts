// tests/e2e/alerts.test.ts
import { test, expect } from '@playwright/test';

test.describe('Alert Management', () => {
  test('should resolve alert as authenticated user', async ({ page }) => {
    // 测试告警解决功能
    await page.goto('http://localhost:3000');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 模拟登录（实际测试中可能需要真实的登录流程）
    const loginButton = page.locator('button[aria-label*="login"]');
    await loginButton.click();
    
    // 等待登录完成
    await page.waitForLoadState('networkidle');
    
    // 查找告警按钮并点击
    const alertsButton = page.locator('button[aria-label*="alerts"]');
    await alertsButton.click();
    
    // 等待告警下拉菜单显示
    const alertsDropdown = page.locator('#alerts-dropdown');
    await expect(alertsDropdown).toBeVisible();
    
    // 查找解决告警按钮并点击
    const resolveButton = page.locator('button[aria-label*="resolve"]').first();
    await resolveButton.click();
    
    // 验证告警是否被解决
    await expect(resolveButton).not.toBeVisible();
  });
});
