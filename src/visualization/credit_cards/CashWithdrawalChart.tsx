import { FC, useMemo } from 'react';
import EChartsContainer from '../../components/common/EChartsContainer';
import { BankData } from '../../types/global.types';

import type { EChartsType } from 'echarts/core';

interface CreditCardCashWithdrawalChartProps {
  allData: { [key: string]: BankData[] };
  showTitle?: boolean;
  onTitleChange?: (title: string) => void;
  chartRef?: { current: EChartsType | null };
}

const CreditCardCashWithdrawalChart: FC<CreditCardCashWithdrawalChartProps> = ({ allData, showTitle = true, onTitleChange, chartRef }) => {
  // Aggregate cash withdrawal volume and value for credit cards
  const totals = useMemo(() => {
    let atmVol = 0, atmVal = 0;
    Object.values(allData).forEach(bankArr => {
      bankArr.forEach(bank => {
        const cc = bank.Card_Payments_Transactions?.Credit_Card;
        if (cc?.Cash_Withdrawal?.At_ATM) {
          atmVol += cc.Cash_Withdrawal.At_ATM.Volume ?? 0;
          atmVal += cc.Cash_Withdrawal.At_ATM.Value ?? 0;
        }
      });
    });
    return { atmVol, atmVal };
  }, [allData]);

  const chartTitle = 'Credit Card Cash Withdrawal Trends';
  if (onTitleChange) onTitleChange(chartTitle);

  const option = {
    backgroundColor: 'transparent',
    title: showTitle ? { text: chartTitle, left: 'center' } : undefined,
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, bottom: 40, top: showTitle ? 60 : 20 },
    xAxis: {
      type: 'category',
      data: ['ATM Withdrawals'],
    },
    yAxis: { type: 'value', name: 'Volume' },
    series: [
      {
        type: 'bar',
        name: 'Volume',
        data: [totals.atmVol],
      },
      {
        type: 'bar',
        name: 'Value',
        data: [totals.atmVal],
        yAxisIndex: 0
      }
    ]
  };

  return (
    <div className="flex flex-col gap-4 justify-between h-full">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="text-lg text-center font-medium flex-1">
          Credit Card Cash Withdrawal Trends
        </div>
      </div>
      {/* No filters needed for aggregate chart */}
      <EChartsContainer
        option={option}
        className="w-full h-[400px]"
        aria-label={chartTitle}
        role="figure"
        tabIndex={0}
        onInit={(instance: EChartsType) => { if (chartRef) chartRef.current = instance; }}
      />
    </div>
  );
};

export default CreditCardCashWithdrawalChart;
