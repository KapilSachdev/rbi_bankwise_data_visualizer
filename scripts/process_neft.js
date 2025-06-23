// process_neft_json.js
// Reads NEFT Excel file, extracts all 4 sheets, and outputs a single nested JSON file.
// Usage: node scripts/process_neft_json.js <month-year> (e.g., 05-2025)


import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { mapBankShortName } from './utils.js';

const getModuleDir = () => path.dirname(new URL(import.meta.url).pathname);

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


const main = () => {
  const { year, month } = getTargetDate(process.argv[2]);
  const paddedMonth = String(month).padStart(2, '0');
  const fileBase = `bankwise_neft_stats_${paddedMonth}_${year}`;
  const excelDir = path.resolve(getModuleDir(), '../data/excel');
  const xlsxPath = path.join(excelDir, `${fileBase}.xlsx`);
  const outputDir = path.resolve(getModuleDir(), '../public/assets/data');
  const outputPath = path.join(outputDir, `${fileBase}.json`);

  if (!fs.existsSync(xlsxPath)) {
    console.error('Excel file not found:', xlsxPath);
    process.exit(1);
  }


  // Read the Excel file as a buffer for compatibility
  const fileBuffer = fs.readFileSync(xlsxPath);
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });

  const result = {};
  // Helper to extract data rows (skip headers, filter numeric Sr_No)
  const extractDataRows = (sheet, headerRows = 2) => {
    const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: null, header: 1 });
    return rawRows.slice(headerRows).filter(row => row[0] != null && typeof row[0] === 'number');
  };

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    // Normalize NEFT, RTGS, Mobile Banking, Internet Banking
    if (/neft/i.test(sheetName)) {
      const dataRows = extractDataRows(sheet);
      result.NEFT = dataRows.map(row => {
        const bankName = row[1];
        return {
          Sr_No: row[0],
          Bank_Name: bankName,
          Bank_Short_Name: mapBankShortName(bankName),
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
    } else if (/rtgs/i.test(sheetName)) {
      // RTGS: similar structure, adjust columns as per actual data
      const dataRows = extractDataRows(sheet);
      result.RTGS = dataRows.map(row => {
        const bankName = row[1];
        return {
          Sr_No: row[0],
          Bank_Name: bankName,
          Bank_Short_Name: mapBankShortName(bankName),
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
    } else if (/mobile/i.test(sheetName)) {
      // Mobile Banking: adjust columns as per actual data
      const dataRows = extractDataRows(sheet);
      result.Mobile_Banking = dataRows.map(row => {
        const bankName = row[1];
        return {
          Sr_No: row[0],
          Bank_Name: bankName,
          Bank_Short_Name: mapBankShortName(bankName),
          Volume: row[2],
          Value: row[3],
          Active_Customers: row[4],
        };
      });
    } else if (/internet/i.test(sheetName)) {
      // Internet Banking: adjust columns as per actual data
      const dataRows = extractDataRows(sheet);
      result.Internet_Banking = dataRows.map(row => {
        const bankName = row[1];
        return {
          Sr_No: row[0],
          Bank_Name: bankName,
          Bank_Short_Name: mapBankShortName(bankName),
          Volume: row[2],
          Value: row[3],
          Active_Customers: row[4],
        };
      });
    } else {
      // Keep other sheets raw for now
      result[sheetName.replace(/\s+/g, '_')] = xlsx.utils.sheet_to_json(sheet, { defval: null });
    }
  }

  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log('Processed and saved:', outputPath);
};

main();
