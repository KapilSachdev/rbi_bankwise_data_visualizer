import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { FC, memo, useEffect, useMemo, useState } from 'react';
import EChartsContainer from '../../../components/common/EChartsContainer';
import Pills from '../../../components/filters/Pills';
import RangeSlider from '../../../components/filters/RangeSlider';
import TopNInput from '../../../components/filters/TopNInput';
import { useYearRangeData } from '../../../hooks/useYearRangeData';
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
    // Build time series for each bank, include short name for UX
    return Array.from(bankMap.entries())
      .map(([bankName, bankDatas]) => {
        // Try to get short name from any entry (should be same for all)
        const bankShortName = bankDatas[0]?.Bank_Short_Name || bankName;
        const values = filteredMonths.map(month => {
          const bank = (allData[month] || []).find(d => d.Bank_Name === bankName);
          return { month, creditCards: bank?.Infrastructure?.Credit_Cards ?? 0 };
        });
        // Only include if at least one value > 0
        if (values.some(v => v.creditCards > 0)) {
          return { bank: bankName, bankShortName, values };
        }
        return null;
      })
      .filter(Boolean) as { bank: string; bankShortName: string; values: { month: string; creditCards: number }[] }[];
  }, [allData, filteredMonths, selectedBankType]);

  // Top N state and sorted data
  const [topN, setTopN] = useState(5);
  const latestMonth = filteredMonths[filteredMonths.length - 1];
  const sortedData = useMemo(() => {
    return [...chartData]
      .sort((a, b) => {
        const aVal = a.values.find(v => v.month === latestMonth)?.creditCards ?? 0;
        const bVal = b.values.find(v => v.month === latestMonth)?.creditCards ?? 0;
        return bVal - aVal;
      })
      .slice(0, topN);
  }, [chartData, topN, latestMonth]);

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => value.toLocaleString('en-IN')
    },
    legend: { x: 'right', y: 'top', type: 'scroll' },
    grid: { left: '1%', right: '1%', bottom: '1%' },
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
      name: bank.bankShortName || bank.bank,
      type: 'line',
      data: filteredMonths.map(m => bank.values.find(v => v.month === m)?.creditCards ?? 0),
    })),
  }), [sortedData, filteredMonths]);

  return (
    <div className='flex flex-col gap-4 justify-between h-full'>
      <div className='flex flex-row items-center justify-between gap-2'>
        <div className='text-lg text-center font-medium flex-1'>
          Credit Card Time Series
        </div>
      </div>
      <div className='grid gap-4'>
        <div className="flex w-full justify-between gap-4">
          <TopNInput
            value={topN}
            min={1}
            max={chartData.length}
            onChange={setTopN}
            label="banks"
          />
          <RangeSlider
            min={years[0]}
            max={years[years.length - 1]}
            value={yearRange}
            onChange={setYearRange}
            step={1}
          />
        </div>
        <Pills
          bankTypes={bankTypes}
          selected={selectedBankType}
          onSelect={setSelectedBankType}
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
