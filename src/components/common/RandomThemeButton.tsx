import { FC, memo, useCallback, useEffect, useState } from 'react';
import SVGIcon from './SVGIcon';
// ...existing code...

// DaisyUI's default themes (from https://daisyui.com/docs/themes/)


/**
 * DaisyUI themes with their mode (light/dark) for UI and ECharts logic
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


const THEME_KEY = 'daisyui-theme';

const setTheme = (theme: string) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
};

const getSavedTheme = (): string | null => {
  return localStorage.getItem(THEME_KEY);
};


const RandomThemeButton: FC = () => {
  const [lastTheme, setLastTheme] = useState<string | null>(null);

  useEffect(() => {
    const saved = getSavedTheme();
    if (saved && DAISYUI_THEMES.some(t => t.name === saved)) {
      setTheme(saved);
      setLastTheme(saved);
    } else {
      const current = document.documentElement.getAttribute('data-theme');
      if (current && DAISYUI_THEMES.some(t => t.name === current)) {
        setLastTheme(current);
      }
    }
  }, []);

  const handleRandomTheme = useCallback(() => {
    const themeObj = DAISYUI_THEMES[Math.floor(Math.random() * DAISYUI_THEMES.length)];
    setTheme(themeObj.name);
    setLastTheme(themeObj.name);
  }, []);

  return (
    <div className="fixed z-50 bottom-4 right-4 flex flex-col items-center gap-2">
      <a
        href="https://www.github.com/kapilsachdev/rbi_bankwise_data_visualizer/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Project Home Page"
      >
        <SVGIcon icon="github" className="size-8 stroke-primary" />
      </a>
      <button
        type="button"
        className="btn btn-primary btn-circle btn-sm shadow-md focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:outline-none"
        aria-label="Randomise Theme"
        onClick={handleRandomTheme}
        title={lastTheme ? `${lastTheme}` : 'Randomise'}
      >
      </button>
      <a
        href="https://www.github.com/kapilsachdev"
        className="badge badge-primary badge-dash text-xs"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub profile of Kapil Sachdev"
      >
        Kapil Sachdev
      </a>
    </div>
  );
};

export default memo(RandomThemeButton);
