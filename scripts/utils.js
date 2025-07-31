import fs from 'fs';
import https from 'https';
import path from 'path';

import { BANK_ACRONYMS } from '../data/bank_acronyms.js';


const normalize = (s) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    // Canonicalize common suffixes
    .replace(/\b(limited|ltd|ltd.)\b/g, "ltd")
    .replace(/\b(corporation|corp)\b/g, "corp")
    .replace(/\b(company|co)\b/g, "co")
    .replace(/\b(bank)\b/g, "bank")
    .trim();

const isBankNameSimilar = (a, b) => {
  a = normalize(a)
  b = normalize(b)
  return a === b || a.startsWith(b) || b.startsWith(a);
};


/**
 * Returns the short acronym for a given bank name, or the trimmed name if not found.
 */
export const mapBankShortName = (bankName) => {
  if (!bankName || typeof bankName !== "string") return "";
  for (const [shortName, obj] of Object.entries(BANK_ACRONYMS)) {
    if (Array.isArray(obj.names) && obj.names.some(fullName => isBankNameSimilar(bankName, fullName))) {
      return shortName;
    }
  }
  return bankName.trim();
};

export const mapFullNameFromShortName = (shortName) => {
  if (!shortName || typeof shortName !== "string") return "";
  const obj = BANK_ACRONYMS[shortName];
  if (obj && Array.isArray(obj.names) && obj.names.length > 0)
    return obj.names[0]; // Return the first full name
  return "";
};

/**
 * Returns the bank type for a given bank name, or 'Unknown' if not found.
 */
export const getBankTypeByName = (bankName) => {
  if (!bankName || typeof bankName !== "string") return "Unknown";
  for (const obj of Object.values(BANK_ACRONYMS)) {
    if (Array.isArray(obj.names) && obj.names.some(fullName => isBankNameSimilar(bankName, fullName))) {
      return obj.Bank_Type || "Unknown";
    }
  }
  return "Unknown";
};


/**
 * Gets the directory of the current module.
 * @returns {string} The absolute path to the module's directory.
 */
export const getModuleDir = () => path.dirname(new URL(import.meta.url).pathname);

/**
 * Ensures that a directory exists, creating it recursively if it doesn't.
 * @param {string} dir - The directory path to ensure.
 */
export const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Parses a date argument (YYYY_MM) or calculates a default date (current month - 2).
 * @param {string | undefined} arg - The date argument in 'YYYY_MM' format, or undefined for default.
 * @returns {{year: number, month: number}} An object containing the target year and month.
 */
export const getTargetDate = (arg) => {
  if (arg && /^\d{4}_\d{2}$/.test(arg)) {
    const [year, month] = arg.split('_').map(Number);
    return { year, month };
  }

  // Default to current month minus 2
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1 - 2; // getMonth() is 0-indexed, so +1 for actual month, then -2
  if (month < 1) {
    month += 12;
    year -= 1;
  }
  return { year, month };
};

/**
 * Fetches the content of a given URL.
 * @param {string} url - The URL to fetch.
 * @param {object} options - HTTP request options, including headers.
 * @returns {Promise<string>} A promise that resolves with the page content as a string.
 */
export const fetchPage = (url, options) =>
  new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });

/**
 * Downloads a file from a given URL to a destination path.
 * @param {string} url - The URL of the file to download.
 * @param {string} dest - The local path where the file should be saved.
 * @param {object} options - HTTP request options, including headers.
 * @returns {Promise<void>} A promise that resolves when the file is successfully downloaded.
 */
export const downloadFile = (url, dest, options) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, options, (res) => {
      // Check for HTTP redirects (3xx status codes)
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.warn(`Redirecting to ${res.headers.location}`);
        file.close(() => {
          fs.unlink(dest, () => { // Delete the partially created file
            downloadFile(res.headers.location, dest, options).then(resolve).catch(reject);
          });
        });
        return;
      }

      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      // Clean up the partially downloaded file on error
      fs.unlink(dest, () => reject(err));
    });
  });

/**
 * Extracts the .xlsx or .xls link from HTML content.
 * @param {string} html - The HTML content to parse.
 * @returns {string | null} The absolute URL of the Excel file, or null if not found.
 */
export const extractXlsxLink = (html) => {
  const match = html.match(/href\s*=\s*['"]([^'"]+\.(xlsx|xls))['"]/i);
  if (!match) return null;
  const href = match[1];
  // Ensure the URL is absolute
  return href.startsWith('http') ? href : `https://www.rbi.org.in${href}`;
};

/**
 * Pauses execution for a specified duration.
 * @param {number} ms - The duration to wait in milliseconds.
 * @returns {Promise<void>} A promise that resolves after the specified delay.
 */
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Tries to fetch a page and extract an .xlsx link, with retries.
 * @param {string} url - The URL of the page to fetch.
 * @param {object} httpOptions - HTTP request options for fetching the page.
 * @param {number} maxAttempts - Maximum number of attempts.
 * @param {number} delayMs - Delay between attempts in milliseconds.
 * @returns {Promise<string>} The .xlsx URL.
 * @throws {Error} If no .xlsx link is found after maxAttempts.
 */
export const fetchXlsxLinkWithRetry = async (url, httpOptions, maxAttempts, delayMs) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(`Fetching page and looking for .xlsx link (attempt ${attempt}/${maxAttempts})...`);
    const html = await fetchPage(url, httpOptions);
    const xlsxUrl = extractXlsxLink(html);
    if (xlsxUrl) {
      return xlsxUrl;
    }
    if (attempt < maxAttempts) {
      console.log(`.xlsx link not found, retrying in ${delayMs / 1000}s...`);
      await wait(delayMs);
    }
  }
  throw new Error(`No .xlsx link found on page after ${maxAttempts} attempts: ${url}`);
};
