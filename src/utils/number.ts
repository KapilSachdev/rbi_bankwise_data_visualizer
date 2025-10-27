// Convert numbers to indian currency format
export function formatCurrency(value: number | string | undefined): string {
  if (value === null || value === undefined) return '';

  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    compactDisplay: 'long',
  };
  return new Intl.NumberFormat('en-IN', options).format(value as number);
}

export function formatNumber(value: number | string | undefined): string {
  if (value === null || value === undefined) return '';

  const options: Intl.NumberFormatOptions = {
    notation: 'compact',
    compactDisplay: 'long',
  };
  return new Intl.NumberFormat('en-IN', options).format(value as number);
}
