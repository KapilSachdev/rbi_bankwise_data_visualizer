
import React, { useRef, useEffect } from 'react';
import './animations.css';

/**
 * AnimateOutline wraps a single SVG shape and animates its outline using CSS keyframes.
 * It works for any SVG shape that supports getTotalLength().
 *
 * Usage:
 * <AnimateOutline>
 *   <circle ... />
 * </AnimateOutline>
 */
export interface AnimateOutlineProps {
  children: React.ReactElement<SVGElement>;
  duration?: number; // ms
  animationClassName?: string; // animation class for outline
}

export const AnimateOutline: React.FC<AnimateOutlineProps> = ({ children, duration = 3000, animationClassName = 'animated-dash' }) => {
  const shapeRef = useRef<SVGElement>(null);

  useEffect(() => {
    const el = shapeRef.current;
    if (!el) return;
    let perimeter = 100;
    if ('getTotalLength' in el && typeof (el as any).getTotalLength === 'function') {
      try {
        perimeter = (el as any).getTotalLength();
      } catch { }
    }
    el.style.setProperty('--perimeter', `${perimeter}`);
    el.style.setProperty('--duration', `${duration}ms`);
  }, [duration]);

  // Only attach the ref if the child is a string element (e.g., 'circle', 'rect', etc.)
  const isDomElement = typeof children.type === 'string';
  return React.cloneElement(children, {
    ...(isDomElement ? { ref: shapeRef } : {}),
    className: [children.props.className, animationClassName].filter(Boolean).join(' '),
    style: { ...(children.props.style || {}) },
  });
};
