import re

with open('/workspace/prototype/prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

# 统计标签
div_open = 0
div_close = 0

for i, line in enumerate(lines, 1):
    opens = len(re.findall(r'<div\b(?![/])', line))
    closes = len(re.findall(r'</div>', line))
    div_open += opens
    div_close += closes

print("=" * 50)
print("HTML标签统计")
print("=" * 50)
print(f"div开标签: {div_open}")
print(f"div闭标签: {div_close}")
print(f"差异: {div_open - div_close}")
print("=" * 50)

if div_open == div_close:
    print("✅ 所有div标签已正确闭合！")
else:
    print(f"⚠️  还有 {div_open - div_close} 个div标签未闭合")
