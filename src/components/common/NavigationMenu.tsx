import { FC } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SVGIcon from './SVGIcon';

interface MenuItem {
  label: string;
  icon: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { label: 'SVG Lab', icon: 'paint_roller', path: '/svg_lab' },
  { label: 'Filter Lab', icon: 'filter', path: '/filter_lab' },
  { label: 'Bank Profile', icon: 'bank', path: '/bank_profile' },
  { label: 'Credit Card', icon: 'credit_card', path: '/cards' },
  { label: 'Home', icon: 'home', path: '/' },
];

/**
 * NavigationMenu: A floating dock/hamburger menu for navigation.
 * Handles its own open/close state and route navigation.
 */
const NavigationMenu: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Handler for menu navigation and closing dropdown
  const handleMenuClick = (path: string) => {
    navigate(path);
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  return (
    <div className="dropdown dropdown-hover dropdown-left dropdown-end">
      <div tabIndex={0} role='button' className="cursor-pointer text-primary" aria-label="Open navigation menu">
        <SVGIcon icon="menu" className="size-6 md:size-10" />
      </div>
      <ul tabIndex={0} className="menu rounded dropdown-content bg-base-100 shadow-md">
        {menuItems.map(item => (
          <li key={item.path} className="w-full">
            <button
              className={`flex flex-nowrap items-center gap-3 px-4 py-3 text-base-content w-full whitespace-nowrap ${location.pathname === item.path ? 'font-bold text-primary' : ''}`}
              onClick={() => handleMenuClick(item.path)}
              aria-current={location.pathname === item.path ? 'page' : undefined}
              tabIndex={0}
            >
              {/* <SVGIcon icon={item.icon} className="size-5" /> */}
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavigationMenu;
