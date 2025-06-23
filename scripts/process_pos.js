
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BANK_ACRONYMS } from '../data/bank_acronyms.js';

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
  { col: 0, path: 'Sr_No' },
  { col: 1, path: 'Bank_Name' },
  { col: 2, path: 'Infrastructure.ATMs_CRMs.On_site' },
  { col: 3, path: 'Infrastructure.ATMs_CRMs.Off_site' },
  { col: 4, path: 'Infrastructure.PoS' },
  { col: 5, path: 'Infrastructure.Micro_ATMs' },
  { col: 6, path: 'Infrastructure.Bharat_QR_Codes' },
  { col: 7, path: 'Infrastructure.UPI_QR_Codes' },
  { col: 8, path: 'Infrastructure.Credit_Cards' },
  { col: 9, path: 'Infrastructure.Debit_Cards' },
  { col: 10, path: 'Card_Payments_Transactions.Credit_Card.at_PoS.Volume' },
  { col: 11, path: 'Card_Payments_Transactions.Credit_Card.at_PoS.Value' },
  { col: 12, path: 'Card_Payments_Transactions.Credit_Card.Online_ecom.Volume' },
  { col: 13, path: 'Card_Payments_Transactions.Credit_Card.Online_ecom.Value' },
  { col: 14, path: 'Card_Payments_Transactions.Credit_Card.Others.Volume' },
  { col: 15, path: 'Card_Payments_Transactions.Credit_Card.Others.Value' },
  { col: 16, path: 'Card_Payments_Transactions.Credit_Card.Cash_Withdrawal.At_ATM.Volume' },
  { col: 17, path: 'Card_Payments_Transactions.Credit_Card.Cash_Withdrawal.At_ATM.Value' },
  { col: 18, path: 'Card_Payments_Transactions.Debit_Card.at_PoS.Volume' },
  { col: 19, path: 'Card_Payments_Transactions.Debit_Card.at_PoS.Value' },
  { col: 20, path: 'Card_Payments_Transactions.Debit_Card.Online_ecom.Volume' },
  { col: 21, path: 'Card_Payments_Transactions.Debit_Card.Online_ecom.Value' },
  { col: 22, path: 'Card_Payments_Transactions.Debit_Card.Others.Volume' },
  { col: 23, path: 'Card_Payments_Transactions.Debit_Card.Others.Value' },
  { col: 24, path: 'Card_Payments_Transactions.Debit_Card.Cash_Withdrawal.At_ATM.Volume' },
  { col: 25, path: 'Card_Payments_Transactions.Debit_Card.Cash_Withdrawal.At_ATM.Value' },
  { col: 26, path: 'Card_Payments_Transactions.Debit_Card.Cash_Withdrawal.At_PoS.Volume' },
  { col: 27, path: 'Card_Payments_Transactions.Debit_Card.Cash_Withdrawal.At_PoS.Value' },
];


// Process all Excel files in data/excel, only if corresponding JSON does not exist
const excelDir = path.resolve(__dirname, '../data/excel');
const jsonDir = path.resolve(__dirname, '../public/assets/data');

fs.readdirSync(excelDir)
  .filter(file => file.endsWith('.xlsx'))
  .forEach(excelFile => {
    const baseName = path.basename(excelFile, '.xlsx');
    const jsonFile = `${baseName}.json`;
    const jsonFilePath = path.join(jsonDir, jsonFile);
    if (fs.existsSync(jsonFilePath)) {
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

      const jsonResult = [];
      let currentBankType = '';

      // Find start of data
      const startIndex = data.findIndex(row => row[1] === 'Scheduled Commercial Banks') + 1;
      currentBankType = data[startIndex - 1]?.[1] || 'Unknown';

      for (let i = startIndex; i < data.length; i++) {
        const row = data[i];

        // Update bank type for section headers
        if (row.length < 3) {
          currentBankType = row[1];
          continue;
        }

        // Skip non-data rows
        if (!row[1] || typeof row[1] !== 'number' || row[1] === 'Total' || !row[1]) continue;

        const bankData = { Bank_Type: currentBankType };
        columnMapping.forEach(({ col, path }) => {
          const value = row[col+1] ?? 1; // Adjusted to match the column index in the row
          setNestedObject(bankData, path, value);
        });
        // Add short name/acronym for the bank
        const bankName = bankData.Bank_Name;
        bankData.Bank_Short_Name = BANK_ACRONYMS[bankName] || bankName;

        jsonResult.push(bankData);
      }

      fs.writeFileSync(
        jsonFilePath,
        JSON.stringify(jsonResult, null, 2),
        'utf-8',
      );
      console.log(`Generated ${jsonFile} (${jsonResult.length} banks)`);
    } catch (error) {
      console.error(`Error processing ${excelFile}:`, error.message);
    }
  });
