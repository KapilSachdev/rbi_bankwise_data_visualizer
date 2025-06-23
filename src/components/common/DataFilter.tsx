import React from 'react';

interface DataFilterProps {
  months?: string[];
  bankTypes?: string[];
  selectedMonth?: string;
  selectedBankType?: string;
  onMonthChange?: (month: string) => void;
  onBankTypeChange?: (type: string) => void;
  /**
   * Which filters to show. All true by default.
   * Example: { month: true, bankType: true }
   */
  filters?: {
    month?: boolean;
    bankType?: boolean;
  };
}

const DataFilter: React.FC<DataFilterProps> = ({
  months = [],
  bankTypes = [],
  selectedMonth = '',
  selectedBankType = '',
  onMonthChange,
  onBankTypeChange,
  filters = { month: true, bankType: true },
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-center justify-center">
      {filters.month && months.length > 0 && onMonthChange && (
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
      )}
      {filters.bankType && bankTypes.length > 0 && onBankTypeChange && (
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
      )}
    </div>
  );
};

export default DataFilter;
