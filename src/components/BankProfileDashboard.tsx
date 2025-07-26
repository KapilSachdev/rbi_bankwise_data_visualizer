
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import type { BankData } from '../types/global.types';
import BankStats from '../visualization/bank_overview/BankStats';
import SVGIcon from './common/SVGIcon';

// --- Utility Functions ---

const getPreviousMonth = (currentMonth: string, months: string[]): string | null => {
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

// --- Main Component ---


interface BankProfileDashboardProps {
  posBanksData: { [month: string]: BankData[] };
  months: string[];
}

const BankProfileDashboard: FC<BankProfileDashboardProps> = ({ posBanksData, months }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');

  // Set default month on mount or months change
  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  // Get banks for selected month
  const banksForMonth = useMemo(() => posBanksData[selectedMonth] || [], [posBanksData, selectedMonth]);

  // Set default bank when month changes or bank is missing
  useEffect(() => {
    if (banksForMonth.length > 0 && !banksForMonth.some(b => b.Bank_Name === selectedBank)) {
      setSelectedBank(banksForMonth[0].Bank_Name);
    } else if (banksForMonth.length === 0 && selectedBank) {
      setSelectedBank('');
    }
  }, [banksForMonth, selectedBank]);

  const bankNames = useMemo(() => banksForMonth.map(b => b.Bank_Name), [banksForMonth]);
  const selectedBankData = useMemo(() => banksForMonth.find(b => b.Bank_Name === selectedBank) || null, [banksForMonth, selectedBank]);

  // Previous month and previous bank data
  const prevMonth = useMemo(() => getPreviousMonth(selectedMonth, months), [selectedMonth, months]);
  const prevMonthBankData = useMemo(() => {
    if (!prevMonth || !selectedBank) return null;
    const prevBanks = posBanksData[prevMonth] || [];
    return prevBanks.find(b => b.Bank_Name === selectedBank) || null;
  }, [prevMonth, selectedBank, posBanksData]);

  // Handlers
  const handleMonthSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  }, []);
  const handleBankSelect = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBank(e.target.value);
  }, []);

  // DaisyUI: select, card, alert, divider
  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <label className="label" htmlFor="month-select">
            <span className="label-text">Select Month</span>
          </label>
          <select
            id="month-select"
            className="select select-bordered w-full"
            value={selectedMonth}
            onChange={handleMonthSelect}
            aria-label="Select Month"
            disabled={months.length === 0}
          >
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="label" htmlFor="bank-select">
            <span className="label-text">Select Bank</span>
          </label>
          <select
            id="bank-select"
            className="select select-bordered w-full"
            value={selectedBank}
            onChange={handleBankSelect}
            aria-label="Select Bank"
            disabled={bankNames.length === 0}
          >
            {bankNames.map(bankName => (
              <option key={bankName} value={bankName}>{bankName}</option>
            ))}
          </select>
        </div>
      </div>
      {selectedBankData ? (
        <BankStats currentMonth={selectedMonth} selectedBankData={selectedBankData} prevMonthBankData={prevMonthBankData} />
      ) : (
        <div role="alert" className="alert alert-info shadow-lg">
          <SVGIcon icon="info" className="shrink-0 w-6 h-6" aria-label="Info" />
          <div>
            <h3 className="font-bold">No Bank Selected or Data Unavailable!</h3>
            <div className="text-sm">Please select a month and then a bank from the dropdowns above to view its profile.</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankProfileDashboard;
