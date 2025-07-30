import { FC, memo, useMemo } from 'react';
import SVGIcon from '../../components/common/SVGIcon';
import type { BankData } from '../../types/global.types';

// Utility to safely calculate Month-over-Month (MoM)
const calculateMoM = (current: number | undefined, prev: number | undefined): number | null => {
  if (typeof current !== 'number' || typeof prev !== 'number' || isNaN(current) || isNaN(prev)) {
    return null; // Return null for invalid or undefined inputs
  }
  if (prev === 0) {
    return current === 0 ? 0 : null; // If previous is 0, MoM is 0 if current is also 0, otherwise undefined
  }
  return ((current - prev) / prev) * 100;
};

interface MoMIndicatorProps {
  currentValue: number | undefined;
  previousValue: number | undefined;
}


// Improved MoMIndicator: shows both absolute and percent change, with pronounced visual style
const MoMIndicator: FC<MoMIndicatorProps> = memo(({ currentValue, previousValue }) => {
  const percent = calculateMoM(currentValue, previousValue);

  if (percent === null || previousValue === undefined || currentValue === undefined || isNaN(previousValue) || isNaN(currentValue)) {
    return null;
  }

  const absChange = currentValue - previousValue;
  const isPositive = absChange > 0;
  const isNegative = absChange < 0;
  const isZero = absChange === 0;

  const sign = isPositive ? '+' : '';

  const colorClass = isPositive
    ? 'bg-success/10 text-success border-success'
    : isNegative
      ? 'bg-error/10 text-error border-error'
      : 'bg-base-200 text-base-content border-base-300';

  const icon = 'arrow';
  const rotateClass = isPositive ? '' : isNegative ? 'rotate-180' : 'rotate-90';

  const ariaLabel = isPositive
    ? `Increased by ${absChange.toLocaleString()} (${percent.toFixed(1)}%) from last month`
    : isNegative
      ? `Decreased by ${Math.abs(absChange).toLocaleString()} (${Math.abs(percent).toFixed(1)}%) from last month`
      : 'No change from last month';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border font-semibold text-xs shadow-sm ${colorClass} transition-all duration-200`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full mr-1">
        <SVGIcon icon={icon} className={`w-3 h-3 stroke-[2] ${rotateClass}`} aria-hidden="true" />
      </span>
      {isZero ? (
        'No change'
      ) : (
        <>
          {sign}{Math.abs(absChange).toLocaleString()}
          <span className="text-sm opacity-70 ml-0.5">({sign}{Math.abs(percent).toFixed(1)}%)</span>
        </>
      )}
    </span>
  );
});

MoMIndicator.displayName = 'MoMIndicator';


interface StatItemProps {
  title: string;
  value: number | string | undefined;
  currentValueForMoM?: number;
  previousValueForMoM?: number;
}

export const StatItem: FC<StatItemProps> = memo(({ title, value, currentValueForMoM, previousValueForMoM }) => (
  <div className="stat place-items-center">
    <div className="stat-title">{title}</div>
    <div className="stat-value">
      {value !== undefined && value !== null && value !== '' ? value : '-'}
    </div>
    <div className="stat-desc flex items-center gap-2">
      <MoMIndicator currentValue={currentValueForMoM} previousValue={previousValueForMoM} />
    </div>
  </div>
));

StatItem.displayName = 'StatItem';

interface BankStatsProps {
  currentMonth: string;
  selectedBankData: BankData | null;
  prevMonthBankData: BankData | null;
}

// Helper to format month for display
const formatMonthDisplay = (month: string): string => {
  if (!month) return '';
  const [year, monthNum] = month.split('-');
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthIndex = parseInt(monthNum, 10) - 1;
  return `${monthNames[monthIndex]} ${year}`;
};

// Configuration for StatItems to reduce repetition
const STAT_ITEMS_CONFIG = [
  { title: "UPI QR Codes", valuePath: (data: BankData) => data.Infrastructure?.UPI_QR_Codes },
  { title: "Credit Cards", valuePath: (data: BankData) => data.Infrastructure?.Credit_Cards },
  { title: "Debit Cards", valuePath: (data: BankData) => data.Infrastructure?.Debit_Cards },
  { title: "On-site ATMs", valuePath: (data: BankData) => data.Infrastructure?.ATMs_CRMs?.On_site },
  { title: "Off-site ATMs", valuePath: (data: BankData) => data.Infrastructure?.ATMs_CRMs?.Off_site },
  { title: "PoS Terminals", valuePath: (data: BankData) => data.Infrastructure?.PoS },
  { title: "Micro ATMs", valuePath: (data: BankData) => data.Infrastructure?.Micro_ATMs },
  { title: "Bharat QR Codes", valuePath: (data: BankData) => data.Infrastructure?.Bharat_QR_Codes },
];

// Main BankStats component
const BankStats: FC<BankStatsProps> = ({ currentMonth, selectedBankData, prevMonthBankData }) => {
  if (!selectedBankData) {
    return null;
  }

  const monthBadge = useMemo(() => formatMonthDisplay(currentMonth), [currentMonth]);

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        {/* Bank Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h2 className="card-title text-3xl font-extrabold text-accent mb-2 sm:mb-0">
            {selectedBankData.Bank_Name}
          </h2>
          <div className="flex flex-wrap gap-4 items-center">
            {monthBadge && (
              <div className="badge badge-primary badge-lg p-2" aria-label={`Data for ${monthBadge}`}>
                {monthBadge}
              </div>
            )}
            {selectedBankData.Bank_Type && (
              <div className="badge badge-lg p-2">
                {selectedBankData.Bank_Type}
              </div>
            )}
            {selectedBankData.Bank_Short_Name && (
              <div className="badge badge-lg p-2">
                {selectedBankData.Bank_Short_Name}
              </div>
            )}
          </div>
        </div>

        <p className="text-lg text-gray-600 mb-6">
          Infrastructure overview for the selected bank.
        </p>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2 rounded-selector">
          {STAT_ITEMS_CONFIG.map((item, index) => (
            <StatItem
              key={item.title}
              title={item.title}
              value={item.valuePath(selectedBankData)}
              currentValueForMoM={item.valuePath(selectedBankData)}
              previousValueForMoM={prevMonthBankData ? item.valuePath(prevMonthBankData) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BankStats;
