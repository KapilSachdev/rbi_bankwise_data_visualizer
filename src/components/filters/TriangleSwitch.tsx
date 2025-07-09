import React, { useRef, useEffect, useState } from 'react';
// Helper to get the total length of the triangle perimeter
const getTrianglePerimeter = (points: [number, number][]) => {
  let len = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    len += Math.hypot(x2 - x1, y2 - y1);
  }
  return len;
};

// Helper to get the length up to a side (for stroke-dashoffset)
const getOffsetToSide = (points: [number, number][], sideIdx: number) => {
  let offset = 0;
  for (let i = 0; i < sideIdx; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    offset += Math.hypot(x2 - x1, y2 - y1);
  }
  return offset;
};

interface TriangleSwitchProps {
  options: [string, string, string];
  selected: string;
  onSelect: (option: string) => void;

  size?: number;
}


const TRIANGLE_SIDES = [
  {
    coords: { x1: 32, y1: 8, x2: 56, y2: 56 },
    id: 'right',
    textDy: -10,
    reverse: false
  },
  {
    coords: { x1: 8, y1: 56, x2: 56, y2: 56 },
    id: 'bottom',
    textDy: 10,
    reverse: false
  },
  {
    coords: { x1: 8, y1: 56, x2: 32, y2: 8 },
    id: 'left',
    textDy: -10,
    reverse: false
  }
];

/**
 * TriangleSwitch - A clean and accessible SVG-based triangle switch.
 */
const TriangleSwitch: React.FC<TriangleSwitchProps> = ({
  options,
  selected,
  onSelect,
  size = 64
}) => {
  const radioGroupRef = useRef<HTMLDivElement>(null);
  // For animation
  const trianglePoints: [number, number][] = [
    [32, 8],
    [56, 56],
    [8, 56],
  ];
  // Animation state: fromIdx, toIdx, progress
  const selectedIdx = options.findIndex(o => o === selected);
  const [animState, setAnimState] = useState(() => ({
    fromIdx: selectedIdx,
    toIdx: selectedIdx,
    progress: 1
  }));
  const perimeter = getTrianglePerimeter(trianglePoints);
  const sideLens = [
    Math.hypot(56 - 32, 56 - 8),
    Math.hypot(8 - 56, 56 - 56),
    Math.hypot(32 - 8, 8 - 56),
  ];

  // Animate when selectedIdx changes
  useEffect(() => {
    if (selectedIdx === animState.toIdx && animState.progress === 1) return;
    let running = true;
    setAnimState({ fromIdx: animState.toIdx, toIdx: selectedIdx, progress: 0 });
    let startTime: number | null = null;
    const duration = 350;
    function animate(ts: number) {
      if (!running) return;
      if (startTime == null) startTime = ts;
      const elapsed = ts - startTime;
      let progress = Math.min(1, elapsed / duration);
      setAnimState(state => ({ ...state, progress }));
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimState({ fromIdx: selectedIdx, toIdx: selectedIdx, progress: 1 });
      }
    }
    requestAnimationFrame(animate);
    return () => { running = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx]);

  useEffect(() => {
    if (radioGroupRef.current) {
      const selectedRadio = radioGroupRef.current.querySelector(`[aria-label="${selected}"]`) as HTMLElement;
      selectedRadio?.focus();
    }
  }, [selected]);

  // Compute animated stroke-dashoffset
  let dashOffset = 0;
  let dashArray = 0;
  const { fromIdx, toIdx, progress } = animState;
  if (fromIdx !== toIdx && progress < 1) {
    // Animate along the shortest path (clockwise or counterclockwise), always 1 or 2 steps
    const from = getOffsetToSide(trianglePoints, fromIdx);
    const n = trianglePoints.length;
    let stepsCW = (toIdx - fromIdx + n) % n;
    let stepsCCW = (fromIdx - toIdx + n) % n;
    let useCCW = stepsCCW < stepsCW;
    if (stepsCCW === stepsCW) {
      if (stepsCW === 1) {
        useCCW = (toIdx - fromIdx + n) % n !== 1;
      } else {
        useCCW = false;
      }
    }
    let dist = 0;
    if (useCCW) {
      for (let i = 0; i < stepsCCW; ++i) {
        const idxA = (fromIdx - i + n) % n;
        const idxB = (idxA - 1 + n) % n;
        dist += Math.hypot(
          trianglePoints[idxA][0] - trianglePoints[idxB][0],
          trianglePoints[idxA][1] - trianglePoints[idxB][1]
        );
      }
      dashArray = dist;
      dashOffset = (from - (dist * progress) + perimeter) % perimeter;
    } else {
      for (let i = 0; i < stepsCW; ++i) {
        const idxA = (fromIdx + i) % n;
        const idxB = (idxA + 1) % n;
        dist += Math.hypot(
          trianglePoints[idxA][0] - trianglePoints[idxB][0],
          trianglePoints[idxA][1] - trianglePoints[idxB][1]
        );
      }
      dashArray = dist;
      dashOffset = (from + (dist * progress)) % perimeter;
    }
  } else {
    // Always highlight only the selected edge, never wrap around
    dashArray = sideLens[selectedIdx];
    dashOffset = getOffsetToSide(trianglePoints, selectedIdx);
    // If dashArray is 0 (should never happen), fallback to full perimeter
    if (dashArray === 0) {
      dashArray = perimeter;
      dashOffset = 0;
    }
  }

  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{ minWidth: size * 2, minHeight: size * 1.5 }}
      role="radiogroup"
      aria-label="Triangle switch"
      ref={radioGroupRef}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        className="block mx-auto"
        style={{ touchAction: 'manipulation', overflow: 'visible' }}
        aria-hidden="true"
      >
        {/* Triangle outline */}
        <polygon
          points="32,8 56,56 8,56"
          fill="none"
          stroke="var(--color-base-300)"
          strokeWidth={4}
        />

        {/* Animated selection stroke */}
        <polygon
          points="32,8 56,56 8,56"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={6}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={dashArray + ',' + (perimeter - dashArray)}
          strokeDashoffset={-dashOffset}
          style={{ transition: progress === 1 ? 'stroke-dashoffset 0.2s' : undefined }}
          opacity={1}
          pointerEvents="none"
        />

        {/* Define SVG paths for each triangle side for textPath usage */}
        <defs>
          {TRIANGLE_SIDES.map((side, idx) => (
            <path
              key={side.id}
              id={side.id}
              d={`M${side.coords.x1},${side.coords.y1} L${side.coords.x2},${side.coords.y2}`}
              fill="none"
            />
          ))}
        </defs>

        {/* Map over the triangle sides to render lines and tilted labels */}
        {options.map((option, index) => {
          const side = TRIANGLE_SIDES[index];
          if (!side) {
            console.warn(`Missing side configuration for option at index ${index}`);
            return null;
          }
          return (
            <React.Fragment key={option}>
              <line
                x1={side.coords.x1}
                y1={side.coords.y1}
                x2={side.coords.x2}
                y2={side.coords.y2}
                stroke={"var(--color-base-300)"}
                strokeWidth={8}
                opacity={0.1}
                strokeLinecap="round"
                className="outline-none"
                style={{ cursor: 'pointer', transition: 'stroke 0.2s, opacity 0.2s', outline: 'none' }}
                tabIndex={selectedIdx === index ? 0 : -1}
                role="radio"
                aria-checked={selectedIdx === index}
                aria-label={option}
                onClick={() => onSelect(option)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(option);
                  }
                }}
              />
              <text
                fontSize={8}
                fill="var(--color-base-content)"
                style={{ pointerEvents: 'none' }}
                dy={side.textDy}
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
            </React.Fragment>
          );
        })}
      </svg>
    </div >
  );
};

export default TriangleSwitch;
