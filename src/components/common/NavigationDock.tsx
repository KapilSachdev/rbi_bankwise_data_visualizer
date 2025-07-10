import { FC, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SVGIcon from './SVGIcon';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { label: 'Dashboard', icon: 'home', path: '/' },
  { label: 'Filter Lab', icon: 'filter', path: '/filter-lab' },
  { label: 'SVG Icon Lab', icon: 'paint_roller', path: '/svg-lab' },
];

/**
 * NavigationDock: A floating dock/hamburger menu for navigation.
 * Handles its own open/close state and route navigation.
 */
const NavigationDock: FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  return (
    <>
      {/* Hamburger menu button */}
      <a
        role="button"
        className="cursor-pointer text-primary"
        aria-label="Open navigation menu"
        onClick={() => setMenuOpen(v => !v)}
      >
        <SVGIcon icon="menu" className="max-sm:size-6 md:size-8" />
      </a>

      {/* Floating menu */}
      {menuOpen && (
        <ul className="absolute bottom-16 right-0 menu bg-base-100 border border-base-300 rounded-xl shadow-lg min-w-[180px] animate-fade-in z-50 p-2">
          {menuItems.map(item => (
            <li key={item.path} className="w-full">
              <button
                className={`flex items-center gap-3 px-4 py-3 text-base-content text-left w-full ${location.pathname === item.path ? 'font-bold text-primary' : ''}`}
                onClick={() => navigate(item.path)}
                aria-current={location.pathname === item.path ? 'page' : undefined}
                tabIndex={0}
              >
                <SVGIcon icon={item.icon} className="size-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};

export default NavigationDock;
