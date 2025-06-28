import { useRef, useEffect, RefObject, MutableRefObject } from 'react';
import * as echarts from 'echarts/core';
import type { EChartsType, EChartsCoreOption } from 'echarts/core';

/**
 * Custom hook to manage ECharts instance lifecycle and resizing.
 * Returns chart ref and chart instance.
 */
export function useECharts(
  option: EChartsCoreOption,
  onInit?: (chart: EChartsType) => void
): [RefObject<HTMLDivElement | null>, MutableRefObject<EChartsType | null>] {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<EChartsType | null>(null);

  useEffect(() => {
    if (chartRef.current && !chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current);
      if (onInit && chartInstance.current) onInit(chartInstance.current);
    }
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [onInit]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, { notMerge: false, lazyUpdate: false });
    }
  }, [option]);

  useEffect(() => {
    if (!chartInstance.current) return;
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return [chartRef, chartInstance];
}
