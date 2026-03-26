import { FC, useMemo } from "react";

interface PeriodPresetsProps {
  months: string[]; // e.g. ['2024-01', '2024-02', ...]
  selectedPreset: string;
  onRangeChange: (range: [string, string]) => void; // [startMonth, endMonth]
  onPresetChange?: (preset: string) => void;
}

const PeriodPresets: FC<PeriodPresetsProps> = ({ months, selectedPreset, onRangeChange, onPresetChange }) => {
  const presets = ['1M', '3M', '6M', '1Y', '5Y', '10Y', 'All'];

  const sortedMonths = useMemo(() => [...months].sort(), [months]);

  const applyPreset = (preset: string) => {
    if (sortedMonths.length === 0) return;
    const lastIdx = sortedMonths.length - 1;
    let count = 0;
    switch (preset) {
      case '1M': count = 1; break;
      case '3M': count = 3; break;
      case '6M': count = 6; break;
      case '1Y': count = 12; break;
      case '5Y': count = 12 * 5; break;
      case '10Y': count = 12 * 10; break;
      case 'All': count = sortedMonths.length; break;
      default: count = 12;
    }

    const startIdx = Math.max(0, lastIdx - count + 1);
    const start = sortedMonths[startIdx];
    const end = sortedMonths[lastIdx];
    onRangeChange([start, end]);
    if (onPresetChange) onPresetChange(preset);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset}
          className={`btn btn-sm ${selectedPreset === preset ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => applyPreset(preset)}
        >
          {preset}
        </button>
      ))}
    </div>
  );
};

export default PeriodPresets;
