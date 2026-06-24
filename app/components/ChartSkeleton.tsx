// 图表组件骨架屏 - 用于动态加载时的占位
import { Card, CardContent } from '@/components/ui/card';

export function ChartSkeleton() {
  return (
    <Card>
      <CardContent className="h-[320px] p-4 md:h-[420px]">
        <div className="flex h-full flex-col gap-4">
          {/* X 轴 */}
          <div className="flex justify-between px-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-2 w-12 animate-pulse rounded bg-muted" />
            ))}
          </div>
          
          {/* 图表区域 */}
          <div className="relative flex-1 overflow-hidden">
            {/* 网格线 */}
            <div className="absolute inset-0 grid grid-rows-4 gap-2 opacity-20">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-b border-dashed border-border" />
              ))}
            </div>
            
            {/* 模拟数据线 */}
            <div className="absolute inset-x-4 bottom-8 top-8 flex items-end gap-2">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="flex-1 animate-pulse rounded-t bg-primary/20"
                  style={{ height: `${Math.random() * 60 + 20}%` }}
                />
              ))}
            </div>
          </div>
          
          {/* Y 轴标签 */}
          <div className="flex justify-between px-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-2 w-8 animate-pulse rounded bg-muted" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
