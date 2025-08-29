import { FC, memo, SVGProps } from 'react';

interface SVGIconProps extends SVGProps<SVGSVGElement> {
  /**
   * The symbol id from the sprite (e.g., "github").
   */
  icon: string;
}

/**
 * Renders an SVG icon from the sprite at public/assets/icons.svg.
 * @param icon The symbol id (e.g., "github")
 * @param className
 * @param rest Other SVG props (e.g., aria-label, title)
 */
const SVGIcon: FC<SVGIconProps> = ({ icon, className = 'size-8', ...rest }) => (
  <svg role="img" className={className} {...rest}>
    <use href={`assets/icons.svg#${icon}`} />
  </svg>
);

export default memo(SVGIcon);
