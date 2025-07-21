import { useContext } from 'react';
import { LayoutContext } from '../context/LayoutContext';
import { BankData } from '../types/global.types';
import { AccordionLayout, GridLayout } from './layouts';
import CreditCardCashWithdrawalChart from '../visualization/credit_cards/CashWithdrawalChart';
import CreditCardTimeSeriesChart from '../visualization/credit_cards/TimeSeriesChart';
import CreditCardTypeBreakdownChart from '../visualization/credit_cards/TypeBreakdownChart';
import TopCreditCardBanksChart from '../visualization/credit_cards/TopBanksChart';
import { ChartItem, LayoutProps } from './layouts/types';

interface CreditCardDashboardProps {
  posBanksData: { [key: string]: BankData[] };
  months: string[];
}

const CreditCardDashboard: React.FC<CreditCardDashboardProps> = ({ posBanksData, months }) => {
  const { layout } = useContext(LayoutContext);

  const charts: ChartItem<any>[] = [
    {
      component: CreditCardTimeSeriesChart,
      props: {
        title: 'Credit Card Transactions Over Time',
        allData: posBanksData,
        months,
      }
    },
    {
      component: TopCreditCardBanksChart,
      props: {
        title: 'Top Banks by Credit Card Volume',
        allData: posBanksData,
        topN: 10,
      }
    },
    {
      component: CreditCardTypeBreakdownChart,
      props: {
        title: 'Credit Card Transaction Type Breakdown',
        allData: posBanksData,
      }
    },
    {
      component: CreditCardCashWithdrawalChart,
      props: {
        title: 'Credit Card Cash Withdrawal Trends',
        allData: posBanksData,
      }
    },
  ];

  return (
    <article>
      {layout === 'grid' && <GridLayout charts={charts} />}
      {layout === 'accordion' && <AccordionLayout charts={charts} />}
    </article>
  );
};

export default CreditCardDashboard;
