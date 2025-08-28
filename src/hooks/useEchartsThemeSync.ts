import * as echarts from 'echarts/core';
import { useEffect, useState } from 'react';
import { ECHARTS_THEMES } from '../assets/styles/echarts_themes';

/**
 * Utility to set ECharts theme in localStorage and dispatch event.
 * Use this everywhere to keep theme sync logic DRY.
 */
export function setEchartsThemeName(theme: string) {
  localStorage.setItem('echarts-theme', theme);
  window.dispatchEvent(new CustomEvent('echarts-theme-change', { detail: { theme } }));
}
/**
 * Hook for chart containers to listen for ECharts theme changes and update accordingly.
 * Returns the current ECharts theme name (from localStorage or default).
 */
export function useEchartsThemeSync() {
  const [echartsTheme, setEchartsTheme] = useState<string>(() =>
    localStorage.getItem('echarts-theme') || (ECHARTS_THEMES[0]?.name ?? 'default')

  );

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      if (e.detail?.theme) setEchartsTheme(e.detail.theme);
    };
    window.addEventListener('echarts-theme-change', handler as EventListener);
    // On mount, set from localStorage in case it changed externally
    setEchartsTheme(localStorage.getItem('echarts-theme') || (ECHARTS_THEMES[0]?.name ?? 'default'));
    return () => window.removeEventListener('echarts-theme-change', handler as EventListener);
  }, []);
  return echartsTheme;
}

/**
 * Registers all ECharts themes on mount. Call once in app root or chart parent.
 */
export function useRegisterEchartsThemes() {
  useEffect(() => {
    ECHARTS_THEMES.forEach(theme => {
      if (theme?.themeOptions) {
        echarts.registerTheme(theme.name, theme.themeOptions);
      }
    });
  }, []);
}

/**
 * For ECharts 6+ (beta): Dynamically set chart theme without re-initializing.
 * Call this with the chart instance and new theme name on theme change event.
 */
export function setEchartsTheme(chartInstance: echarts.ECharts | null, themeName?: string) {
  if (!chartInstance || !themeName) return;
  chartInstance.setTheme(themeName);
}
