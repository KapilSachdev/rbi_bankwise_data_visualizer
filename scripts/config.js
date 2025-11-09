// Common constants across all configurations
const COMMON_CONSTANTS = {
  USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  // Standard HTTP headers for page fetching
  HTTP_PAGE_HEADERS: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },
  // Standard HTTP headers for file downloading (Excel)
  HTTP_FILE_HEADERS: {
    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,application/octet-stream,*/*;q=0.8',
  },
  MAX_FETCH_ATTEMPTS: 2, // Maximum retries for fetching XLSX link
  RETRY_DELAY_MS: 2000,  // Delay between retries in milliseconds
};

/**
 * Configuration for NEFT (National Electronic Funds Transfer) data.
 */
export const NEFT_CONFIG = {
  ...COMMON_CONSTANTS,
  TYPE: 'NEFT',
  BASE_URL: 'https://www.rbi.org.in/Scripts/NEFTUserView.aspx?Id=',
  BASE_ID: 205,      // Starting ID for May 2025
  BASE_YEAR: 2025,   // Base year for ID calculation
  BASE_MONTH: 5,     // Base month (May) for ID calculation
  OUTPUT_SUBDIR: 'neft', // Subdirectory within data/excel for NEFT files
  FILE_NAME_PREFIX: 'bankwise_neft_stats', // Prefix for downloaded NEFT files
  /**
   * Calculates the ID for a given target year and month based on NEFT base values.
   * @param {number} targetYear - The target year.
   * @param {number} targetMonth - The target month (1-12).
   * @returns {number} The calculated ID.
   */
  idCalculator: (targetYear, targetMonth) => {
    const monthsDiff = (targetYear - NEFT_CONFIG.BASE_YEAR) * 12 + (targetMonth - NEFT_CONFIG.BASE_MONTH);
    return NEFT_CONFIG.BASE_ID + monthsDiff;
  },
};

/**
 * Configuration for ATM (Automated Teller Machine) / POS (Point of Sale) data.
 */
export const POS_CONFIG = {
  ...COMMON_CONSTANTS,
  TYPE: 'POS',
  BASE_URL: 'https://www.rbi.org.in/Scripts/ATMView.aspx?atmid=',
  BASE_ID: 167,      // Starting ATM ID (atmid) for January 2025
  BASE_YEAR: 2025,   // Base year for ATM ID calculation
  BASE_MONTH: 1,     // Base month (January) for ATM ID calculation
  OUTPUT_SUBDIR: 'pos', // Subdirectory within data/excel for POS files
  FILE_NAME_PREFIX: 'bankwise_pos_stats', // Prefix for downloaded POS files
  /**
   * Calculates the ATM ID for a given target year and month based on POS base values.
   * @param {number} targetYear - The target year.
   * @param {number} targetMonth - The target month (1-12).
   * @returns {number} The calculated ATM ID.
   */
  idCalculator: (targetYear, targetMonth) => {
    const monthsDiff = (targetYear - POS_CONFIG.BASE_YEAR) * 12 + (targetMonth - POS_CONFIG.BASE_MONTH);
    return POS_CONFIG.BASE_ID + monthsDiff;
  },
};
