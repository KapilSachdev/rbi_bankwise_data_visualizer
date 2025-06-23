import React from 'react';

interface DataFilterProps {
  months: string[];
  years: string[];
  bankTypes: string[];
  selectedMonth: string;
  selectedYear: string;
  selectedBankType: string;
  onMonthChange: (month: string) => void;
  onYearChange: (year: string) => void;
  onBankTypeChange: (type: string) => void;
}

const DataFilter: React.FC<DataFilterProps> = ({
  months,
  years,
  bankTypes,
  selectedMonth,
  selectedYear,
  selectedBankType,
  onMonthChange,
  onYearChange,
  onBankTypeChange,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-center justify-center">
      <label className="flex flex-col text-xs font-medium text-gray-400">
        Month
        <select
          className="mt-1 px-2 py-1 rounded bg-gray-800 text-gray-100 focus:ring-2 focus:ring-sky-400"
          value={selectedMonth}
          onChange={e => onMonthChange(e.target.value)}
        >
          {months.map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col text-xs font-medium text-gray-400">
        Year
        <select
          className="mt-1 px-2 py-1 rounded bg-gray-800 text-gray-100 focus:ring-2 focus:ring-sky-400"
          value={selectedYear}
          onChange={e => onYearChange(e.target.value)}
        >
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col text-xs font-medium text-gray-400">
        Bank Type
        <select
          className="mt-1 px-2 py-1 rounded bg-gray-800 text-gray-100 focus:ring-2 focus:ring-sky-400"
          value={selectedBankType}
          onChange={e => onBankTypeChange(e.target.value)}
        >
          <option value="">All</option>
          {bankTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </label>
    </div>
  );
};

export default DataFilter;
