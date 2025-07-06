import { FC, useRef, useState, useCallback, useEffect, MouseEvent, TouchEvent, KeyboardEvent } from 'react';

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (range: [number, number]) => void;
  step?: number;
  className?: string;
  startLabel?: string;
  endLabel?: string;
}


/**
 * A true two-thumb range slider with a single track and two draggable thumbs, styled with daisyUI/Tailwind.
 * Emits [start, end] range, prevents thumbs from crossing, accessible and keyboard-friendly.
 */
const RangeSlider: FC<RangeSliderProps> = ({
  min,
  max,
  value: [start, end],
  onChange,
  step = 1,
  className = '',
  startLabel,
  endLabel,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<null | 'start' | 'end'>(null);

  // Calculate percent positions for thumbs
  const percent = useCallback((val: number) => ((val - min) / (max - min)) * 100, [min, max]);
  const startPercent = percent(start);
  const endPercent = percent(end);


  // Mouse/touch drag logic
  const onThumbDown = useCallback((which: 'start' | 'end') => (e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    setDragging(which);
    document.body.style.userSelect = 'none';
  }, []);

  // Track click logic: move nearest thumb to click position
  const handleTrackClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = Math.max(0, Math.min(1, clickX / rect.width));
    let value = Math.round((min + clickPercent * (max - min)) / step) * step;
    value = Math.max(min, Math.min(max, value));
    // Decide which thumb is closer
    const distToStart = Math.abs(value - start);
    const distToEnd = Math.abs(value - end);
    if (distToStart < distToEnd) {
      // Move start thumb, but don't cross end
      if (value > end) value = end;
      onChange([value, end]);
    } else {
      // Move end thumb, but don't cross start
      if (value < start) value = start;
      onChange([start, value]);
    }
  }, [end, max, min, onChange, start, step]);

  const onThumbMove = useCallback((clientX: number) => {
    if (!trackRef.current || dragging === null) return;
    const rect = trackRef.current.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent));
    let value = Math.round((min + percent * (max - min)) / step) * step;
    value = Math.max(min, Math.min(max, value));
    if (dragging === 'start') {
      if (value > end) value = end;
      onChange([value, end]);
    } else {
      if (value < start) value = start;
      onChange([start, value]);
    }
  }, [dragging, min, max, start, end, step, onChange]);

  // Mouse/touch event listeners
  useEffect(() => {
    if (dragging === null) return;
    const move = (e: Event) => {
      if ('touches' in e) {
        const touchEvent = e as unknown as TouchEvent;
        if (touchEvent.touches && touchEvent.touches.length > 0) {
          onThumbMove(touchEvent.touches[0].clientX);
        }
      } else if ('clientX' in e) {
        const mouseEvent = e as unknown as MouseEvent;
        onThumbMove(mouseEvent.clientX);
      }
    };
    const up = () => {
      setDragging(null);
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', move as EventListener);
    window.addEventListener('touchmove', move as EventListener);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move as EventListener);
      window.removeEventListener('touchmove', move as EventListener);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchend', up);
    };
  }, [dragging, onThumbMove]);

  // Keyboard accessibility
  const handleThumbKey = useCallback((which: 'start' | 'end') => (e: KeyboardEvent<HTMLDivElement>) => {
    let delta = 0;
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') delta = -step;
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') delta = step;
    if (delta !== 0) {
      e.preventDefault();
      if (which === 'start') {
        const newStart = Math.min(Math.max(start + delta, min), end);
        onChange([newStart, end]);
      } else {
        const newEnd = Math.max(Math.min(end + delta, max), start);
        onChange([start, newEnd]);
      }
    }
  }, [end, max, min, onChange, start, step]);

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <div className="flex items-center gap-2 select-none">
        {startLabel && <span className="text-xs">{startLabel}</span>}
        <div
          ref={trackRef}
          className="relative flex-1 h-12 flex items-center cursor-pointer"
          aria-label="Range slider"
          onClick={handleTrackClick}
        >
          {/* Value badges above thumbs */}
          <span
            className="absolute -top-2 left-0 translate-x-[-50%] badge badge-primary text-xs px-2 py-1 select-none pointer-events-none"
            style={{ left: `calc(${startPercent}% )` }}
            aria-hidden="true"
          >
            {start}
          </span>
          <span
            className="absolute -top-2 left-0 translate-x-[-50%] badge badge-primary text-xs px-2 py-1 select-none pointer-events-none"
            style={{ left: `calc(${endPercent}% )` }}
            aria-hidden="true"
          >
            {end}
          </span>
          {/* Track */}
          <div className="absolute left-0 right-0 h-2 rounded-selector bg-base-300" style={{ top: '50%', transform: 'translateY(-50%)' }} />
          {/* Selected range */}
          <div
            className="absolute h-2 rounded-selector bg-primary"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
            }}
          />
          {/* Start thumb */}
          <div
            role="slider"
            tabIndex={0}
            aria-valuemin={min}
            aria-valuemax={end}
            aria-valuenow={start}
            aria-label="Select start value"
            className={`absolute w-5 h-5 rounded-selector bg-primary border-2 border-base-100 shadow transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-primary z-10 cursor-pointer ${dragging === 'start' ? 'scale-110' : ''}`}
            style={{ left: `calc(${startPercent}% - 0.625rem)`, top: '50%', transform: 'translateY(-50%)' }}
            onMouseDown={onThumbDown('start')}
            onTouchStart={onThumbDown('start')}
            onKeyDown={handleThumbKey('start')}
          />
          {/* End thumb */}
          <div
            role="slider"
            tabIndex={0}
            aria-valuemin={start}
            aria-valuemax={max}
            aria-valuenow={end}
            aria-label="Select end value"
            className={`absolute w-5 h-5 rounded-selector bg-primary border-2 border-base-100 shadow transition-all duration-100 focus:outline-none focus:ring-2 focus:ring-primary z-10 cursor-pointer ${dragging === 'end' ? 'scale-110' : ''}`}
            style={{ left: `calc(${endPercent}% - 0.625rem)`, top: '50%', transform: 'translateY(-50%)' }}
            onMouseDown={onThumbDown('end')}
            onTouchStart={onThumbDown('end')}
            onKeyDown={handleThumbKey('end')}
          />
        </div>
        {endLabel && <span className="text-xs">{endLabel}</span>}
      </div>
    </div>
  );
};

export default RangeSlider;
