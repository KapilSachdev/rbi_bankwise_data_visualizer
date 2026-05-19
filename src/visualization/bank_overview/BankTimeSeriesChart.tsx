import type { EChartsType } from 'echarts/core';
import { FC, useMemo, useRef } from 'react';
import EChartsContainer from '../../components/common/EChartsContainer';
import type { BankData } from '../../types/global.types';
import PeriodPresets, { usePeriodRange } from '../../components/filters/PeriodPresets';

interface BankTimeSeriesChartProps {
  bankData: BankData[];
  months: string[];
  metrics: Array<keyof BankData['Infrastructure']>;
  bankName: string;
  digitalBankingData?: {
    [month: string]: {
      NEFT?: unknown[];
      RTGS?: unknown[];
      Mobile_Banking?: unknown[];
      Internet_Banking?: unknown[];
    };
  };
}
const BankTimeSeriesChart: FC<BankTimeSeriesChartProps> = ({ bankName, bankData, months, metrics }) => {
  const chartInstanceRef = useRef<EChartsType | null>(null);
  const {
    selectedPreset,
    setSelectedPreset,
    monthRange,
    setMonthRange,
    filteredMonths,
  } = usePeriodRange(months, '1Y');

  const handlePresetRangeChange = (range: [string, string]) => setMonthRange(range);
  const handlePresetSelect = (preset: string) => setSelectedPreset(preset);
  // derive filtered bankData by matching months to the hook's filteredMonths
  const filteredBankData = useMemo(() => {
    const set = new Set(filteredMonths);
    const out: BankData[] = [];
    for (let i = 0; i < months.length; i++) {
      if (set.has(months[i])) out.push(bankData[i]);
    }
    return out;
  }, [months, bankData, filteredMonths]);

  const chartOption = useMemo(() => {
    const series = metrics.map((metric) => ({
      name: metric.replace(/_/g, ' '),
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: filteredBankData.map(d => d?.Infrastructure?.[metric] ?? null),
    }));
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
      legend: { top: 10, textStyle: { fontWeight: 600 } },
      grid: { left: 40, right: 20, top: 50, bottom: 40 },
      xAxis: {
        type: 'category',
        data: filteredMonths,
        axisLabel: { rotate: 45, fontWeight: 500 }
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontWeight: 500 }
      },
      series
    };
  }, [filteredBankData, metrics, filteredMonths]);
  return (
    <div className="card bg-base-100 shadow border-base-300 mb-8">
      <div className="card-body">
        <div className="flex items-center justify-between mb-2">
          <h3 className="card-title text-xl font-bold">{bankName} - Monthly Trends</h3>
          <PeriodPresets
            months={months}
            selectedPreset={selectedPreset}
            onRangeChange={handlePresetRangeChange}
            onPresetChange={handlePresetSelect}
          />
        </div>
        <EChartsContainer
          option={chartOption}
          className='w-full h-[400px]'
          aria-label={`${bankName} - Monthly trends for ${metrics.map(m => m.replace(/_/g, ' ')).join(', ')}`}
          role='img'
          tabIndex={0}
          onInit={instance => { chartInstanceRef.current = instance; }}
        />
      </div>
    </div>
  );
};

export default BankTimeSeriesChart;
