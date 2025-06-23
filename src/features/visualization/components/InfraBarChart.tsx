import React from 'react';
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

interface ATMData {
  Bank_Type: string;
  Bank_Name: string;
  Bank_Short_Name: string;
  Infrastructure: {
    ATMs_CRMs: {
      On_site: number;
      Off_site: number;
    };
    PoS: number;
    Micro_ATMs: number;
    Bharat_QR_Codes: number;
    UPI_QR_Codes: number;
    Credit_Cards: number;
    Debit_Cards: number;
  };
}

interface BankInfraBarChartProps {
  data: ATMData[];
}

const INFRA_METRICS = [
  { label: 'On-site ATMs', value: 'ATMs_CRMs.On_site' },
  { label: 'Off-site ATMs', value: 'ATMs_CRMs.Off_site' },
  { label: 'PoS Terminals', value: 'PoS' },
  { label: 'Micro ATMs', value: 'Micro_ATMs' },
  { label: 'Bharat QR Codes', value: 'Bharat_QR_Codes' },
  { label: 'UPI QR Codes', value: 'UPI_QR_Codes' },
  { label: 'Credit Cards', value: 'Credit_Cards' },
  { label: 'Debit Cards', value: 'Debit_Cards' },
];

const BankInfraBarChart: React.FC<BankInfraBarChartProps> = ({ data }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [topN, setTopN] = React.useState(10);
  const [metric, setMetric] = React.useState(INFRA_METRICS[0].value);

  const getMetricValue = (infra: ATMData['Infrastructure'], metricPath: string): number => {
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

  const sortedData = React.useMemo(() => {
    return [...data]
      .sort((a, b) => {
        const aVal = getMetricValue(a.Infrastructure, metric);
        const bVal = getMetricValue(b.Infrastructure, metric);
        return bVal - aVal;
      })
      .slice(0, topN);
  }, [data, topN, metric]);


  React.useEffect(() => {
    if (!chartRef.current) return;
    echarts.use([
      TooltipComponent,
      GridComponent,
      LegendComponent,
      ToolboxComponent,
      MarkLineComponent,
      BarChart,
      CanvasRenderer,
    ]);
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
    <div className="min-w-100">
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
  );
};

export default BankInfraBarChart;
