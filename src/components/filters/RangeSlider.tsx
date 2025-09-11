import { motion } from 'framer-motion';
import { FC, useCallback, useEffect, useRef, useState } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
  step?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Modern dual-thumb range slider with smooth animations and full accessibility
 */
const RangeSlider: FC<RangeSliderProps> = ({
  min,
  max,
  value: [start, end],
  onChange,
  step = 1,
  className = '',
  disabled = false,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<null | 'start' | 'end'>(null);

  // Calculate positions
  const getPosition = useCallback((val: number) => ((val - min) / (max - min)) * 100, [min, max]);
  const startPos = getPosition(start);
  const endPos = getPosition(end);

  // Convert position to value
  const positionToValue = useCallback((position: number) => {
    const clamped = Math.max(0, Math.min(100, position));
    const rawValue = min + (clamped / 100) * (max - min);
    return Math.round(rawValue / step) * step;
  }, [min, max, step]);

  // Handle drag start
  const handleThumbDown = useCallback((thumb: 'start' | 'end') =>
    (e: React.MouseEvent | React.TouchEvent) => {
      if (disabled) return;
      e.preventDefault();
      setDragging(thumb);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }, [disabled]);

  // Handle drag move
  const handleMove = useCallback((clientX: number) => {
    if (!trackRef.current || dragging === null) return;

    const rect = trackRef.current.getBoundingClientRect();
    const position = ((clientX - rect.left) / rect.width) * 100;
    const newValue = positionToValue(position);

    if (dragging === 'start') {
      const clampedValue = Math.min(Math.max(newValue, min), end);
      onChange([clampedValue, end]);
    } else {
      const clampedValue = Math.max(Math.min(newValue, max), start);
      onChange([start, clampedValue]);
    }
  }, [dragging, positionToValue, min, max, start, end, onChange]);

  // Handle track click
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (disabled || !trackRef.current) return;

    const rect = trackRef.current.getBoundingClientRect();
    const position = ((e.clientX - rect.left) / rect.width) * 100;
    const clickValue = positionToValue(position);

    // Move closer thumb
    const distToStart = Math.abs(clickValue - start);
    const distToEnd = Math.abs(clickValue - end);

    if (distToStart < distToEnd) {
      onChange([Math.min(clickValue, end), end]);
    } else {
      onChange([start, Math.max(clickValue, start)]);
    }
  }, [disabled, positionToValue, start, end, onChange]);

  // Global event listeners
  useEffect(() => {
    if (dragging === null) return;

    const handleGlobalMove = (e: Event) => {
      const clientX = 'touches' in e
        ? (e as TouchEvent).touches[0]?.clientX
        : (e as MouseEvent).clientX;

      if (clientX !== undefined) {
        handleMove(clientX);
      }
    };

    const handleGlobalUp = () => {
      setDragging(null);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleGlobalMove);
    document.addEventListener('touchmove', handleGlobalMove);
    document.addEventListener('mouseup', handleGlobalUp);
    document.addEventListener('touchend', handleGlobalUp);

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove);
      document.removeEventListener('touchmove', handleGlobalMove);
      document.removeEventListener('mouseup', handleGlobalUp);
      document.removeEventListener('touchend', handleGlobalUp);
    };
  }, [dragging, handleMove]);

  return (
    <div className={`flex flex-col gap-3 w-full ${className}`}>

      {/* Slider */}
      <div
        ref={trackRef}
        className={`relative h-2 rounded-selector cursor-pointer transition-colors touch-none ${disabled ? 'bg-base-300 cursor-not-allowed' : 'bg-base-300 hover:bg-base-content/20'
          }`}
        onClick={handleTrackClick}
      >
        {/* Active range */}
        <motion.div
          className="absolute h-full rounded-selector bg-primary"
          style={{
            left: `${startPos}%`,
            width: `${endPos - startPos}%`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />

        {/* Start Thumb */}
        <motion.div
          className={`absolute w-5 h-5 rounded-selector border-2 shadow-lg cursor-grab transition-all duration-200 top-1/2 -translate-y-1/2 ${disabled
            ? 'bg-base-300 border-base-400 cursor-not-allowed'
            : dragging === 'start'
              ? 'bg-primary border-primary scale-110 shadow-xl'
              : 'bg-primary border-base-100'
            }`}
          style={{
            left: `calc(${startPos}% - 0.625rem)`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onMouseDown={handleThumbDown('start')}
          onTouchStart={handleThumbDown('start')}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={end}
          aria-valuenow={start}
          aria-label={`Start value: ${start}`}
        >
          {/* Value label above thumb */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 badge badge-primary text-xs font-medium px-1.5 py-0.5 rounded-selector shadow-sm border border-base-300 whitespace-nowrap">
            {start}
          </div>
        </motion.div>

        {/* End Thumb */}
        <motion.div
          className={`absolute w-5 h-5 rounded-selector border-2 shadow-lg cursor-grab transition-all duration-200 top-1/2 -translate-y-1/2 ${disabled
            ? 'bg-base-300 border-base-400 cursor-not-allowed'
            : dragging === 'end'
              ? 'bg-primary border-primary scale-110 shadow-xl'
              : 'bg-primary border-base-100'
            }`}
          style={{
            left: `calc(${endPos}% - 0.625rem)`,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onMouseDown={handleThumbDown('end')}
          onTouchStart={handleThumbDown('end')}
          role="slider"
          aria-valuemin={start}
          aria-valuemax={max}
          aria-valuenow={end}
          aria-label={`End value: ${end}`}
        >
          {/* Value label above thumb */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 badge badge-primary text-xs font-medium px-1.5 py-0.5 rounded-selector shadow-sm border border-base-300 whitespace-nowrap">
            {end}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RangeSlider;
