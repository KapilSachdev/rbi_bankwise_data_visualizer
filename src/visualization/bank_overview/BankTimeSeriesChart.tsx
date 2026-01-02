import type { EChartsType } from 'echarts/core';
import { FC, useMemo, useRef } from 'react';
import EChartsContainer from '../../components/common/EChartsContainer';
import type { BankData } from '../../types/global.types';

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
  const chartOption = useMemo(() => {
    const series = metrics.map((metric) => ({
      name: metric.replace(/_/g, ' '),
      type: 'line',
      smooth: true,
      showSymbol: false,
      data: bankData.map(d => d.Infrastructure?.[metric] ?? null),
    }));
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
      legend: { top: 10, textStyle: { fontWeight: 600 } },
      grid: { left: 40, right: 20, top: 50, bottom: 40 },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: { rotate: 45, fontWeight: 500 }
      },
      yAxis: {
        type: 'value',
        axisLabel: { fontWeight: 500 }
      },
      series
    };
  }, [bankData, metrics, months]);
  return (
    <div className="card bg-base-100 shadow border-base-300 mb-8">
      <div className="card-body">
        <h3 className="card-title text-xl font-bold mb-2">{bankName} - Monthly Trends</h3>
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
