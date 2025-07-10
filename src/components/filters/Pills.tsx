import { FC } from 'react';


interface PillsProps {
  bankTypes: string[];
  selected: string;
  onSelect: (type: string) => void;
}

const Pills: FC<PillsProps> = ({ bankTypes, selected, onSelect }) => (
  <div className="overflow-x-auto w-full scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
    <div className="gap-2 rounded-selector px-1 py-1 shadow flex-nowrap inline-flex min-w-max">
      <button
        className={`btn btn-xs rounded-selector px-4 font-medium transition-all ${!selected ? 'btn-primary btn-active' : 'btn-soft'}`}
        aria-pressed={!selected}
        onClick={() => onSelect('')}
      >
        All
      </button>
      {bankTypes.map(type => (
        <button
          key={type}
          className={`btn btn-xs rounded-selector px-4 font-medium transition-all ${selected === type ? 'btn-primary btn-active' : 'btn-soft'}`}
          aria-pressed={selected === type}
          onClick={() => onSelect(type)}
        >
          {type}
        </button>
      ))}
    </div>
  </div>
);

export default Pills;
