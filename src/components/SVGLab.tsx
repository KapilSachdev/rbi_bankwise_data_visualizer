import { useState } from 'react';
import SVGIcon from './common/SVGIcon';

const iconNames = [
  'menu', 'chart', 'paint_roller', 'github',
  'grid', 'layers', 'info', 'arrow',
  'credit-card', 'nested_circle', 'smartphone', 'triangle',
];

const SVGLab: React.FC = () => {
  const [search, setSearch] = useState('');
  const filteredIcons = iconNames.filter(name => name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="p-4 sm:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8">SVG Lab</h1>
      <input
        type="text"
        className="input input-bordered w-full mb-4 sm:mb-8"
        placeholder="Search icons..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        aria-label="Search icons"
      />
      <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {filteredIcons.map(name => (
          <div key={name} className="flex flex-col items-center p-2 sm:p-4 bg-base-100 rounded-selector border border-base-300 shadow hover:shadow-lg transition">
            <SVGIcon icon={name} className="size-16 sm:size-20 md:size-24 mb-2 text-primary" />
            <span className="text-xs font-mono select-all break-all text-base-content/80">{name}</span>
          </div>
        ))}
        {filteredIcons.length === 0 && (
          <div className="col-span-full text-center text-base-content/60">No icons found.</div>
        )}
      </div>
    </section>
  );
};

export default SVGLab;
