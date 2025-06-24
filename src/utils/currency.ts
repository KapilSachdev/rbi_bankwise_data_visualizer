// Convert numbers to indian currency format
export function formatCurrency(value: number): string {
  if (value === null || value === undefined) return '';
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };
  return new Intl.NumberFormat('en-IN', options).format(value);
}
