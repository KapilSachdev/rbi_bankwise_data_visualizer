import React, { useMemo, useRef, useEffect } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import DataFilter from '../../../components/common/DataFilter';
// Removed custom YearRangeSlider, using DaisyUI slider instead
import type { BankData } from '../../../types/global.types';

// Register ECharts components (safe to call multiple times)
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
]);


interface CreditCardTimeSeriesChartProps {
  allData: { [key: string]: BankData[] };
  months: string[];
}

const CreditCardTimeSeriesChart: React.FC<CreditCardTimeSeriesChartProps> = ({ allData, months }) => {
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

  const [yearRange, setYearRange] = React.useState<[number, number]>(defaultYearRange);

  // Set default year range to last 5 years on mount or when years change
  React.useEffect(() => {
    setYearRange(defaultYearRange);
  }, [defaultYearRange[0], defaultYearRange[1]]);

  // Filter months by selected year range
  const filteredMonths = useMemo(() => {
    return sortedMonths.filter(m => {
      const y = Number(m.slice(0, 4));
      return y >= yearRange[0] && y <= yearRange[1];
    });
  }, [sortedMonths, yearRange]);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  // Filter state
  const [selectedBankType, setSelectedBankType] = React.useState('');
  const [selectedBanks, setSelectedBanks] = React.useState<string[]>([]);

  // Get all unique bank types
  const bankTypes = useMemo(() => {
    const all = filteredMonths.flatMap(m => allData[m] || []);
    return Array.from(new Set(all.map(d => d.Bank_Type)));
  }, [allData, filteredMonths]);

  // Get all unique banks (filtered by type), only those with credit cards > 0 in at least one month
  const banks = useMemo(() => {
    const all = filteredMonths.flatMap(m => allData[m] || []);
    const filtered = selectedBankType ? all.filter(d => d.Bank_Type === selectedBankType) : all;
    // Group by bank name
    const bankMap = new Map<string, BankData[]>();
    filtered.forEach(d => {
      if (!bankMap.has(d.Bank_Name)) bankMap.set(d.Bank_Name, []);
      bankMap.get(d.Bank_Name)!.push(d);
    });
    // Only include banks with credit cards > 0 in at least one month
    return Array.from(bankMap.entries())
      .filter(([, arr]) => arr.some(b => b.Infrastructure?.Credit_Cards > 0))
      .map(([name]) => name);
  }, [allData, filteredMonths, selectedBankType]);

  // Whenever selectedBankType changes, reset selectedBanks to top 5 for that type (with >0 credit cards)
  useEffect(() => {
    if (banks.length > 0) {
      const latestMonth = filteredMonths[filteredMonths.length - 1];
      const data = (allData[latestMonth] || [])
        .filter(d => (!selectedBankType || d.Bank_Type === selectedBankType) && d.Infrastructure?.Credit_Cards > 0);
      const sorted = [...data].sort((a, b) => (b.Infrastructure?.Credit_Cards ?? 0) - (a.Infrastructure?.Credit_Cards ?? 0));
      setSelectedBanks(sorted.map(d => d.Bank_Name));
    } else {
      setSelectedBanks([]);
    }
  }, [selectedBankType, banks.length, allData, filteredMonths]);

  // Build time series data for selected banks (only if they have >0 credit cards in at least one month)
  const chartData = useMemo(() => {
    return selectedBanks.map(bankName => {
      const values = filteredMonths.map(month => {
        const bank = (allData[month] || []).find(d => d.Bank_Name === bankName);
        return { month, creditCards: bank?.Infrastructure?.Credit_Cards ?? 0 };
      });
      // Only include if at least one value > 0
      if (values.some(v => v.creditCards > 0)) {
        return { bank: bankName, values };
      }
      return null;
    }).filter(Boolean) as { bank: string; values: { month: string; creditCards: number }[] }[];
  }, [selectedBanks, allData, filteredMonths]);

  // Sort by latest credit card count
  const sortedData = useMemo(() => {
    const latestMonth = filteredMonths[filteredMonths.length - 1];
    return [...chartData].sort((a, b) => {
      const aVal = a.values.find(v => v.month === latestMonth)?.creditCards ?? 0;
      const bVal = b.values.find(v => v.month === latestMonth)?.creditCards ?? 0;
      return bVal - aVal;
    });
  }, [chartData, filteredMonths]);

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    title: {
      text: 'Credit Card Count Over Time by Bank',
      left: 'center',
    },
    tooltip: { trigger: 'axis' },
    legend: { top: 30, type: 'scroll' },
    grid: { left: '3%', right: '4%', top: '30%', bottom: '0%', containLabel: true },
    xAxis: {
      type: 'category',
      data: filteredMonths,
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      name: 'Credit Cards',
      axisLabel: { formatter: '{value}' },
    },
    series: sortedData.map(bank => ({
      name: bank.bank,
      type: 'line',
      data: filteredMonths.map(m => bank.values.find(v => v.month === m)?.creditCards ?? 0),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 },
      emphasis: { focus: 'series' },
    })),
    animationDuration: 800,
  }), [sortedData, filteredMonths]);

  // Initialize and update chart
  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }
    chartInstance.current.setOption(option);
    // Responsive resize
    const handleResize = () => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [option]);

  return (
    <div className='flex flex-col gap-4 justify-between h-full'>
      <div className='flex gap-4 justify-between mb-4'>
        <DataFilter
          bankTypes={bankTypes}
          selectedBankType={selectedBankType}
          onBankTypeChange={setSelectedBankType}
          filters={{ bankType: true }}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium" htmlFor="year-range-slider">
            Year Range: {yearRange[0]} - {yearRange[1]}
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xs">{years[0]}</span>
            <input
              id="year-range-slider"
              type="range"
              min={years[0]}
              max={years[years.length - 1]}
              value={yearRange[0]}
              className="range range-primary flex-1"
              step={1}
              onChange={e => {
                const newStart = Number(e.target.value);
                setYearRange(([_, end]) => [Math.min(newStart, end), Math.max(newStart, end)]);
              }}
              aria-label="Select start year"
            />
            <input
              type="range"
              min={years[0]}
              max={years[years.length - 1]}
              value={yearRange[1]}
              className="range range-secondary flex-1"
              step={1}
              onChange={e => {
                const newEnd = Number(e.target.value);
                setYearRange(([start, _]) => [Math.min(start, newEnd), Math.max(start, newEnd)]);
              }}
              aria-label="Select end year"
            />
            <span className="text-xs">{years[years.length - 1]}</span>
          </div>
        </div>
      </div>
      <div
        ref={chartRef}
        className="w-full h-[400px]"
        aria-label="Credit Card Time Series Chart"
        role="img"
        tabIndex={0}
      />
    </div>
  );
};

export default React.memo(CreditCardTimeSeriesChart);
