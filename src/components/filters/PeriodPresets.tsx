import { FC } from "react";

interface PeriodPresetsProps {
  selectedPreset: string;
  onPresetChange: (preset: string) => void;
}

const PeriodPresets: FC<PeriodPresetsProps> = ({ selectedPreset, onPresetChange }) => {
  const presets = ['1M', '3M', '6M', '1Y', 'All'];

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((preset) => (
        <button
          key={preset}
          className={`btn btn-sm ${selectedPreset === preset ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onPresetChange(preset)}
        >
          {preset}
        </button>
      ))}
    </div>
  );
};

export default PeriodPresets;
