import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import FloatingDock from './components/common/FloatingDock';
import { DATA_FOLDER } from './constants/data';
import CreditCardDashboard from './features/CreditCardDashboard';
import Dashboard from './features/Dashboard';
import FilterLab from './features/FilterLab';
import SVGLab from './features/SVGLab';

import { LayoutContext } from './context/LayoutContext';
import type { BankData } from './types/global.types';


interface DataFileMeta {
  file: string;
  label: string;
  key: string;
  type?: string;
}

function App() {
  const [layout, setLayout] = useState('grid');

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

  const months = files.filter(f => f.type === 'pos').map(f => f.key);
  const posBanksData = Object.fromEntries(
    Object.entries(posData).map(([k, v]) => [k, v?.banks ?? []])
  );

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      <main className="grid min-h-screen">
        {/* Persistent dock, theme, and global UI here */}
        <FloatingDock />
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                posBanksData={posBanksData}
                months={months} />
            }
          />
          <Route
            path="/credit_cards"
            element={<CreditCardDashboard posBanksData={posBanksData} months={months} />}
          />
          <Route path="/filter_lab" element={<FilterLab />} />
          <Route path="/svg_lab" element={<SVGLab />} />
        </Routes>
      </main>
    </LayoutContext.Provider>
  );
}

export default App;
