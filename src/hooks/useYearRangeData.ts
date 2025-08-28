import { useMemo } from 'react';

/**
 * Extracts unique years from a list of months and computes a default year range.
 * Returns { years, defaultYearRange }.
 *
 * @param months - Array of month strings (format: YYYY-MM)
 * @param rangeSize - Number of years to include in default range (default: 5)
 */
export function useYearRangeData(months: string[], rangeSize: number = 5) {
  const sortedMonths = useMemo(() => [...months].sort(), [months]);

  const years = useMemo(() => {
    const yearSet = new Set<number>();
    sortedMonths.forEach(m => {
      const y = Number(m.slice(0, 4));
      if (!isNaN(y)) yearSet.add(y);
    });
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [sortedMonths]);

  const defaultYearRange = useMemo(() => {
    if (years.length === 0) return [0, 0] as [number, number];
    const end = years[years.length - 1];
    const start = years.length > rangeSize ? years[years.length - rangeSize] : years[0];
    return [start, end] as [number, number];
  }, [years, rangeSize]);

  return { years, defaultYearRange };
}
