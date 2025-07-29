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
  const sign = isPositive ? '+' : isNegative ? '' : '';
  // Use DaisyUI/Tailwind semantic color classes for theming
  const color = isPositive
    ? 'bg-success/10 text-success border-success'
    : isNegative
      ? 'bg-error/10 text-error border-error'
      : 'bg-base-200 text-base-content border-base-300';
  // Use only 'arrow' icon and rotate for direction
  const icon = 'arrow';
  const rotateClass = isPositive ? '' : isNegative ? 'rotate-180' : 'rotate-90';
  const ariaLabel = isPositive
    ? `Increased by ${absChange.toLocaleString()} (${percent.toFixed(1)}%) from last month`
    : isNegative
      ? `Decreased by ${Math.abs(absChange).toLocaleString()} (${Math.abs(percent).toFixed(1)}%) from last month`
      : 'No change from last month';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-selector border font-semibold text-xs shadow-sm ${color} transition-all duration-200`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-selector mr-1">
        <SVGIcon icon={icon} className={`w-4 h-4 stroke-[2] ${rotateClass}`} aria-hidden="true" />
      </span>
      {sign}{Math.abs(absChange).toLocaleString()} <span className="opacity-60">({sign}{Math.abs(percent).toFixed(1)}%)</span>
    </span>
  );
});

MoMIndicator.displayName = 'MoMIndicator';

interface StatItemProps {
  title: string;
  value: number | string | undefined;
  description: string;
  valueColorClass?: string;
  currentValueForMoM?: number;
  previousValueForMoM?: number;
}

// StatItem component for displaying individual statistics
export const StatItem: FC<StatItemProps> = memo(({
  title,
  value,
  description,
  valueColorClass = '',
  currentValueForMoM,
  previousValueForMoM,
}) => (
  <div className="stat place-items-center">
    <div className="stat-title">{title}</div>
    <div className={`stat-value ${valueColorClass}`}>
      {value !== undefined && value !== null && value !== '' ? value : '-'}
    </div>
    <div className="stat-desc flex items-center gap-2">
      {description}
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
  { title: "UPI QR Codes", description: "UPI-enabled payments", valuePath: (data: BankData) => data.Infrastructure?.UPI_QR_Codes, valueColorClass: "text-warning" },
  { title: "Credit Cards", description: "Cards issued", valuePath: (data: BankData) => data.Infrastructure?.Credit_Cards, valueColorClass: "text-error" },
  { title: "Debit Cards", description: "Cards issued", valuePath: (data: BankData) => data.Infrastructure?.Debit_Cards, valueColorClass: "text-success" },
  { title: "On-site ATMs", description: "Includes CRMs", valuePath: (data: BankData) => data.Infrastructure?.ATMs_CRMs?.On_site, valueColorClass: "text-secondary" },
  { title: "Off-site ATMs", description: "Extended reach", valuePath: (data: BankData) => data.Infrastructure?.ATMs_CRMs?.Off_site },
  { title: "PoS Terminals", description: "Point of Sale devices", valuePath: (data: BankData) => data.Infrastructure?.PoS, valueColorClass: "text-accent" },
  { title: "Micro ATMs", description: "Compact ATM solutions", valuePath: (data: BankData) => data.Infrastructure?.Micro_ATMs },
  { title: "Bharat QR Codes", description: "Digital payment codes", valuePath: (data: BankData) => data.Infrastructure?.Bharat_QR_Codes, valueColorClass: "text-info" },
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
              key={item.title} // Use title as key, assuming titles are unique
              title={item.title}
              value={item.valuePath(selectedBankData)}
              description={item.description}
              valueColorClass={item.valueColorClass}
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
