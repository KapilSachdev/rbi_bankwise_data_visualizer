
import { useEffect, useState } from 'react';
import RandomThemeButton from './components/common/RandomThemeButton';
import { DATA_FOLDER } from './constants/data';
import BankTypeStackedAreaChart from './features/visualization/components/BankTypeStackedAreaChart';
import CreditCardTimeSeriesChart from './features/visualization/components/CreditCardTimeSeriesChart';
import BankInfraBarChart from './features/visualization/components/InfraBarChart';
import TopMoversLineChart from './features/visualization/components/TopMoversLineChart';

import type { BankData } from './types/global.types';

interface DataFileMeta {
  file: string;
  label: string;
  key: string;
  type?: string;
}



function App() {
  // Manifest and bifurcated data
  const [files, setFiles] = useState<DataFileMeta[]>([]);
  const [posData, setPosData] = useState<{ [key: string]: { banks: BankData[]; summary?: unknown } }>({});
  // const [neftData, setNeftData] = useState<{ [key: string]: { banks: BankData[]; summary?: unknown } }>({});


  useEffect(() => {
    fetch(`${DATA_FOLDER}/index.json`)
      .then(res => res.json())
      .then((manifest: { neft: DataFileMeta[]; pos: DataFileMeta[] }) => {
        const allFiles = [...(manifest.neft || []), ...(manifest.pos || [])];
        setFiles(allFiles);
        const allMeta = [
          ...(manifest.neft || []).map(f => ({ ...f, type: 'neft' })),
          ...(manifest.pos || []).map(f => ({ ...f, type: 'pos' })),
        ];
        return Promise.all(
          allMeta.map(f =>
            fetch(`${DATA_FOLDER}/${f.file}`)
              .then(res => res.json())
              .then(data => ({ key: f.key, type: f.type, data }))
          )
        );
      })
      .then(results => {
        const pos: { [key: string]: { banks: BankData[]; summary?: unknown } } = {};
        results.forEach((result) => {
          const { key, type, data } = result as { key: string; type: string; data: { banks: BankData[]; summary?: unknown } };
          if (type === 'pos') pos[key] = data;
        });
        setPosData(pos);
      })
      .catch(err => {
        console.error('Failed to load month data:', err);
      });
  }, []);

  const posFiles = files.filter(f => f.type === 'pos');
  const posBanksData = Object.fromEntries(
    Object.entries(posData).map(([k, v]) => [k, v?.banks ?? []])
  );

  const chartRefs = {
    topMovers: { current: null },
    bankType: { current: null },
    infra: { current: null },
    creditCard: { current: null },
  };

  return (
    <main className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
      <div className="card shadow-sm border border-base-300">
        <div className="card-body">
          <TopMoversLineChart
            allData={posBanksData}
            months={posFiles.map(f => f.key)}
            chartRef={chartRefs.topMovers}
          />
        </div>
      </div>
      <div className="card shadow-sm border border-base-300">
        <div className="card-body">
          <BankTypeStackedAreaChart
            allData={posBanksData}
            months={posFiles.map(f => f.key)}
            chartRef={chartRefs.bankType}
          />
        </div>
      </div>
      <div className="card shadow-sm border border-base-300">
        <div className="card-body">
          <CreditCardTimeSeriesChart
            allData={posBanksData}
            months={posFiles.map(f => f.key)}
            chartRef={chartRefs.creditCard}
          />
        </div>
      </div>

      <div className="card shadow-sm border border-base-300">
        <div className="card-body">
          <BankInfraBarChart
            allData={posBanksData}
            months={posFiles.map(f => f.key)}
            chartRef={chartRefs.infra}
          />
        </div>
      </div>

      <RandomThemeButton />


    </main >
  );
}

export default App;
