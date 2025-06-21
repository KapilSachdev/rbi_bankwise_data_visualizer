// Node.js script to fetch RBI ATM stats page, extract xlsx link, download, and process to JSON
// Usage: node scripts/fetch_and_process_rbi_xlsx.js <atmid> (e.g., 170 for April 2025)


import fs from 'fs';
import path from 'path';
import https from 'https';
import xlsx from 'xlsx';

const BASE_URL = 'https://www.rbi.org.in/Scripts/ATMView.aspx?atmid=';

async function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}


function fetchXlsxLink(html) {
  // Regex to find the first .xlsx or .XLSX link, single or double quotes, case-insensitive
  const match = html.match(/href\s*=\s*['"]([^'"]+\.xlsx)['"]/i);
  if (!match) throw new Error('No .xlsx link found on page');
  let href = match[1];
  if (!href.startsWith('http')) {
    // Relative link, prepend domain
    href = 'https://www.rbi.org.in' + href;
  }
  return href;
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/octet-stream,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    };
    https.get(url, options, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve());
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}


// Removed processXlsxToJson and all JSON conversion logic. Only Excel download remains.


function getAtmidForMonth(baseAtmid, baseYear, baseMonth, targetYear, targetMonth) {
  // baseMonth and targetMonth are 1-based (Jan=1)
  const monthsDiff = (targetYear - baseYear) * 12 + (targetMonth - baseMonth);
  return baseAtmid + monthsDiff;
}

async function main() {
  // Base: Jan 2025 = atmid 167
  const baseAtmid = 167;
  const baseYear = 2025;
  const baseMonth = 1;

  // Get current date and calculate two months ago
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1; // JS: 0=Jan, 11=Dec; we want 1-based
  month -= 2;
  if (month < 1) {
    month += 12;
    year -= 1;
  }

  const atmid = getAtmidForMonth(baseAtmid, baseYear, baseMonth, year, month);
  const paddedMonth = String(month).padStart(2, '0');
  const fileBase = `rbi_bankwise_${paddedMonth}_${year}`;
  console.log(`Fetching data for ${paddedMonth}/${year} (atmid=${atmid})`);
  const pageUrl = BASE_URL + atmid;
  console.log('Fetching page:', pageUrl);
  const html = await fetchPage(pageUrl);
  console.log('Extracting .xlsx link from HTML...');
  const xlsxUrl = fetchXlsxLink(html);
  console.log('Found xlsx:', xlsxUrl);
  const __dirname = path.dirname(new URL(import.meta.url).pathname);
  const excelDir = path.resolve(__dirname, '../data/excel');
  if (!fs.existsSync(excelDir)) fs.mkdirSync(excelDir, { recursive: true });
  const xlsxPath = path.join(excelDir, `${fileBase}.xlsx`);
  console.log('Downloading Excel file...');
  await downloadFile(xlsxUrl, xlsxPath);
  console.log('Downloaded xlsx to', xlsxPath);
  console.log('Done!');
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
