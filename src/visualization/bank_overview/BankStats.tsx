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

// MoMIndicator component with clear styling and accessibility
const MoMIndicator: FC<MoMIndicatorProps> = memo(({ currentValue, previousValue }) => {
  const mom = calculateMoM(currentValue, previousValue);

  if (mom === null) {
    return null;
  }

  const isPositive = mom > 0;
  const isNegative = mom < 0;
  const badgeClass = isPositive ? 'badge-success' : isNegative ? 'badge-error' : 'badge-neutral';
  const arrowRotationClass = isNegative ? 'rotate-180' : '';
  const ariaLabel = isPositive ? 'Month over month increase' : isNegative ? 'Month over month decrease' : 'No change month over month';

  return (
    <span className={`badge badge-xs flex items-center gap-1 ${badgeClass}`} aria-label={`${Math.abs(mom).toFixed(1)}% ${ariaLabel}`}>
      {mom !== 0 && (
        <SVGIcon
          icon="arrow" // Ensure this SVGIcon is accessible and provides a visual cue
          className={`w-3 h-3 ${arrowRotationClass}`}
          aria-hidden="true" // Hide from screen readers as parent span has aria-label
        />
      )}
      {Math.abs(mom).toFixed(1)}%
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
              <div className="badge badge-info badge-lg p-3" aria-label={`Data for ${monthBadge}`}>
                {monthBadge}
              </div>
            )}
            {selectedBankData.Bank_Type && (
              <div className="badge badge-primary badge-lg p-3">
                {selectedBankData.Bank_Type}
              </div>
            )}
            {selectedBankData.Bank_Short_Name && (
              <div className="badge badge-neutral badge-lg p-3">
                {selectedBankData.Bank_Short_Name}
              </div>
            )}
          </div>
        </div>

        <p className="text-lg text-gray-600 mb-6">
          Infrastructure overview for the selected bank.
        </p>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-base-200 p-4 rounded-xl">
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
