import { useContext } from 'react';
import { BankData } from '../types/global.types';
import Hero from './home/Hero';
import { BankTypeStackedAreaChart, InfraBarChart, TopMoversLineChart } from '../visualization/components';
import { CashWithdrawalChart, TimeSeriesChart, TopBanksChart, TypeBreakdownChart } from '../visualization/credit_cards';
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
      <Hero />
      <article>
        {layout === 'grid' && <GridLayout charts={charts} />}
        {layout === 'accordion' && <AccordionLayout charts={charts} />}
      </article>
    </>
  )
};

export default Dashboard;
