import { FC } from 'react';
import { motion } from 'framer-motion';

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
  min = 0,
  max = 1000,
  onChange,
  label = 'banks',
  className = '',
}) => {
  const handleChange = (newValue: number) => {
    const clampedValue = Math.max(min, Math.min(max, newValue));
    onChange(clampedValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue)) {
      handleChange(newValue);
    }
  };

  const increment = () => handleChange(value + 1);
  const decrement = () => handleChange(value - 1);

  return (
    <div className={`join items-center ${className}`}>
      <motion.button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="btn btn-xs btn-primary join-item"
        whileTap={{ scale: 0.9 }}
        title="Decrease value"
        aria-label="Decrease"
      >
        -
      </motion.button>
      <motion.div
        key={value}
        initial={{ y: -20, opacity: 0, scale: 1.2 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
          duration: 0.1
        }}
        className="join-item"
      >
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleInputChange}
          className="input input-xs input-ghost w-10 sm:w-12 text-base-content text-center appearance-none"
          aria-label={`Show top N ${label}`}
          title={`Current: ${value}. Min: ${min}, Max: ${max}`}
        />
      </motion.div>
      <motion.button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="btn btn-xs btn-primary join-item"
        whileTap={{ scale: 1.1 }}
        title="Increase value"
        aria-label="Increase"
      >
        +
      </motion.button>
      <span className="join-item flex items-center h-8 px-2 py-0 text-sm bg-base-200 text-base-content">{label}</span>
    </div>
  );
};

export default TopNInput;
