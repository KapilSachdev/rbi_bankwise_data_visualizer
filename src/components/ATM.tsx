import React, { useEffect, useRef } from 'react';
import { DATA_FOLDER } from '../constants/data';
import * as echarts from 'echarts';


const ATMChart: React.FC = () => {
  const onsiteRef = useRef<HTMLDivElement>(null);
  const offsiteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let chartOnsite: echarts.ECharts | null = null;
    let chartOffsite: echarts.ECharts | null = null;
    let disposed = false;
    fetch(DATA_FOLDER + 'rbi_bankwise_04_2025.json')
      .then(res => res.json())
      .then(data => {
        if (disposed) return;
        // On-site
        type ChartDatum = { name: string; value: number };
        const rawOnsite: ChartDatum[] = data.map((d: any): ChartDatum => ({
          name: d['Bank Name'],
          value:
            d.Infrastructure?.['Number - Outstanding (as on month end)']?.['ATMs & CRMs']?.['On-site'] ?? 0
        })).filter((d: ChartDatum) => d.value > 0);
        rawOnsite.sort((a: ChartDatum, b: ChartDatum) => b.value - a.value);

        const onsiteTop = rawOnsite.slice(0, 10);
        const onsiteOthersValue = rawOnsite.slice(10).reduce((sum, d) => sum + d.value, 0);
        const onsiteData = onsiteOthersValue > 0 ? [...onsiteTop, { name: 'Others', value: onsiteOthersValue }] : onsiteTop;

        // Off-site
        const rawOffsite: ChartDatum[] = data.map((d: any): ChartDatum => ({
          name: d['Bank Name'],
          value:
            d.Infrastructure?.['Number - Outstanding (as on month end)']?.['ATMs & CRMs']?.['Off-site'] ?? 0
        })).filter((d: ChartDatum) => d.value > 0);
        rawOffsite.sort((a: ChartDatum, b: ChartDatum) => b.value - a.value);

        const offsiteTop = rawOffsite.slice(0, 10);
        const offsiteOthersValue = rawOffsite.slice(10).reduce((sum, d) => sum + d.value, 0);
        const offsiteData = offsiteOthersValue > 0 ? [...offsiteTop, { name: 'Others', value: offsiteOthersValue }] : offsiteTop;

        if (onsiteRef.current) {
          chartOnsite = echarts.init(onsiteRef.current);
          chartOnsite.setOption({
            title: {
              text: 'On-site ATMs Share',
              left: 'center',
              top: 20,
              textStyle: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
            },
            tooltip: {
              trigger: 'item',
              formatter: '{b}: {c} ({d}%)'
            },
            legend: { show: false },
            series: [
              {
                name: 'On-site ATMs',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['55%', '55%'],
                data: onsiteData,
                label: {
                  show: true,
                  color: '#fff',
                  formatter: '{b}\n{d}%'
                },
                labelLine: { length: 20, length2: 10, lineStyle: { color: '#fff' } },
                itemStyle: {
                  borderRadius: 8,
                  borderColor: '#222',
                  borderWidth: 2,
                  shadowBlur: 10,
                  shadowColor: 'rgba(0,0,0,0.3)'
                },
                emphasis: {
                  scale: true,
                  itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.5)' }
                }
              }
            ],
            backgroundColor: 'transparent',
          });
        }
        if (offsiteRef.current) {
          chartOffsite = echarts.init(offsiteRef.current);
          chartOffsite.setOption({
            title: {
              text: 'Off-site ATMs Share',
              left: 'center',
              top: 20,
              textStyle: { color: '#fff', fontSize: 20, fontWeight: 'bold' }
            },
            tooltip: {
              trigger: 'item',
              formatter: '{b}: {c} ({d}%)'
            },
            legend: { show: false },
            series: [
              {
                name: 'Off-site ATMs',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['55%', '55%'],
                data: offsiteData,
                label: {
                  show: true,
                  color: '#fff',
                  formatter: '{b}\n{d}%'
                },
                labelLine: { length: 20, length2: 10, lineStyle: { color: '#fff' } },
                itemStyle: {
                  borderRadius: 8,
                  borderColor: '#222',
                  borderWidth: 2,
                  shadowBlur: 10,
                  shadowColor: 'rgba(0,0,0,0.3)'
                },
                emphasis: {
                  scale: true,
                  itemStyle: { shadowBlur: 20, shadowColor: 'rgba(0,0,0,0.5)' }
                }
              }
            ],
            backgroundColor: 'transparent',
          });
        }
      });
    return () => {
      disposed = true;
      if (chartOnsite) chartOnsite.dispose();
      if (chartOffsite) chartOffsite.dispose();
    };
  }, []);

  return (
    <div className="w-full flex flex-col md:flex-row gap-8 justify-center items-start">
      <div className="flex-1 min-w-0 bg-white/5 rounded-lg shadow p-4 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-center text-blue-200 mb-2">On-site ATMs</h2>
        <div ref={onsiteRef} className="w-full h-80 bg-transparent" />
      </div>
      <div className="flex-1 min-w-0 bg-white/5 rounded-lg shadow p-4 flex flex-col items-center">
        <h2 className="text-lg font-semibold text-center text-blue-200 mb-2">Off-site ATMs</h2>
        <div ref={offsiteRef} className="w-full h-80 bg-transparent" />
      </div>
    </div>
  );
};

export default ATMChart;
