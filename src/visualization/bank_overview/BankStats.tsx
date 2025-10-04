import { FC, memo } from 'react';
import SVGIcon from '../../components/common/SVGIcon';
import type { BankData, NEFT, RTGS, MobileBanking, InternetBanking } from '../../types/global.types';
import { formatCurrency } from '../../utils/number';
import { formatNumber } from '../../utils/number';

// --- Type Guards and Data Structure Distinction ---
// PoS data structure (ATM/PoS/Card)
export interface PosBankData extends BankData {
  Infrastructure: BankData['Infrastructure'];
  Card_Payments_Transactions?: BankData['Card_Payments_Transactions'];
}

// Type guards for runtime type checking
export function isPosBankData(data: unknown): data is PosBankData {
  return data !== null && typeof data === 'object' && 'Infrastructure' in data;
}

export function isNEFTBankData(data: unknown): data is NEFT {
  return data !== null && typeof data === 'object' && 'Received_Inward_Credits' in data && 'Total_Outward_Debits' in data;
}

export function isRTGSBankData(data: unknown): data is RTGS {
  return data !== null && typeof data === 'object' && 'Outward_Transactions' in data && 'Inward_Transactions' in data;
}

export function isMobileBankingData(data: unknown): data is MobileBanking {
  return data !== null && typeof data === 'object' && 'Volume' in data && 'Value' in data && 'Active_Customers' in data && !('Received_Inward_Credits' in data);
}

export function isInternetBankingData(data: unknown): data is InternetBanking {
  return data !== null && typeof data === 'object' && 'Volume' in data && 'Value' in data && 'Active_Customers' in data && !('Outward_Transactions' in data);
}

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

  const sign = isPositive ? '+' : '-';

  const colorClass = isPositive
    ? 'bg-success/10 text-success border-success'
    : isNegative
      ? 'bg-error/10 text-error border-error'
      : 'bg-base-200 text-base-content border-base-300';

  const rotateClass = isPositive ? '' : isNegative ? 'rotate-180' : 'rotate-90';

  const ariaLabel = isPositive
    ? `Increased by ${absChange.toLocaleString()} (${percent.toFixed(1)}%) from last month`
    : isNegative
      ? `Decreased by ${Math.abs(absChange).toLocaleString()} (${Math.abs(percent).toFixed(1)}%) from last month`
      : 'No change from last month';

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-selector border font-semibold text-xs shadow-sm ${colorClass} transition-all duration-200`}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      <span className="inline-flex items-center justify-center w-4 h-4 rounded-selector mr-1">
        <SVGIcon icon='triangle' className={`w-3 h-3 ${rotateClass}`} aria-hidden="true" />
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
  <div className="stat place-items-center p-2 bg-transparent">
    <div className="stat-title text-lg text-base-content">{title}</div>
    <div className="stat-value text-lg tooltip" data-tip={formatNumber(value, false)}>{formatNumber(value) || '-'}</div>
    <div className="stat-desc flex items-center gap-2">
      <MoMIndicator currentValue={currentValueForMoM} previousValue={previousValueForMoM} />
    </div>
  </div>
));

StatItem.displayName = 'StatItem';

interface DigitalBankingData {
  neft?: { current: NEFT | null, prev: NEFT | null };
  rtgs?: { current: RTGS | null, prev: RTGS | null };
  mobile?: { current: MobileBanking | null, prev: MobileBanking | null };
  internet?: { current: InternetBanking | null, prev: InternetBanking | null };
}

interface BankStatsProps {
  currentMonth: string;
  selectedBankData: BankData | null;
  prevMonthBankData: BankData | null;
  digitalBankingData?: DigitalBankingData;
}

// Configuration for StatItems to reduce repetition
const STAT_ITEMS_CONFIG = [
  { title: "Credit Cards", valuePath: (data: BankData) => data.Infrastructure?.Credit_Cards },
  { title: "Debit Cards", valuePath: (data: BankData) => data.Infrastructure?.Debit_Cards },
  { title: "UPI QR Codes", valuePath: (data: BankData) => data.Infrastructure?.UPI_QR_Codes },
  { title: "Bharat QR Codes", valuePath: (data: BankData) => data.Infrastructure?.Bharat_QR_Codes },
  { title: "PoS Terminals", valuePath: (data: BankData) => data.Infrastructure?.PoS },
  { title: "On-site ATMs", valuePath: (data: BankData) => data.Infrastructure?.ATMs_CRMs?.On_site },
  { title: "Off-site ATMs", valuePath: (data: BankData) => data.Infrastructure?.ATMs_CRMs?.Off_site },
  { title: "Micro ATMs", valuePath: (data: BankData) => data.Infrastructure?.Micro_ATMs },
];

// Main BankStats component
const BankStats: FC<BankStatsProps> = ({ currentMonth: _currentMonth, selectedBankData, prevMonthBankData, digitalBankingData }) => {
  if (!selectedBankData) {
    return null;
  }

  // Section 1: Infrastructure (PoS/ATM/Card)
  const isPos = isPosBankData(selectedBankData);
  const isPrevPos = prevMonthBankData && isPosBankData(prevMonthBankData);

  // Section 2: Digital Banking (NEFT, RTGS, Mobile, Internet)
  // These are passed as explicit props, not as selectedBankData
  const neft = digitalBankingData?.neft;
  const rtgs = digitalBankingData?.rtgs;
  const mobile = digitalBankingData?.mobile;
  const internet = digitalBankingData?.internet;

  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        {/* Section 1: Infrastructure (PoS/ATM/Card) */}
        {isPos && (
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-2">ATM / PoS / Card Infrastructure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2 rounded-selector">
              {STAT_ITEMS_CONFIG.map((item, _index) => (
                <StatItem
                  key={item.title}
                  title={item.title}
                  value={item.valuePath(selectedBankData)}
                  currentValueForMoM={item.valuePath(selectedBankData)}
                  previousValueForMoM={isPrevPos ? item.valuePath(prevMonthBankData) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Digital Banking (NEFT, RTGS, Mobile, Internet) - Compact Row Layout */}
        <div className="mb-8">
          <h3 className="font-bold text-lg mb-2">Digital Banking Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* NEFT */}
            <div className="rounded-selector p-4 h-full flex flex-col">
              <h4 className="font-semibold mb-2 text-center">NEFT</h4>
              {neft?.current ? (
                <div className="flex flex-col gap-2 flex-1">
                  <StatItem
                    title="Inward Credits (No.)"
                    value={neft.current.Received_Inward_Credits.No.toLocaleString()}
                    currentValueForMoM={neft.current.Received_Inward_Credits.No}
                    previousValueForMoM={neft.prev?.Received_Inward_Credits.No}
                  />
                  <StatItem
                    title="Inward Credits (Amount)"
                    value={formatCurrency(neft.current.Received_Inward_Credits.Amount)}
                    currentValueForMoM={neft.current.Received_Inward_Credits.Amount}
                    previousValueForMoM={neft.prev?.Received_Inward_Credits.Amount}
                  />
                  <StatItem
                    title="Outward Debits (No.)"
                    value={neft.current.Total_Outward_Debits.No.toLocaleString()}
                    currentValueForMoM={neft.current.Total_Outward_Debits.No}
                    previousValueForMoM={neft.prev?.Total_Outward_Debits.No}
                  />
                  <StatItem
                    title="Outward Debits (Amount)"
                    value={formatCurrency(neft.current.Total_Outward_Debits.Amount)}
                    currentValueForMoM={neft.current.Total_Outward_Debits.Amount}
                    previousValueForMoM={neft.prev?.Total_Outward_Debits.Amount}
                  />
                </div>
              ) : (
                <div className="text-center text-base-content/60">No data</div>
              )}
            </div>
            {/* RTGS */}
            <div className="rounded-selector p-4 h-full flex flex-col">
              <h4 className="font-semibold mb-2 text-center">RTGS</h4>
              {rtgs?.current ? (
                <div className="flex flex-col gap-2 flex-1">
                  <StatItem
                    title="Outward Txns (No.)"
                    value={rtgs.current.Outward_Transactions.No.toLocaleString()}
                    currentValueForMoM={rtgs.current.Outward_Transactions.No}
                    previousValueForMoM={rtgs.prev?.Outward_Transactions.No}
                  />
                  <StatItem
                    title="Outward Txns (Amount)"
                    value={formatCurrency(rtgs.current.Outward_Transactions.Amount)}
                    currentValueForMoM={rtgs.current.Outward_Transactions.Amount}
                    previousValueForMoM={rtgs.prev?.Outward_Transactions.Amount}
                  />
                  <StatItem
                    title="Inward Txns (No.)"
                    value={rtgs.current.Inward_Transactions.No.toLocaleString()}
                    currentValueForMoM={rtgs.current.Inward_Transactions.No}
                    previousValueForMoM={rtgs.prev?.Inward_Transactions.No}
                  />
                  <StatItem
                    title="Inward Txns (Amount)"
                    value={formatCurrency(rtgs.current.Inward_Transactions.Amount)}
                    currentValueForMoM={rtgs.current.Inward_Transactions.Amount}
                    previousValueForMoM={rtgs.prev?.Inward_Transactions.Amount}
                  />
                </div>
              ) : (
                <div className="text-center text-base-content/60">No data</div>
              )}
            </div>
            {/* Mobile Banking */}
            <div className="rounded-selector p-4 h-full flex flex-col">
              <h4 className="font-semibold mb-2 text-center">Mobile Banking</h4>
              {mobile?.current ? (
                <div className="flex flex-col gap-2 flex-1">
                  <StatItem
                    title="Volume"
                    value={mobile.current.Volume.toLocaleString()}
                    currentValueForMoM={mobile.current.Volume}
                    previousValueForMoM={mobile.prev?.Volume}
                  />
                  <StatItem
                    title="Value"
                    value={formatCurrency(mobile.current.Value)}
                    currentValueForMoM={mobile.current.Value}
                    previousValueForMoM={mobile.prev?.Value}
                  />
                  <StatItem
                    title="Active Customers"
                    value={mobile.current.Active_Customers.toLocaleString()}
                    currentValueForMoM={mobile.current.Active_Customers}
                    previousValueForMoM={mobile.prev?.Active_Customers}
                  />
                </div>
              ) : (
                <div className="text-center text-base-content/60">No data</div>
              )}
            </div>
            {/* Internet Banking */}
            <div className="rounded-selector p-4 h-full flex flex-col">
              <h4 className="font-semibold mb-2 text-center">Internet Banking</h4>
              {internet?.current ? (
                <div className="flex flex-col gap-2 flex-1">
                  <StatItem
                    title="Volume"
                    value={internet.current.Volume.toLocaleString()}
                    currentValueForMoM={internet.current.Volume}
                    previousValueForMoM={internet.prev?.Volume}
                  />
                  <StatItem
                    title="Value"
                    value={formatCurrency(internet.current.Value)}
                    currentValueForMoM={internet.current.Value}
                    previousValueForMoM={internet.prev?.Value}
                  />
                  <StatItem
                    title="Active Customers"
                    value={internet.current.Active_Customers.toLocaleString()}
                    currentValueForMoM={internet.current.Active_Customers}
                    previousValueForMoM={internet.prev?.Active_Customers}
                  />
                </div>
              ) : (
                <div className="text-center text-base-content/60">No data</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankStats;
