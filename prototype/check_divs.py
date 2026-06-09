import re

with open('/workspace/prototype/prototype.html', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = content.split('\n')

# 统计标签
div_open = 0
div_close = 0

print("=" * 60)
print("逐行分析div标签")
print("=" * 60)

for i, line in enumerate(lines, 1):
    opens = len(re.findall(r'<div\b(?![/])', line))
    closes = len(re.findall(r'</div>', line))
    
    if opens > 0 or closes > 0:
        print(f"Line {i:3d}: +{opens:2d} -{closes:2d} | {line.strip()[:70]}")
    
    div_open += opens
    div_close += closes

print("=" * 60)
print(f"div开标签: {div_open}")
print(f"div闭标签: {div_close}")
print(f"差异: {div_open - div_close}")
print("=" * 60)
