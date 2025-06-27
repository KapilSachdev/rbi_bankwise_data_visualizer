import fs from 'fs';
import path from 'path';
import https from 'https';

// Constants
const BASE_URL = 'https://www.rbi.org.in/Scripts/ATMView.aspx?atmid=';
const BASE_ATMID = 167;
const BASE_YEAR = 2025;
const BASE_MONTH = 1;
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

const getAtmidForMonth = (targetYear, targetMonth) => {
  const monthsDiff = (targetYear - BASE_YEAR) * 12 + (targetMonth - BASE_MONTH);
  return BASE_ATMID + monthsDiff;
};

const getTargetDate = (arg) => {
  if (arg && /^\d{4}_\d{2}$/.test(arg)) {
    const [year, month] = arg.split('_').map(Number);
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
  if (!match) throw new Error('No .xlsx link found on page');
  const href = match[1];
  return href.startsWith('http') ? href : `https://www.rbi.org.in${href}`;
};

const monthArg = process.argv.find(arg => arg.startsWith('--month='));
let yearMonth = null;
if (monthArg) {
  yearMonth = monthArg.split('=')[1];
}

// Main execution
const main = async () => {
  try {
    const { year, month } = getTargetDate(yearMonth);
    const paddedMonth = String(month).padStart(2, '0');
    const fileBase = `bankwise_pos_stats_${year}_${paddedMonth}`;

    // Check if the file already exists, and if it does return early
    const excelDir = path.resolve(getModuleDir(), '../data/excel');
    ensureDir(excelDir);
    const xlsxPath = path.join(excelDir, `${fileBase}.xlsx`);
    if (fs.existsSync(xlsxPath)) {
      console.log(`File already exists: ${xlsxPath}`);
      return;
    }

    const atmid = getAtmidForMonth(year, month);
    console.log(`Processing data for ${year}/${paddedMonth} (atmid=${atmid})`);

    const pageUrl = `${BASE_URL}${atmid}`;
    console.log('Fetching page:', pageUrl);
    const html = await fetchPage(pageUrl);

    console.log('Extracting .xlsx link...');
    const xlsxUrl = extractXlsxLink(html);
    console.log('Found xlsx:', xlsxUrl);


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
