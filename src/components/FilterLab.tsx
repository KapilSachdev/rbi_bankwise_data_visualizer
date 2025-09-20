
import { useState } from 'react';
import Pills from './filters/Pills';
import TopNInput from './filters/TopNInput';
import RangeSlider from './filters/RangeSlider';
import RadialMenu from './filters/Radial';
import TriangleSwitch from './filters/TriangleSwitch';
import OrbitMenu from './filters/Orbit';
import Doughnut from './filters/Doughnut';
import Typeahead from './common/Typeahead';
import { BANK_TYPES } from '../constants/data';


const FilterLab: React.FC = () => {
  // Local state for each filter demo
  // Pills
  const pillsOptions = BANK_TYPES;
  const [pillsValue, setPillsValue] = useState(BANK_TYPES[0]);
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

  // Typeahead
  const typeaheadOptions = [
    { label: 'State Bank of India', value: 'State Bank of India', shortName: 'SBI' },
    { label: 'HDFC Bank', value: 'HDFC Bank', shortName: 'HDFC' },
    { label: 'ICICI Bank', value: 'ICICI Bank', shortName: 'ICICI' },
    { label: 'Axis Bank', value: 'Axis Bank', shortName: 'AXIS' },
    { label: 'Kotak Mahindra Bank', value: 'Kotak Mahindra Bank', shortName: 'KOTAK' },
    { label: 'IndusInd Bank', value: 'IndusInd Bank', shortName: 'INDUSIND' },
    { label: 'IDFC First Bank', value: 'IDFC First Bank', shortName: 'IDFCFirst' },
    { label: 'Bank of Baroda', value: 'Bank of Baroda', shortName: 'BOB' },
  ];

  const [typeahead, setTypeahead] = useState(typeaheadOptions[0].value);

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-6">Filter Lab</h1>
      <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
        <div className="card bg-base-100 shadow border border-base-300">
          <div className="card-body">
            <h2 className="card-title">Typeahead Search</h2>
            <Typeahead
              options={typeaheadOptions}
              selectedValue={typeahead}
              onSelect={setTypeahead}
              placeholder="Search banks..."
            />
            <div className="mt-2 text-xs opacity-70">Selected: {typeahead}</div>
          </div>
        </div>
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
