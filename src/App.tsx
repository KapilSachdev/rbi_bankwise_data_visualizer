import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import RandomThemeButton from './components/common/RandomThemeButton';
import { DATA_FOLDER } from './constants/data';
import Dashboard from './features/Dashboard';
import FilterLab from './features/FilterLab';
import SVGLab from './features/SVGLab';
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

  return (
    <main className="grid">
      {/* Persistent dock, theme, and global UI here */}
      <RandomThemeButton />
      <Routes>
        <Route
          path="/"
          element={
            <Dashboard
              posBanksData={posBanksData}
              posFiles={posFiles}
            />
          }
        />
        <Route path="/filter-lab" element={<FilterLab />} />
        <Route path="/svg-lab" element={<SVGLab />} />
      </Routes>
    </main>
  );
}

export default App;
