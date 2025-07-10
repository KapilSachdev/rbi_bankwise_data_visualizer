import { useState } from 'react';
import SVGIcon from '../components/common/SVGIcon';

const iconNames = [
  'menu',
  'chart',
  'paint_roller',
  'github',
];

const SVGLab: React.FC = () => {
  const [search, setSearch] = useState('');
  const filteredIcons = iconNames.filter(name => name.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-6">SVG Lab</h1>
      <input
        type="text"
        className="input input-bordered w-full mb-6"
        placeholder="Search icons..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        aria-label="Search icons"
      />
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredIcons.map(name => (
          <div key={name} className="flex flex-col items-center p-4 bg-base-100 rounded-lg border border-base-300 shadow hover:shadow-lg transition">
            <SVGIcon icon={name} className="size-24 mb-2 text-primary" />
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
