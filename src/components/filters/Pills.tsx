import React from 'react';


interface PillsProps {
  bankTypes: string[];
  selected: string;
  onSelect: (type: string) => void;
}

const Pills: React.FC<PillsProps> = ({ bankTypes, selected, onSelect }) => (
  <div className="overflow-x-auto w-full scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
    <div className="gap-2 rounded-full px-1 py-1 shadow flex-nowrap inline-flex min-w-max">
      <button
        className={`btn btn-xs rounded-full px-4 font-semibold transition-all ${!selected ? 'btn-primary btn-active' : 'btn-outline'}`}
        aria-pressed={!selected}
        onClick={() => onSelect('')}
      >
        All
      </button>
      {bankTypes.map(type => (
        <button
          key={type}
          className={`btn btn-xs rounded-full px-4 font-semibold transition-all ${selected === type ? 'btn-primary btn-active' : 'btn-outline'}`}
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
