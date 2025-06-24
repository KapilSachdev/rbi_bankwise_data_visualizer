export const formatMonthYear = (input: string): string => {
  const [year, month] = input.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
};
