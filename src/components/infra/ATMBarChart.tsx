import React from 'react';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TooltipComponentOption,
  GraphicComponent,
  GraphicComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption,
  MarkLineComponent,
  MarkLineComponentOption,
  ToolboxComponent
} from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { ToolboxComponentOption } from 'echarts';

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


interface ATMBarChartProps {
  data: ATMData[];
}

const ATMBarChart: React.FC<ATMBarChartProps> = ({ data }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [topN, setTopN] = React.useState(5);

  // Memoize sorted and sliced data for top N
  const sortedData = React.useMemo(() => {
    return [...data]
      .sort((a, b) => {
        const aTotal = a.Infrastructure.ATMs_CRMs.On_site + a.Infrastructure.ATMs_CRMs.Off_site;
        const bTotal = b.Infrastructure.ATMs_CRMs.On_site + b.Infrastructure.ATMs_CRMs.Off_site;
        return bTotal - aTotal;
      })
      .slice(0, topN);
  }, [data, topN]);

  React.useEffect(() => {
    if (chartRef.current) {
      echarts.use([
        TooltipComponent,
        ToolboxComponent,
        GraphicComponent,
        GridComponent,
        LegendComponent,
        MarkLineComponent,
        BarChart,
        CanvasRenderer
      ]);
      const chartInstance = echarts.init(chartRef.current, 'dark');

      const option: echarts.ComposeOption<
        | TooltipComponentOption
        | ToolboxComponentOption
        | GraphicComponentOption
        | GridComponentOption
        | LegendComponentOption
        | MarkLineComponentOption
        | BarSeriesOption> = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
          formatter: (params: any) => {
            // params is an array of series data for the hovered category
            if (!Array.isArray(params) || params.length === 0) return '';
            const idx = params[0].dataIndex;
            const bank = sortedData[idx];
            const onSite = bank.Infrastructure.ATMs_CRMs.On_site;
            const offSite = bank.Infrastructure.ATMs_CRMs.Off_site;
            const total = onSite + offSite;
            return `
              <div>
                <div class="font-semibold text-base mb-1">${bank.Bank_Name}</div>
                <div><span class="font-medium">On-site ATMs:</span> ${onSite.toLocaleString()}</div>
                <div><span class="font-medium">Off-site ATMs:</span> ${offSite.toLocaleString()}</div>
                <div class="mt-1 font-bold">Total ATMs: ${total.toLocaleString()}</div>
              </div>
            `;
          },
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        legend: {
          data: ['On-site ATMs', 'Off-site ATMs']
        },
        xAxis: {
          type: 'category',
          data: sortedData.map(item => item.Bank_Short_Name),
          axisLabel: {
            interval: 0, // Show all labels
            rotate: 30, // Rotate for readability
            color: '#e5e7eb', // Tailwind gray-200
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
            stack: 'total',
            name: 'On-site ATMs',
            data: sortedData.map(item => item.Infrastructure.ATMs_CRMs.On_site),
            emphasis: { focus: 'series' },
            itemStyle: { color: '#38bdf8' }, // Tailwind sky-400
          },
          {
            type: 'bar',
            stack: 'total',
            name: 'Off-site ATMs',
            data: sortedData.map(item => item.Infrastructure.ATMs_CRMs.Off_site),
            emphasis: { focus: 'series' },
            itemStyle: { color: '#fbbf24' }, // Tailwind amber-400
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

      chartInstance.setOption(option);

      return () => {
        chartInstance.dispose();
      };
    }
  }, [sortedData]);

  return (
    <div className="min-w-100">
      <h2 className="text-lg font-semibold mb-2">ATM/CRM Overview</h2>
      <div className="flex items-center gap-2 mb-2">
        <label htmlFor="topN" className="text-sm">Show top</label>
        <input
          id="topN"
          type="number"
          min={1}
          max={data.length}
          value={topN}
          onChange={e => setTopN(Math.max(1, Math.min(data.length, Number(e.target.value))))}
          className=""
        />
        <span className="text-sm text-gray-400">banks by total ATMs</span>
      </div>
      <div
        ref={chartRef}
        style={{ width: '100%', height: '400px' }}
        aria-label="ATM/CRM Bar Chart"
        role="img"
        tabIndex={0}
        className="outline-none focus:ring-2 focus:ring-sky-400 rounded"
      />
    </div>
  );
};

export default ATMBarChart;


