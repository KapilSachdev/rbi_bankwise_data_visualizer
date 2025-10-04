// Convert numbers to indian currency format
export function formatCurrency(value: number | string | undefined): string {
  if (value === null || value === undefined) return '';
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };
  return new Intl.NumberFormat('en-IN', options).format(value as number);
}

export function formatNumber(value: number | string | undefined, compact = true): string {
  if (value === null || value === undefined) return '';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  if (compact) {
    const crore = 1_00_00_000;
    const lakh = 1_00_000;

    if (num >= crore) {
      return `${(num / crore).toFixed(2).replace(/\.00$/, '')} Crore`;
    } else if (num >= lakh) {
      return `${(num / lakh).toFixed(2).replace(/\.00$/, '')} Lakh`;
    }
  }

  return new Intl.NumberFormat('en-IN').format(num);
}
