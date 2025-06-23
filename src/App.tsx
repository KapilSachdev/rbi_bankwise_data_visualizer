
import { DATA_FOLDER } from './constants/data';
import './App.css';
import ATMBarChart from './components/infra/ATMBarChart';
import CardInfraBarChart from './components/infra/CardsBarChart';
import DataFilter from './components/DataFilter';
import { useEffect, useState, useMemo } from 'react';

const FILES = [
  {
    file: `${DATA_FOLDER}/bankwise_pos_stats_04_2025.json`,
    month: 'April',
    year: '2025',
  },
];

function getUniqueBankTypes(data: any[]): string[] {
  return Array.from(new Set(data.map((d) => d.Bank_Type)));
}

function App() {
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('April');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [selectedBankType, setSelectedBankType] = useState('');

  // For demo, only one file/month/year. Extend for more files as needed.
  useEffect(() => {
    const fileObj = FILES.find(f => f.month === selectedMonth && f.year === selectedYear);
    if (!fileObj) return;
    fetch(fileObj.file)
      .then((res) => res.json())
      .then((data) => setParsedData(data))
      .catch((err) => {
        console.error('Failed to fetch data:', err);
        setParsedData([]);
      });
  }, [selectedMonth, selectedYear]);

  const months = useMemo(() => FILES.map(f => f.month), []);
  const years = useMemo(() => FILES.map(f => f.year), []);
  const bankTypes = useMemo(() => parsedData.length ? getUniqueBankTypes(parsedData) : [], [parsedData]);

  const filteredData = useMemo(() => {
    if (!selectedBankType) return parsedData;
    return parsedData.filter((d) => d.Bank_Type === selectedBankType);
  }, [parsedData, selectedBankType]);

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 p-2 md:p-6">
      <DataFilter
        months={months}
        years={years}
        bankTypes={bankTypes}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        selectedBankType={selectedBankType}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onBankTypeChange={setSelectedBankType}
      />
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section>
          {filteredData.length > 0 && <ATMBarChart data={filteredData} />}
        </section>
        <section>
          {filteredData.length > 0 && <CardInfraBarChart data={filteredData} />}
        </section>
      </section>
    </main>
  );
}

export default App;
