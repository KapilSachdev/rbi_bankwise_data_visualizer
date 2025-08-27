import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../public/assets/data');

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
    label: `${monthName(month)} ${year}`,
  };
}


function monthName(mm) {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ][parseInt(mm, 10) - 1];
}


async function main() {
  const subdirs = ['neft', 'pos'];

  for (const subdir of subdirs) {
    const subdirPath = path.join(DATA_DIR, subdir);
    const files = await fs.readdir(subdirPath);
    const manifest = [];

    for (const file of files) {
      if (!file.endsWith('.json') || file === 'index.json') continue;
      const info = parseFileInfo(file);
      if (!info) continue;
      manifest.push({
        type: info.type,
        file: info.file,
        label: info.label,
        key: info.key,
      });
    }

    // Sort by key descending (latest first)
    manifest.sort((a, b) => b.key.localeCompare(a.key));

    // Ensure output directory exists (though it should already)
    const outputPath = path.join(subdirPath, 'index.json');
    const outputData = { [subdir]: manifest };
    await fs.writeFile(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`Manifest written to ${outputPath}`);
  }
}

main();
