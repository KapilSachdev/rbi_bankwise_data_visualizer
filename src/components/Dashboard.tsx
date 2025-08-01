import { useContext } from 'react';
import { LayoutContext } from '../context/LayoutContext';
import { BankData } from '../types/global.types';
import { formatMonthYear } from '../utils/time';
import { BankTypeStackedAreaChart, InfraBarChart, TopMoversLineChart } from '../visualization/components';
import { TimeSeriesChart } from '../visualization/cards';
import { AccordionLayout, CardLayout } from './layouts';
import type { ChartItem } from './layouts/types';

interface DashboardProps {
  posBanksData: { [key: string]: BankData[] };
  months: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ posBanksData, months }) => {
  const { layout } = useContext(LayoutContext);

  const charts: ChartItem<any>[] = [
    {
      component: TopMoversLineChart,
      props: { title: 'Card Transactions Top Movers', allData: posBanksData, months }
    },
    {
      component: BankTypeStackedAreaChart,
      props: { title: 'Card Transactions Volume by Bank Type Over Time', allData: posBanksData, months }
    },
    {
      component: TimeSeriesChart,
      props: { title: 'Credit Card Transactions Over Time', allData: posBanksData, months }
    },
    {
      component: InfraBarChart,
      props: {
        title: `Bank Infrastructure ( ${months[0] && formatMonthYear(months[0])} )`, allData: posBanksData, months
      }
    },
  ];
  return (
    <>
      <article>
        {layout === 'grid' && <CardLayout charts={charts} />}
        {layout === 'accordion' && <AccordionLayout charts={charts} />}
      </article>
    </>
  )
};

export default Dashboard;
