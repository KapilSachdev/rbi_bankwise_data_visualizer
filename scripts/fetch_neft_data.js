import fs from 'fs';
import path from 'path';
import https from 'https';

// Constants
const BASE_URL = 'https://www.rbi.org.in/Scripts/NEFTUserView.aspx?Id=';
const BASE_ID = 205; // May 2025 is Id=205
const BASE_YEAR = 2025;
const BASE_MONTH = 5; // May
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// HTTP request options
const httpOptions = {
  headers: {
    'User-Agent': USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },
};

// Utility functions
const getModuleDir = () => path.dirname(new URL(import.meta.url).pathname);

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const getIdForMonth = (targetYear, targetMonth) => {
  const monthsDiff = (targetYear - BASE_YEAR) * 12 + (targetMonth - BASE_MONTH);
  return BASE_ID + monthsDiff;
};

const getTargetDate = (arg) => {
  if (arg && /^\d{2}-\d{4}$/.test(arg)) {
    const [month, year] = arg.split('-').map(Number);
    return { year, month };
  }
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1 - 2;
  if (month < 1) {
    month += 12;
    year -= 1;
  }
  return { year, month };
};

// HTTP operations
const fetchPage = (url) =>
  new Promise((resolve, reject) => {
    https.get(url, httpOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });

const downloadFile = (url, dest) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      ...httpOptions,
      headers: {
        ...httpOptions.headers,
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/octet-stream,*/*;q=0.8',
      },
    };
    https.get(url, options, (res) => {
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => fs.unlink(dest, () => reject(err)));
  });


// HTML processing
const extractXlsxLink = (html) => {
  const match = html.match(/href\s*=\s*['"]([^'"]+\.(xlsx|xls))['"]/i);
  if (!match) return null;
  const href = match[1];
  return href.startsWith('http') ? href : `https://www.rbi.org.in${href}`;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Try to fetch the NEFT page and extract the .xlsx link, retrying if not found.
 * @param {string} url - The NEFT page URL
 * @param {number} maxAttempts - Number of attempts
 * @param {number} delayMs - Delay between attempts (ms)
 * @returns {Promise<string>} - The .xlsx URL
 */
const fetchXlsxLinkWithRetry = async (url, maxAttempts = 5, delayMs = 2000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const html = await fetchPage(url);
    const xlsxUrl = extractXlsxLink(html);
    if (xlsxUrl) {
      return xlsxUrl;
    }
    if (attempt < maxAttempts) {
      console.log(`.xlsx link not found (attempt ${attempt}/${maxAttempts}), retrying in ${delayMs / 1000}s...`);
      await wait(delayMs);
    }
  }
  throw new Error(`No .xlsx link found on page after ${maxAttempts} attempts`);
};

// Main execution
const main = async () => {
  try {
    const { year, month } = getTargetDate(process.argv[2]);
    const paddedMonth = String(month).padStart(2, '0');
    const fileBase = `bankwise_neft_stats_${year}_${paddedMonth}`;
    const id = getIdForMonth(year, month);
    console.log(`Processing NEFT data for ${year}/${paddedMonth} (Id=${id})`);


    const pageUrl = `${BASE_URL}${id}`;
    console.log('Fetching NEFT page:', pageUrl);
    console.log('Looking for .xlsx link (with retry)...');
    const xlsxUrl = await fetchXlsxLinkWithRetry(pageUrl, 5, 2000);
    console.log('Found xlsx:', xlsxUrl);

    const excelDir = path.resolve(getModuleDir(), '../data/excel');
    ensureDir(excelDir);
    const xlsxPath = path.join(excelDir, `${fileBase}.xlsx`);

    console.log('Downloading Excel file...');
    await downloadFile(xlsxUrl, xlsxPath);
    console.log('Downloaded xlsx to', xlsxPath);

    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

main();
