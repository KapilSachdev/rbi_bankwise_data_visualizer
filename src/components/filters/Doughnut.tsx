import React, { FC } from 'react';

interface DoughnutProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  /** Diameter of the doughnut menu in px (default: 100) */
  size?: number;
}

/**
 * Doughnut - Accessible, interactive doughnut (pie) menu for option selection.
 * @remarks
 * - Keyboard and screen reader accessible.
 * - Uses SVG for precise, interactive segments.
 */

const Doughnut: FC<DoughnutProps> = ({
  options,
  selected,
  onSelect,
  size = 80, // slightly larger default for better touch/label spacing
}) => {
  // Responsive: clamp size between 96px and 240px
  const clampedSize = Math.max(48, Math.min(size, 240));
  const radius = clampedSize / 2;
  const innerRadius = radius * 0.4; // slightly thicker ring for modern look
  const gapAngle = Math.max(4, 16 - options.length); // adaptive gap for more options
  const angleStep = 360 / options.length;
  const sliceAngle = angleStep - gapAngle;

  // Helper to create SVG arc path for each doughnut slice with gap
  const getSlicePath = (i: number) => {
    const startAngle = angleStep * i - 90 + gapAngle / 2;
    const endAngle = angleStep * i - 90 + sliceAngle + gapAngle / 2;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    // Outer arc start/end
    const x1 = radius + radius * Math.cos(toRad(startAngle));
    const y1 = radius + radius * Math.sin(toRad(startAngle));
    const x2 = radius + radius * Math.cos(toRad(endAngle));
    const y2 = radius + radius * Math.sin(toRad(endAngle));
    // Inner arc start/end
    const x3 = radius + innerRadius * Math.cos(toRad(endAngle));
    const y3 = radius + innerRadius * Math.sin(toRad(endAngle));
    const x4 = radius + innerRadius * Math.cos(toRad(startAngle));
    const y4 = radius + innerRadius * Math.sin(toRad(startAngle));
    const largeArc = sliceAngle > 180 ? 1 : 0;
    return [
      `M${x1},${y1}`,
      `A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2}`,
      `L${x3},${y3}`,
      `A${innerRadius},${innerRadius} 0 ${largeArc} 0 ${x4},${y4}`,
      'Z',
    ].join(' ');
  };

  // Helper for label truncation
  const getShortLabel = (label: string) =>
    label.length > 12 ? label.slice(0, 10) + '…' : label;



  return (
    <div
      className="group/pie relative flex items-center justify-center w-full min-h-[160px] py-4"
      style={{ maxWidth: clampedSize * 1.5, minWidth: clampedSize, minHeight: clampedSize + 32 }}
      aria-label="Pie filter menu"
      role="menu"
      tabIndex={0}
      // Keyboard navigation removed for now
    >
      <svg
        width={clampedSize}
        height={clampedSize}
        className="block focus:outline-none drop-shadow-sm"
        aria-hidden="true"
        focusable="false"
        style={{ background: 'transparent' }}
      >
        {options.map((option, i) => (
          <path
            key={option}
            d={getSlicePath(i)}
            className={`cursor-pointer ${selected === option ? 'fill-primary' : 'fill-base-200 hover:fill-primary/30'} focus:outline-none`}
            tabIndex={-1}
            role="menuitemradio"
            aria-label={option}
            aria-checked={selected === option}
            onClick={() => onSelect(option)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') onSelect(option);
            }}
          />
        ))}
      </svg>
      {/* Option labels with tooltip for overflow */}
      {options.map((option, i) => {
        const angle = (angleStep * (i + 0.5) - 90) * (Math.PI / 180);
        // Place label further out for clarity
        const labelRadius = radius + 20;
        const x = radius + labelRadius * Math.cos(angle);
        const y = radius + labelRadius * Math.sin(angle);
        const shortLabel = getShortLabel(option);
        return (
          <div
            key={option}
            className="absolute flex flex-col items-center"
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            aria-hidden="true"
          >
            <span
              className={`text-xs font-medium p-0.5 rounded bg-base-100/80 text-base-content  pointer-events-auto whitespace-nowrap max-w-[72px] truncate ${selected === option ? 'shadow-xl border border-base-100/50' : 'group-hover/pie:visible invisible'}`}
              tabIndex={-1}
              title={option.length > 12 ? option : undefined}
            >
              {shortLabel}
            </span>
            {/* Tooltip for overflowed text */}
            {option.length > 12 && (
              <span
                className={`tooltip tooltip-open tooltip-bottom text-xs bg-base-200 text-base-content px-2 py-1 rounded mt-1 z-10 ${
                  selected === option ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {option}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Doughnut;
