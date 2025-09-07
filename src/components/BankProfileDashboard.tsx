
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import type { BankData, BankProfileDashboardProps } from '../types/global.types';
import BankStats from '../visualization/bank_overview/BankStats';
import BankTimeSeriesChart from '../visualization/bank_overview/BankTimeSeriesChart';
import SVGIcon from './common/SVGIcon';
import { getPreviousMonth, formatMonthYear } from '../utils/time';

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
  const handlePrevMonth = useCallback(() => {
    const currentIndex = months.indexOf(selectedMonth);
    if (currentIndex < months.length - 1) {
      setSelectedMonth(months[currentIndex + 1]);
    }
  }, [months, selectedMonth]);

  const handleNextMonth = useCallback(() => {
    const currentIndex = months.indexOf(selectedMonth);
    if (currentIndex > 0) {
      setSelectedMonth(months[currentIndex - 1]);
    }
  }, [months, selectedMonth]);

  // DaisyUI: select, card, alert, divider
  return (
    <div className="container mx-auto p-4 sm:p-8">
      {/* Bank Hero Banner */}
      {selectedBankData && (
        <div className="card bg-base-100 shadow-xl border border-base-300 mb-8">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col">
                <h2 className="card-title text-3xl font-extrabold mb-2">
                  {selectedBankData.Bank_Name}
                </h2>
                <div className="flex gap-2">
                  <div className="badge badge-lg p-2">{selectedBankData.Bank_Type}</div>
                  <div className="badge badge-lg p-2">{selectedBankData.Bank_Short_Name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button
                  className="btn btn-ghost"
                  onClick={handlePrevMonth}
                  disabled={months.indexOf(selectedMonth) === months.length - 1}
                  aria-label="Previous Month"
                >
                  <SVGIcon icon="arrow" className="w-6 h-6 rotate-270" />
                </button>
                <div className="badge badge-info badge-lg p-2" aria-label={`Data for ${formatMonthYear(selectedMonth)}`}>
                  {formatMonthYear(selectedMonth)}
                </div>
                <button
                  className="btn btn-ghost"
                  onClick={handleNextMonth}
                  disabled={months.indexOf(selectedMonth) === 0}
                  aria-label="Next Month"
                >
                  <SVGIcon icon="arrow" className="w-6 h-6 rotate-90" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
