import React, { useMemo } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { BankData } from '../../../types/global.types';
import EChartsContainer from '../../../components/common/EChartsContainer';

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);

interface BankTypeStackedAreaChartProps {
  allData: Record<string, BankData[]>;
  months: string[];
}



const BankTypeStackedAreaChart: React.FC<BankTypeStackedAreaChartProps> = ({ allData, months }) => {
  // No need for chartRef or chartInstance, handled by EChartsChart
  // Get all unique bank types
  const bankTypes = useMemo(() => {
    const set = new Set<string>();
    months.forEach(month => {
      (allData[month] || []).forEach(row => set.add(row.Bank_Type || 'Unknown'));
    });
    return Array.from(set).sort();
  }, [allData, months]);

  // Prepare time series for each bank type
  const typeSeries = useMemo(() => {
    const sortedMonths = [...months].sort();
    return bankTypes.map(type => {
      const values = sortedMonths.map(month => {
        const rows = (allData[month] || []).filter(r => (r.Bank_Type || 'Unknown') === type);
        // Sum total card txn volume for this type
        return rows.reduce((sum, row) => {
          const credit = row.Card_Payments_Transactions?.Credit_Card;
          const debit = row.Card_Payments_Transactions?.Debit_Card;
          return sum +
            (credit?.at_PoS?.Volume || 0) +
            (credit?.Online_ecom?.Volume || 0) +
            (debit?.at_PoS?.Volume || 0) +
            (debit?.Online_ecom?.Volume || 0);
        }, 0);
      });
      return { type, values };
    });
  }, [allData, months, bankTypes]);


  const sortedMonths = useMemo(() => [...months].sort(), [months]);
  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    title: {
      text: 'Card Transaction Volume by Bank Type',
      left: 'center',
    },
    tooltip: { trigger: 'axis' },
    legend: { top: 30, type: 'scroll' },
    grid: { left: '3%', right: '4%', top: '20%', bottom: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: sortedMonths,
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      name: 'Txn Volume',
    },
    series: typeSeries.map(s => ({
      name: s.type,
      type: 'line',
      data: s.values,
    })),
    animationDuration: 800,
  }), [typeSeries, sortedMonths]);

  return (
    <div className="h-full grid">
      <div className="self-end">
        <EChartsContainer
          option={option}
          className="w-full h-[400px]"
          aria-label="Bank Type Stacked Area Chart"
          role="img"
          tabIndex={0}
        />
        <div className="text-xs text-base-content/60 mt-2">
          Card transactions volume by bank type over time.
        </div>
      </div>
    </div>
  );
};

export default BankTypeStackedAreaChart;
