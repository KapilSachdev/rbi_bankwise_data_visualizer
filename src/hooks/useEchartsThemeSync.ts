import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { DAISYUI_THEMES } from '../components/common/RandomThemeButton';

/**
 * Custom React hook to initialize and manage an ECharts instance that syncs with DaisyUI theme changes.
 * @param chartRef - React ref to the chart container div
 * @param getOption - Function that returns the ECharts option object
 * @param deps - Dependency array for re-rendering the chart (data, metric, etc.)
 * @returns The ECharts instance (optional, for advanced use)
 */
export function useEchartsThemeSync(
  chartRef: React.RefObject<HTMLDivElement | null>,
  getOption: () => echarts.EChartsCoreOption,
  deps: unknown[] = []
) {
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Helper to get current DaisyUI theme and map to ECharts theme
    const getEchartsTheme = () => {
      const themeAttr = document.documentElement.getAttribute('data-theme') || 'light';
      const themeObj = DAISYUI_THEMES.find(t => t.name === themeAttr);
      return themeObj?.mode === 'dark' ? 'dark' : 'light';
    };

    // (Re)initialize chart with correct theme
    const initChart = () => {
      if (!chartRef.current) return;
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      const theme = getEchartsTheme();
      chartInstance.current = echarts.init(chartRef.current, theme);
      chartInstance.current.setOption(getOption());
    };

    initChart();

    // Listen for DaisyUI theme changes using MutationObserver
    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          initChart();
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    // Handle window resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return chartInstance.current;
}
