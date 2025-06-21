import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const CardTransactionLeaderboard: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);
    fetch('/data/rbi_bankwise_04_2025.json')
      .then(res => res.json())
      .then((data) => {
        // Calculate total card transaction value (credit + debit, all channels)
        const banks = data.map((d: any) => {
          const credit = d['Card Payments and Cash Withdrawal Transactions during the month']?.['Credit Card']?.['Card Payments Transactions'] || {};
          const debit = d['Card Payments and Cash Withdrawal Transactions during the month']?.['Debit Card']?.['Card Payments Transactions'] || {};
          const creditTotal = ['at PoS', 'Online (e-com)', 'Others'].reduce((sum, key) => sum + (credit[key]?.['Value (in Rs\'000)'] ?? 0), 0);
          const debitTotal = ['at PoS', 'Online (e-com)', 'Others'].reduce((sum, key) => sum + (debit[key]?.['Value (in Rs\'000)'] ?? 0), 0);
          return {
            name: d['Bank Name'],
            value: creditTotal + debitTotal,
          };
        });
        banks.sort((a: { name: string; value: number }, b: { name: string; value: number }) => b.value - a.value);
        const top10 = banks.slice(0, 10);
        chart.setOption({
          title: {
            text: 'Top 10 Banks by Card Transaction Value',
            left: 'center',
            textStyle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
          },
          tooltip: { trigger: 'axis', formatter: (params: any) => `${params[0].name}: ₹${params[0].value.toLocaleString()}k` },
          grid: { left: 120, right: 40, bottom: 40, top: 80 },
          xAxis: {
            type: 'value',
            axisLabel: { color: '#fff', formatter: (v: number) => `₹${v/1000}L` },
          },
          yAxis: {
            type: 'category',
            data: top10.map((b: { name: string; value: number }) => b.name),
            axisLabel: { color: '#fff', fontWeight: 'bold' },
          },
          series: [{
            name: 'Card Txn Value',
            type: 'bar',
            data: top10.map((b: { name: string; value: number }) => b.value),
            itemStyle: {
              color: '#60a5fa',
              borderRadius: [0, 8, 8, 0],
              shadowBlur: 10,
              shadowColor: 'rgba(0,0,0,0.2)'
            },
            label: {
              show: true,
              position: 'right',
              color: '#fff',
              formatter: (params: any) => `₹${params.value.toLocaleString()}k`
            }
          }],
          backgroundColor: 'transparent',
        });
      });
    return () => chart.dispose();
  }, []);

  return (
    <div className="w-full bg-white/5 rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold text-center text-blue-200 mb-2">Card Transaction Value Leaderboard</h2>
      <div ref={chartRef} className="w-full h-96 bg-transparent" />
    </div>
  );
};

export default CardTransactionLeaderboard;
