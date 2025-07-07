
import { BarChart } from 'echarts/charts';
import { GridComponent, LegendComponent, MarkLineComponent, ToolboxComponent, TooltipComponent, } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { FC, useMemo, useState } from 'react';
import EChartsContainer from '../../../components/common/EChartsContainer';
import Pills from '../../../components/filters/Pills';
import TopNInput from '../../../components/filters/TopNInput';
import { BANK_TYPES } from '../../../constants/data';
import type { BankData } from '../../../types/global.types';
import { formatMonthYear } from '../../../utils/time';

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
  chartRef?: { current: echarts.EChartsType | null };
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


const BankInfraBarChart: FC<BankInfraBarChartProps> = ({ allData, months, chartRef }) => {

  const [topN, setTopN] = useState(5);
  const [metric, setMetric] = useState(INFRA_METRICS[0].value);
  // Always use the first month in months as selectedMonth, fallback to '' if empty
  const [selectedMonth, setSelectedMonth] = useState<string>(months[0] || '');
  const [selectedBankType, setSelectedBankType] = useState<string>('');

  // Keep selectedMonth in sync with months[0] if months changes
  if (months[0] && selectedMonth !== months[0]) {
    setSelectedMonth(months[0]);
  }

  // Get all unique bank types
  const bankTypes = BANK_TYPES

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

  const option = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: number) => value.toLocaleString('en-IN')
    },
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
  }), [sortedData, metric, selectedMonth]);

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="text-lg text-center font-semibold">
        {INFRA_METRICS.find(m => m.value === metric)?.label || ''} - {selectedMonth && formatMonthYear(selectedMonth)}
      </div>
      <div className="grid gap-2">
        <Pills
          bankTypes={bankTypes}
          selected={selectedBankType}
          onSelect={setSelectedBankType}
        />
        <div className="flex justify-stretch justify-items-stretch gap-4 mb-2 w-full">
          <div className="flex flex-col text-xs font-medium text-base-content self-end">
            <TopNInput
              value={topN}
              min={1}
              max={data.length}
              onChange={setTopN}
              label="banks"
              className="mt-1"
            />
          </div>
          <div className="flex flex-col text-xs font-medium text-base-content ml-auto">
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
        </div>
      </div>

      <EChartsContainer
        option={option}
        className="w-full h-[400px]"
        aria-label="Bank Infrastructure Bar Chart"
        role="img"
        tabIndex={0}
        onInit={instance => { if (chartRef) chartRef.current = instance; }}
      />
    </div>
  );
};

export default BankInfraBarChart;
