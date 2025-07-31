// scripts/fetchPos.js
import { POS_CONFIG } from './config.js';
import { fetchRbiExcelData } from './fetch_excel.js';
import { getTargetDate } from './utils.js';

/**
 * Main function to fetch POS/ATM data.
 * It parses command-line arguments and calls the generic fetcher.
 */
const main = async () => {
  try {
    // Parse command-line argument: YYYY_MM
    const { year, month } = getTargetDate(process.argv[2]);

    await fetchRbiExcelData(POS_CONFIG, year, month);
    console.log('POS/ATM data fetching complete!');
  } catch (err) {
    console.error('Error fetching POS/ATM data:', err.message);
    process.exit(1);
  }
};

main();
