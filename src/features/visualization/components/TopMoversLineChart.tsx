import { LineChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { FC, useMemo, useState } from 'react';
import EChartsContainer from '../../../components/common/EChartsContainer';
import Doughnut from '../../../components/filters/Doughnut';
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
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      valueFormatter: (value: number) => value.toLocaleString('en-IN')
    },
    legend: { x: 'right', y: 'top' },
    toolbox: { feature: { saveAsImage: {} } },
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
      data: bank.values
    })),
  }), [topBanks, sortedMonths, selectedMetric, topN]);

  return (
    <div className="w-full h-[480px]">
      <div className="text-lg text-center font-semibold">
        Number of {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Card Transactions of Top {topN} Banks
      </div>
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
        onInit={instance => { if (chartRef) chartRef.current = instance; }}
      />
    </div>
  );
};

export default TopMoversLineChart;
