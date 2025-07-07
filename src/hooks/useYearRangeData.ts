import { useMemo } from 'react';

/**
 * Extracts unique years from a list of months and computes a default year range (last 5 years or all).
 * Returns { years, defaultYearRange }.
 *
 * @param months - Array of month strings (format: YYYY_MM or YYYY-MM)
 */
export function useYearRangeData(months: string[]) {
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
        const start = years.length > 5 ? years[years.length - 5] : years[0];
        return [start, end] as [number, number];
    }, [years]);

    return { years, defaultYearRange };
}
