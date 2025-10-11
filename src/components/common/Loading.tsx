import React, { useEffect } from 'react';
import './loading.css';

export type LoadingProps = {
  className?: string;
  ariaLabel?: string;
  /**
   * When true, render as a full-viewport cover (position: fixed).
   * When false, render inline (position: relative) so it can be used inside cards.
   */
  cover?: boolean;
  /** Primary color for the loader; defaults to CSS var or brand color. */
  color?: string;
  /** If true and `cover` is true, lock body scroll while loader is present. */
  lockScroll?: boolean;
};

const Loading: React.FC<LoadingProps> = ({
  className = '',
  ariaLabel = 'Loading content',
  cover = true,
  color,
  lockScroll = true,
}) => {
  useEffect(() => {
    if (cover && lockScroll) {
      const originalOverflow = document.documentElement.style.overflow || document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = originalOverflow;
        document.body.style.overflow = originalOverflow;
      };
    }
    return;
  }, [cover, lockScroll]);

  const classes = ['preloader', !cover ? 'preloader--inline' : '', className]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties | undefined = color ? { ['--loader-color' as any]: color } : undefined;

  return (
    <div className={classes} role="status" aria-live="polite" aria-label={ariaLabel} style={style}>
      <div className="loader">
        <div className="ball" />
        <div className="line" />
      </div>
    </div>
  );
};

export default Loading;
