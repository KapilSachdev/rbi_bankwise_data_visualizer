import type { EChartsType } from 'echarts/core';
import type { EChartsCoreOption } from 'echarts/core';
import { FC, useMemo, useRef } from 'react';
import EChartsContainer from '../../components/common/EChartsContainer';
import PeriodPresets, { usePeriodRange } from '../../components/filters/PeriodPresets';
import type { BankData, BankTimeSeriesChartProps } from '../../types/global.types';

const DigitalizationIndexChart: FC<BankTimeSeriesChartProps> = ({ bankData, months, bankName }) => {
  const chartRef = useRef<EChartsType | null>(null);
  const { selectedPreset, setSelectedPreset, monthRange, setMonthRange, filteredMonths } = usePeriodRange(months, '5Y');

  const filteredBankData = useMemo(() => {
    const set = new Set(filteredMonths);
    const out: BankData[] = [];
    for (let i = 0; i < months.length; i++) {
      if (set.has(months[i])) out.push(bankData[i]);
    }
    return out;
  }, [months, bankData, filteredMonths]);

  const { creditDigitalSeries, debitDigitalSeries } = useMemo(() => {
    const credit: number[] = [];
    const debit: number[] = [];

    for (const d of filteredBankData) {
      const creditCard = d?.Card_Payments_Transactions?.Credit_Card;
      const debitCard = d?.Card_Payments_Transactions?.Debit_Card;

      const creditDigital = (creditCard?.at_PoS?.Volume ?? 0) + (creditCard?.Online_ecom?.Volume ?? 0) + (creditCard?.Others?.Volume ?? 0);
      const creditCash = (creditCard?.Cash_Withdrawal?.At_ATM?.Volume ?? 0) + (creditCard?.Cash_Withdrawal?.At_PoS?.Volume ?? 0);
      const creditTotal = creditDigital + creditCash;

      const debitDigital = (debitCard?.at_PoS?.Volume ?? 0) + (debitCard?.Online_ecom?.Volume ?? 0) + (debitCard?.Others?.Volume ?? 0);
      const debitCash = (debitCard?.Cash_Withdrawal?.At_ATM?.Volume ?? 0) + (debitCard?.Cash_Withdrawal?.At_PoS?.Volume ?? 0);
      const debitTotal = debitDigital + debitCash;

      // We push absolute digital volumes for stacking. If totals are zero, push 0.
      credit.push(creditTotal > 0 ? creditDigital : 0);
      debit.push(debitTotal > 0 ? debitDigital : 0);
    }

    return { creditDigitalSeries: credit, debitDigitalSeries: debit };
  }, [filteredBankData]);

  const chartOption: EChartsCoreOption = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis', axisPointer: { type: 'line' } },
      legend: { top: 10, textStyle: { fontWeight: 600 } },
      grid: { left: 40, right: 20, top: 60, bottom: 40 },
      xAxis: { type: 'category', data: filteredMonths, axisLabel: { rotate: 45, fontWeight: 500 } },
      yAxis: { type: 'value', axisLabel: { fontWeight: 500 } },
      series: [
        {
          name: 'Credit Card',
          type: 'line',
          smooth: true,
          stack: 'digital',
          areaStyle: {},
          showSymbol: false,
          data: creditDigitalSeries,
        },
        {
          name: 'Debit Card',
          type: 'line',
          smooth: true,
          stack: 'digital',
          areaStyle: {},
          showSymbol: false,
          data: debitDigitalSeries,
        },
      ],
    };
  }, [creditDigitalSeries, debitDigitalSeries, filteredMonths]);

  const handlePresetRangeChange = (range: [string, string]) => setMonthRange(range);
  const handlePresetSelect = (preset: string) => setSelectedPreset(preset);

  return (
    <div className="flex-1 card bg-base-100 shadow border-base-300 mb-8">
      <div className="card-body">
        <div className="flex flex-col gap-4 items-center justify-between mb-2">
          <h3 className="card-title text-xl font-bold">Card Volume Movement</h3>
          <PeriodPresets
            months={months}
            selectedPreset={selectedPreset}
            onRangeChange={handlePresetRangeChange}
            onPresetChange={handlePresetSelect}
          />
        </div>
        <EChartsContainer
          option={chartOption}
          className="w-full h-[400px]"
          aria-label={`${bankName} - Card digitalization`}
          role="img"
          tabIndex={0}
          onInit={instance => { chartRef.current = instance; }}
        />
      </div>
    </div>
  );
};

export default DigitalizationIndexChart;
