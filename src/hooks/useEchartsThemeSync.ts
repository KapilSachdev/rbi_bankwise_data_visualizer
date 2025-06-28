import { useEffect } from 'react';
import * as echarts from 'echarts/core';
import { DAISYUI_THEMES } from '../components/common/RandomThemeButton';


export function useEchartsThemeSync(chartInstance: echarts.ECharts | null) {
  useEffect(() => {
    if (!chartInstance) return;

    const getEchartsTheme = () => {
      const themeAttr = document.documentElement.getAttribute('data-theme') || 'light';
      const themeObj = DAISYUI_THEMES.find(t => t.name === themeAttr);
      return themeObj?.mode === 'dark' ? 'dark' : 'light';
    };

    const observer = new MutationObserver(mutations => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'data-theme') {
          const theme = getEchartsTheme();
          // @ts-expect-error: setTheme is public in ECharts 6 but not in types yet
          chartInstance?.setTheme(theme);
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      observer.disconnect();
    };
  }, [chartInstance]);
}
