import fs from 'fs';
import path from 'path';
import {
  downloadFile,
  ensureDir,
  fetchXlsxLinkWithRetry,
  getModuleDir
} from './utils.js';

/**
 * Fetches and downloads an Excel file from the RBI website based on the provided configuration.
 * @param {object} config - The configuration object for the specific data type (e.g., NEFT_CONFIG, POS_CONFIG).
 * @param {number} targetYear - The target year for the data.
 * @param {number} targetMonth - The target month (1-12) for the data.
 * @returns {Promise<string>} A promise that resolves with the path to the downloaded Excel file.
 * @throws {Error} If any step of the fetching or downloading fails.
 */
export const fetchRbiExcelData = async (config, targetYear, targetMonth, force = false) => {
  const {
    TYPE,
    BASE_URL,
    USER_AGENT,
    HTTP_PAGE_HEADERS,
    HTTP_FILE_HEADERS,
    MAX_FETCH_ATTEMPTS,
    RETRY_DELAY_MS,
    idCalculator,
    OUTPUT_SUBDIR,
    FILE_NAME_PREFIX,
  } = config;

  const paddedMonth = String(targetMonth).padStart(2, '0');
  const fileBase = `${FILE_NAME_PREFIX}_${targetYear}_${paddedMonth}`;
  const id = idCalculator(targetYear, targetMonth);

  console.log(`Processing ${TYPE} data for ${targetYear}/${paddedMonth} (ID/ATMID=${id})`);

  const excelDir = path.resolve(getModuleDir(), `../data/excel/${OUTPUT_SUBDIR}`);
  ensureDir(excelDir);
  const xlsxPath = path.join(excelDir, `${fileBase}.xlsx`);

  if (force && fs.existsSync(xlsxPath)) {
    console.log(`[--force] Removing existing: ${xlsxPath}`);
    try {
      fs.unlinkSync(xlsxPath);
    } catch (error) {
      console.error(`Error removing file ${xlsxPath}:`, error);
    }
  }

  // Check if the file already exists to avoid re-downloading
  if (fs.existsSync(xlsxPath)) {
    console.log(`File already exists: ${xlsxPath}`);
    return xlsxPath;
  }

  const pageUrl = `${BASE_URL}${id}`;
  console.log(`Fetching ${TYPE} page: ${pageUrl}`);

  // Combine common headers with specific page headers
  const pageHttpOptions = {
    headers: {
      'User-Agent': USER_AGENT,
      ...HTTP_PAGE_HEADERS,
    },
  };

  const xlsxUrl = await fetchXlsxLinkWithRetry(pageUrl, pageHttpOptions, MAX_FETCH_ATTEMPTS, RETRY_DELAY_MS);
  console.log('Found xlsx:', xlsxUrl);

  console.log('Downloading Excel file...');
  // Combine common headers with specific file headers
  const fileHttpOptions = {
    headers: {
      'User-Agent': USER_AGENT,
      ...HTTP_FILE_HEADERS,
    },
  };

  await downloadFile(xlsxUrl, xlsxPath, fileHttpOptions);
  console.log(`Downloaded xlsx to ${xlsxPath}`);

  return xlsxPath;
};
