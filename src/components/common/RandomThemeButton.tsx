import React from 'react';

// DaisyUI's default themes (from https://daisyui.com/docs/themes/)
const DAISYUI_THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'retro', 'cyberpunk',
  'valentine', 'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe',
  'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee', 'winter',
];

const RandomThemeButton: React.FC = () => {
  const handleRandomTheme = () => {
    const theme = DAISYUI_THEMES[Math.floor(Math.random() * DAISYUI_THEMES.length)];
    document.documentElement.setAttribute('data-theme', theme);
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
