
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { mapBankShortName, getBankTypeByName, mapFullNameFromShortName } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function setNestedObject(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    current[keys[i]] = current[keys[i]] || {};
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = isNaN(value) ? value : Number(value);
}

const columnMapping = [
  { col: 0, path: 'Sr_No', pre_2022_03_Col: 0, pre_2020_05_Col: 0 },
  { col: 1, path: 'Bank_Name', pre_2022_03_Col: 1, pre_2020_05_Col: 1 },
  { col: 2, path: 'Infrastructure.ATMs_CRMs.On_site', pre_2022_03_Col: 2, pre_2020_05_Col: 2 },
  { col: 3, path: 'Infrastructure.ATMs_CRMs.Off_site', pre_2022_03_Col: 3, pre_2020_05_Col: 3 },
  { col: 4, path: 'Infrastructure.PoS', pre_2022_03_Col: 4, pre_2020_05_Col: 4 },
  { col: 5, path: 'Infrastructure.Micro_ATMs', pre_2022_03_Col: 6 },
  { col: 6, path: 'Infrastructure.Bharat_QR_Codes', pre_2022_03_Col: 7 },
  { col: 7, path: 'Infrastructure.UPI_QR_Codes' },
  { col: 8, path: 'Infrastructure.Credit_Cards', pre_2022_03_Col: 8, pre_2020_05_Col: 6 },
  { col: 9, path: 'Infrastructure.Debit_Cards', pre_2022_03_Col: 13, pre_2020_05_Col: 11 },
  { col: 10, path: 'Card_Payments_Transactions.Credit_Card.at_PoS.Volume', pre_2022_03_Col: 10, pre_2020_05_Col: 8 },
  { col: 11, path: 'Card_Payments_Transactions.Credit_Card.at_PoS.Value', pre_2022_03_Col: 12, pre_2020_05_Col: 10 },
  { col: 12, path: 'Card_Payments_Transactions.Credit_Card.Online_ecom.Volume' },
  { col: 13, path: 'Card_Payments_Transactions.Credit_Card.Online_ecom.Value' },
  { col: 14, path: 'Card_Payments_Transactions.Credit_Card.Others.Volume' },
  { col: 15, path: 'Card_Payments_Transactions.Credit_Card.Others.Value' },
  { col: 16, path: 'Card_Payments_Transactions.Credit_Card.Cash_Withdrawal.At_ATM.Volume', pre_2022_03_Col: 9, pre_2020_05_Col: 7 },
  { col: 17, path: 'Card_Payments_Transactions.Credit_Card.Cash_Withdrawal.At_ATM.Value', pre_2022_03_Col: 11, pre_2020_05_Col: 9 },
  { col: 18, path: 'Card_Payments_Transactions.Debit_Card.at_PoS.Volume', pre_2022_03_Col: 15, pre_2020_05_Col: 13 },
  { col: 19, path: 'Card_Payments_Transactions.Debit_Card.at_PoS.Value', pre_2022_03_Col: 17, pre_2020_05_Col: 15 },
  { col: 20, path: 'Card_Payments_Transactions.Debit_Card.Online_ecom.Volume' },
  { col: 21, path: 'Card_Payments_Transactions.Debit_Card.Online_ecom.Value' },
  { col: 22, path: 'Card_Payments_Transactions.Debit_Card.Others.Volume' },
  { col: 23, path: 'Card_Payments_Transactions.Debit_Card.Others.Value' },
  { col: 24, path: 'Card_Payments_Transactions.Debit_Card.Cash_Withdrawal.At_ATM.Volume', pre_2022_03_Col: 14, pre_2020_05_Col: 12 },
  { col: 25, path: 'Card_Payments_Transactions.Debit_Card.Cash_Withdrawal.At_ATM.Value', pre_2022_03_Col: 16, pre_2020_05_Col: 14 },
  { col: 26, path: 'Card_Payments_Transactions.Debit_Card.Cash_Withdrawal.At_PoS.Volume' },
  { col: 27, path: 'Card_Payments_Transactions.Debit_Card.Cash_Withdrawal.At_PoS.Value' },
];


// Process all Excel files in data/excel, only if corresponding JSON does not exist
const excelDir = path.resolve(__dirname, '../data/excel');
const jsonDir = path.resolve(__dirname, '../public/assets/data');

let filePrefix = 'bankwise_pos_stats_';
const fileArg = process.argv.find(arg => arg.startsWith('--month='));
if (fileArg) {
  const filename = fileArg.split('=')[1];
  if (filename) {
    filePrefix = `bankwise_pos_stats_${filename}`;
  }
}

const forceFlag = process.argv.includes('--force');

const extractYearMonthFromFilename = (filename) => {
  const match = filename.match(/bankwise_pos_stats_(\d{4})_(\d{2})/i);
  return match ? { year: parseInt(match[1]), month: parseInt(match[2]) } : null;
};


fs.readdirSync(excelDir)
  .filter(file => file.startsWith(filePrefix) && file.endsWith('.xlsx'))
  .forEach(excelFile => {
    const baseName = path.basename(excelFile, '.xlsx');
    const jsonFile = `${baseName}.json`;
    const jsonFilePath = path.join(jsonDir, jsonFile);
    if (!forceFlag && fs.existsSync(jsonFilePath)) {
      console.log(`Skipping ${excelFile} (JSON already exists)`);
      return;
    }
    try {
      const excelFilePath = path.join(excelDir, excelFile);
      const fileBuffer = fs.readFileSync(excelFilePath);
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const jsonOutput = { banks: [] };
      let totalRow = null;

      // Find start of data
      let startIndex = data.findIndex(row => row[1] === 'Scheduled Commercial Banks') + 1;
      // If not found, assume that excel has numbered headers before data
      if (startIndex === 0) startIndex = data.findIndex(row => row[0] === 1);


      // Per-file year/month and format detection
      let year = 0, month = 0;
      let pre_2020_05_Format = false;
      let pre_2022_03_Format = false;
      const ym = extractYearMonthFromFilename(baseName);
      if (ym) {
        year = ym.year;
        month = ym.month;
        if (year < 2020 || (year === 2020 && month < 5)) {
          pre_2020_05_Format = true;
        } else if (year < 2022 || (year === 2022 && month < 3)) {
          pre_2022_03_Format = true;
        }
      }




      for (let i = startIndex; i < data.length; i++) {
        const row = data[i];
        // Ensure row is defined and has at least 5 columns
        if (!row || !Array.isArray(row) || typeof row[1] === 'undefined') continue;
        if (row.length < 5) {
          console.log(`Skipping row due to insufficient columns: ${JSON.stringify(row)}`);
          continue;
        }

        const bankData = {};
        columnMapping.forEach(({ col, path, pre_2022_03_Col, pre_2020_05_Col }) => {
          let value;
          if (pre_2020_05_Format) {
            if (typeof pre_2020_05_Col === 'undefined') value = 0;
            if (typeof row[1] === 'number') pre_2020_05_Col = pre_2020_05_Col + 1; // Adjust for Sr.No.-based index
            value = row[pre_2020_05_Col];
          } else if (pre_2022_03_Format) {
            if (typeof pre_2022_03_Col === 'undefined') value = 0;
            else value = row[pre_2022_03_Col];
          } else {
            value = row[col + 1];
          }
          // If value is undefined or null, set to 0 for numbers, '' for strings
          if (typeof value === 'undefined' || value === null)  value = 0;
          setNestedObject(bankData, path, value);
        });

        // SrNo or Bank Name can be "total" or "grand total"
        if (["total", "grand total"].includes(bankData.Sr_No.toString().trim().toLowerCase()) || ["total", "grand total"].includes(bankData.Bank_Name.toString().trim().toLowerCase())) {
          // Use whichever is string for Bank_Name for traceability
          bankData.Bank_Name = typeof bankData.Sr_No === 'string' ? bankData.Sr_No : bankData.Bank_Name;
          // Remove bank name, short name, and type for total rows
          delete bankData.Bank_Name;
          delete bankData.Bank_Short_Name;
          delete bankData.Bank_Type;
          totalRow = bankData;
          break; // Stop processing further rows
        }

        const bankName = bankData.Bank_Name;
        // if bankName is 0 or not a string then continue to next
        if (!bankName || typeof bankName !== 'string') continue;

        // Add short name/acronym for the bank
        bankData.Bank_Short_Name = mapBankShortName(bankName);
        // As bank names can be different, pick the first name from the acronym mapping
        if (bankData.Bank_Short_Name != 'Unknown') {
          bankData.Bank_Name = mapFullNameFromShortName(bankData.Bank_Short_Name);
        }
        // Assign robust Bank_Type using utility
        bankData.Bank_Type = getBankTypeByName(bankName);

        jsonOutput.banks.push(bankData);
      }

      // Output as { banks: [...], total: {...} } if total exists, else just { banks: [...] }
      const output = totalRow ? { banks: jsonOutput.banks, total: totalRow } : { banks: jsonOutput.banks };
      fs.writeFileSync(
        jsonFilePath,
        JSON.stringify(output, null, 2),
        'utf-8',
      );
      console.log(`Generated ${jsonFile} (${jsonOutput.banks.length} banks${totalRow ? ' + total row' : ''})`);
    } catch (error) {
      console.error(`Error processing ${excelFile}:\n`, error.stack);
    }
  });

