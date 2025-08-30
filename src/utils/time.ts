export const formatMonthYear = (input: string): string => {
  const [year, month] = input.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
};

export const getPreviousMonth = (currentMonth: string, months: string[]): string | null => {
  if (!currentMonth) return null;
  const [yearStr, monthStr] = currentMonth.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10);
  if (isNaN(year) || isNaN(month)) return null;
  month -= 1;
  if (month === 0) {
    year -= 1;
    month = 12;
  }
  const prevMonthFormatted = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}`;
  return months.includes(prevMonthFormatted) ? prevMonthFormatted : null;
};
