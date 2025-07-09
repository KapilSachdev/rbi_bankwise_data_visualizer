import React from 'react';
import { AnimateOutline } from './AnimateOutline';


export interface SquareProps {
  animationClassName?: string;
}

const Square: React.FC<SquareProps> = ({ animationClassName }) => (
  <svg width={48} height={48} viewBox="0 0 40 40" aria-label="Square" className="block mx-auto text-primary">
    <AnimateOutline animationClassName={animationClassName}>
      <rect
        x={8}
        y={8}
        width={24}
        height={24}
        stroke="currentColor"
        strokeWidth={3}
        fill="none"
        rx={4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </AnimateOutline>
  </svg>
);

export default Square;
