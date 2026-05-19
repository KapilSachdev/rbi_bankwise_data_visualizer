import { useEffect, useMemo, useState } from 'react';

type MonthRange = [string, string];

export function usePeriodRange(months: string[], defaultPreset: string = '1Y') {
  const sortedMonths = useMemo(() => [...months].sort(), [months]);

  const presetToCount = (preset: string) => {
    switch (preset) {
      case '1M': return 1;
      case '3M': return 3;
      case '6M': return 6;
      case '1Y': return 12;
      case '5Y': return 12 * 5;
      case '10Y': return 12 * 10;
      case 'All': return sortedMonths.length;
      default: return 12;
    }
  };

  const getRangeForPreset = (preset: string): MonthRange => {
    if (sortedMonths.length === 0) return ['', ''];
    const lastIdx = sortedMonths.length - 1;
    const count = presetToCount(preset);
    if (count >= sortedMonths.length) return [sortedMonths[0], sortedMonths[lastIdx]];
    const startIdx = Math.max(0, lastIdx - count + 1);
    return [sortedMonths[startIdx], sortedMonths[lastIdx]];
  };

  const initialRange = useMemo(() => getRangeForPreset(defaultPreset), [sortedMonths, defaultPreset]);

  const [selectedPreset, setSelectedPreset] = useState<string>(defaultPreset);
  const [monthRange, setMonthRange] = useState<MonthRange>(initialRange);

  useEffect(() => {
    setSelectedPreset(defaultPreset);
    setMonthRange(initialRange);
  }, [initialRange, defaultPreset]);

  const applyPreset = (preset: string) => {
    const range = getRangeForPreset(preset);
    setSelectedPreset(preset);
    setMonthRange(range);
    return range;
  };

  const filteredMonths = useMemo(() => {
    if (!monthRange[0] || !monthRange[1]) return sortedMonths;
    return sortedMonths.filter(m => m >= monthRange[0] && m <= monthRange[1]);
  }, [sortedMonths, monthRange]);

  return {
    selectedPreset,
    setSelectedPreset,
    monthRange,
    setMonthRange,
    applyPreset,
    filteredMonths,
    sortedMonths,
  };
}

export default usePeriodRange;
