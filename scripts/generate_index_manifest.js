import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../public/assets/data');
const OUTPUT_PATH = path.join(__dirname, '../public/assets/data/index.json');

// Helper to extract type and date from filename

function parseFileInfo(filename) {
  // Example: bankwise_neft_stats_2025_04.json or bankwise_pos_stats_2024_12.json
  const match = filename.match(/^bankwise_(neft|pos)_stats_(\d{4})_(\d{2})\.json$/);
  if (!match) return null;
  const [, type, year, month] = match;
  return {
    type,
    file: filename,
    key: `${year}-${month}`,
    label:
      type === 'neft'
        ? `${monthName(month)} ${year}`
        : `${monthName(month)} ${year}`,
  };
}


function monthName(mm) {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ][parseInt(mm, 10) - 1];
}


async function main() {
  const files = await fs.readdir(DATA_DIR);
  const manifest = { neft: [], pos: [] };

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const info = parseFileInfo(file);
    if (!info) continue;
    manifest[info.type].push({
      type: info.type,
      file: info.file,
      label: info.label,
      key: info.key,
    });
  }

  // Sort by key descending (latest first)
  manifest.neft.sort((a, b) => b.key.localeCompare(a.key));
  manifest.pos.sort((a, b) => b.key.localeCompare(a.key));

  // Ensure output directory exists
  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Manifest written to ${OUTPUT_PATH}`);
}

main();
