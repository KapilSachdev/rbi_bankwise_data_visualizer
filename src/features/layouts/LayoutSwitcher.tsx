import { useContext, useRef, useState } from 'react';
import { LayoutContext } from '../../context/LayoutContext';
import SVGIcon from '../../components/common/SVGIcon';

const LAYOUTS = [
  {
    key: 'grid',
    icon: 'grid',
    label: 'Grid Layout',
  },
  {
    key: 'accordion',
    icon: 'layers',
    label: 'Accordion Layout',
  },
];

function LayoutSwitcher() {
  const { layout, setLayout } = useContext(LayoutContext);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on blur (if focus leaves the panel)
  const handleBlur = (e: React.FocusEvent<HTMLButtonElement | HTMLDivElement>) => {
    if (!panelRef.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  return (
    <div className="relative flex items-center" tabIndex={-1}>
      {/* Main icon button */}
      <div
        className="cursor-pointer"
        aria-label="Select layout"
        title="Select layout"
        onMouseEnter={() => setOpen(true)}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        tabIndex={0}
      >
        <SVGIcon icon='grid' className="text-primary size-6 md:size-10" />
      </div>
      {/* Slide-out panel */}
      <div
        ref={panelRef}
        className={`absolute right-12 top-1/2 -translate-y-1/2 flex flex-row-reverse gap-2 bg-base-200/90 glass rounded-xl shadow-lg px-2 py-1 transition-all duration-200 ${open ? 'opacity-100 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95'}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        tabIndex={-1}
        aria-label="Layout options"
        role="menu"
      >
        {LAYOUTS.map(l => (
          <button
            key={l.key}
            className={`btn btn-ghost btn-circle flex items-center justify-center transition-colors ${layout === l.key ? 'border-2 border-primary text-primary shadow-md' : 'text-base-content/70'}`}
            aria-label={l.label}
            title={l.label}
            onClick={() => { setLayout(l.key); setOpen(false); }}
            tabIndex={0}
            type="button"
            role="menuitem"
            autoFocus={open && layout === l.key}
          >
            <SVGIcon icon={l.icon} className="size-5" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default LayoutSwitcher;
