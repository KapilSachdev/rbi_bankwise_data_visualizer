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
  // themeSync = true, // removed unused prop
  ...rest
}) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<EChartsType | null>(null);

  useRegisterEchartsThemes();
  const echartsTheme = useEchartsThemeSync();

  useEffect(() => {
    if (!chartRef.current) return;
    chartInstance.current = echarts.init(chartRef.current, echartsTheme);
    if (onInit && chartInstance.current) onInit(chartInstance.current);
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [onInit]);

  useEffect(() => {
    if (chartInstance.current && echartsTheme) {
      setEchartsTheme(chartInstance.current, echartsTheme);
    }
  }, [echartsTheme]);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption(option, { lazyUpdate: true });
    }
  }, [option]);

  // Debounced resize on container size change
  useEffect(() => {
    if (!chartInstance.current) return;
    let resizeTimeout: number | undefined;
    const handleResize = () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        chartInstance.current?.resize();
      }, 120);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
    };
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
