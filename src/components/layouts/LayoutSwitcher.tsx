import { useContext } from 'react';
import { LayoutContext } from '../../context/LayoutContext';
import SVGIcon from '../common/SVGIcon';

const LAYOUT_OPTIONS = [
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


  return (
    <div className="dropdown dropdown-hover dropdown-left dropdown-end">
      {/* The dropdown trigger */}
      <div tabIndex={0} role='button' className="cursor-pointer text-primary" aria-label="Select layout" title="Select layout">
        {/* CORRECTED: Use the 'layout' state to determine the icon */}
        <SVGIcon icon='grid' className="text-primary size-6 md:size-10" />
      </div>

      {/* The dropdown content (panel) */}
      <div tabIndex={0} className="dropdown-content bg-base-100 shadow-lg px-2 py-1 rounded-selector flex flex-row gap-2">
        {LAYOUT_OPTIONS.map(option => (
          <button
            key={option.key}
            className={`btn btn-ghost btn-circle flex items-center justify-center transition-colors ${layout === option.key ? 'border-2 border-primary text-primary shadow-md' : 'text-base-content/70'}`}
            aria-label={option.label}
            title={option.label}
            onClick={() => setLayout(option.key)}
            tabIndex={0}
            type="button"
            role="option"
            aria-selected={layout === option.key}
          >
            <SVGIcon icon={option.icon} className="size-5" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default LayoutSwitcher;
