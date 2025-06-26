import React from 'react';

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
const Doughnut: React.FC<DoughnutProps> = ({
  options,
  selected,
  onSelect,
  size = 100,
}) => {
  // Each slice is a doughnut (ring) segment
  const radius = size / 2;
  const innerRadius = radius * 0.55; // thickness of the ring (adjust as needed)
  const gapAngle = 6; // degrees of gap between slices
  const angleStep = 360 / options.length;
  const sliceAngle = angleStep - gapAngle;

  // Helper to create SVG arc path for each doughnut slice with gap
  const getSlicePath = (i: number) => {
    // Add gap by offsetting start/end angles
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

    // Path: move to outer start, arc outer, line to inner end, arc inner (reverse), close
    return [
      `M${x1},${y1}`,
      `A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2}`,
      `L${x3},${y3}`,
      `A${innerRadius},${innerRadius} 0 ${largeArc} 0 ${x4},${y4}`,
      'Z',
    ].join(' ');
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label="Pie filter menu"
      role="menu"
      tabIndex={0}
    >
      <svg width={size} height={size} className="block focus:outline-none" aria-hidden="true" focusable="false">
        {options.map((option, i) => (
          <path
            key={option}
            d={getSlicePath(i)}
            className={`transition-all duration-200 cursor-pointer ${selected === option ? 'fill-primary' : 'fill-neutral-content hover:fill-secondary'} focus:outline-none`}
            tabIndex={0}
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
      {/* Option labels */}
      {options.map((option, i) => {
        const angle = (angleStep * (i + 0.5) - 90) * (Math.PI / 180);
        // Place label just outside the ring
        const labelRadius = radius + 14; // 14px outside the outer edge
        const x = radius + labelRadius * Math.cos(angle);
        const y = radius + labelRadius * Math.sin(angle);
        return (
          <span
            key={option}
            className="absolute text-xs font-semibold select-none pointer-events-none"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
            }}
            aria-hidden="true"
          >
            {option}
          </span>
        );
      })}
    </div>
  );
};

export default Doughnut;
