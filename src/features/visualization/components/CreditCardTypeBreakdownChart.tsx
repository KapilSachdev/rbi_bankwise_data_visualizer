import { PieChart } from 'echarts/charts';
import * as echarts from 'echarts/core';
import { FC, useMemo } from 'react';
import EChartsContainer from '../../../components/common/EChartsContainer';
import { BankData } from '../../../types/global.types';

import type { EChartsType } from 'echarts/core';

interface CreditCardTypeBreakdownChartProps {
  allData: { [key: string]: BankData[] };
  months: string[];
  showTitle?: boolean;
  onTitleChange?: (title: string) => void;
  chartRef?: { current: EChartsType | null };
}

echarts.use(PieChart);

const CreditCardTypeBreakdownChart: FC<CreditCardTypeBreakdownChartProps> = ({ allData, months, showTitle = true, onTitleChange, chartRef }) => {
  // Aggregate transaction types for credit cards
  const breakdown = useMemo(() => {
    let atPos = 0, online = 0, cash = 0, others = 0;
    Object.values(allData).forEach(bankArr => {
      bankArr.forEach(bank => {
        const cc = bank.Card_Payments_Transactions?.Credit_Card;
        if (cc) {
          atPos += cc.at_PoS?.Volume ?? 0;
          online += cc.Online_ecom?.Volume ?? 0;
          cash += cc.Cash_Withdrawal?.At_ATM?.Volume ?? 0;
          others += cc.Others?.Volume ?? 0;
        }
      });
    });
    return [
      { name: 'PoS', value: atPos },
      { name: 'Online/ecom', value: online },
      { name: 'Cash Withdrawal', value: cash },
      { name: 'Others', value: others }
    ];
  }, [allData]);

  const chartTitle = 'Credit Card Transaction Type Breakdown';
  if (onTitleChange) onTitleChange(chartTitle);

  const option = {
    backgroundColor: 'transparent',
    title: showTitle ? { text: chartTitle, left: 'center' } : undefined,
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: breakdown,
      label: { formatter: '{b}: {c}' }
    }]
  };

  return (
    <div className="flex flex-col gap-4 justify-between h-full">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="text-lg text-center font-medium flex-1">
          Credit Card Transaction Type Breakdown
        </div>
      </div>
      {/* No filters needed for aggregate breakdown */}
      <EChartsContainer
        className="w-full h-[400px]"
        option={option}
        aria-label={chartTitle}
        role="figure"
        tabIndex={0}
        onInit={instance => { if (chartRef) chartRef.current = instance; }}
      />
    </div>
  );
};

export default CreditCardTypeBreakdownChart;
