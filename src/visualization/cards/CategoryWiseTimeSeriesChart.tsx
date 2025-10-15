import { LineChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { FC, memo, useEffect, useMemo, useRef, useState } from 'react'; // Added useRef
import EChartsContainer from '../../components/common/EChartsContainer';
import Pills from '../../components/filters/Pills';
import RangeSlider from '../../components/filters/RangeSlider';
import TopNInput from '../../components/filters/TopNInput';
import { BANK_TYPES } from '../../constants/data';
import { useYearRangeData } from '../../hooks/useYearRangeData';
import type { BankData } from '../../types/global.types';

// Echarts registration: Register all necessary components at once.
echarts.use([
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  CanvasRenderer,
  DataZoomComponent
]);

interface CategoryWiseTimeSeriesChartProps {
  allData: Record<string, BankData[]>;
  months: string[];
  // chartRef is now optional and managed internally if not provided externally.
  chartRef?: React.MutableRefObject<echarts.EChartsType | null>;
}

// Constants for credit card categories and metrics
const CREDIT_CARD_CATEGORIES = [
  { key: 'at_PoS', label: 'PoS' },
  { key: 'Online_ecom', label: 'Online Ecom' },
  { key: 'Others', label: 'Others' },
  { key: 'Cash_Withdrawal', label: 'Cash Withdrawal' },
] as const; // Use 'as const' for immutability and type inference

const METRICS = [
  { key: 'Volume', label: 'Volume' },
  { key: 'Value', label: 'Value' },
] as const; // Use 'as const'

type CreditCardCategoryKey = typeof CREDIT_CARD_CATEGORIES[number]['key'];
type MetricKey = typeof METRICS[number]['key'];

const CategoryWiseTimeSeriesChart: FC<CategoryWiseTimeSeriesChartProps> = ({
  allData,
  months,
  chartRef: externalChartRef, // Renamed to avoid confusion with internal ref
}) => {
  // Internal chart ref for ECharts instance, prioritized over external one if both are present
  const internalChartRef = useRef<echarts.EChartsType | null>(null);
  const chartInstanceRef = externalChartRef || internalChartRef;

  const { years, defaultYearRange } = useYearRangeData(months);

  // State Management
  const [yearRange, setYearRange] = useState<[number, number]>(defaultYearRange);
  const [selectedBankType, setSelectedBankType] = useState<string>(''); // Explicit type
  const [topN, setTopN] = useState<number>(5); // Explicit type
  const [selectedCategory, setSelectedCategory] = useState<CreditCardCategoryKey>(
    CREDIT_CARD_CATEGORIES[0].key
  );
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>(METRICS[0].key);

  // Effect to update yearRange when defaultYearRange changes (e.g., on initial load or data change)
  useEffect(() => {
    setYearRange(defaultYearRange);
  }, [defaultYearRange]);

  // Memoized sorted and filtered months for chart data consistency
  const filteredMonths = useMemo(() => {
    // Sorting `months` directly here instead of `sortedMonths` state for simplicity
    const sorted = [...months].sort();
    return sorted.filter((m) => {
      const year = Number(m.slice(0, 4));
      return year >= yearRange[0] && year <= yearRange[1];
    });
  }, [months, yearRange]);

  // Memoized chart data calculation for performance
  const chartData = useMemo(() => {
    const allFilteredDataForMonths = filteredMonths.flatMap((m) => allData[m] || []);
    const dataFilteredByBankType = selectedBankType
      ? allFilteredDataForMonths.filter((d) => d.Bank_Type === selectedBankType)
      : allFilteredDataForMonths;

    const bankMap = new Map<string, BankData[]>();
    dataFilteredByBankType.forEach((d) => {
      if (!bankMap.has(d.Bank_Name)) bankMap.set(d.Bank_Name, []);
      bankMap.get(d.Bank_Name)!.push(d);
    });

    return Array.from(bankMap.entries())
      .map(([bankName, bankDatas]) => {
        const bankShortName = bankDatas[0]?.Bank_Short_Name || bankName;
        const values = filteredMonths.map((month) => {
          const bankDataForMonth = (allData[month] || []).find((d) => d.Bank_Name === bankName);
          let value = 0;

          if (bankDataForMonth?.Card_Payments_Transactions?.Credit_Card) {
            const creditCardData = bankDataForMonth.Card_Payments_Transactions.Credit_Card;

            if (selectedCategory === 'Cash_Withdrawal') {
              value =
                creditCardData.Cash_Withdrawal?.At_ATM?.[selectedMetric] ?? 0;
            } else {
              const categoryData = creditCardData[selectedCategory];
              if (
                categoryData &&
                typeof categoryData === 'object' &&
                selectedMetric in categoryData
              ) {
                value = categoryData[selectedMetric as keyof typeof categoryData] ?? 0;
              }
            }
          }
          return { month, value };
        });

        // Only include banks that have at least one month with a value greater than 0
        if (values.some((v) => v.value > 0)) {
          return { bank: bankName, bankShortName, values };
        }
        return null;
      })
      .filter(Boolean) as {
        bank: string;
        bankShortName: string;
        values: { month: string; value: number }[];
      }[];
  }, [allData, filteredMonths, selectedBankType, selectedCategory, selectedMetric]);

  // Memoized sorted data for Top N filtering
  const sortedData = useMemo(() => {
    const latestMonth = filteredMonths[filteredMonths.length - 1];
    return [...chartData]
      .sort((a, b) => {
        const aVal = a.values.find((v) => v.month === latestMonth)?.value ?? 0;
        const bVal = b.values.find((v) => v.month === latestMonth)?.value ?? 0;
        return bVal - aVal;
      })
      .slice(0, topN);
  }, [chartData, topN, filteredMonths]); // Added filteredMonths as a dependency

  // ECharts option object memoization
  const chartOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => value.toLocaleString('en-IN'),
    },
    legend: { x: 'right', y: 'top', type: 'scroll' },
    grid: { left: '1%', right: '1%', bottom: '1%' },
    xAxis: {
      type: 'category',
      data: filteredMonths,
      axisLabel: { rotate: 45, interval: Math.ceil(filteredMonths.length / 10) }, // Optimize interval for readability
      boundaryGap: false, // Prevents gap at the beginning and end of the axis
    },
    yAxis: {
      type: 'value',
      name: selectedMetric,
      axisLabel: {
        formatter: (value: number) => value.toLocaleString('en-IN'), // Format Y-axis labels
      },
      splitLine: {
        lineStyle: {
          type: 'dashed', // Dashed grid lines for better visual separation
        },
      },
    },
    series: sortedData.map((bank) => ({
      name: bank.bankShortName || bank.bank,
      type: 'line',
      // Ensure smooth lines for time series data
      smooth: true,
      // Use array.find for data points to ensure correct month alignment
      data: filteredMonths.map((m) => bank.values.find((v) => v.month === m)?.value ?? 0),
      // Optional: Add stack to see cumulative values if desired, otherwise remove
      // stack: 'Total',
    })),
    // DataZoom for better navigation on large datasets
    dataZoom: [
      {
        type: 'inside', // 'inside' for mouse wheel zooming
        start: 0,
        end: 100,
      },
      {
        type: 'slider', // 'slider' for a draggable scrollbar
        start: 0,
        end: 100,
        height: 20,
        bottom: 0,
      },
    ],
  }), [sortedData, filteredMonths, selectedMetric]);

  return (
    <div className='flex flex-col gap-4 justify-between h-full'>
      <div className='flex flex-row items-center justify-between gap-2'>
        <div className='text-lg text-center font-medium flex-1'>
          Credit Card Category Time Series
        </div>
      </div>
      <div className='grid gap-4'>
        <div className='flex w-full flex-wrap gap-4 items-center justify-between'>
          <div className='flex gap-2 items-center'>
            <span className='font-medium'>Category:</span>
            <div className='join'>
              {CREDIT_CARD_CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  className={`btn btn-xs join-item${selectedCategory === cat.key ? ' btn-primary' : ''
                    }`}
                  onClick={() => setSelectedCategory(cat.key)}
                  type='button'
                  aria-pressed={selectedCategory === cat.key}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div className='flex gap-2 items-center'>
            <span className='font-medium'>Metric:</span>
            <label className='flex items-center gap-2 cursor-pointer'>
              <span className={selectedMetric === 'Volume' ? 'font-semibold' : 'text-base-content/60'}>Volume</span>
              <input
                type='checkbox'
                className='toggle toggle-primary toggle-sm'
                checked={selectedMetric === 'Value'}
                onChange={() =>
                  setSelectedMetric(selectedMetric === 'Volume' ? 'Value' : 'Volume')
                }
                aria-label='Toggle between Volume and Value'
              />
              <span className={selectedMetric === 'Value' ? 'font-semibold' : 'text-base-content/60'}>Value</span>
            </label>
          </div>
          <TopNInput
            value={topN}
            min={1}
            max={chartData.length || 1}
            onChange={setTopN}
            label='banks'
          />
          <RangeSlider
            min={years[0]}
            max={years[years.length - 1]}
            value={yearRange}
            onChange={setYearRange}
            step={1}
          />
        </div>
        <Pills bankTypes={BANK_TYPES} selected={selectedBankType} onSelect={setSelectedBankType} />
      </div>
      <EChartsContainer
        option={chartOption}
        className='w-full h-[400px]'
        aria-label='Credit Card Category Time Series Chart'
        role='img'
        tabIndex={0}
        onInit={(instance) => {
          chartInstanceRef.current = instance;
        }}
      />
    </div>
  );
};

export default memo(CategoryWiseTimeSeriesChart);
