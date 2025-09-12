import { motion } from 'framer-motion';
import { FC } from 'react';


interface PillsProps {
  bankTypes: string[];
  selected: string;
  onSelect: (type: string) => void;
  showAll?: boolean;
}

const Pills: FC<PillsProps> = ({ bankTypes, selected, onSelect, showAll = true }) => {
  if (bankTypes.length === 0) {
    return (
      <div className="text-sm text-base-content opacity-50">
        No bank types available
      </div>
    );
  }

  return (
    <div
      className="overflow-x-auto w-full scrollbar-none"
      role="tablist"
      aria-label="Bank type filters"
    >
      <div className="gap-2 rounded-selector px-1 py-1 shadow flex-nowrap inline-flex min-w-max">
        {showAll && (
          <motion.button
            className={`btn btn-xs rounded-selector px-4 font-medium transition-all ${!selected ? 'btn-primary btn-active' : 'btn-soft'
              }`}
            aria-pressed={!selected}
            onClick={() => onSelect('')}
            whileTap={{ scale: 0.9 }}
            title="Show all bank types"
          >
            All
          </motion.button>
        )}
        {bankTypes.map((type) => (
          <motion.button
            key={type}
            className={`btn btn-xs rounded-selector px-4 font-medium transition-all ${selected === type ? 'btn-primary btn-active' : 'btn-soft'
              }`}
            aria-pressed={selected === type}
            onClick={() => onSelect(type)}
            whileTap={{ scale: 0.9 }}
            title={`Filter by ${type}`}
          >
            {type}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default Pills;
