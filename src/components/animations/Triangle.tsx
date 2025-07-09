import React from 'react';
import { AnimateOutline } from './AnimateOutline';


export interface TriangleProps {
  animationClassName?: string;
}

const Triangle: React.FC<TriangleProps> = ({ animationClassName }) => (
  <svg width={48} height={48} viewBox="0 0 40 40" aria-label="Triangle" className="block mx-auto text-primary">
    <AnimateOutline animationClassName={animationClassName}>
      <polygon
        points="20,7 34,33 6,33"
        stroke="currentColor"
        strokeWidth={3}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </AnimateOutline>
  </svg>
);

export default Triangle;
