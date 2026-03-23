// app/lib/scoring.ts v3.5.1
export function calculateHealthScore(
  availability: number, // 0-100
  avgLatency: number, // ms
  errorRate: number // 0-100
): number {
  // Normalize response time: 0ms = 100, 2000ms+ = 0
  const latencyScore = Math.max(0, Math.min(100, (1 - avgLatency / 2000) * 100));
  
  // Error rate: 0% = 100, 100% = 0
  const errorScore = Math.max(0, Math.min(100, (1 - errorRate / 100) * 100));
  
  // Weights: Availability 50%, Latency 30%, Error Rate 20%
  const score = (availability * 0.5) + (latencyScore * 0.3) + (errorScore * 0.2);
  
  return Math.round(score);
}
