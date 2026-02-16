// scripts/fetchNeft.js
import { NEFT_CONFIG } from './config.js';
import { fetchRbiExcelData } from './fetch_excel.js';
import { getTargetDate } from './utils.js';

/**
 * Main function to fetch NEFT data.
 * It parses command-line arguments and calls the generic fetcher.
 */
const main = async () => {
  try {
    // Parse command-line argument: --month=YYYY_MM
    const monthArg = process.argv.find(arg => arg.startsWith('--month='));
    const { year, month } = getTargetDate(monthArg);
    // Remove existing file and force re-download
    const force = process.argv.some(arg => ['--force', '-f'].includes(arg));

    await fetchRbiExcelData(NEFT_CONFIG, year, month, force);
    console.log('NEFT data fetching complete!');
  } catch (err) {
    console.error('Error fetching NEFT data:', err.message);
    process.exit(1);
  }
};

main();
