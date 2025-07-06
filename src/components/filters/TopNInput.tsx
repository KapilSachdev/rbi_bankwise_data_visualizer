import { FC } from 'react';

interface TopNInputProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  className?: string;
}

/**
 * Reusable input for selecting top N items in a chart or list.
 * @param value Current value
 * @param min Minimum allowed value (default 1)
 * @param max Maximum allowed value (default 1000)
 * @param onChange Callback when value changes
 * @param label Optional label (default: 'banks')
 * @param className Optional extra classes
 */
const TopNInput: FC<TopNInputProps> = ({
  value,
  min = 1,
  max = 1000,
  onChange,
  label = 'banks',
  className = '',
}) => (
  <div className={`join items-center ${className}`}>
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={e => {
        const v = Math.max(min, Math.min(max, Number(e.target.value)));
        onChange(v);
      }}
      className="input input-sm input-bordered w-16 join-item text-base-content"
      aria-label={`Show top N ${label}`}
    />
    <span className="join-item flex items-center h-8 px-2 py-0 text-sm bg-base-200 text-base-content">{label}</span>
  </div>
);

export default TopNInput;
