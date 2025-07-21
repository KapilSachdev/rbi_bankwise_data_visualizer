import { FC, useMemo, useState } from 'react';
import EChartsContainer from '../../../components/common/EChartsContainer';
import TopNInput from '../../../components/filters/TopNInput';
import { BankData } from '../../../types/global.types';

import type { EChartsType } from 'echarts/core';

interface TopCreditCardBanksChartProps {
  allData: { [key: string]: BankData[] };
  months: string[];
  topN?: number;
  showTitle?: boolean;
  onTitleChange?: (title: string) => void;
  chartRef?: { current: EChartsType | null };
}

const TopCreditCardBanksChart: FC<TopCreditCardBanksChartProps> = ({ allData, months, topN = 5, showTitle = true, onTitleChange, chartRef }) => {
  // TopN state for user control
  const [currentTopN, setCurrentTopN] = useState(topN);

  // Aggregate total credit card volume per bank
  const topBanks = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.values(allData).forEach(bankArr => {
      bankArr.forEach(bank => {
        const vol = bank.Infrastructure?.Credit_Cards ?? 0;
        totals[bank.Bank_Name] = (totals[bank.Bank_Name] || 0) + vol;
      });
    });
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, currentTopN);
  }, [allData, currentTopN]);

  const chartTitle = `Top ${currentTopN} Banks by Credit Card Volume`;
  if (onTitleChange) onTitleChange(chartTitle);

  const option = {
    backgroundColor: 'transparent',
    title: showTitle ? { text: chartTitle, left: 'center' } : undefined,
    tooltip: { trigger: 'axis' },
    grid: { left: 60, right: 20, bottom: 40, top: showTitle ? 60 : 20 },
    xAxis: {
      type: 'category',
      data: topBanks.map(([name]) => name),
      axisLabel: { rotate: 30 }
    },
    yAxis: { type: 'value', name: 'Credit Cards' },
    series: [{
      type: 'bar',
      data: topBanks.map(([, value]) => value),
    }]
  };

  return (
    <div className="flex flex-col gap-4 justify-between h-full">
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="text-lg text-center font-medium flex-1">
          Top Banks by Credit Card Volume
        </div>
      </div>
      <div className="grid gap-4">
        <div className="flex w-full justify-end gap-4">
          <TopNInput
            value={currentTopN}
            min={1}
            max={Math.max(1, Object.keys(allData).length)}
            onChange={setCurrentTopN}
            label="banks"
          />
        </div>
      </div>
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

export default TopCreditCardBanksChart;
