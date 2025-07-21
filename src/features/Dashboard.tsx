import { useContext } from 'react';
import { BankData } from '../types/global.types';
import Hero from './home/Hero';
import BankTypeStackedAreaChart from './visualization/components/BankTypeStackedAreaChart';
import CreditCardTimeSeriesChart from './visualization/components/CreditCardTimeSeriesChart';
import BankInfraBarChart from './visualization/components/InfraBarChart';
import TopMoversLineChart from './visualization/components/TopMoversLineChart';
import { LayoutContext } from '../context/LayoutContext';
import { GridLayout, AccordionLayout } from './layouts';
import type { ChartItem } from './layouts/types';
import { formatMonthYear } from '../utils/time';

interface DashboardProps {
  posBanksData: { [key: string]: BankData[] };
  months: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ posBanksData, months }) => {
  const { layout } = useContext(LayoutContext);

  const charts: ChartItem[] = [
    {
      component: TopMoversLineChart,
      props: { title: 'Card Transactions Top Movers', allData: posBanksData, months }
    },
    {
      component: BankTypeStackedAreaChart,
      props: { title: 'Card Transactions Volume by Bank Type Over Time', allData: posBanksData, months }
    },
    {
      component: CreditCardTimeSeriesChart,
      props: { title: 'Credit Card Transactions Over Time', allData: posBanksData, months }
    },
    {
      component: BankInfraBarChart,
      props: {
        title: `Bank Infrastructure ( ${months[0] && formatMonthYear(months[0])} )`, allData: posBanksData, months
      }
    },
  ];
  return (
    <>
      <Hero />
      <article>
        {layout === 'grid' && <GridLayout charts={charts} />}
        {layout === 'accordion' && <AccordionLayout charts={charts} />}
      </article>
    </>
  )
};

export default Dashboard;
