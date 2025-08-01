import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { FC, useEffect, useMemo, useState } from 'react';
import EChartsContainer from '../../components/common/EChartsContainer';
import RangeSlider from '../../components/filters/RangeSlider';
import { useYearRangeData } from '../../hooks/useYearRangeData';
import type { BankData } from '../../types/global.types';

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
  chartRef?: { current: echarts.EChartsType | null };
}

const BankTypeStackedAreaChart: FC<BankTypeStackedAreaChartProps> = ({ allData, months, chartRef }) => {
  // Get all unique bank types
  const bankTypes = useMemo(() => {
    const set = new Set<string>();
    months.forEach(month => {
      (allData[month] || []).forEach(row => set.add(row.Bank_Type || 'Unknown'));
    });
    return Array.from(set).sort();
  }, [allData, months]);


  // DRY: Use shared hook for years and default range
  const { years, defaultYearRange } = useYearRangeData(months);
  const [yearRange, setYearRange] = useState<[number, number]>(defaultYearRange);
  useEffect(() => { setYearRange(defaultYearRange); }, [defaultYearRange]);
  const sortedMonths = useMemo(() => [...months].sort(), [months]);
  const filteredMonths = useMemo(() => {
    return sortedMonths.filter(m => {
      const y = Number(m.slice(0, 4));
      return y >= yearRange[0] && y <= yearRange[1];
    });
  }, [sortedMonths, yearRange]);

  // Prepare time series for each bank type (filtered by year range)
  const typeSeries = useMemo(() => {
    return bankTypes.map(type => {
      const values = filteredMonths.map(month => {
        const rows = (allData[month] || []).filter(r => (r.Bank_Type || 'Unknown') === type);
        // Sum total card transaction volume for this type
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
  }, [allData, filteredMonths, bankTypes]);

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => value.toLocaleString('en-IN')
    },
    legend: { x: 'right', y: 'top', type: 'scroll' },
    grid: { left: '3%', right: '4%', top: '20%', bottom: '8%' },
    xAxis: {
      type: 'category',
      data: filteredMonths,
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      name: 'Transaction Volume'
    },
    series: typeSeries.map(s => ({
      name: s.type,
      type: 'line',
      data: s.values,
    })),
  }), [typeSeries, filteredMonths]);

  return (
    <div className="h-full grid">
      <div className="text-lg text-center font-medium mb-4">
        Card Transactions Volume by Bank Type Over Time
      </div>
      <div className="flex w-full justify-end gap-4 mb-2">
        <RangeSlider
          min={years[0]}
          max={years[years.length - 1]}
          value={yearRange}
          onChange={setYearRange}
          step={1}
        />
      </div>
      <div className="self-end">
        <EChartsContainer
          option={option}
          className="w-full h-[400px]"
          aria-label="Bank Type Stacked Area Chart"
          role="img"
          tabIndex={0}
          onInit={instance => { if (chartRef) chartRef.current = instance; }}
        />
        <div className="text-xs text-base-content/60 mt-2">
          Card transactions volume by bank type over time.
        </div>
      </div>
    </div>
  );
};

export default BankTypeStackedAreaChart;
