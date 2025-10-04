import { Fragment, useEffect, useMemo, useRef, useState } from 'react';

interface TriangleSwitchProps {
  options: [string, string, string];
  selected: string;
  onSelect: (option: string) => void;
  size?: number;
}

const POINTS = [
  [32, 8],   // Top
  [56, 56],  // Right
  [8, 56]    // Left
];

const TRIANGLE_SIDES = [
  { id: 'right', textDy: -16, points: [0, 1] },
  { id: 'bottom', textDy: 16, points: [1, 2] },
  { id: 'left', textDy: -16, points: [2, 0] }
];

/**
 * Custom hook to handle triangle geometry calculations and animation logic for the TriangleSwitch component.
 * Encapsulates the math for side lengths, perimeter, dash offsets, and smooth transitions between selections.
 * @param selectedIdx - The index of the currently selected option.
 * @param polygonRef - Ref to the animated SVG polygon element.
 * @param radioGroupRef - Ref to the radio group container for accessibility focus.
 * @param selected - The currently selected option string for focus management.
 * @returns Object containing sideLengths, perimeter, and dashOffsets for rendering.
 */
const useTriangleAnimation = (
  selectedIdx: number,
  polygonRef: React.RefObject<SVGPolygonElement | null>,
  radioGroupRef: React.RefObject<HTMLDivElement | null>,
  selected: string
) => {
  const [prevIdx, setPrevIdx] = useState(-1);

  // Calculate geometry once - computes side lengths, perimeter, and dash offsets for the triangle.
  const { sideLengths, perimeter, dashOffsets } = useMemo(() => {
    const sideLengths = TRIANGLE_SIDES.map((_, i) => {
      const [p1, p2] = [POINTS[i], POINTS[(i + 1) % 3]];
      return Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
    });

    const perimeter = sideLengths.reduce((sum, len) => sum + len, 0);
    const dashOffsets = [
      0,
      sideLengths[0],
      sideLengths[0] + sideLengths[1]
    ];

    return { sideLengths, perimeter, dashOffsets };
  }, []);

  // Animation handling - manages smooth transitions between selected options by calculating the shortest path.
  useEffect(() => {
    if (selectedIdx === prevIdx || prevIdx === -1) {
      setPrevIdx(selectedIdx);
      return;
    }

    const polygon = polygonRef.current;
    if (!polygon) return;

    const fromOffset = -dashOffsets[prevIdx];
    const toOffset = -dashOffsets[selectedIdx];

    // Calculate the direct distance between points
    const directDistance = toOffset - fromOffset;

    // Calculate the distance going the other way around
    let wrapAroundDistance;
    if (directDistance > 0) {
      wrapAroundDistance = directDistance - perimeter;
    } else {
      wrapAroundDistance = perimeter + directDistance;
    }

    // Choose the direction with the smallest absolute distance
    const shouldWrap = Math.abs(wrapAroundDistance) < Math.abs(directDistance);
    const finalToOffset = shouldWrap ? fromOffset + wrapAroundDistance : fromOffset + directDistance;

    polygon.style.transition = 'none';
    polygon.style.strokeDashoffset = `${fromOffset}`;

    requestAnimationFrame(() => {
      polygon.style.transition = 'stroke-dashoffset 350ms cubic-bezier(0.4, 0, 0.2, 1)';
      polygon.style.strokeDashoffset = `${finalToOffset}`;
    });

    const handler = () => setPrevIdx(selectedIdx);
    polygon.addEventListener('transitionend', handler, { once: true });

    return () => polygon.removeEventListener('transitionend', handler);
  }, [selectedIdx, prevIdx, dashOffsets, perimeter]);

  // Accessibility focus - ensures the selected radio element receives focus for screen readers.
  useEffect(() => {
    const radio = radioGroupRef.current?.querySelector<HTMLElement>(`[aria-label="${selected}"]`);
    radio?.focus();
  }, [selected, radioGroupRef]);

  return { sideLengths, perimeter, dashOffsets };
};

/**
 * TriangleSwitch component - A unique triangular radio switch with smooth animations and full accessibility support.
 * Allows selection of one of three options via clicks or keyboard navigation, with visual feedback on the triangle edges.
 * @param options - Array of three string options to display on the triangle sides.
 * @param selected - The currently selected option string.
 * @param onSelect - Callback function invoked when an option is selected.
 * @param size - Optional size of the SVG (default: 64).
 */
const TriangleSwitch: React.FC<TriangleSwitchProps> = ({
  options,
  selected,
  onSelect,
  size = 64
}) => {
  const polygonRef = useRef<SVGPolygonElement>(null);
  const radioGroupRef = useRef<HTMLDivElement>(null);
  const selectedIdx = options.indexOf(selected);

  const { sideLengths, perimeter, dashOffsets } = useTriangleAnimation(
    selectedIdx,
    polygonRef,
    radioGroupRef,
    selected
  );

  return (
    <div
      ref={radioGroupRef}
      className="flex flex-col items-center justify-center"
      style={{ minWidth: size * 2, minHeight: size * 1.5 }}
      role="radiogroup"
      aria-label="Triangle switch"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className="block mx-auto"
        style={{
          touchAction: 'manipulation',
          overflow: 'visible',
          shapeRendering: 'geometricPrecision',
          textRendering: 'geometricPrecision'
        }}
      >
        {/* Static triangle outline */}
        <polygon
          points="32,8 56,56 8,56"
          fill="none"
          stroke="var(--color-base-300)"
          strokeWidth={8}
        />

        {/* Animated highlight */}
        <polygon
          ref={polygonRef}
          points="32,8 56,56 8,56"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={10}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={`${sideLengths[selectedIdx]},${perimeter - sideLengths[selectedIdx]}`}
          strokeDashoffset={-dashOffsets[selectedIdx]}
          opacity={1}
          pointerEvents="none"
        />

        <defs>
          {TRIANGLE_SIDES.map((side) => {
            let [start, end] = side.points.map(i => POINTS[i]);
            // For the 'bottom' side, reverse the direction so text is not reversed
            if (side.id === 'bottom') {
              [start, end] = [end, start];
            }
            return (
              <path
                key={side.id}
                id={side.id}
                d={`M${start[0]},${start[1]} L${end[0]},${end[1]}`}
                fill="none"
              />
            );
          })}
        </defs>

        {options.map((option, index) => {
          const side = TRIANGLE_SIDES[index];
          const isSelected = selectedIdx === index;

          return (
            <Fragment key={option}>
              <line
                x1={POINTS[side.points[0]][0]}
                y1={POINTS[side.points[0]][1]}
                x2={POINTS[side.points[1]][0]}
                y2={POINTS[side.points[1]][1]}
                stroke="var(--color-base-300)"
                strokeWidth={12}
                opacity={0.3}
                strokeLinecap="round"
                style={{
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  opacity: isSelected ? 0.2 : 0.1,
                  outline: 'none'
                }}
                tabIndex={isSelected ? 0 : -1}
                role="radio"
                aria-checked={isSelected}
                aria-label={option}
                onClick={() => onSelect(option)}
                onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && onSelect(option)}
              />
              <text
                fontSize={16}
                fill="var(--color-base-content)"
                className={
                  [
                    'cursor-pointer',
                    'focus:outline-none',
                    'overflow-visible',
                    'transition-all',
                    'duration-200',
                    isSelected ? 'font-bold' : 'font-light',
                  ].join(' ')
                }
                dy={side.textDy}
                tabIndex={0}
                role="radio"
                aria-checked={isSelected}
                aria-label={option}
                onClick={() => onSelect(option)}
                onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && onSelect(option)}
              >
                <textPath
                  href={`#${side.id}`}
                  startOffset="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {option}
                </textPath>
              </text>
            </Fragment>
          );
        })}
      </svg>
    </div>
  );
};

export default TriangleSwitch;
