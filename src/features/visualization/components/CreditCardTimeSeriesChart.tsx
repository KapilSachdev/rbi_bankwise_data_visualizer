import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { FC, memo, useEffect, useMemo, useState } from 'react';
import EChartsContainer from '../../../components/common/EChartsContainer';
import Pills from '../../../components/filters/Pills';
import RangeSlider from '../../../components/filters/RangeSlider';
import TopNInput from '../../../components/filters/TopNInput';
import { BANK_TYPES } from '../../../constants/data';
import type { BankData } from '../../../types/global.types';

echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);


interface CreditCardTimeSeriesChartProps {
  allData: Record<string, BankData[]>;
  months: string[];
  chartRef?: { current: echarts.EChartsType | null };
}

const CreditCardTimeSeriesChart: FC<CreditCardTimeSeriesChartProps> = ({ allData, months, chartRef }) => {
  // Ensure months are sorted in ascending order (earliest to latest)
  const sortedMonths = useMemo(() => {
    return [...months].sort();
  }, [months]);

  // Extract unique years from months (format: YYYY_MM or YYYY-MM)
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    sortedMonths.forEach(m => {
      const y = Number(m.slice(0, 4));
      if (!isNaN(y)) yearSet.add(y);
    });
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [sortedMonths]);

  // Default year range: last 5 years (or all if <5)
  const defaultYearRange = useMemo(() => {
    if (years.length === 0) return [0, 0] as [number, number];
    const end = years[years.length - 1];
    const start = years.length > 5 ? years[years.length - 5] : years[0];
    return [start, end] as [number, number];
  }, [years]);

  const [yearRange, setYearRange] = useState<[number, number]>(defaultYearRange);

  // Set default year range to last 5 years on mount or when years change
  useEffect(() => {
    setYearRange(defaultYearRange);
  }, [defaultYearRange]);

  // Filter months by selected year range
  const filteredMonths = useMemo(() => {
    return sortedMonths.filter(m => {
      const y = Number(m.slice(0, 4));
      return y >= yearRange[0] && y <= yearRange[1];
    });
  }, [sortedMonths, yearRange]);
  // No need for chartRef or chartInstance, handled by EChartsChart

  // Filter state
  const [selectedBankType, setSelectedBankType] = useState('');

  // Get all unique bank types
  const bankTypes = BANK_TYPES

  // Build time series data for all banks matching filter (only if they have >0 credit cards in at least one month)
  const chartData = useMemo(() => {
    const all = filteredMonths.flatMap(m => allData[m] || []);
    const filtered = selectedBankType ? all.filter(d => d.Bank_Type === selectedBankType) : all;
    // Group by bank name
    const bankMap = new Map<string, BankData[]>();
    filtered.forEach(d => {
      if (!bankMap.has(d.Bank_Name)) bankMap.set(d.Bank_Name, []);
      bankMap.get(d.Bank_Name)!.push(d);
    });
    // Build time series for each bank
    return Array.from(bankMap.entries())
      .map(([bankName]) => {
        const values = filteredMonths.map(month => {
          const bank = (allData[month] || []).find(d => d.Bank_Name === bankName);
          return { month, creditCards: bank?.Infrastructure?.Credit_Cards ?? 0 };
        });
        // Only include if at least one value > 0
        if (values.some(v => v.creditCards > 0)) {
          return { bank: bankName, values };
        }
        return null;
      })
      .filter(Boolean) as { bank: string; values: { month: string; creditCards: number }[] }[];
  }, [allData, filteredMonths, selectedBankType]);

  // Top N state and sorted data
  const [topN, setTopN] = useState(10);
  const latestMonth = filteredMonths[filteredMonths.length - 1];
  const sortedData = useMemo(() => {
    return [...chartData]
      .sort((a, b) => {
        const aVal = a.values.find(v => v.month === latestMonth)?.creditCards ?? 0;
        const bVal = b.values.find(v => v.month === latestMonth)?.creditCards ?? 0;
        return bVal - aVal;
      })
      .slice(0, topN);
  }, [chartData, filteredMonths, topN, latestMonth]);

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => value.toLocaleString('en-IN')
    },
    legend: { x: 'right', y: 'top', type: 'scroll' },
    grid: { left: '1%', right: '1%', bottom: '1%', containLabel: true },
    xAxis: {
      type: 'category',
      data: filteredMonths,
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      name: 'Credit Cards',
    },
    series: sortedData.map(bank => ({
      name: bank.bank,
      type: 'line',
      data: filteredMonths.map(m => bank.values.find(v => v.month === m)?.creditCards ?? 0),
      smooth: true,
      emphasis: { focus: 'series' },
    })),
  }), [sortedData, filteredMonths]);

  return (
    <div className='flex flex-col gap-4 justify-between h-full'>
      <div className='flex flex-row items-center justify-between gap-2'>
        <div className='text-lg text-center font-semibold flex-1'>
          Credit Card Time Series
        </div>
        <TopNInput
          value={topN}
          min={1}
          max={chartData.length}
          onChange={setTopN}
          label="banks"
        />
      </div>
      <div className='grid gap-4'>
        <div className="flex-1 min-w-0">
          <Pills
            bankTypes={bankTypes}
            selected={selectedBankType}
            onSelect={setSelectedBankType}
          />
        </div>

        <RangeSlider
          min={years[0]}
          max={years[years.length - 1]}
          value={yearRange}
          onChange={setYearRange}
          step={1}
        />
      </div>
      <EChartsContainer
        option={option}
        className="w-full h-[400px]"
        aria-label="Credit Card Time Series Chart"
        role="img"
        tabIndex={0}
        onInit={instance => { if (chartRef) chartRef.current = instance; }}
      />
    </div>
  );
};

export default memo(CreditCardTimeSeriesChart);
