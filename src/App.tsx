import { useEffect, useState, useMemo } from 'react';
import { DATA_FOLDER } from './constants/data';
import DataFilter from './components/common/DataFilter';
import BankInfraBarChart from './features/visualization/components/InfraBarChart';


// Dynamically list all available months (add more as needed)
const FILES = [
  {
    file: `${DATA_FOLDER}/bankwise_pos_stats_03_2025.json`,
    label: 'March 2025',
    key: '2025-03',
  },
  {
    file: `${DATA_FOLDER}/bankwise_pos_stats_04_2025.json`,
    label: 'April 2025',
    key: '2025-04',
  },
];

function getUniqueBankTypes(data: any[]): string[] {
  return Array.from(new Set(data.map((d) => d.Bank_Type)));
}



function App() {
  // State for all months' data
  const [allData, setAllData] = useState<{ [key: string]: any[] }>({});
  const [selectedBankType, setSelectedBankType] = useState('');
  // For MoM/YoY or time series, allow user to select any two months
  const [selectedMonths, setSelectedMonths] = useState<string[]>(['2025-03', '2025-04']);
  // For legacy charts, allow user to select month (default to latest)
  const [selectedMonthKey, setSelectedMonthKey] = useState(FILES[FILES.length - 1].key);

  // Load all months' data on mount
  useEffect(() => {
    Promise.all(
      FILES.map(f => fetch(f.file).then(res => res.json()).then(data => [f.key, data]))
    ).then(entries => {
      setAllData(Object.fromEntries(entries));
    }).catch(err => {
      console.error('Failed to load month data:', err);
    });
  }, []);

  // For filter dropdowns (now using { label, value })
  const monthOptions = useMemo(() => FILES.map(f => ({ label: f.label, value: f.key })), []);
  const bankTypes = useMemo(() => {
    const current = allData[selectedMonthKey] || [];
    return current.length ? getUniqueBankTypes(current) : [];
  }, [allData, selectedMonthKey]);

  // For legacy charts, use selected month and filter by bank type
  const filteredData = useMemo(() => {
    const data = allData[selectedMonthKey] || [];
    if (!selectedBankType) return data;
    return data.filter((d) => d.Bank_Type === selectedBankType);
  }, [allData, selectedMonthKey, selectedBankType]);

  return (
    <main className="min-h-screen">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section>
          {/* BankInfraBarChart: unified infra chart with metric dropdown */}
          <DataFilter
            bankTypes={bankTypes}
            selectedBankType={selectedBankType}
            onBankTypeChange={setSelectedBankType}
            filters={{ bankType: true }}
          />
          {filteredData.length > 0 && <BankInfraBarChart data={filteredData} />}
        </section>
      </section>
    </main>
  );
}

export default App;
