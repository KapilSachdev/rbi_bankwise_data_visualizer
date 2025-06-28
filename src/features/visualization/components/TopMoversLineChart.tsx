import React, { useMemo, useState } from 'react';
import Doughnut from '../../../components/filters/Doughnut';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent, ToolboxComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { BankData } from '../../../types/global.types';
import EChartsContainer from '../../../components/common/EChartsContainer';

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  CanvasRenderer,
]);

interface TopMoversLineChartProps {
  allData: Record<string, BankData[]>;
  months: string[];
  metric?: 'credit' | 'debit' | 'total';
  topN?: number;
}

const TopMoversLineChart: React.FC<TopMoversLineChartProps> = ({ allData, months, metric = 'total', topN = 5 }) => {
  const [selectedMetric, setSelectedMetric] = useState<'credit' | 'debit' | 'total'>(metric);

  // Prepare time series for each bank
  const bankSeries = useMemo(() => {
    const bankMap = new Map<string, { name: string; values: number[] }>();
    const sortedMonths = [...months].sort();
    sortedMonths.forEach((month, mi) => {
      (allData[month] || []).forEach(row => {
        const bank = row.Bank_Short_Name?.trim() || row.Bank_Name;
        const credit = row.Card_Payments_Transactions?.Credit_Card;
        const debit = row.Card_Payments_Transactions?.Debit_Card;
        let value = 0;
        if (selectedMetric === 'credit') {
          value = (credit?.at_PoS?.Volume || 0) + (credit?.Online_ecom?.Volume || 0);
        } else if (selectedMetric === 'debit') {
          value = (debit?.at_PoS?.Volume || 0) + (debit?.Online_ecom?.Volume || 0);
        } else {
          value =
            (credit?.at_PoS?.Volume || 0) +
            (credit?.Online_ecom?.Volume || 0) +
            (debit?.at_PoS?.Volume || 0) +
            (debit?.Online_ecom?.Volume || 0);
        }
        if (!bankMap.has(bank)) {
          bankMap.set(bank, { name: bank, values: Array(sortedMonths.length).fill(0) });
        }
        bankMap.get(bank)!.values[mi] = value;
      });
    });
    return Array.from(bankMap.values());
  }, [allData, months, selectedMetric]);

  // Compute growth for each bank (last - first)
  const topBanks = useMemo(() => {
    return [...bankSeries]
      .map(b => ({ ...b, growth: b.values[b.values.length - 1] - b.values[0] }))
      .sort((a, b) => b.growth - a.growth)
      .slice(0, topN);
  }, [bankSeries, topN]);


  const sortedMonths = useMemo(() => [...months].sort(), [months]);
  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    title: {
      text: `Top ${topN} Banks by ${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Card Txn Growth`,
      left: 'center',
    },
    tooltip: { trigger: 'axis' },
    legend: { top: 30, type: 'scroll' },
    toolbox: { feature: { saveAsImage: {} } },
    grid: { left: '3%', right: '4%', top: '20%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: sortedMonths,
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      name: 'Transaction Volume',
    },
    series: topBanks.map(bank => ({
      name: bank.name,
      type: 'line',
      data: bank.values,
      smooth: true,
      emphasis: { focus: 'series' },
      showSymbol: false,
    })),
    animationDuration: 800,
  }), [topBanks, sortedMonths, selectedMetric, topN]);

  return (
    <div className="w-full h-[480px]">
      <div className="flex justify-end">
        <Doughnut
          options={['Total', 'Credit Card', 'Debit Card']}
          selected={
            selectedMetric === 'total'
              ? 'Total'
              : selectedMetric === 'credit'
              ? 'Credit Card'
              : 'Debit Card'
          }
          onSelect={option => {
            setSelectedMetric(
              option === 'Total' ? 'total' : option === 'Credit Card' ? 'credit' : 'debit'
            );
          }}
          size={36}
        />
      </div>
      <EChartsContainer
        option={option}
        className="w-full h-[400px] rounded-xl"
        aria-label="Top Movers Card Transaction Growth"
        role="img"
        tabIndex={0}
      />
      <div className="text-xs text-base-content/60 mt-2">Top {topN} banks by {selectedMetric} card transaction growth over time.</div>
    </div>
  );
};

export default TopMoversLineChart;
