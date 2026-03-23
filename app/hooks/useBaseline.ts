// app/hooks/useBaseline.ts v3.4.7
import { useState, useEffect } from 'react';
import { getMetricsBaseline } from '../lib/metrics';

export function useBaseline(apiId: string) {
  const [baseline, setBaseline] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBaseline() {
      const data = await getMetricsBaseline(apiId);
      setBaseline(data);
      setLoading(false);
    }
    fetchBaseline();
  }, [apiId]);

  return { baseline, loading };
}
