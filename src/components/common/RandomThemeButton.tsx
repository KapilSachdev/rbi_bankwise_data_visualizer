import React, { useEffect } from 'react';

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

const RandomThemeButton: React.FC = () => {
  // On mount, set theme from localStorage if available
  useEffect(() => {
    const saved = getSavedTheme();
    if (saved && DAISYUI_THEMES.some(t => t.name === saved)) {
      setTheme(saved);
    }
  }, []);

  const handleRandomTheme = () => {
    const themeObj = DAISYUI_THEMES[Math.floor(Math.random() * DAISYUI_THEMES.length)];
    setTheme(themeObj.name);
  };

  return (
    <button
      type="button"
      className="fixed z-50 bottom-4 right-4 btn btn-primary btn-circle shadow-lg"
      aria-label="Random Theme"
      onClick={handleRandomTheme}
      title="Random DaisyUI Theme"
    >
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.07-7.07l-1.41 1.41M6.34 17.66l-1.41 1.41m12.02 0l1.41-1.41M6.34 6.34L4.93 4.93" />
      </svg>
    </button>
  );
};

export default React.memo(RandomThemeButton);
