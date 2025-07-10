
import { useState } from 'react';
import Pills from '../components/filters/Pills';
import TopNInput from '../components/filters/TopNInput';
import RangeSlider from '../components/filters/RangeSlider';
import RadialMenu from '../components/filters/Radial';
import TriangleSwitch from '../components/filters/TriangleSwitch';
import OrbitMenu from '../components/filters/Orbit';
import Doughnut from '../components/filters/Doughnut';

const FilterLab: React.FC = () => {
  // Local state for each filter demo
  // Pills
  const pillsOptions = ['Public', 'Private', 'Foreign'];
  const [pillsValue, setPillsValue] = useState('Public');
  // TopNInput
  const [topN, setTopN] = useState(5);
  // RangeSlider
  const [range, setRange] = useState<[number, number]>([20, 80]);
  // RadialMenu
  const radialOptions = ['Debit', 'Credit', 'UPI', 'IMPS', 'NEFT'];
  const [radial, setRadial] = useState(radialOptions[0]);
  // TriangleSwitch
  const triangleOptions: [string, string, string] = ['Volume', 'Value', 'Count'];
  const [triangle, setTriangle] = useState(triangleOptions[0]);
  // OrbitMenu
  const orbitOptions = ['ATMs', 'PoS', 'MicroATMs', 'QR', 'Cards'];
  const [orbit, setOrbit] = useState(orbitOptions[0]);
  // Doughnut
  const doughnutOptions = ['Retail', 'Corporate', 'SME', 'Agri', 'Other'];
  const [doughnut, setDoughnut] = useState(doughnutOptions[0]);

  return (
    <section className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🧪 Filter Lab</h1>
      <p className="mb-8 text-base-content/70">A staging area for all filter components. Use this page to test, debug, and refine filter UIs and logic in isolation.</p>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Pills</h2>
            <Pills bankTypes={pillsOptions} selected={pillsValue} onSelect={setPillsValue} />
            <div className="mt-2 text-xs opacity-70">Selected: {pillsValue}</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Top N Input</h2>
            <TopNInput value={topN} onChange={setTopN} />
            <div className="mt-2 text-xs opacity-70">Value: {topN}</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Range Slider</h2>
            <RangeSlider min={0} max={100} value={range} onChange={setRange} />
            <div className="mt-2 text-xs opacity-70">Range: {range[0]} - {range[1]}</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Radial Menu</h2>
            <RadialMenu options={radialOptions} selected={radial} onSelect={setRadial} />
            <div className="mt-2 text-xs opacity-70">Selected: {radial}</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Triangle Switch</h2>
            <TriangleSwitch options={triangleOptions} selected={triangle} onSelect={setTriangle} />
            <div className="mt-2 text-xs opacity-70">Selected: {triangle}</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Orbit Menu</h2>
            <OrbitMenu options={orbitOptions} selected={orbit} onSelect={setOrbit} />
            <div className="mt-2 text-xs opacity-70">Selected: {orbit}</div>
          </div>
        </div>
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Doughnut Menu</h2>
            <Doughnut options={doughnutOptions} selected={doughnut} onSelect={setDoughnut} />
            <div className="mt-2 text-xs opacity-70">Selected: {doughnut}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FilterLab;
