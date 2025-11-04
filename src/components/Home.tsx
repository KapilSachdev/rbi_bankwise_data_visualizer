import { BarChart, LineChart, PieChart, SankeyChart, SunburstChart, TreemapChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { FC, useMemo } from 'react';
import { CardPaymentsTransactions } from 'src/types/global.types';
import { useAppData } from '../context/DataContext';
import { createCardPaymentsTransactions } from '../utils/factories';
import { formatCurrency } from '../utils/number';
import EChartsContainer from './common/EChartsContainer';

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
    if (!months.length) return {};
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
  }, [digitalBankingData, months]);

  // Debit vs Credit Card Usage: Sankey chart
  const cardUsageOption = useMemo(() => {
    if (!months.length) return {};
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
      series: [{
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
      }],
    };
  }, [posBanksData, months]);

  // NEFT vs RTGS: Bar chart
  const neftRtgsOption = useMemo(() => {
    if (!months.length) return {};
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

      {/* Grid of smaller charts */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="p-4">
            <h3 className="text-xl font-semibold   mb-4">Transaction Values by Type</h3>
            <EChartsContainer option={transactionValues} className="h-64" />
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
