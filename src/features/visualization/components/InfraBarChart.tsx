
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  MarkLineComponent,
} from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import Pills from '../../../components/filters/Pills';
import { useEchartsThemeSync } from '../../../hooks/useEchartsThemeSync';
import type { BankData } from '../../../types/global.types';
import { formatMonthYear } from '../../../utils/time'

echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  ToolboxComponent,
  MarkLineComponent,
  BarChart,
  CanvasRenderer,
]);


interface BankInfraBarChartProps {
  allData: Record<string, BankData[]>;
  months: string[];
}

const INFRA_METRICS = [
  { label: 'Credit Cards', value: 'Credit_Cards' },
  { label: 'Debit Cards', value: 'Debit_Cards' },
  { label: 'Micro ATMs', value: 'Micro_ATMs' },
  { label: 'Off-site ATMs', value: 'ATMs_CRMs.Off_site' },
  { label: 'On-site ATMs', value: 'ATMs_CRMs.On_site' },
  { label: 'PoS Terminals', value: 'PoS' },
  { label: 'Bharat QR Codes', value: 'Bharat_QR_Codes' },
  { label: 'UPI QR Codes', value: 'UPI_QR_Codes' },
];


const BankInfraBarChart: React.FC<BankInfraBarChartProps> = ({ allData, months }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const [topN, setTopN] = useState(10);
  const [metric, setMetric] = useState(INFRA_METRICS[0].value);
  const [selectedMonth, setSelectedMonth] = useState(() => months[0]);

  useEffect(() => {
    setSelectedMonth(months[0]);
  }, [months]);
  const [selectedBankType, setSelectedBankType] = useState<string>('');


  // Get all unique bank types
  const bankTypes = useMemo(() => {
    const all = months.flatMap(m => allData[m] || []);
    return Array.from(new Set(all.map(d => d.Bank_Type)));
  }, [allData, months]);

  // Filtered data for chart
  const data = useMemo(() => {
    if (!selectedMonth || !allData[selectedMonth]) return [];
    let d = allData[selectedMonth] || [];
    if (selectedBankType) d = d.filter(b => b.Bank_Type === selectedBankType);
    return d;
  }, [allData, selectedMonth, selectedBankType]);

  const getMetricValue = (infra: BankData['Infrastructure'], metricPath: string): number => {
    const [main, sub] = metricPath.split('.');
    if (sub) {
      if (main === 'ATMs_CRMs' && (sub === 'On_site' || sub === 'Off_site')) {
        return infra.ATMs_CRMs[sub as 'On_site' | 'Off_site'];
      }
      return 0;
    }
    switch (main) {
      case 'PoS':
        return infra.PoS;
      case 'Micro_ATMs':
        return infra.Micro_ATMs;
      case 'Bharat_QR_Codes':
        return infra.Bharat_QR_Codes;
      case 'UPI_QR_Codes':
        return infra.UPI_QR_Codes;
      case 'Credit_Cards':
        return infra.Credit_Cards;
      case 'Debit_Cards':
        return infra.Debit_Cards;
      default:
        return 0;
    }
  };

  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data]
      .sort((a, b) => {
        const aVal = getMetricValue(a.Infrastructure, metric);
        const bVal = getMetricValue(b.Infrastructure, metric);
        return bVal - aVal;
      })
      .slice(0, topN);
  }, [data, topN, metric]);



  useEchartsThemeSync(
    chartRef,
    () => ({
      backgroundColor: 'transparent',
      title: {
        text: `${INFRA_METRICS.find(m => m.value === metric)?.label || ''} (${selectedMonth && formatMonthYear(selectedMonth)})`,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: unknown) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const idx = (params[0] as { dataIndex: number }).dataIndex;
          const bank = sortedData[idx];
          const val = getMetricValue(bank.Infrastructure, metric);
          return `
            <div>
              <div class="font-semibold text-base mb-1">${bank.Bank_Name}</div>
              <div><span class="font-medium">${INFRA_METRICS.find(m => m.value === metric)?.label}:</span> ${val.toLocaleString()}</div>
            </div>
          `;
        },
      },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      legend: { show: false },
      xAxis: {
        type: 'category',
        data: sortedData.map(item => item.Bank_Short_Name),
        axisLabel: {
          interval: 0,
          rotate: 30,
        },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          type: 'bar',
          name: INFRA_METRICS.find(m => m.value === metric)?.label || '',
          data: sortedData.map(item => getMetricValue(item.Infrastructure, metric)),
          emphasis: { focus: 'series' },
        },
      ],
      toolbox: {
        feature: {
          saveAsImage: { title: 'Save' },
          dataView: { readOnly: true },
          restore: {},
        },
        right: 10,
        top: 10,
      },
    }),
    [sortedData, metric, selectedMonth]
  );

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="grid gap-2">
        <Pills
          bankTypes={bankTypes}
          selected={selectedBankType}
          onSelect={(type: string) => setSelectedBankType(type)}
        />
        <div className="flex justify-stretch justify-items-stretch gap-4 mb-2 w-full">
          <div className="flex flex-col text-xs font-medium text-base-content min-w-[8rem]">
            <span>Metric</span>
            <div className="dropdown mt-1">
              <button
                popoverTarget="metric-dropdown"
                className="btn btn-sm btn-outline w-full justify-between text-base-content"
                type="button"
                aria-haspopup="listbox"
                aria-expanded="false"
              >
                {INFRA_METRICS.find(opt => opt.value === metric)?.label || 'Select Metric'}
              </button>
              <ul
                className="dropdown-content menu menu-sm p-0 shadow bg-base-100 rounded-box w-full z-10"
                popover="auto"
                id="metric-dropdown"
                role="listbox"
              >
                {INFRA_METRICS.map(opt => (
                  <li key={opt.value}>
                    <button
                      className={`w-full text-left px-4 py-2 ${metric === opt.value ? 'bg-primary text-primary-content' : 'text-base-content'}`}
                      onClick={() => setMetric(opt.value)}
                      role="option"
                      aria-selected={metric === opt.value}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col text-xs font-medium text-base-content min-w-[8rem] self-end ml-auto">
            <div className="join mt-1">
              <input
                id="topN"
                type="number"
                min={1}
                max={data.length}
                value={topN}
                onChange={e => setTopN(Math.max(1, Math.min(data.length, Number(e.target.value))))}
                className="input input-sm input-bordered w-16 join-item text-base-content"
                aria-label="Show top N banks"
              />
              <span className="join-item flex items-center px-2 text-sm bg-base-200 text-base-content">banks</span>
            </div>
          </div>
        </div>
      </div>

      <div
        ref={chartRef}
        aria-label="Bank Infrastructure Bar Chart"
        role="img"
        tabIndex={0}
        className="w-full h-[400px]"
      />
    </div>
  );
};

export default BankInfraBarChart;
