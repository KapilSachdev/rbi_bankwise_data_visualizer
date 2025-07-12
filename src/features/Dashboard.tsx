import { BankData } from '../types/global.types';
import Hero from './home/Hero';
import BankTypeStackedAreaChart from './visualization/components/BankTypeStackedAreaChart';
import TopMoversLineChart from './visualization/components/TopMoversLineChart';
import CreditCardTimeSeriesChart from './visualization/components/CreditCardTimeSeriesChart';
import BankInfraBarChart from './visualization/components/InfraBarChart';


interface DashboardProps {
  posBanksData: { [key: string]: BankData[] };
  months: string[];
}

const Dashboard: React.FC<DashboardProps> = ({ posBanksData, months }) => (
  <>
    <Hero />
    <article className="grid lg:grid-cols-2 gap-8 py-8">
      <div className="card shadow-sm border border-base-300">
        <div className="card-body">
          <TopMoversLineChart
            allData={posBanksData}
            months={months}
          />
        </div>
      </div>
      <div className="card shadow-sm border border-base-300">
        <div className="card-body">
          <BankTypeStackedAreaChart
            allData={posBanksData}
            months={months}
          />
        </div>
      </div>
      <div className="card shadow-sm border border-base-300">
        <div className="card-body">
          <CreditCardTimeSeriesChart
            allData={posBanksData}
            months={months}
          />
        </div>
      </div>
      <div className="card shadow-sm border border-base-300">
        <div className="card-body">
          <BankInfraBarChart
            allData={posBanksData}
            months={months}
          />
        </div>
      </div>
    </article>
  </>
);

export default Dashboard;
