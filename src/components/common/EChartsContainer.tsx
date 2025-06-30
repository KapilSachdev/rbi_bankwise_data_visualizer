import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import * as echarts from 'echarts/core';
import { CSSProperties, FC, memo, useEffect, useRef } from 'react';
import { useEchartsThemeSync, useRegisterEchartsThemes, setEchartsTheme } from '../../hooks/useEchartsThemeSync';


type EChartsContainerProps = {
  option: EChartsCoreOption;
  className?: string;
  style?: CSSProperties;
  onInit?: (chart: EChartsType) => void;
  themeSync?: boolean; // default true
  'aria-label'?: string;
  role?: string;
  tabIndex?: number;
};

/**
 * Generic, reusable ECharts chart component for React
 * Handles chart instance lifecycle, resizing, and theme sync.
 * Pass ECharts option, and optionally get chart instance via onInit.
 */
const EChartsContainer: FC<EChartsContainerProps> = ({
  option,
  className = '',
  style,
  onInit,
  themeSync = true,
  ...rest
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<EChartsType | null>(null);

  // Register ECharts themes once
  useRegisterEchartsThemes();
  // Listen for ECharts theme changes (independent of DaisyUI)
  const echartsTheme = useEchartsThemeSync();

  // Init chart on mount
  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current, echartsTheme);
    if (onInit && chartInstance.current) onInit(chartInstance.current);
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
    // Only run on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onInit]);

  // Update theme in-place (ECharts 6+) when theme changes
  useEffect(() => {
    if (chartInstance.current && echartsTheme) {
      setEchartsTheme(chartInstance.current, echartsTheme);
    }
  }, [echartsTheme]);

  // Set option
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, { lazyUpdate: false });
    }
  }, [option]);

  // Resize on container size change
  useEffect(() => {
    if (!chartInstance.current) return;
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      ref={chartRef}
      className={className}
      style={style}
      {...rest}
    />
  );
};

export default memo(EChartsContainer);
