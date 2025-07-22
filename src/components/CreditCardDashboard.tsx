import { useContext } from 'react';
import { LayoutContext } from '../context/LayoutContext';
import { BankData } from '../types/global.types';
import CreditCardCashWithdrawalChart from '../visualization/cards/CategoryWiseTimeSeriesChart';
import CreditCardTimeSeriesChart from '../visualization/cards/TimeSeriesChart';
import { AccordionLayout, CardLayout } from './layouts';
import { ChartItem } from './layouts/types';

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
      {layout === 'grid' && <CardLayout charts={charts} />}
      {layout === 'accordion' && <AccordionLayout charts={charts} />}
    </article>
  );
};

export default CreditCardDashboard;
