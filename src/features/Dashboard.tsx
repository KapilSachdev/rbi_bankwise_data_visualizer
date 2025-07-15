import { useContext } from 'react';
import { BankData } from '../types/global.types';
import Hero from './home/Hero';
import BankTypeStackedAreaChart from './visualization/components/BankTypeStackedAreaChart';
import CreditCardTimeSeriesChart from './visualization/components/CreditCardTimeSeriesChart';
import BankInfraBarChart from './visualization/components/InfraBarChart';
import TopMoversLineChart from './visualization/components/TopMoversLineChart';
import { LayoutContext } from '../App';
import { GridLayout, AccordionLayout } from './layouts/Layouts';


interface DashboardProps {
  posBanksData: { [key: string]: BankData[] };
  months: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ posBanksData, months }) => {
  const { layout, setLayout } = useContext(LayoutContext);

  const charts = [
    { component: TopMoversLineChart, props: { allData: posBanksData, months } },
    { component: BankTypeStackedAreaChart, props: { allData: posBanksData, months } },
    { component: CreditCardTimeSeriesChart, props: { allData: posBanksData, months } },
    { component: BankInfraBarChart, props: { allData: posBanksData, months } },
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
