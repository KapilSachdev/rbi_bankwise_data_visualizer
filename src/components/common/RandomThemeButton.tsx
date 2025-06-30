import { FC, memo, useCallback, useEffect, useState } from 'react';
import { ECHARTS_THEMES } from '../../assets/styles/echarts_themes';
import { setEchartsThemeName } from '../../hooks/useEchartsThemeSync';
import SVGIcon from './SVGIcon';

// Chart Theme Button
const ChartThemeButton: FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>(() => localStorage.getItem('echarts-theme') || ECHARTS_THEMES[0].name);

  // Only update local state from localStorage on mount (in case user reloads)
  useEffect(() => {
    setCurrentTheme(localStorage.getItem('echarts-theme') || ECHARTS_THEMES[0].name);
  }, []);

  const handleNextTheme = useCallback(() => {
    const idx = ECHARTS_THEMES.findIndex(t => t.name === currentTheme);
    const nextIdx = (idx + 1) % ECHARTS_THEMES.length;
    const nextTheme = ECHARTS_THEMES[nextIdx].name;
    setCurrentTheme(nextTheme);
    setEchartsThemeName(nextTheme); // This will dispatch the event for listeners
  }, [currentTheme]);

  return (
    <a
      role="button"
      className="cursor-pointer"
      aria-label="Randomise Chart Theme"
      onClick={handleNextTheme}
      title={`Chart Theme: ${currentTheme}`}
    >
      <SVGIcon icon="chart" className="size-6 fill-primary" />
    </a>
  );
};

/**
 * DaisyUI themes with their mode (light/dark) for UI
 * Source: https://daisyui.com/docs/themes/
 */
export const DAISYUI_THEMES = [
  { name: 'light', mode: 'light' },
  { name: 'dark', mode: 'dark' },
  { name: 'cupcake', mode: 'light' },
  { name: 'bumblebee', mode: 'light' },
  { name: 'emerald', mode: 'light' },
  { name: 'corporate', mode: 'light' },
  { name: 'synthwave', mode: 'dark' },
  { name: 'retro', mode: 'light' },
  { name: 'cyberpunk', mode: 'dark' },
  { name: 'valentine', mode: 'light' },
  { name: 'halloween', mode: 'dark' },
  { name: 'garden', mode: 'light' },
  { name: 'forest', mode: 'dark' },
  { name: 'aqua', mode: 'light' },
  { name: 'lofi', mode: 'light' },
  { name: 'pastel', mode: 'light' },
  { name: 'fantasy', mode: 'light' },
  { name: 'wireframe', mode: 'light' },
  { name: 'black', mode: 'dark' },
  { name: 'luxury', mode: 'dark' },
  { name: 'dracula', mode: 'dark' },
  { name: 'cmyk', mode: 'light' },
  { name: 'autumn', mode: 'light' },
  { name: 'business', mode: 'light' },
  { name: 'acid', mode: 'light' },
  { name: 'lemonade', mode: 'light' },
  { name: 'night', mode: 'dark' },
  { name: 'coffee', mode: 'dark' },
  { name: 'winter', mode: 'light' },
  // Add more as needed
];

const THEME_KEY = 'theme';

const setTheme = (theme: string) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  // Dispatch a custom event for DaisyUI theme change
  window.dispatchEvent(new CustomEvent('daisyui-theme-change', { detail: { theme } }));
};

const getSavedTheme = (): string | null => {
  return localStorage.getItem(THEME_KEY);
};



const RandomThemeButton: FC = () => {
  const [lastTheme, setLastTheme] = useState<string | null>(null);

  useEffect(() => {
    const saved = getSavedTheme();
    let themeToSet: string | null = null;
    if (saved && DAISYUI_THEMES.some(t => t.name === saved)) {
      setTheme(saved);
      setLastTheme(saved);
      themeToSet = saved;
    } else {
      const current = document.documentElement.getAttribute('data-theme');
      if (current && DAISYUI_THEMES.some(t => t.name === current)) {
        setLastTheme(current);
        themeToSet = current;
      }
    }
  }, []);

  const handleRandomTheme = useCallback(() => {
    const themeObj = DAISYUI_THEMES[Math.floor(Math.random() * DAISYUI_THEMES.length)];
    setTheme(themeObj.name);
    setLastTheme(themeObj.name);
    // The setTheme function already dispatches the event
  }, []);

  return (
    <div className="fixed z-50 bottom-4 right-4 flex flex-col items-center gap-2">
      <a
        role="button"
        className="cursor-pointer"
        aria-label="Randomise Theme"
        title={lastTheme ? `${lastTheme}` : 'Randomise'}
        onClick={handleRandomTheme}
      >
        <SVGIcon icon="paint_roller" className="size-6 fill-primary" />
      </a>

      <ChartThemeButton />

      <a
        href="https://www.github.com/kapilsachdev/rbi_bankwise_data_visualizer/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Project Home Page"
      >
        <SVGIcon icon="github" className="size-6 fill-primary" />
      </a>
    </div>
  );
};

export default memo(RandomThemeButton);
