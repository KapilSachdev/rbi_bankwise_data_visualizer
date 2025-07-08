import React from 'react';
import { AnimateOutline } from './AnimateOutline';


export interface CircleProps {
  animationClassName?: string;
}

const Circle: React.FC<CircleProps> = ({ animationClassName }) => (
  <svg width={48} height={48} viewBox="0 0 40 40" aria-label="Circle" className="block mx-auto text-primary">
    <AnimateOutline animationClassName={animationClassName}>
      <circle
        cx={20}
        cy={20}
        r={12}
        stroke="currentColor"
        strokeWidth={3}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </AnimateOutline>
  </svg>
);

export default Circle;
