import React, { useMemo, useRef, useEffect } from 'react';
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import DataFilter from '../../../components/common/DataFilter';
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

/**
 * Line chart for credit card time series per bank.
 * @param data - Array of time series per bank
 * @param months - Array of months (x-axis)
 */

/**
 * Line chart for credit card time series per bank, rendered directly with ECharts API (no extra dependencies).
 */



interface CreditCardTimeSeriesChartProps {
  allData: { [key: string]: BankData[] };
  months: string[];
}

const CreditCardTimeSeriesChart: React.FC<CreditCardTimeSeriesChartProps> = ({ allData, months }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  // Filter state
  const [selectedBankType, setSelectedBankType] = React.useState('');
  const [selectedBanks, setSelectedBanks] = React.useState<string[]>([]);

  // Get all unique bank types
  const bankTypes = useMemo(() => {
    const all = months.flatMap(m => allData[m] || []);
    return Array.from(new Set(all.map(d => d.Bank_Type)));
  }, [allData, months]);

  // Get all unique banks (filtered by type), only those with credit cards > 0 in at least one month
  const banks = useMemo(() => {
    const all = months.flatMap(m => allData[m] || []);
    const filtered = selectedBankType ? all.filter(d => d.Bank_Type === selectedBankType) : all;
    // Group by bank name
    const bankMap = new Map<string, BankData[]>();
    filtered.forEach(d => {
      if (!bankMap.has(d.Bank_Name)) bankMap.set(d.Bank_Name, []);
      bankMap.get(d.Bank_Name)!.push(d);
    });
    // Only include banks with credit cards > 0 in at least one month
    return Array.from(bankMap.entries())
      .filter(([_, arr]) => arr.some(b => b.Infrastructure?.Credit_Cards > 0))
      .map(([name]) => name);
  }, [allData, months, selectedBankType]);

  // Whenever selectedBankType changes, reset selectedBanks to top 5 for that type (with >0 credit cards)
  useEffect(() => {
    if (banks.length > 0) {
      const latestMonth = months[months.length - 1];
      const data = (allData[latestMonth] || [])
        .filter(d => (!selectedBankType || d.Bank_Type === selectedBankType) && d.Infrastructure?.Credit_Cards > 0);
      const sorted = [...data].sort((a, b) => (b.Infrastructure?.Credit_Cards ?? 0) - (a.Infrastructure?.Credit_Cards ?? 0));
      setSelectedBanks(sorted.map(d => d.Bank_Name));
    } else {
      setSelectedBanks([]);
    }
  }, [selectedBankType, banks.length, allData, months]);

  // Build time series data for selected banks (only if they have >0 credit cards in at least one month)
  const chartData = useMemo(() => {
    return selectedBanks.map(bankName => {
      const values = months.map(month => {
        const bank = (allData[month] || []).find(d => d.Bank_Name === bankName);
        return { month, creditCards: bank?.Infrastructure?.Credit_Cards ?? 0 };
      });
      // Only include if at least one value > 0
      if (values.some(v => v.creditCards > 0)) {
        return { bank: bankName, values };
      }
      return null;
    }).filter(Boolean) as { bank: string; values: { month: string; creditCards: number }[] }[];
  }, [selectedBanks, allData, months]);

  // Sort by latest credit card count
  const sortedData = useMemo(() => {
    const latestMonth = months[months.length - 1];
    return [...chartData].sort((a, b) => {
      const aVal = a.values.find(v => v.month === latestMonth)?.creditCards ?? 0;
      const bVal = b.values.find(v => v.month === latestMonth)?.creditCards ?? 0;
      return bVal - aVal;
    });
  }, [chartData, months]);

  const option = useMemo(() => ({
    title: {
      text: 'Credit Card Count Over Time by Bank',
      left: 'center',
    },
    tooltip: { trigger: 'axis' },
    legend: { top: 30, type: 'scroll' },
    grid: { left: '3%', right: '4%', top: '30%', bottom: '0%', containLabel: true },
    xAxis: {
      type: 'category',
      data: months,
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
      data: months.map(m => bank.values.find(v => v.month === m)?.creditCards ?? 0),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { width: 2 },
      emphasis: { focus: 'series' },
    })),
    animationDuration: 800,
  }), [sortedData, months]);

  // Initialize and update chart
  useEffect(() => {
    if (!chartRef.current) return;
    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }
    chartInstance.current.setOption(option);
    // Responsive resize
    const handleResize = () => {
      chartInstance.current && chartInstance.current.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current && chartInstance.current.dispose();
      chartInstance.current = null;
    };
  }, [option]);

  return (
    <div>
      <DataFilter
        bankTypes={bankTypes}
        selectedBankType={selectedBankType}
        onBankTypeChange={setSelectedBankType}
        filters={{ bankType: true }}
      />
      <div
        ref={chartRef}
        className="w-full h-[400px] bg-white dark:bg-gray-900 rounded-lg shadow"
        aria-label="Credit Card Time Series Chart"
        role="img"
        tabIndex={0}
      />
    </div>
  );
};

export default React.memo(CreditCardTimeSeriesChart);
