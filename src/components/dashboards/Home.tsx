import { BarChart, LineChart, PieChart, SankeyChart, SunburstChart, TreemapChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { FC, useMemo } from 'react';
import { CardPaymentsTransactions, InternetBanking, MobileBanking } from '../../types/global.types';
import { useAppData } from '../../context/DataContext';
import { createCardPaymentsTransactions, createInternetBanking, createMobileBanking } from '../../utils/factories';
import { formatCurrency, formatNumber } from '../../utils/number';
import { formatMonthYear } from '../../utils/time';
import EChartsContainer from '../common/EChartsContainer';

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  SunburstChart,
  TreemapChart,
  SankeyChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
]);

// Move transformers out and make them reusable
export const transformTransactionValuesOption = (digitalBankingData: any, latestMonth: string) => {
  if (!latestMonth) return {};
  const digital = digitalBankingData[latestMonth] || {};

  const neft: number = (digital.NEFT || []).reduce((sum: number, item: any) =>
    sum + item.Received_Inward_Credits.Amount + item.Total_Outward_Debits.Amount, 0) * 1e7;
  const rtgs: number = (digital.RTGS || []).reduce((sum: number, item: any) =>
    sum + item.Outward_Transactions.Amount + item.Inward_Transactions.Amount, 0) * 1e7;

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}: ${formatCurrency(params.value)} (${params.percent}%)`
    },
    series: [{
      type: 'pie',
      label: { show: true, formatter: '{b} ({d}%)' },
      data: [
        { name: 'NEFT', value: neft },
        { name: 'RTGS', value: rtgs },
      ],
    }],
  };
};

export const transformCardUsageOption = (posBanksData: any, latestMonth: string) => {
  if (!latestMonth) return {};

  let cards: CardPaymentsTransactions = createCardPaymentsTransactions();
  posBanksData[latestMonth]?.forEach((bank: any) => {
    cards.Credit_Card.at_PoS.Value += bank.Card_Payments_Transactions?.Credit_Card?.at_PoS?.Value || 0;
    cards.Credit_Card.Online_ecom.Value += bank.Card_Payments_Transactions?.Credit_Card?.Online_ecom?.Value || 0;
    cards.Credit_Card.Cash_Withdrawal.Total!.Value += (bank.Card_Payments_Transactions?.Credit_Card?.Cash_Withdrawal?.At_ATM.Value || 0) + (bank.Card_Payments_Transactions?.Credit_Card?.Cash_Withdrawal?.At_PoS?.Value || 0);
    cards.Credit_Card.Others.Value += bank.Card_Payments_Transactions?.Credit_Card?.Others?.Value || 0;

    cards.Debit_Card.at_PoS.Value += bank.Card_Payments_Transactions?.Debit_Card?.at_PoS?.Value || 0;
    cards.Debit_Card.Online_ecom.Value += bank.Card_Payments_Transactions?.Debit_Card?.Online_ecom?.Value || 0;
    cards.Debit_Card.Cash_Withdrawal.Total!.Value += (bank.Card_Payments_Transactions?.Debit_Card?.Cash_Withdrawal?.At_ATM.Value || 0) + (bank.Card_Payments_Transactions?.Debit_Card?.Cash_Withdrawal?.At_PoS?.Value || 0);
    cards.Debit_Card.Others.Value += bank.Card_Payments_Transactions?.Debit_Card?.Others?.Value || 0;
  });

  cards.Credit_Card.Total!.Value = cards.Credit_Card.at_PoS.Value + cards.Credit_Card.Online_ecom.Value + cards.Credit_Card.Cash_Withdrawal.Total!.Value + cards.Credit_Card.Others.Value;
  cards.Debit_Card.Total!.Value = cards.Debit_Card.at_PoS.Value + cards.Debit_Card.Online_ecom.Value + cards.Debit_Card.Cash_Withdrawal.Total!.Value + cards.Debit_Card.Others.Value;

  return {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    series: {
      type: 'sankey',
      data: [
        { name: 'Debit Cards' }, { name: 'Credit Cards' }, { name: 'Others' },
        { name: 'POS' }, { name: 'Ecom' }, { name: 'Cash' },
      ],
      links: [
        { source: 'Others', target: 'Debit Cards', value: cards.Debit_Card.Others.Value },
        { source: 'POS', target: 'Debit Cards', value: cards.Debit_Card.at_PoS.Value },
        { source: 'Ecom', target: 'Debit Cards', value: cards.Debit_Card.Online_ecom.Value },
        { source: 'Cash', target: 'Debit Cards', value: cards.Debit_Card.Cash_Withdrawal.Total!.Value },
        { source: 'Others', target: 'Credit Cards', value: cards.Credit_Card.Others.Value },
        { source: 'POS', target: 'Credit Cards', value: cards.Credit_Card.at_PoS.Value },
        { source: 'Ecom', target: 'Credit Cards', value: cards.Credit_Card.Online_ecom.Value },
        { source: 'Cash', target: 'Credit Cards', value: cards.Credit_Card.Cash_Withdrawal.Total!.Value },
      ],
    },
  };
};

export const transformMobileInternetOption = (digitalBankingData: any, latestMonth: string) => {
  if (!latestMonth) return {};

  let mobile: MobileBanking = createMobileBanking();
  digitalBankingData[latestMonth]?.Mobile_Banking?.forEach((item: any) => {
    mobile.Value += item.Value;
    mobile.Volume += item.Volume;
    mobile.Active_Customers += item.Active_Customers;
  });

  let internet: InternetBanking = createInternetBanking();
  digitalBankingData[latestMonth]?.Internet_Banking?.forEach((item: any) => {
    internet.Value += item.Value;
    internet.Volume += item.Volume;
    internet.Active_Customers += item.Active_Customers;
  });

  const metrics = ['Value', 'Volume', 'Active Customers'];
  const percentDigitalValues = Object.entries(mobile).reduce((acc, [key, val]) => {
    const internetVal = (internet as any)[key] || 0;
    const total = (val + internetVal) || 1;
    const mobilePercent: number = Math.round(((val / total) * 100));
    (acc.mobile as any)[key] = mobilePercent;
    (acc.internet as any)[key] = 100 - mobilePercent;
    return acc;
  }, { mobile: createMobileBanking(), internet: createInternetBanking() });

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        let tooltip = `<b>${params[0].name}</b><br/>`;
        params.forEach((p: any) => { tooltip += `${p.marker} ${p.seriesName}: ${p.value}%<br/>`; });
        return tooltip;
      },
    },
    legend: { data: ['Mobile Banking', 'Internet Banking'] },
    xAxis: { type: 'category', data: metrics, axisLabel: { interval: 0 } },
    yAxis: {
      type: 'value',
      max: 100 // Since the values add up to 100%, capping the axis renders it cleanly
    },
    series: [
      {
        name: 'Mobile Banking',
        type: 'bar',
        stack: 'totalPercent',
        stackStrategy: 'positive',
        data: [percentDigitalValues.mobile.Value, percentDigitalValues.mobile.Volume, percentDigitalValues.mobile.Active_Customers]
      },
      {
        name: 'Internet Banking',
        type: 'bar',
        stack: 'totalPercent',
        stackStrategy: 'positive',
        data: [percentDigitalValues.internet.Value, percentDigitalValues.internet.Volume, percentDigitalValues.internet.Active_Customers]
      },
    ],
  };
};

export const transformTop5CardOption = (posBanksData: any, latestMonth: string, cardType: 'Credit_Cards' | 'Debit_Cards') => {
  if (!latestMonth) return {};

  const totalCards = posBanksData[latestMonth]?.reduce((sum: number, bank: any) => sum + bank.Infrastructure[cardType], 0) || 0;
  const top5Banks = posBanksData[latestMonth]?.sort((a: any, b: any) => b.Infrastructure[cardType] - a.Infrastructure[cardType]).slice(0, 5) || [];

  return {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const p = params[0];
        return `${p.marker} ${p.name}: ${formatNumber(p.value)} (${Math.round((p.value / totalCards) * 100)}%)`;
      },
    },
    xAxis: {
      type: 'category',
      data: top5Banks.map((item: any) => item.Bank_Short_Name),
      axisLabel: { interval: 0, rotate: 30 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: (value: number) => formatNumber(value) },
    },
    series: [
      {
        name: cardType === 'Credit_Cards' ? 'Credit Cards' : 'Debit Cards',
        type: 'bar',
        data: top5Banks.map((item: any) => item.Infrastructure[cardType]),
        label: {
          show: true,
          position: 'outside',
          formatter: (params: any) => {
            const value = params.value;
            const percent = totalCards ? Math.round((value / totalCards) * 100) : 0;
            return `${percent}%`;
          }
        },
      },
    ],
  };
};


// REVIEW: Do we need to move them to hooks as well?
export const useHomeCharts = () => {
  const { posBanksData, digitalBankingData, latestMonth } = useAppData();

  const transactionValues = useMemo(() =>
    transformTransactionValuesOption(digitalBankingData, latestMonth),
    [digitalBankingData, latestMonth]
  );

  const cardUsageOption = useMemo(() =>
    transformCardUsageOption(posBanksData, latestMonth),
    [posBanksData, latestMonth]
  );

  const mobileInternetOption = useMemo(() =>
    transformMobileInternetOption(digitalBankingData, latestMonth),
    [digitalBankingData, latestMonth]
  );

  const top5CreditCardOption = useMemo(() =>
    transformTop5CardOption(posBanksData, latestMonth, 'Credit_Cards'),
    [posBanksData, latestMonth]
  );

  const top5DebitCardOption = useMemo(() =>
    transformTop5CardOption(posBanksData, latestMonth, 'Debit_Cards'),
    [posBanksData, latestMonth]
  );

  return {
    latestMonth,
    charts: {
      transactionValues,
      cardUsageOption,
      mobileInternetOption,
      top5CreditCardOption,
      top5DebitCardOption,
    }
  };
};

const Home: FC = () => {
  const { latestMonth, charts } = useHomeCharts();

  const panels = [
    { title: 'Credit Card Market Share', option: charts.top5CreditCardOption },
    { title: 'Debit Card Market Share', option: charts.top5DebitCardOption },
    { title: 'Transaction Values by Type', option: charts.transactionValues },
    { title: 'Mobile vs. Internet Banking', option: charts.mobileInternetOption },
    { title: 'Debit vs. Credit Card Usage', option: charts.cardUsageOption },
  ];

  return (
    <article className="p-4">
      <h1>{formatMonthYear(latestMonth)}</h1>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 py-4">
        {panels.map((p) => (
          <div key={p.title}>
            <h3 className="text-xl font-semibold">{p.title}</h3>
            <EChartsContainer className="h-64" option={p.option} />
          </div>
        ))}
      </section>
    </article>
  );
};

export default Home;
