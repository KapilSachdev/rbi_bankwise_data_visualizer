import { FC, KeyboardEvent, ReactNode, useEffect, useRef, useState } from 'react';

interface OrbitMenuProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  centerIcon?: ReactNode;
  openOn?: 'hover' | 'click';
}

/**
 * OrbitMenu - A planetary/orbit menu with a central planet and orbiting moons (options).
 * @param options - Array of option labels
 * @param selected - Currently selected option
 * @param onSelect - Callback when an option is selected
 * @param centerIcon - Icon or element for the center planet (optional)
 * @param openOn - 'hover' or 'click' to open the menu (default: 'click')
 */

const OrbitMenu: FC<OrbitMenuProps> = ({
  options,
  selected,
  onSelect,
  centerIcon = <span className="text-2xl">🪐</span>,
  openOn = 'click',
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null);
  const radius = 72; // px
  const angleStep = (2 * Math.PI) / options.length;
  // For orbit animation
  const ORBIT_ROTATION_SPEED = 0.03; // degrees per ms, controls orbit rotation speed
  const [orbitAngle, setOrbitAngle] = useState(0);

  useEffect(() => {
    let raf: number | undefined;
    if (open) {
      let last = performance.now();
      const animate = (now: number) => {
        const delta = now - last;
        last = now;
        setOrbitAngle(a => (a + (delta * ORBIT_ROTATION_SPEED)) % 360); // slow rotation
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
    }
    return () => {
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  }, [open]);

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
      aria-label="Orbit filter menu"
      onKeyDown={handleKeyDown}
      onMouseLeave={openOn === 'hover' ? handleClose : undefined}
      style={{ width: 56, height: 56 }}
    >
      {/* Central planet */}
      <button
        ref={btnRef}
        className={`btn btn-circle btn-secondary shadow-lg z-20 transition-transform duration-200 ${open ? 'scale-110 ring-4 ring-info/30' : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Open orbit menu"
        onClick={openOn === 'click' ? handleToggle : undefined}
        onMouseEnter={openOn === 'hover' ? handleOpen : undefined}
        style={{ boxShadow: open ? '0 0 16px 4px #38bdf8aa' : undefined, zIndex: 40 }}
      >
        {centerIcon}
      </button>
      {/* Orbit ring and moons overlay */}
      {open && center && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Orbit ring */}
          <svg style={{ position: 'absolute', left: center.x - radius, top: center.y - radius, pointerEvents: 'none', zIndex: 30 }} width={radius * 2} height={radius * 2}>
            <circle
              cx={radius}
              cy={radius}
              r={radius}
              fill="none"
              stroke="#8884"
              strokeWidth="2"
              style={{ filter: 'blur(0.5px)' }}
            />
          </svg>
          {/* Moons */}
          {options.map((option, i) => {
            const baseAngle = i * angleStep - Math.PI / 2;
            const animatedAngle = baseAngle + (open ? (orbitAngle * Math.PI) / 180 : 0);
            const x = Math.cos(animatedAngle) * radius;
            const y = Math.sin(animatedAngle) * radius;
            return (
              <button
                key={option}
                className={`btn btn-xs btn-circle absolute transition-all duration-300 ease-out pointer-events-auto ${selected === option ? 'btn-info scale-125 ring-2 ring-info' : 'btn-ghost'} opacity-100`}
                style={{
                  left: center.x + x,
                  top: center.y + y,
                  transform: 'translate(-50%, -50%)',
                  boxShadow: open ? '0 0 8px 2px #38bdf8aa' : undefined,
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

export default OrbitMenu;
