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

  const currency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    notation: 'compact',
    compactDisplay: 'long',
  });

  const parts = currency.formatToParts(Number(value));
  return parts.filter(p => p.type !== 'currency').map(p => p.value).join('').trim();
}
