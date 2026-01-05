import { BarChart, LineChart, PieChart, SankeyChart, SunburstChart, TreemapChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { FC, useMemo } from 'react';
import { CardPaymentsTransactions, InternetBanking, MobileBanking } from 'src/types/global.types';
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

const Home: FC = () => {
  const { posBanksData, digitalBankingData, months, latestMonth } = useAppData();

  // Transaction Volume by Type: Pie chart
  const transactionValues = useMemo(() => {
    if (!latestMonth) return {};
    const digital = digitalBankingData[latestMonth] || {};
    // Amount is already in crore
    const neft: number = (digital.NEFT || []).reduce((sum, item) => sum + item.Received_Inward_Credits.Amount + item.Total_Outward_Debits.Amount, 0) * 1e7;
    const rtgs: number = (digital.RTGS || []).reduce((sum, item) => sum + item.Outward_Transactions.Amount + item.Inward_Transactions.Amount, 0) * 1e7;

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
  }, [digitalBankingData, latestMonth]);

  // Debit vs Credit Card Usage: Sankey chart
  const cardUsageOption = useMemo(() => {
    if (!latestMonth) return {};

    let cards: CardPaymentsTransactions = createCardPaymentsTransactions();
    posBanksData[latestMonth]?.forEach(bank => {
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
      tooltip: {
        trigger: 'item',
      },
      series: {
        type: 'sankey',
        data: [
          { name: 'Debit Cards' },
          { name: 'Credit Cards' },
          { name: 'Others' },
          { name: 'POS' },
          { name: 'Ecom' },
          { name: 'Cash' },
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
  }, [posBanksData, latestMonth]);

  // Mobile vs Internet Banking: Grouped Bar Chart (Percentages)
  const mobileInternetOption = useMemo(() => {
    if (!latestMonth) return {};

    let mobile: MobileBanking = createMobileBanking();
    digitalBankingData[latestMonth]?.Mobile_Banking?.forEach(item => {
      mobile.Value += item.Value;
      mobile.Volume += item.Volume;
      mobile.Active_Customers += item.Active_Customers;
    });

    let internet: InternetBanking = createInternetBanking();
    digitalBankingData[latestMonth]?.Internet_Banking?.forEach(item => {
      internet.Value += item.Value;
      internet.Volume += item.Volume;
      internet.Active_Customers += item.Active_Customers;
    });

    // Metrics for x-axis
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
          params.forEach((p: any) => {
            tooltip += `${p.marker} ${p.seriesName}: ${p.value}%<br/>`;
          });
          return tooltip;
        },
      },
      legend: { data: ['Mobile Banking', 'Internet Banking'] },
      xAxis: {
        type: 'category',
        data: metrics,
        axisLabel: { interval: 0 },
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Mobile Banking',
          type: 'bar',
          data: [percentDigitalValues.mobile.Value, percentDigitalValues.mobile.Volume, percentDigitalValues.mobile.Active_Customers],
        },
        {
          name: 'Internet Banking',
          type: 'bar',
          data: [percentDigitalValues.internet.Value, percentDigitalValues.internet.Volume, percentDigitalValues.internet.Active_Customers],
        },
      ],
    };
  }, [digitalBankingData, latestMonth]);

  // Top 5 banks by credit card transactions value - Bar Chart (Latest Month)
  const top5CreditCardOption = useMemo(() => {
    if (!latestMonth) return {};

    const totalCreditCards = posBanksData[latestMonth]?.reduce((sum, bank) => sum + bank.Infrastructure.Credit_Cards, 0) || 0;
    const top5Banks = posBanksData[latestMonth]?.sort((a, b) => b.Infrastructure.Credit_Cards - a.Infrastructure.Credit_Cards).slice(0, 5) || [];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const p = params[0];
          return `${p.marker} ${p.name}: ${formatNumber(p.value)} (${Math.round((p.value / totalCreditCards) * 100)}%)`;
        },
      },
      xAxis: {
        type: 'category',
        data: top5Banks.map(item => item.Bank_Short_Name),
        axisLabel: { interval: 0, rotate: 30 },
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: (value: number) => formatNumber(value) },
      },
      series: [
        {
          name: 'Credit Cards',
          type: 'bar',
          data: top5Banks.map(item => item.Infrastructure.Credit_Cards),
          label: {
            show: true,
            position: 'outside',
            formatter: (params: any) => {
              const value = params.value;
              const percent = totalCreditCards ? Math.round((value / totalCreditCards) * 100) : 0;
              return `${percent}%`;
            }
          },
        },
      ],
    };
  }, [posBanksData, latestMonth]);

  return (
    <article className="p-4">
      <h1>{formatMonthYear(latestMonth)}</h1>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 py-4">
        <div>
          <h3 className="text-xl font-semibold">Credit Card Market Share</h3>
          <EChartsContainer className="h-64" option={top5CreditCardOption} />
        </div>
        <div className="">
          <h3 className="text-xl font-semibold">Transaction Values by Type</h3>
          <EChartsContainer className="h-64" option={transactionValues} />
        </div>
        <div className="">
          <h3 className="text-xl font-semibold">Mobile vs. Internet Banking</h3>
          <EChartsContainer className="h-64" option={mobileInternetOption} />
        </div>
        <div className="">
          <h3 className="text-xl font-semibold">Debit vs. Credit Card Usage</h3>
          <EChartsContainer className="h-64" option={cardUsageOption} />
        </div>
      </section>
    </article>
  );
};

export default Home;
