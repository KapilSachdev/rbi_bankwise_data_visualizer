import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import * as echarts from 'echarts/core';
import { CSSProperties, FC, memo, useEffect, useRef } from 'react';
import { useEchartsThemeSync } from '../../hooks/useEchartsThemeSync';


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

  // Init chart
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

  // Theme sync
  useEchartsThemeSync(themeSync ? chartInstance.current : null);

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
