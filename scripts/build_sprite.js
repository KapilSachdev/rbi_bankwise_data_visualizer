// Generate SVG sprite from all SVGs in src/assets/icons/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = path.join(__dirname, '../src/assets/icons');
const SPRITE_PATH = path.join(__dirname, '../public/assets/icons.svg');

function getSymbolId(filename) {
  return path.basename(filename, '.svg').toLowerCase().replace(/[^a-z0-9_-]/g, '-');
}

function extractSvgContent(svg, filename) {
  // Remove XML declaration and comments
  svg = svg.replace(/<\?xml.*?\?>/g, '').replace(/<!--.*?-->/gs, '');
  // Extract viewBox
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  if (!viewBoxMatch) {
    console.warn(`Warning: SVG file '${filename}' is missing a viewBox attribute. Skipping.`);
    return null;
  }
  const viewBox = viewBoxMatch[1];
  // Extract inner content (everything inside <svg>...</svg>)
  const inner = svg.replace(/^[\s\S]*?<svg[^>]*>/i, '').replace(/<\/svg>[\s\S]*$/i, '');
  return { viewBox, inner };
}

function minifyInnerSvg(inner) {
  return inner.replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

function buildSprite() {
  const files = fs.readdirSync(ICONS_DIR).filter(f => f.endsWith('.svg'));
  let processed = 0;
  const symbols = files.map(file => {
    const svg = fs.readFileSync(path.join(ICONS_DIR, file), 'utf8');
    const result = extractSvgContent(svg, file);
    if (!result) return null;
    processed++;
    const { viewBox, inner } = result;
    const id = getSymbolId(file);
    const minInner = minifyInnerSvg(inner);
    return `<symbol id="${id}" viewBox="${viewBox}">${minInner}</symbol>`;
  }).filter(Boolean);
  const sprite = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols.join('')}</svg>\n`;
  fs.writeFileSync(SPRITE_PATH, sprite, 'utf8');
  console.log(`SVG sprite generated with ${processed} icons at ${SPRITE_PATH}`);
}

buildSprite();
