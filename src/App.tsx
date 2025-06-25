import { useEffect, useState } from 'react';

interface DataFileMeta {
  file: string;
  label: string;
  key: string;
  type?: string;
}
import CreditCardTimeSeriesChart from './features/visualization/components/CreditCardTimeSeriesChart';
import RandomThemeButton from './components/common/RandomThemeButton';
import { DATA_FOLDER } from './constants/data';
import BankInfraBarChart from './features/visualization/components/InfraBarChart';
import type { BankData } from './types/global.types';




function App() {
  // Manifest and bifurcated data
  const [files, setFiles] = useState<DataFileMeta[]>([]);
  const [posData, setPosData] = useState<{ [key: string]: BankData[] }>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [neftData, setNeftData] = useState<{ [key: string]: BankData[] }>({});

  // Load manifest and then all months' data on mount
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
        const pos: { [key: string]: BankData[] } = {};
        const neft: { [key: string]: BankData[] } = {};
        results.forEach((result) => {
          const { key, type, data } = result as { key: string; type: string; data: unknown[] };
          if (type === 'pos') pos[key] = data as BankData[];
          else if (type === 'neft') neft[key] = data as BankData[];
        });
        setPosData(pos);
        setNeftData(neft);
      })
      .catch(err => {
        console.error('Failed to load month data:', err);
      });
  }, []);

  // Only POS files for POS-based charts
  const posFiles = files.filter(f => f.type === 'pos');

  return (
    <main className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-300 flex flex-col items-center py-8 px-2">
      <div className="w-full flex justify-end max-w-7xl mb-4">
        <RandomThemeButton />
      </div>
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card card-lg bg-base-100 shadow-xl">
          <div className="card-body">
            <BankInfraBarChart allData={posData} months={posFiles.map(f => f.key)} />
          </div>
        </div>
        <div className="card card-lg bg-base-100 shadow-xl flex flex-col justify-center">
          <div className="card-body">
            <CreditCardTimeSeriesChart allData={posData} months={posFiles.map(f => f.key)} />
          </div>
        </div>
      </div>
    </main>
  );
}

export default App;
