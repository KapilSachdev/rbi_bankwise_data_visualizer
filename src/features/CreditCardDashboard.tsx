import { useContext } from 'react';
import { LayoutContext } from '../context/LayoutContext';
import { BankData } from '../types/global.types';
import { AccordionLayout, GridLayout } from './layouts';
import CreditCardCashWithdrawalChart from './visualization/components/CreditCardCashWithdrawalChart';
import CreditCardTimeSeriesChart from './visualization/components/CreditCardTimeSeriesChart';
import CreditCardTypeBreakdownChart from './visualization/components/CreditCardTypeBreakdownChart';
import TopCreditCardBanksChart from './visualization/components/TopCreditCardBanksChart';
import { ChartItem } from './layouts/types';

interface CreditCardDashboardProps {
  posBanksData: { [key: string]: BankData[] };
  months: string[];
}

const CreditCardDashboard: React.FC<CreditCardDashboardProps> = ({ posBanksData, months }) => {
  const { layout } = useContext(LayoutContext);

  const charts: ChartItem[] = [
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
        months,
        topN: 10,
      }
    },
    {
      component: CreditCardTypeBreakdownChart,
      props: {
        title: 'Credit Card Transaction Type Breakdown',
        allData: posBanksData,
        months,
      }
    },
    {
      component: CreditCardCashWithdrawalChart,
      props: {
        title: 'Credit Card Cash Withdrawal Trends',
        allData: posBanksData,
        months,
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
