import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import FloatingDock from './components/common/FloatingDock';
import { DATA_FOLDER } from './constants/data';
import CreditCardDashboard from './components/CreditCardDashboard';
import Dashboard from './components/Dashboard';
import FilterLab from './components/FilterLab';
import SVGLab from './components/SVGLab';

import BankProfileDashboard from './components/BankProfileDashboard';

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
  // For Digital Banking, keep the full object (with NEFT, RTGS, Mobile_Banking, Internet_Banking arrays)
  const [digitalBankingData, setDigitalBankingData] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    Promise.all([
      fetch(`${DATA_FOLDER.pos}/index.json`).then(res => res.json()),
      fetch(`${DATA_FOLDER.neft}/index.json`).then(res => res.json())
    ])
      .then(([posManifest, neftManifest]) => {
        const allFiles = [
          ...(neftManifest.neft || []).map((f: any) => ({ ...f, type: 'neft' })),
          ...(posManifest.pos || []).map((f: any) => ({ ...f, type: 'pos' })),
        ];
        setFiles(allFiles);
        const allMeta = [
          ...(neftManifest.neft || []).map((f: any) => ({ ...f, type: 'neft' })),
          ...(posManifest.pos || []).map((f: any) => ({ ...f, type: 'pos' })),
        ];
        return Promise.all(
          allMeta.map(f =>
            fetch(`${DATA_FOLDER[f.type]}/${f.file}`)
              .then(res => res.json())
              .then(data => ({ key: f.key, type: f.type, data }))
          )
        );
      })
      .then(results => {
        const pos: { [key: string]: { banks: BankData[]; summary?: unknown } } = {};
        const digital: { [key: string]: any } = {};
        results.forEach((result) => {
          const { key, type, data } = result as { key: string; type: string; data: any };
          if (type === 'pos') pos[key] = data;
          if (type === 'neft') {
            digital[key] = data;
          }
        });
        setPosData(pos);
        setDigitalBankingData(digital);
      })
      .catch(err => {
        console.error('Failed to load data:', err);
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
                months={months}
              />
            }
          />
          <Route
            path="/cards"
            element={<CreditCardDashboard posBanksData={posBanksData} months={months} />}
          />
          <Route path="/filter_lab" element={<FilterLab />} />
          <Route path="/svg_lab" element={<SVGLab />} />
          <Route
            path="/bank_profile"
            element={
              <BankProfileDashboard
                posBanksData={posBanksData}
                digitalBankingData={digitalBankingData}
                months={months}
              />
            }
          />
        </Routes>
      </main>
    </LayoutContext.Provider>
  );
}

export default App;
