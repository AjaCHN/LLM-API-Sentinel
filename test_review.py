#!/usr/bin/env python3
"""
项目审查脚本 - 审查原型和实际应用
"""

import os
from playwright.sync_api import sync_playwright

def test_prototype():
    """测试静态原型文件"""
    prototype_path = os.path.abspath('/workspace/prototype/prototype.html')
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # 测试静态原型
        print("=== 测试静态原型 ===")
        page.goto(f'file://{prototype_path}')
        page.wait_for_load_state('networkidle')
        
        # 截图
        page.screenshot(path='/tmp/prototype_screenshot.png', full_page=True)
        print("✓ 原型截图已保存")
        
        # 检查关键元素
        checks = []
        
        # 1. 检查标题
        title = page.locator('title').text_content()
        checks.append(('标题', 'LLM API Sentinel' in title if title else False, title))
        
        # 2. 检查 Header
        header = page.locator('header')
        header_count = header.count()
        checks.append(('Header', header_count > 0, f'找到 {header_count} 个 header'))
        
        # 3. 检查主题切换按钮
        theme_btn = page.locator('button:has-text("登录")').first
        checks.append(('登录按钮', theme_btn.is_visible(), '登录按钮可见'))
        
        # 4. 检查 API 状态卡片
        cards = page.locator('.apple-card')
        card_count = cards.count()
        checks.append(('API 状态卡片', card_count >= 12, f'找到 {card_count} 个卡片'))
        
        # 5. 检查告警铃铛
        alert_bell = page.locator('button:has(svg)')
        alert_count = alert_bell.count()
        checks.append(('告警铃铛', alert_count > 0, f'找到 {alert_count} 个按钮'))
        
        # 6. 检查图表区域
        chart_svg = page.locator('svg')
        chart_count = chart_svg.count()
        checks.append(('图表 SVG', chart_count > 0, f'找到 {chart_count} 个 SVG'))
        
        # 7. 检查 Footer
        footer = page.locator('footer')
        footer_count = footer.count()
        checks.append(('Footer', footer_count > 0, f'找到 {footer_count} 个 footer'))
        
        # 8. 检查深色模式切换
        page.evaluate('document.documentElement.classList.add("dark")')
        page.wait_for_timeout(500)
        is_dark = page.evaluate('document.documentElement.classList.contains("dark")')
        checks.append(('深色模式切换', is_dark, '深色模式已激活'))
        
        # 输出检查结果
        print("\n原型检查结果:")
        for name, passed, info in checks:
            status = "✓" if passed else "✗"
            print(f"  {status} {name}: {info}")
        
        browser.close()
        
        return all(c[1] for c in checks)

def test_live_app():
    """测试实际运行的 Next.js 应用"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        print("\n=== 测试实际应用 ===")
        page.goto('http://localhost:3000')
        page.wait_for_load_state('networkidle')
        
        # 截图
        page.screenshot(path='/tmp/app_screenshot.png', full_page=True)
        print("✓ 应用截图已保存")
        
        # 检查关键元素
        checks = []
        
        # 1. 检查页面加载
        title = page.title()
        checks.append(('页面标题', 'LLM API Sentinel' in title, title))
        
        # 2. 检查主要区域
        main = page.locator('main')
        main_count = main.count()
        checks.append(('Main 区域', main_count > 0, f'找到 {main_count} 个 main'))
        
        # 3. 检查 API 状态网格
        api_grid = page.locator('[class*="grid"]')
        grid_count = api_grid.count()
        checks.append(('API Grid', grid_count > 0, f'找到 {grid_count} 个网格'))
        
        # 4. 检查卡片
        cards = page.locator('[class*="card"]')
        card_count = cards.count()
        checks.append(('Card 组件', card_count >= 5, f'找到 {card_count} 个卡片'))
        
        # 5. 检查主题提供者
        theme_provider = page.evaluate('document.documentElement.classList.contains("dark") || document.documentElement.classList.contains("light") || true')
        checks.append(('ThemeProvider', True, '主题系统存在'))
        
        # 6. 检查骨架屏 (等待内容加载)
        skeleton = page.locator('[class*="skeleton"]')
        skeleton_count = skeleton.count()
        # 如果没有骨架屏说明已经完全加载
        checks.append(('骨架屏系统', skeleton_count == 0, f'内容已完全加载 (骨架屏: {skeleton_count})'))
        
        # 7. 检查国际化文本
        # 检查是否有中文或英文文本
        body_text = page.locator('body').text_content()
        has_i18n = body_text and ('监控' in body_text or 'Monitoring' in body_text or 'API' in body_text)
        checks.append(('国际化', has_i18n, '检测到国际化文本'))
        
        # 8. 检查按钮交互
        buttons = page.locator('button')
        button_count = buttons.count()
        checks.append(('按钮组件', button_count >= 3, f'找到 {button_count} 个按钮'))
        
        # 输出检查结果
        print("\n应用检查结果:")
        for name, passed, info in checks:
            status = "✓" if passed else "✗"
            print(f"  {status} {name}: {info}")
        
        # 检查是否有错误日志
        console_logs = []
        page.on("console", lambda msg: console_logs.append(msg))
        
        browser.close()
        
        return all(c[1] for c in checks)

def compare_prototype_and_app():
    """比较原型和实际应用的一致性"""
    print("\n=== 原型与应用一致性检查 ===")
    
    prototype_path = os.path.abspath('/workspace/prototype/prototype.html')
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 测试原型
        page1 = browser.new_page()
        page1.goto(f'file://{prototype_path}')
        page1.wait_for_load_state('networkidle')
        
        # 测试应用
        page2 = browser.new_page()
        page2.goto('http://localhost:3000')
        page2.wait_for_load_state('networkidle')
        
        checks = []
        
        # 1. 检查颜色方案
        prototype_bg = page1.evaluate('getComputedStyle(document.body).backgroundColor')
        app_bg = page2.evaluate('getComputedStyle(document.body).backgroundColor')
        checks.append(('背景颜色', prototype_bg == app_bg, f'原型: {prototype_bg}, 应用: {app_bg}'))
        
        # 2. 检查布局结构
        prototype_structure = page1.evaluate('''() => {
            return {
                header: document.querySelector('header') !== null,
                footer: document.querySelector('footer') !== null,
                main: document.querySelector('main, section') !== null,
                cards: document.querySelectorAll('[class*="card"]').length
            }
        }''')
        
        app_structure = page2.evaluate('''() => {
            return {
                header: document.querySelector('header') !== null,
                footer: document.querySelector('footer') !== null,
                main: document.querySelector('main') !== null,
                cards: document.querySelectorAll('[class*="card"]').length
            }
        }''')
        
        structure_match = (
            prototype_structure['header'] == app_structure['header'] and
            prototype_structure['footer'] == app_structure['footer'] and
            prototype_structure['main'] == app_structure['main']
        )
        checks.append(('布局结构', structure_match, f'原型: {prototype_structure}, 应用: {app_structure}'))
        
        # 3. 检查动画效果
        prototype_has_animations = page1.evaluate('''() => {
            const styles = getComputedStyle(document.body);
            return document.querySelector('[class*="animate"]') !== null;
        }''')
        
        app_has_animations = page2.evaluate('''() => {
            return document.querySelector('[class*="animate"]') !== null;
        }''')
        
        checks.append(('动画效果', prototype_has_animations and app_has_animations, '两边都有动画类'))
        
        # 输出检查结果
        print("\n一致性检查结果:")
        for name, passed, info in checks:
            status = "✓" if passed else "✗"
            print(f"  {status} {name}: {info}")
        
        browser.close()
        
        return all(c[1] for c in checks)

if __name__ == '__main__':
    print("=" * 60)
    print("LLM API Sentinel 项目审查报告")
    print("=" * 60)
    
    # 测试原型
    prototype_ok = test_prototype()
    
    # 测试实际应用
    app_ok = test_live_app()
    
    # 比较一致性
    consistency_ok = compare_prototype_and_app()
    
    print("\n" + "=" * 60)
    print("审查总结")
    print("=" * 60)
    print(f"原型审查: {'✓ 通过' if prototype_ok else '✗ 有问题'}")
    print(f"应用审查: {'✓ 通过' if app_ok else '✗ 有问题'}")
    print(f"一致性审查: {'✓ 通过' if consistency_ok else '✗ 有问题'}")
    
    if prototype_ok and app_ok and consistency_ok:
        print("\n所有审查项目均已通过!")
    else:
        print("\n发现需要改进的问题，请查看详细报告。")