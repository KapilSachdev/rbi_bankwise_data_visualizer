import React, { FC } from 'react';

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

const DataFilter: FC<DataFilterProps> = ({
  months = [],
  bankTypes = [],
  selectedMonth = '',
  selectedBankType = '',
  onMonthChange,
  onBankTypeChange,
  filters = { month: true, bankType: true },
}) => {
  return (
    <div className="flex items-center justify-center">
      {filters.month && months.length > 0 && onMonthChange && (
        <div className="flex flex-col text-xs font-medium text-base-content min-w-[8rem]">
          <span>Month</span>
          <div className="dropdown mt-1">
            <button
              popoverTarget="month-dropdown"
              className="btn btn-sm btn-outline w-full justify-between"
              type="button"
              aria-haspopup="listbox"
              aria-expanded="false"
            >
              {selectedMonth || 'Select Month'}
            </button>
            <ul
              className="dropdown-content menu menu-sm p-0 shadow bg-base-100 rounded-box w-full z-10"
              popover="auto"
              id="month-dropdown"
              role="listbox"
            >
              {months.map(month => (
                <li key={month}>
                  <button
                    className={`w-full text-left px-4 py-2 ${selectedMonth === month ? 'bg-primary text-primary-content' : ''}`}
                    onClick={() => onMonthChange(month)}
                    role="option"
                    aria-selected={selectedMonth === month}
                  >
                    {month}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {filters.bankType && bankTypes.length > 0 && onBankTypeChange && (
        <div className="flex flex-col text-xs font-medium text-base-content min-w-[8rem]">
          <span>Bank Type</span>
          <div className="dropdown mt-1">
            <button
              popoverTarget="banktype-dropdown"
              className="btn btn-sm btn-outline w-full justify-between"
              type="button"
              aria-haspopup="listbox"
              aria-expanded="false"
            >
              {selectedBankType || 'All'}
            </button>
            <ul
              className="dropdown-content menu menu-sm p-0 shadow bg-base-100 rounded-box w-full z-10"
              popover="auto"
              id="banktype-dropdown"
              role="listbox"
            >
              <li>
                <button
                  className={`w-full text-left px-4 py-2 ${!selectedBankType ? 'bg-primary text-primary-content' : ''}`}
                  onClick={() => onBankTypeChange('')}
                  role="option"
                  aria-selected={!selectedBankType}
                >
                  All
                </button>
              </li>
              {bankTypes.map(type => (
                <li key={type}>
                  <button
                    className={`w-full text-left px-4 py-2 ${selectedBankType === type ? 'bg-primary text-primary-content' : ''}`}
                    onClick={() => onBankTypeChange(type)}
                    role="option"
                    aria-selected={selectedBankType === type}
                  >
                    {type}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataFilter;
