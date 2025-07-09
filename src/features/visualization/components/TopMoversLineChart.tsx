import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { FC, useEffect, useMemo, useState } from 'react';
import EChartsContainer from '../../../components/common/EChartsContainer';
import Doughnut from '../../../components/filters/Doughnut';
import Pills from '../../../components/filters/Pills';
import RangeSlider from '../../../components/filters/RangeSlider';
import TopNInput from '../../../components/filters/TopNInput';
import { BANK_TYPES } from '../../../constants/data';
import { useYearRangeData } from '../../../hooks/useYearRangeData';
import type { BankData } from '../../../types/global.types';

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
  chartRef?: { current: echarts.EChartsType | null };
}

const TopMoversLineChart: FC<TopMoversLineChartProps> = ({ allData, months, metric = 'total', topN = 5, chartRef }) => {
  const [selectedMetric, setSelectedMetric] = useState<'credit' | 'debit' | 'total'>(metric);
  const [topNState, setTopNState] = useState<number>(topN);
  const [selectedBankType, setSelectedBankType] = useState<string>('');

  // Get year range and default from months
  const { years, defaultYearRange } = useYearRangeData(months);
  const [yearRange, setYearRange] = useState<[number, number]>(defaultYearRange);
  useEffect(() => { setYearRange(defaultYearRange); }, [defaultYearRange]);

  // Filter months by year range
  const sortedMonths = useMemo(() => [...months].sort(), [months]);
  const filteredMonths = useMemo(() => {
    return sortedMonths.filter(m => {
      const y = Number(m.slice(0, 4));
      return y >= yearRange[0] && y <= yearRange[1];
    });
  }, [sortedMonths, yearRange]);

  // Prepare time series for each bank (filtered by year range and bank type)
  const bankSeries = useMemo(() => {
    const bankMap = new Map<string, { name: string; values: number[] }>();
    filteredMonths.forEach((month, mi) => {
      let monthData = allData[month] || [];
      if (selectedBankType) {
        monthData = monthData.filter(row => row.Bank_Type === selectedBankType);
      }
      monthData.forEach(row => {
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
          bankMap.set(bank, { name: bank, values: Array(filteredMonths.length).fill(0) });
        }
        bankMap.get(bank)!.values[mi] = value;
      });
    });
    return Array.from(bankMap.values());
  }, [allData, filteredMonths, selectedMetric, selectedBankType]);

  // Compute total sum for each bank over filtered period and get top N banks by sum
  const topBanks = useMemo(() => {
    return [...bankSeries]
      .map(b => ({ ...b, total: b.values.reduce((sum, v) => sum + v, 0) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, topNState);
  }, [bankSeries, topNState]);


  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => value.toLocaleString('en-IN')
    },
    legend: { x: 'right', y: 'top' },
    toolbox: { feature: { saveAsImage: {} } },
    xAxis: {
      type: 'category',
      data: filteredMonths,
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      name: 'Transaction Volume',
    },
    series: topBanks.map(bank => ({
      name: bank.name,
      type: 'line',
      data: bank.values
    })),
  }), [topBanks, filteredMonths]);

  return (
    <div className="flex flex-col gap-4 justify-between h-full">
      <div className="text-lg text-center font-semibold">
        Number of {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Card Transactions of Top {topNState} Banks
      </div>
      <div className="grid gap-2">
        <Pills
          bankTypes={BANK_TYPES}
          selected={selectedBankType}
          onSelect={setSelectedBankType}
        />
        <div className="flex w-full items-center justify-between gap-6 mb-2">
          <TopNInput
            value={topNState}
            min={1}
            max={bankSeries.length}
            onChange={setTopNState}
            label="banks"
          />
          <RangeSlider
            min={years[0]}
            max={years[years.length - 1]}
            value={yearRange}
            onChange={setYearRange}
            step={1}
          />
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
      </div>
      <EChartsContainer
        option={option}
        className="w-full h-[400px] rounded-xl"
        onInit={instance => { if (chartRef) chartRef.current = instance; }}
      />
    </div >
  );
};

export default TopMoversLineChart;
