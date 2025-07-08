import { useEffect, useState } from 'react';

/**
 * Returns a debounced value that only updates after the given delay.
 * @param value The value to debounce
 * @param delay Delay in ms
 */
export function useDebouncedValue<T>(value: T, delay: number = 1000): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}
