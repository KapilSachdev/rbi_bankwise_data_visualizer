import { FC, memo, useCallback, useEffect, useState } from 'react';
import { ECHARTS_THEMES, UI_THEMES } from '../../constants/themes';
import { setEchartsThemeName } from '../../hooks/useEchartsThemeSync';
import { oklchToHex } from '../../utils/color';
import SVGIcon from './SVGIcon';



const THEME_KEY = 'theme';

const setTheme = (theme: string) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
};

const getSavedTheme = (): string | null => {
  return localStorage.getItem(THEME_KEY);
};

interface ChartThemeButtonProps {
  uiTheme: string | null;
}


const ChartThemeButton: FC<ChartThemeButtonProps> = ({ uiTheme }) => {
  const [currentTheme, setCurrentTheme] = useState<string>(() => localStorage.getItem('echarts-theme') || ECHARTS_THEMES[0].name);

  const handleNextTheme = useCallback(() => {
    const idx = ECHARTS_THEMES.findIndex(t => t.name === currentTheme);
    const uiThemeMode = UI_THEMES.find((theme) => theme.name == uiTheme)?.mode;
    const availableThemes = ECHARTS_THEMES.filter(theme => theme.mode == uiThemeMode);
    const nextIdx = (idx + 1) % availableThemes.length;
    const nextTheme = availableThemes[nextIdx]?.name;
    setCurrentTheme(nextTheme);
    setEchartsThemeName(nextTheme); // This will dispatch the event for listeners
  }, [currentTheme, uiTheme]);

  // Only update local state from localStorage on mount (in case user reloads)
  useEffect(() => {
    setCurrentTheme(localStorage.getItem('echarts-theme') || ECHARTS_THEMES[0].name);
  }, []);

  useEffect(() => {
    const uiThemeMode = UI_THEMES.find((theme) => theme.name == uiTheme)?.mode;
    const chartThemeMode = ECHARTS_THEMES.find(theme => theme.name == currentTheme)?.mode;
    if (uiThemeMode != chartThemeMode) handleNextTheme();

  }, [uiTheme, currentTheme, handleNextTheme]);

  return (
    <a
      role="button"
      className="cursor-pointer text-primary"
      aria-label="Randomise Chart Theme"
      onClick={handleNextTheme}
      title={`Chart Theme: ${currentTheme}`}
    >
      <SVGIcon icon="chart" className="max-sm:size-6 md:size-8" />
    </a>
  );
};

const RandomThemeButton: FC = () => {
  const [lastTheme, setLastTheme] = useState<string | null>(null);

  useEffect(() => {
    const saved = getSavedTheme();
    if (saved && UI_THEMES.some(t => t.name === saved)) {
      setTheme(saved);
      setLastTheme(saved);
    } else {
      const current = document.documentElement.getAttribute('data-theme');
      if (current && UI_THEMES.some(t => t.name === current)) {
        setLastTheme(current);
      }
    }
  }, []);


  const updateMetaTheme = (mode: string | 'light' | 'dark') => {
    let primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
    if (primaryColor.startsWith('oklch')) {
      primaryColor = oklchToHex(primaryColor);
    }
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    if (primaryColor) {
      meta.setAttribute('content', primaryColor);
      meta.setAttribute('media', `(prefers-color-scheme: ${mode})`);
    }
  }

  const handleRandomTheme = useCallback(() => {
    const themeObj = UI_THEMES[Math.floor(Math.random() * UI_THEMES.length)];
    setTheme(themeObj.name);
    setLastTheme(themeObj.name);
    updateMetaTheme(themeObj.mode);
  }, []);

  return (
    <div className="fixed z-50 bottom-4 right-4 flex flex-col items-center gap-2">
      <a
        role="button"
        className="cursor-pointer text-primary"
        aria-label="Randomise Theme"
        title={lastTheme ? `${lastTheme}` : 'Randomise'}
        onClick={handleRandomTheme}
      >
        <SVGIcon icon="paint_roller" className="max-sm:size-6 md:size-8" />
      </a>

      <ChartThemeButton uiTheme={lastTheme} />

      <a
        href="https://www.github.com/kapilsachdev/rbi_bankwise_data_visualizer/"
        target="_blank"
        className='cursor-pointer text-primary'
        rel="noopener noreferrer"
        aria-label="Project Home Page"
      >
        <SVGIcon icon="github" className="max-sm:size-6 md:size-8" />
      </a>
    </div>
  );
};

export default memo(RandomThemeButton);
