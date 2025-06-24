
import { useEffect, useMemo, useRef, useState } from 'react';
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
import DataFilter from '../../../components/common/DataFilter';
import type { BankData } from '../../../types/global.types';
import { formatMonthYear } from '../../../utils/time'

// Register ECharts components once at the module level
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
  allData: { [key: string]: BankData[] };
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
  const [topN, setTopN] = useState(5);
  const [metric, setMetric] = useState(INFRA_METRICS[0].value);
  const [selectedMonth, setSelectedMonth] = useState(() => months[0]);

  useEffect(() => {
    setSelectedMonth(months[0]);
  }, [months]);
  const [selectedBankType, setSelectedBankType] = useState('');


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


  useEffect(() => {
    if (!chartRef.current || !sortedData.length) return;
    const chart = echarts.init(chartRef.current, 'dark');
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          const idx = params[0].dataIndex;
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
          color: '#e5e7eb',
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#e5e7eb',
          fontSize: 12,
        },
      },
      series: [
        {
          type: 'bar',
          name: INFRA_METRICS.find(m => m.value === metric)?.label || '',
          data: sortedData.map(item => getMetricValue(item.Infrastructure, metric)),
          emphasis: { focus: 'series' },
          itemStyle: { color: '#38bdf8' },
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
    };
    chart.setOption(option);
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      chart.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [sortedData, metric]);

  return (
    <div className="p-2">
      <h2 className='p-2'>Bank {selectedMonth && formatMonthYear(selectedMonth)} POS Assets</h2>
      <div className="min-w-100">
        <DataFilter
          bankTypes={bankTypes}
          selectedBankType={selectedBankType}
          onBankTypeChange={setSelectedBankType}
          filters={{ bankType: true }}
        />
        <div className="flex items-center gap-2 mb-2">
          <label htmlFor="infra-metric" className="text-sm">Metric</label>
          <select
            id="infra-metric"
            className="px-2 py-1 rounded bg-gray-800 text-gray-100 focus:ring-2 focus:ring-sky-400"
            value={metric}
            onChange={e => setMetric(e.target.value)}
          >
            {INFRA_METRICS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <label htmlFor="topN" className="text-sm ml-4">Show top</label>
          <input
            id="topN"
            type="number"
            min={1}
            max={data.length}
            value={topN}
            onChange={e => setTopN(Math.max(1, Math.min(data.length, Number(e.target.value))))}
            className="w-16 px-1 py-1 rounded bg-gray-800 text-gray-100 border border-gray-700 ml-1"
          />
          <span className="text-sm text-gray-400">banks</span>
        </div>
        <div
          ref={chartRef}
          style={{ width: '100%', height: '400px' }}
          aria-label="Bank Infrastructure Bar Chart"
          role="img"
          tabIndex={0}
          className="outline-none focus:ring-2 focus:ring-sky-400 rounded"
        />
      </div>
    </div>
  );
};

export default BankInfraBarChart;
