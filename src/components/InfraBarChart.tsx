import React, { useEffect, useRef } from 'react';
import { DATA_FOLDER } from '../constants/data';
import * as echarts from 'echarts';

const infraMetrics = [
  'PoS',
  'Micro ATMs',
  'Bharat QR Codes',
  'UPI QR Codes',
  'Credit Cards',
  'Debit Cards',
];

const InfraBarChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    fetch(DATA_FOLDER + 'rbi_bankwise_04_2025.json')
      .then(res => res.json())
      .then((data) => {
        // Top 10 banks by PoS (or any metric)
          // Calculate total sum of all infra metrics for each bank
          const withTotal = data.map((d: any) => {
            const infra = d.Infrastructure?.['Number - Outstanding (as on month end)'] || {};
            const total = infraMetrics.reduce((sum, metric) => sum + (infra[metric] ?? 0), 0);
            return { ...d, _total: total };
          });
          withTotal.sort((a: any, b: any) => b._total - a._total);
          const top10 = withTotal.slice(0, 10);
          const others = withTotal.slice(10);
          // Prepare xAxis labels
          const banks = top10.map((d: any) => d['Bank Name']);
          if (others.length > 0) banks.push('Others');
          // Prepare series data for each metric
          const series = infraMetrics.map(metric => {
            // Top 10 values
            const top10Vals = top10.map((d: any) => d.Infrastructure?.['Number - Outstanding (as on month end)']?.[metric] ?? 0);
            // Others summed
            const othersVal = others.reduce((sum: number, d: any) => sum + (d.Infrastructure?.['Number - Outstanding (as on month end)']?.[metric] ?? 0), 0);
            const dataArr = others.length > 0 ? [...top10Vals, othersVal] : top10Vals;
            return {
              name: metric,
              type: 'bar',
              stack: 'infra',
              emphasis: { focus: 'series' },
              data: dataArr,
            };
          });
        chart.setOption({
          title: {
            text: 'Bank Infrastructure Metrics',
            left: 'center',
            textStyle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
          },
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          legend: {
            data: infraMetrics,
            top: 30,
            textStyle: { color: '#fff' },
          },
          grid: { left: 80, right: 40, bottom: 80, top: 80 },
          xAxis: {
            type: 'category',
            data: banks,
            axisLabel: { rotate: 45, fontSize: 10, color: '#fff' },
          },
          yAxis: {
            type: 'value',
            axisLabel: { color: '#fff' },
          },
          series,
          backgroundColor: 'transparent',
        });
      });
    return () => chart.dispose();
  }, []);

  return (
    <div className="w-full bg-white/5 rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-center text-blue-200 mb-2">Bank Infrastructure Comparison</h2>
      <div ref={chartRef} className="w-full h-96 bg-transparent" />
    </div>
  );
};

export default InfraBarChart;
