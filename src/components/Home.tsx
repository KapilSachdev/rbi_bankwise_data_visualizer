import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { FC, useMemo } from 'react';
import { useAppData } from '../context/DataContext';
import EChartsContainer from './common/EChartsContainer';
import { formatCurrency } from '../utils/number';

echarts.use([
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
]);

const Home: FC = () => {
  const { posBanksData, digitalBankingData, months } = useAppData();

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    if (!months.length) return { totalTransactions: 0, totalValue: 0, activeCustomers: 0, atmPos: 0 };
    const latestMonth = months[months.length - 1];
    const banks = posBanksData[latestMonth] || [];
    const digital = digitalBankingData[latestMonth] || {};

    const totalTransactions = banks.reduce((sum, bank) => {
      const infra = bank.Card_Payments_Transactions;
      return sum + (infra?.Credit_Card?.at_PoS?.Volume || 0) + (infra?.Debit_Card?.at_PoS?.Volume || 0);
    }, 0);

    const totalValue = banks.reduce((sum, bank) => {
      const infra = bank.Card_Payments_Transactions;
      return sum + (infra?.Credit_Card?.at_PoS?.Value || 0) + (infra?.Debit_Card?.at_PoS?.Value || 0);
    }, 0);

    const activeCustomers = (digital.Mobile_Banking || []).reduce((sum, item) => sum + item.Active_Customers, 0) +
      (digital.Internet_Banking || []).reduce((sum, item) => sum + item.Active_Customers, 0);

    const atmPos = banks.reduce((sum, bank) => sum + bank.Infrastructure.ATMs_CRMs.On_site + bank.Infrastructure.ATMs_CRMs.Off_site + bank.Infrastructure.PoS, 0);

    return { totalTransactions, totalValue, activeCustomers, atmPos };
  }, [posBanksData, digitalBankingData, months]);

  // Overall Performance Trend: Line chart of total transactions over months
  const performanceTrendOption = useMemo(() => ({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: months },
    yAxis: { type: 'value' },
    series: [{
      type: 'line',
      data: months.map(month => {
        const banks = posBanksData[month] || [];
        return banks.reduce((sum, bank) => {
          const infra = bank.Card_Payments_Transactions;
          return sum + (infra?.Credit_Card?.at_PoS?.Volume || 0) + (infra?.Debit_Card?.at_PoS?.Volume || 0);
        }, 0);
      }),
    }],
  }), [posBanksData, months]);

  // Transaction Volume by Type: Pie chart
  const transactionVolumeOption = useMemo(() => {
    if (!months.length) return {};
    const latestMonth = months[0];
    const digital = digitalBankingData[latestMonth] || {};
    const neft = (digital.NEFT || []).reduce((sum, item) => sum + item.Received_Inward_Credits.Amount + item.Total_Outward_Debits.Amount, 0);
    const rtgs = (digital.RTGS || []).reduce((sum, item) => sum + item.Outward_Transactions.Amount + item.Inward_Transactions.Amount, 0);

    return {
      backgroundColor: 'transparent',
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        tooltip: { valueFormatter: (value: number) => formatCurrency(value) },
        label: { show: true, formatter: '{b} ({d}%)' },
        data: [
          { name: 'NEFT', value: neft },
          { name: 'RTGS', value: rtgs },
        ],
      }],
    };
  }, [digitalBankingData, months]);

  // Debit vs Credit Card Usage: Bar chart
  const cardUsageOption = useMemo(() => {
    if (!months.length) return {};
    const latestMonth = months[months.length - 1];
    const banks = posBanksData[latestMonth] || [];
    const debit = banks.reduce((sum, bank) => sum + (bank.Card_Payments_Transactions?.Debit_Card?.at_PoS?.Volume || 0), 0);
    const credit = banks.reduce((sum, bank) => sum + (bank.Card_Payments_Transactions?.Credit_Card?.at_PoS?.Volume || 0), 0);

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['Debit Cards', 'Credit Cards'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [debit, credit] }],
    };
  }, [posBanksData, months]);

  // NEFT vs RTGS: Bar chart
  const neftRtgsOption = useMemo(() => {
    if (!months.length) return {};
    const latestMonth = months[months.length - 1];
    const digital = digitalBankingData[latestMonth] || {};
    const neft = (digital.NEFT || []).reduce((sum, item) => sum + item.Received_Inward_Credits.No, 0);
    const rtgs = (digital.RTGS || []).reduce((sum, item) => sum + item.Outward_Transactions.No + item.Inward_Transactions.No, 0);

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['NEFT', 'RTGS'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [neft, rtgs] }],
    };
  }, [digitalBankingData, months]);

  // Mobile vs Internet Banking: Bar chart
  const mobileInternetOption = useMemo(() => {
    if (!months.length) return {};
    const latestMonth = months[months.length - 1];
    const digital = digitalBankingData[latestMonth] || {};
    const mobile = (digital.Mobile_Banking || []).reduce((sum, item) => sum + item.Volume, 0);
    const internet = (digital.Internet_Banking || []).reduce((sum, item) => sum + item.Volume, 0);

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['Mobile Banking', 'Internet Banking'] },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: [mobile, internet] }],
    };
  }, [digitalBankingData, months]);

  // Bank Type Market Share: Pie chart
  const bankTypeShareOption = useMemo(() => {
    if (!months.length) return {};
    const latestMonth = months[months.length - 1];
    const banks = posBanksData[latestMonth] || [];
    const types = banks.reduce((acc, bank) => {
      acc[bank.Bank_Type] = (acc[bank.Bank_Type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        data: Object.entries(types).map(([name, value]) => ({ name, value })),
      }],
    };
  }, [posBanksData, months]);

  // Top 5 Banks by Debit Cards: Bar chart
  const topBanksOption = useMemo(() => {
    if (!months.length) return {};
    const latestMonth = months[months.length - 1];
    const banks = posBanksData[latestMonth] || [];
    const sorted = banks.sort((a, b) => b.Infrastructure.Debit_Cards - a.Infrastructure.Debit_Cards).slice(0, 5);

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: sorted.map(b => b.Bank_Short_Name) },
      yAxis: { type: 'value' },
      series: [{ type: 'bar', data: sorted.map(b => b.Infrastructure.Debit_Cards) }],
    };
  }, [posBanksData, months]);

  return (
    <div className="p-4">

      {/* Hero Section */}
      <section className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 p-4 ">
            <h2 className="text-2xl font-semibold mb-4">Overall Performance Trend</h2>
            <EChartsContainer option={performanceTrendOption} className="h-96" />
          </div>
          <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Key Metrics</h2>
            <ul className="space-y-4">
              <li className="flex justify-between items-center">
                <span className=" ">Total Transactions</span>
                <span className="text-2xl font-bold ">{keyMetrics.totalTransactions.toLocaleString()}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className=" ">Total Value</span>
                <span className="text-2xl font-bold ">₹{keyMetrics.totalValue.toLocaleString()}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className=" ">Active Customers</span>
                <span className="text-2xl font-bold">{keyMetrics.activeCustomers.toLocaleString()}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className=" ">ATMs & PoS</span>
                <span className="text-2xl font-bold ">{keyMetrics.atmPos.toLocaleString()}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Grid of smaller charts */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="p-4">
            <h3 className="text-xl font-semibold   mb-4">Transaction Volume by Type</h3>
            <EChartsContainer option={transactionVolumeOption} className="h-64" />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold   mb-4">Debit vs. Credit Card Usage</h3>
            <EChartsContainer option={cardUsageOption} className="h-64" />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold   mb-4">NEFT vs. RTGS Transactions</h3>
            <EChartsContainer option={neftRtgsOption} className="h-64" />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold   mb-4">Mobile vs. Internet Banking</h3>
            <EChartsContainer option={mobileInternetOption} className="h-64" />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold   mb-4">Bank Type Market Share</h3>
            <EChartsContainer option={bankTypeShareOption} className="h-64" />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold   mb-4">Top 5 Banks by Debit Cards</h3>
            <EChartsContainer option={topBanksOption} className="h-64" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
