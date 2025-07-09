import { FC, KeyboardEvent, useRef, useState } from 'react';

interface RadialMenuProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  centerLabel?: string;
  openOn?: 'hover' | 'click';
}

/**
 * RadialMenu - A circular menu where options orbit a central button.
 * @param options - Array of option labels
 * @param selected - Currently selected option
 * @param onSelect - Callback when an option is selected
 * @param centerLabel - Label for the center button (optional)
 * @param openOn - 'hover' or 'click' to open the menu (default: 'click')
 */
const RadialMenu: FC<RadialMenuProps> = ({
  options,
  selected,
  onSelect,
  centerLabel = 'All',
  openOn = 'click',
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null);

  // Calculate positions for options in a circle
  const radius = 64; // px
  const angleStep = (2 * Math.PI) / options.length;


  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setCenter({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setCenter(null);
  };
  const handleToggle = () => {
    if (!open) {
      handleOpen();
    } else {
      handleClose();
    }
  };

  // Accessibility: keyboard navigation
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  };

  return (
    <div
      className="relative inline-flex items-center justify-center select-none"
      tabIndex={0}
      aria-label="Radial filter menu"
      onKeyDown={handleKeyDown}
      onMouseLeave={openOn === 'hover' ? handleClose : undefined}
      style={{ width: 56, height: 56 }}
    >
      {/* Center button */}
      <button
        ref={btnRef}
        className={`btn btn-circle btn-primary shadow-lg z-20 transition-transform duration-200 ${open ? 'scale-110' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={centerLabel}
        onClick={openOn === 'click' ? handleToggle : undefined}
        onMouseEnter={openOn === 'hover' ? handleOpen : undefined}
        style={{ zIndex: 30 }}
      >
        {centerLabel}
      </button>
      {/* Floating options overlay */}
      {open && center && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {options.map((option, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <button
                key={option}
                className={`btn btn-xs btn-circle absolute transition-all duration-300 ease-out pointer-events-auto ${selected === option ? 'btn-accent scale-125' : 'btn-ghost'} opacity-100`}
                style={{
                  left: center.x + x,
                  top: center.y + y,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 60,
                }}
                tabIndex={0}
                aria-label={option}
                onClick={() => {
                  onSelect(option);
                  handleClose();
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default RadialMenu;
