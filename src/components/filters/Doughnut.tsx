import { FC, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface DoughnutProps {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
  /** Diameter of the doughnut menu in px (default: 100) */
  size?: number;
}

// Doughnut - Accessible, interactive doughnut (pie) menu for option selection.
const Doughnut: FC<DoughnutProps> = ({
  options,
  selected,
  onSelect,
  size = 80,
}) => {
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  // Responsive: clamp size between 48px and 240px
  const clampedSize = useMemo(() => Math.max(48, Math.min(size, 240)), [size]);
  const radius = clampedSize / 2;
  const innerRadius = radius * 0.4;
  const gapAngle = useMemo(() => Math.max(4, 16 - options.length), [options.length]);
  const angleStep = 360 / options.length;
  const sliceAngle = angleStep - gapAngle;

  // Memoize slice paths for performance
  const slicePaths = useMemo(() => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    return options.map((_, i) => {
      const startAngle = angleStep * i - 90 + gapAngle / 2;
      const endAngle = angleStep * i - 90 + sliceAngle + gapAngle / 2;
      const x1 = radius + radius * Math.cos(toRad(startAngle));
      const y1 = radius + radius * Math.sin(toRad(startAngle));
      const x2 = radius + radius * Math.cos(toRad(endAngle));
      const y2 = radius + radius * Math.sin(toRad(endAngle));
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
    });
  }, [options.length, radius, innerRadius, angleStep, sliceAngle, gapAngle]);

  // Helper for label truncation
  const getShortLabel = (label: string) => label.length > 12 ? label.slice(0, 10) + '…' : label;

  // Memoize label positions
  const labelPositions = useMemo(() => {
    return options.map((_, i) => {
      const angle = (angleStep * (i + 0.5) - 90) * (Math.PI / 180);
      const labelRadius = radius + 15;
      const x = radius + labelRadius * Math.cos(angle) + 25;
      const y = radius + labelRadius * Math.sin(angle) + 15;
      return { x, y };
    });
  }, [options.length, radius, angleStep]);

  return (
    <div
      className="group/pie relative flex items-center justify-center w-full min-h-[160px] py-4"
      style={{ maxWidth: clampedSize * 1.5, minWidth: clampedSize, minHeight: clampedSize + 32 }}
      role="radiogroup"
      aria-label="Select an option"
    >
      <svg
        width={clampedSize}
        height={clampedSize}
        className="block focus:outline-none"
        style={{}}
        aria-hidden="true"
      >
        {options.map((option, i) => (
          <motion.path
            key={option}
            d={slicePaths[i]}
            className={`cursor-pointer focus:outline-none ${selected === option
              ? 'fill-primary'
              : 'fill-base-200 hover:fill-primary/20'
              }`}
            tabIndex={-1}
            role="radio"
            aria-checked={selected === option}
            aria-label={`Select ${option}`}
            animate={{
              scale: animatingIndex === i ? [1, 0.9, 1] : 1,
              transition: { duration: 0.2, ease: 'easeInOut' },
            }}
            onClick={() => {
              onSelect(option);
              setAnimatingIndex(i);
              setTimeout(() => setAnimatingIndex(null), 200);
            }}
          />
        ))}
      </svg>
      {/* Option labels with tooltip for overflow */}
      {options.map((option, i) => {
        const { x, y } = labelPositions[i];
        const shortLabel = getShortLabel(option);
        return (
          <div
            key={option}
            className="absolute flex flex-col items-center"
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            role="presentation"
            aria-hidden="true"
          >
            <span
              className={`text-xs font-medium p-0.5 rounded bg-base-100/80 text-base-content whitespace-nowrap max-w-[72px] truncate transition-opacity duration-200 ${selected === option
                ? 'shadow-xl border border-base-100/50 opacity-100'
                : 'group-hover/pie:opacity-100 opacity-0'
                }`}
              tabIndex={-1}
              title={option.length > 12 ? option : undefined}
            >
              {shortLabel}
            </span>
            {/* Tooltip for overflowed text */}
            {option.length > 12 && (
              <span
                className={`tooltip tooltip-open tooltip-bottom text-xs bg-base-200 text-base-content px-2 py-1 rounded mt-1 z-10 transition-opacity duration-200 ${selected === option ? 'opacity-100' : 'opacity-0'
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
