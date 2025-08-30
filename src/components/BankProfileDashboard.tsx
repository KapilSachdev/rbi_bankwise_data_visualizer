
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import type { BankData, BankProfileDashboardProps } from '../types/global.types';
import BankStats from '../visualization/bank_overview/BankStats';
import BankTimeSeriesChart from '../visualization/bank_overview/BankTimeSeriesChart';
import SVGIcon from './common/SVGIcon';
import { getPreviousMonth } from '../utils/time';

const BankProfileDashboard: FC<BankProfileDashboardProps> = ({ months, posBanksData, digitalBankingData }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');

  // Set default month on mount or months change
  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, [months, selectedMonth]);

  // Compute previous month before using it
  const prevMonth = useMemo(() => getPreviousMonth(selectedMonth, months), [selectedMonth, months]);
  // Get banks for selected month
  const banksForMonth = useMemo(() => posBanksData[selectedMonth] || [], [posBanksData, selectedMonth]);
  // Extract NEFT, RTGS, Mobile, Internet arrays from digitalBankingData[selectedMonth] (if present)
  const neftMonthObj = digitalBankingData[selectedMonth] || {};
  const prevNeftMonthObj = prevMonth ? (digitalBankingData[prevMonth] || {}) : {};
  const neftBanksForMonth = Array.isArray(neftMonthObj.NEFT) ? neftMonthObj.NEFT : [];
  const rtgsBanksForMonth = Array.isArray(neftMonthObj.RTGS) ? neftMonthObj.RTGS : [];
  const mobileBanksForMonth = Array.isArray(neftMonthObj.Mobile_Banking) ? neftMonthObj.Mobile_Banking : [];
  const internetBanksForMonth = Array.isArray(neftMonthObj.Internet_Banking) ? neftMonthObj.Internet_Banking : [];
  const prevNeftBanksForMonth = Array.isArray(prevNeftMonthObj.NEFT) ? prevNeftMonthObj.NEFT : [];
  const prevRTGSBanksForMonth = Array.isArray(prevNeftMonthObj.RTGS) ? prevNeftMonthObj.RTGS : [];
  const prevMobileBanksForMonth = Array.isArray(prevNeftMonthObj.Mobile_Banking) ? prevNeftMonthObj.Mobile_Banking : [];
  const prevInternetBanksForMonth = Array.isArray(prevNeftMonthObj.Internet_Banking) ? prevNeftMonthObj.Internet_Banking : [];

  useEffect(() => {
    if (banksForMonth.length > 0 && !banksForMonth.some(b => b.Bank_Name === selectedBank)) {
      setSelectedBank(banksForMonth[0].Bank_Name);
    } else if (banksForMonth.length === 0 && selectedBank) {
      setSelectedBank('');
    }
  }, [banksForMonth, selectedBank]);

  const bankNames = useMemo(() => banksForMonth.map(b => b.Bank_Name), [banksForMonth]);
  const selectedBankData = useMemo(() => banksForMonth.find(b => b.Bank_Name === selectedBank) || null, [banksForMonth, selectedBank]);

  // Build time series data for selected bank across all months (PoS only)
  const selectedBankTimeSeriesData = useMemo(() =>
    // copy months before reversing to avoid mutating the prop passed from parent
    [...months].reverse().map(month => {
      const bankArr = posBanksData[month] || [];
      return bankArr.find(b => b.Bank_Name === selectedBank) || null;
    }).filter((b): b is BankData => Boolean(b)),
    [months, posBanksData, selectedBank]
  );
  const selectedNeftBankData = useMemo(() => neftBanksForMonth.find(b => b.Bank_Name === selectedBank) || null, [neftBanksForMonth, selectedBank]);
  const selectedRTGSBankData = useMemo(() => rtgsBanksForMonth.find(b => b.Bank_Name === selectedBank) || null, [rtgsBanksForMonth, selectedBank]);
  const selectedMobileBankingData = useMemo(() => mobileBanksForMonth.find(b => b.Bank_Name === selectedBank) || null, [mobileBanksForMonth, selectedBank]);
  const selectedInternetBankingData = useMemo(() => internetBanksForMonth.find(b => b.Bank_Name === selectedBank) || null, [internetBanksForMonth, selectedBank]);

  // Previous month and previous bank data
  const prevMonthBankData = useMemo(() => {
    if (!prevMonth || !selectedBank) return null;
    const prevBanks = posBanksData[prevMonth] || [];
    return prevBanks.find(b => b.Bank_Name === selectedBank) || null;
  }, [prevMonth, selectedBank, posBanksData]);

  const prevMonthNeftBankData = useMemo(() => {
    if (!prevMonth || !selectedBank) return null;
    return prevNeftBanksForMonth.find(b => b.Bank_Name === selectedBank) || null;
  }, [prevMonth, selectedBank, prevNeftBanksForMonth]);
  const prevMonthRTGSBankData = useMemo(() => {
    if (!prevMonth || !selectedBank) return null;
    return prevRTGSBanksForMonth.find(b => b.Bank_Name === selectedBank) || null;
  }, [prevMonth, selectedBank, prevRTGSBanksForMonth]);
  const prevMonthMobileBankingData = useMemo(() => {
    if (!prevMonth || !selectedBank) return null;
    return prevMobileBanksForMonth.find(b => b.Bank_Name === selectedBank) || null;
  }, [prevMonth, selectedBank, prevMobileBanksForMonth]);
  const prevMonthInternetBankingData = useMemo(() => {
    if (!prevMonth || !selectedBank) return null;
    return prevInternetBanksForMonth.find(b => b.Bank_Name === selectedBank) || null;
  }, [prevMonth, selectedBank, prevInternetBanksForMonth]);

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
        <article className='grid gap-4'>
          <BankStats
            currentMonth={selectedMonth}
            selectedBankData={selectedBankData}
            prevMonthBankData={prevMonthBankData}
            digitalBankingData={{
              neft: { current: selectedNeftBankData, prev: prevMonthNeftBankData },
              rtgs: { current: selectedRTGSBankData, prev: prevMonthRTGSBankData },
              mobile: { current: selectedMobileBankingData, prev: prevMonthMobileBankingData },
              internet: { current: selectedInternetBankingData, prev: prevMonthInternetBankingData },
            }}
          />
          <BankTimeSeriesChart
            bankData={selectedBankTimeSeriesData}
            months={months}
            metrics={["ATMs_CRMs", "PoS", "Credit_Cards", "Debit_Cards"]}
            bankName={selectedBank}
            digitalBankingData={digitalBankingData}
          />
        </article>
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
