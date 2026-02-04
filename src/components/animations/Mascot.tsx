import React, { FC, memo, useCallback } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';

interface MascotProps {
  size?: number | string;
  primaryColor?: string;
  className?: string;
  name?: string;
  onClick?: () => void;
}

const defaultPalette = {
  fur: '#C6A78A',
  belly: '#FFEDD5',
  cheek: '#FFD6D0',
  eye: '#2D2D2D',
  tail: '#B38867',
};

const Mascot: FC<MascotProps> = ({
  size = 64,
  primaryColor,
  className = '',
  name = 'Diggie',
  onClick,
}) => {
  const controls = useAnimation();
  const shouldReduce = useReducedMotion();
  const palette = { ...defaultPalette, fur: primaryColor || defaultPalette.fur };

  const handleClick = useCallback(() => {
    if (onClick) onClick();
    if (!shouldReduce) {
      void controls.start({
        y: [0, -20, 0], // The Jump
        scaleY: [1, 0.8, 1.1, 1], // The Squish
        transition: { duration: 0.5, times: [0, 0.2, 0.5, 1] }
      });
    }
  }, [onClick, shouldReduce, controls]);

  return (
    <motion.div
      style={{ width: size, height: size }}
      className={`relative cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <svg viewBox="0 0 200 200" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        {/* Main Body Group controlled by Click Animation */}
        <motion.g animate={controls} style={{ originX: "100px", originY: "180px" }}>

          {/* Tail - Wiggles only on Hover */}
          <motion.path
            d="M50 130 C20 130 10 160 50 170 C80 170 90 140 70 130"
            fill={palette.tail}
            style={{ originX: "70px", originY: "140px" }}
            whileHover={{
              rotate: [0, -5, 10, -5, 0],
              transition: { duration: 0.2, repeat: Infinity }
            }}
          />

          {/* Body */}
          <ellipse cx="110" cy="135" rx="55" ry="45" fill={palette.fur} />
          <ellipse cx="115" cy="140" rx="35" ry="30" fill={palette.belly} />

          {/* Head */}
          <g transform="translate(100, 85)">
            <circle r="40" fill={palette.fur} />
            <circle cy="10" r="25" fill={palette.belly} />

            {/* Eyes */}
            <ellipse cx="-15" cy="-5" rx="5" ry="7" fill={palette.eye} />
            <ellipse cx="15" cy="-5" rx="5" ry="7" fill={palette.eye} />

            {/* Details */}
            <circle cx="-25" cy="10" r="6" fill={palette.cheek} opacity="0.6" />
            <circle cx="25" cy="10" r="6" fill={palette.cheek} opacity="0.6" />
            <ellipse cy="8" rx="7" ry="5" fill="#333" />

            {/* Teeth */}
            <rect x="-6" y="15" width="12" height="10" rx="2" fill="white" />
            <line x1="0" y1="15" x2="0" y2="25" stroke="#ddd" strokeWidth="1" />
          </g>

          {/* Legs (Static) */}
          <ellipse cx="80" cy="175" rx="12" ry="7" fill={palette.fur} />
          <ellipse cx="140" cy="175" rx="12" ry="7" fill={palette.fur} />
        </motion.g>
      </svg>
    </motion.div>
  );
};

export default memo(Mascot);
