// Reads Transactions Excel file
// Extracts all 4 sheets, NEFT, RTGS, Mobile Banking, Internet Banking, and outputs a single nested JSON file.
// Usage: node scripts/process_neft_json.js <YYYY_MM> (e.g., 2025_05)


import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import {
  ensureDir,
  getBankTypeByName,
  getModuleDir,
  getTargetDate,
  mapBankShortName
} from './utils.js';

// Helper to extract data rows (skip headers, filter numeric Sr_No)
const extractDataRows = (sheet, headerRows = 2) => {
  const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: null, header: 1 });
  return rawRows.slice(headerRows).filter(row => row[0] != null && typeof row[0] === 'number');
};

// Modular sheet processors
const processNeftSheet = (sheet) =>
  extractDataRows(sheet).map(row => {
    const bankName = row[1];
    return {
      Sr_No: row[0],
      Bank_Name: bankName,
      Bank_Short_Name: mapBankShortName(bankName),
      Bank_Type: getBankTypeByName(bankName),
      Received_Inward_Credits: {
        No: row[2],
        Amount: row[3],
      },
      Total_Outward_Debits: {
        No: row[4],
        Amount: row[5],
      },
    };
  });

const processRtgsSheet = (sheet) =>
  extractDataRows(sheet).map(row => {
    const bankName = row[1];
    return {
      Sr_No: row[0],
      Bank_Name: bankName,
      Bank_Short_Name: mapBankShortName(bankName),
      Bank_Type: getBankTypeByName(bankName),
      Outward_Transactions: {
        No: row[2],
        Amount: row[3],
      },
      Inward_Transactions: {
        No: row[4],
        Amount: row[5],
      },
    };
  });

const processMobileSheet = (sheet) =>
  extractDataRows(sheet).map(row => {
    const bankName = row[1];
    return {
      Sr_No: row[0],
      Bank_Name: bankName,
      Bank_Short_Name: mapBankShortName(bankName),
      Bank_Type: getBankTypeByName(bankName),
      Volume: row[2],
      Value: row[3],
      Active_Customers: row[4],
    };
  });

const processInternetSheet = (sheet) =>
  extractDataRows(sheet).map(row => {
    const bankName = row[1];
    return {
      Sr_No: row[0],
      Bank_Name: bankName,
      Bank_Short_Name: mapBankShortName(bankName),
      Bank_Type: getBankTypeByName(bankName),
      Volume: row[2],
      Value: row[3],
      Active_Customers: row[4],
    };
  });

const main = () => {
  const yearMonthArg = process.argv.find(arg => arg.startsWith('--month='));
  const yearMonth = yearMonthArg ? yearMonthArg.split('=')[1] : undefined;
  const { year, month } = getTargetDate(yearMonth);
  const paddedMonth = String(month).padStart(2, '0');
  const fileBase = `bankwise_neft_stats_${year}_${paddedMonth}`;
  const excelDir = path.resolve(getModuleDir(), '../data/excel/neft');
  const xlsxPath = path.join(excelDir, `${fileBase}.xlsx`);
  const outputDir = path.resolve(getModuleDir(), '../public/assets/data/neft');
  const outputPath = path.join(outputDir, `${fileBase}.json`);

  if (!fs.existsSync(xlsxPath)) {
    console.error('Excel file not found:', xlsxPath);
    process.exit(1);
  }

  // Read the Excel file as a buffer for compatibility
  const fileBuffer = fs.readFileSync(xlsxPath);
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

  const result = {};
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (/neft/i.test(sheetName)) {
      result.NEFT = processNeftSheet(sheet);
    } else if (/rtgs/i.test(sheetName)) {
      result.RTGS = processRtgsSheet(sheet);
    } else if (/mobile/i.test(sheetName)) {
      result.Mobile_Banking = processMobileSheet(sheet);
    } else if (/internet/i.test(sheetName)) {
      result.Internet_Banking = processInternetSheet(sheet);
    } else {
      // Keep other sheets raw for now
      result[sheetName.replace(/\s+/g, '_')] = xlsx.utils.sheet_to_json(sheet, { defval: null });
    }
  }

  ensureDir(outputDir);
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log('Processed and saved:', fileBase);
};

main();
