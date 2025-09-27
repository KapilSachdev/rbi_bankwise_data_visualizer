import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import type { BankData, BankProfileDashboardProps } from '../types/global.types';
import { formatMonthYear, getPreviousMonth } from '../utils/time';
import BankStats from '../visualization/bank_overview/BankStats';
import BankTimeSeriesChart from '../visualization/bank_overview/BankTimeSeriesChart';
import SVGIcon from './common/SVGIcon';
import Typeahead from './common/Typeahead';
import Pills from './filters/Pills';

const BankProfileDashboard: FC<BankProfileDashboardProps> = ({ months, posBanksData, digitalBankingData }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');

  // Effect to set the initial month and bank selection on mount or data change.
  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0]);
    }

    const currentMonthBanks = posBanksData[selectedMonth] || [];

    if (currentMonthBanks.length > 0) {
      if (!selectedBank || !currentMonthBanks.some(b => b.Bank_Name === selectedBank)) {
        setSelectedBank(currentMonthBanks[0].Bank_Name);
      }
    } else if (selectedBank) {
      setSelectedBank('');
    }
  }, [months, selectedMonth, posBanksData]);

  const dashboardData = useMemo(() => {
    const prevMonth = getPreviousMonth(selectedMonth, months);
    const banksForMonth = posBanksData[selectedMonth] || [];
    const selectedBankData = banksForMonth.find(b => b.Bank_Name === selectedBank) || null;

    const selectedBankTimeSeriesData = [...months].reverse()
      .map(month => posBanksData[month]?.find(b => b.Bank_Name === selectedBank) || null)
      .filter((b): b is BankData => Boolean(b));

    const prevMonthBankData = prevMonth ? (posBanksData[prevMonth]?.find(b => b.Bank_Name === selectedBank) || null) : null;

    const getDigitalBankingData = (month: string | null) => {
      const data = month ? (digitalBankingData[month] || {}) : {};
      return {
        neft: Array.isArray(data.NEFT) ? data.NEFT.find(b => b.Bank_Name === selectedBank) || null : null,
        rtgs: Array.isArray(data.RTGS) ? data.RTGS.find(b => b.Bank_Name === selectedBank) || null : null,
        mobile: Array.isArray(data.Mobile_Banking) ? data.Mobile_Banking.find(b => b.Bank_Name === selectedBank) || null : null,
        internet: Array.isArray(data.Internet_Banking) ? data.Internet_Banking.find(b => b.Bank_Name === selectedBank) || null : null,
      };
    };

    const currentDigitalBankingData = getDigitalBankingData(selectedMonth);
    const prevDigitalBankingData = getDigitalBankingData(prevMonth);

    const bankNames = banksForMonth.map(b => b.Bank_Name);

    return {
      prevMonth,
      banksForMonth,
      bankNames,
      selectedBankData,
      selectedBankTimeSeriesData,
      prevMonthBankData,
      digitalBanking: {
        neft: { current: currentDigitalBankingData.neft, prev: prevDigitalBankingData.neft },
        rtgs: { current: currentDigitalBankingData.rtgs, prev: prevDigitalBankingData.rtgs },
        mobile: { current: currentDigitalBankingData.mobile, prev: prevDigitalBankingData.mobile },
        internet: { current: currentDigitalBankingData.internet, prev: prevDigitalBankingData.internet },
      },
    };
  }, [selectedMonth, selectedBank, months, posBanksData, digitalBankingData]);

  const {
    banksForMonth,
    selectedBankData,
    selectedBankTimeSeriesData,
    prevMonthBankData,
    digitalBanking,
  } = dashboardData;

  const options = useMemo(() =>
    banksForMonth.map(bank => ({
      label: bank.Bank_Name,
      value: bank.Bank_Name,
      shortName: bank.Bank_Short_Name
    })), [banksForMonth]);

  const monthOptions = useMemo(() =>
    months.map(month => ({
      label: formatMonthYear(month),
      value: month
    })), [months]);

  const selectedShortName = useMemo(() =>
    options.find((bank: { value: string; shortName?: string }) => bank.value === selectedBank)?.shortName || '', [options, selectedBank]);

  const handlePillSelect = useCallback((shortName: string) => {
    const fullName = options.find((bank: { value: string; shortName?: string }) => bank.shortName === shortName)?.value || '';
    if (fullName) setSelectedBank(fullName);
  }, [options]);

  const topBankShortNames = useMemo(() =>
    options
      .filter((bank: { shortName?: string }) => ['HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'IDFCFirst', 'INDUSIND', 'HSBC', 'AMEX', 'AUSFB'].includes(bank.shortName || ''))
      .map((bank: { shortName?: string }) => bank.shortName)
      .filter(Boolean) as string[], [options]);

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


  return (
    <div className="container mx-auto p-4 sm:p-8">
      {selectedBankData && (
        <div className="card bg-base-100 shadow-xl border border-base-300 mb-8">
          <div className="card-body">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-col gap-2">
                <Typeahead
                  options={options}
                  selectedValue={selectedBank}
                  onSelect={setSelectedBank}
                  placeholder="Select Bank"
                  triggerClassName="card-title text-4xl font-extrabold cursor-text"
                  inputClassName="card-title text-4xl font-extrabold focus:outline-none"
                />
                <div className="flex gap-2">
                  <div className="badge badge-xl bg-base-300 p-2">{selectedBankData?.Bank_Type}</div>
                  <div className="badge badge-xl bg-base-300 p-2">{selectedBankData?.Bank_Short_Name}</div>
                </div>
                <div className="grid">
                  {/* Quick access to top banks */}
                  <Pills
                    bankTypes={topBankShortNames}
                    selected={selectedShortName}
                    onSelect={handlePillSelect}
                    showAll={false}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handlePrevMonth}
                  disabled={months.indexOf(selectedMonth) === months.length - 1}
                  aria-label="Previous Month"
                  title="Previous Month"
                >
                  <SVGIcon icon="arrow" className="w-5 h-5 rotate-270" />
                </button>
                <div className="flex-1 min-w-0 w-full">
                  <Typeahead
                    options={monthOptions}
                    selectedValue={selectedMonth}
                    onSelect={setSelectedMonth}
                    placeholder="Select Month"
                    triggerClassName="badge badge-info badge-lg justify-center"
                    inputClassName="focus:outline-none"
                  />
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={handleNextMonth}
                  disabled={months.indexOf(selectedMonth) === 0}
                  aria-label="Next Month"
                  title="Next Month"
                >
                  <SVGIcon icon="arrow" className="w-5 h-5 rotate-90" />
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
            digitalBankingData={digitalBanking}
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
