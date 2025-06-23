import React from 'react';
import * as echarts from 'echarts/core';
import {
  TooltipComponent,
  TooltipComponentOption,
  GridComponent,
  GridComponentOption,
  LegendComponent,
  LegendComponentOption
} from 'echarts/components';
import { BarChart, BarSeriesOption } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';

interface CardInfraData {
  Bank_Type: string;
  Bank_Name: string;
  Bank_Short_Name: string;
  Infrastructure: {
    Credit_Cards: number;
    Debit_Cards: number;
  };
}

interface CardInfraBarChartProps {
  data: CardInfraData[];
}

const CardInfraBarChart: React.FC<CardInfraBarChartProps> = ({ data }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [topN, setTopN] = React.useState(5);

  const sortedData = React.useMemo(() => {
    return [...data]
      .sort((a, b) => {
        const aTotal = a.Infrastructure.Credit_Cards + a.Infrastructure.Debit_Cards;
        const bTotal = b.Infrastructure.Credit_Cards + b.Infrastructure.Debit_Cards;
        return bTotal - aTotal;
      })
      .slice(0, topN);
  }, [data, topN]);

  React.useEffect(() => {
    if (chartRef.current) {
      echarts.use([
        TooltipComponent,
        GridComponent,
        LegendComponent,
        BarChart,
        CanvasRenderer
      ]);
      const chartInstance = echarts.init(chartRef.current, 'dark');

      const option: echarts.ComposeOption<
        | TooltipComponentOption
        | GridComponentOption
        | LegendComponentOption
        | BarSeriesOption> = {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            if (!Array.isArray(params) || params.length === 0) return '';
            const idx = params[0].dataIndex;
            const bank = sortedData[idx];
            const credit = bank.Infrastructure.Credit_Cards;
            const debit = bank.Infrastructure.Debit_Cards;
            const total = credit + debit;
            return `
              <div>
                <div class="font-semibold text-base mb-1">${bank.Bank_Name}</div>
                <div><span class="font-medium">Credit Cards:</span> ${credit.toLocaleString()}</div>
                <div><span class="font-medium">Debit Cards:</span> ${debit.toLocaleString()}</div>
                <div class="mt-1 font-bold">Total Cards: ${total.toLocaleString()}</div>
              </div>
            `;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        legend: {
          data: ['Credit Cards', 'Debit Cards']
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
            name: 'Debit Cards',
            data: sortedData.map(item => item.Infrastructure.Debit_Cards),
            emphasis: { focus: 'series' },
            itemStyle: { color: '#38bdf8' }, // Tailwind sky-400
          },
          {
            type: 'bar',
            stack: 'total',
            name: 'Credit Cards',
            data: sortedData.map(item => item.Infrastructure.Credit_Cards),
            emphasis: { focus: 'series' },
            itemStyle: { color: '#fbbf24' }, // Tailwind amber-400
          }
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
      <h2 className="text-lg font-semibold mb-2">Card Overview</h2>
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
        aria-label="Card Infra Bar Chart"
        role="img"
        tabIndex={0}
        className="outline-none focus:ring-2 focus:ring-amber-400 rounded"
      />
    </div>
  );
};

export default CardInfraBarChart;
