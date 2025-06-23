import { useEffect, useState } from 'react';

interface DataFileMeta {
  file: string;
  label: string;
  key: string;
  type?: string;
}
import CreditCardTimeSeriesChart from './features/visualization/components/CreditCardTimeSeriesChart';
import { DATA_FOLDER } from './constants/data';
import BankInfraBarChart from './features/visualization/components/InfraBarChart';



function App() {
  // Manifest and bifurcated data
  const [files, setFiles] = useState<DataFileMeta[]>([]);
  const [posData, setPosData] = useState<{ [key: string]: any[] }>({});
  const [neftData, setNeftData] = useState<{ [key: string]: any[] }>({});

  // Load manifest and then all months' data on mount
  useEffect(() => {
    fetch(`${DATA_FOLDER}/index.json`)
      .then(res => res.json())
      .then((manifest: DataFileMeta[]) => {
        setFiles(manifest);
        return Promise.all(
          manifest.map(f =>
            fetch(`${DATA_FOLDER}/${f.file}`)
              .then(res => res.json())
              .then(data => ({ key: f.key, type: f.type, data }))
          )
        );
      })
      .then(results => {
        const pos: { [key: string]: any[] } = {};
        const neft: { [key: string]: any[] } = {};
        results.forEach(({ key, type, data }) => {
          if (type === 'pos') pos[key] = data;
          else if (type === 'neft') neft[key] = data;
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
  // Only NEFT files for NEFT-based charts (future use)
  // const neftFiles = files.filter(f => f.type === 'neft');

  return (
    <main className="min-h-screen">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section>
          <BankInfraBarChart allData={posData} months={posFiles.map(f => f.key)} />
        </section>
      </section>
      <section className="max-w-5xl mx-auto w-full">
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-center mb-4 tracking-tight">Credit Card Time Series Analysis</h2>
          <CreditCardTimeSeriesChart allData={posData} months={posFiles.map(f => f.key)} />
        </div>
      </section>
    </main>
  );
}

export default App;
