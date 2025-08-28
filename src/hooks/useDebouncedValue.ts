import { useEffect, useState, useRef } from 'react';

/**
 * Returns a debounced value that only updates after the given delay.
 * @param value The value to debounce
 * @param delay Delay in ms (default: 1000)
 */
export function useDebouncedValue<T>(value: T, delay: number = 1000): T {
  const [debounced, setDebounced] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear the previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      setDebounced(value);
    }, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debounced;
}
