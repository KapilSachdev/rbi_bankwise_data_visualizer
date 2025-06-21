

import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

function combineHeaders(headerRows, colKeys) {
  const filledRows = headerRows.map(row => ({ ...row }));
  for (let r = 0; r < filledRows.length; r++) {
    let last = null;
    for (let c = 0; c < colKeys.length; c++) {
      const key = colKeys[c];
      if (filledRows[r][key] == null || filledRows[r][key] === "") {
        filledRows[r][key] = last;
      } else {
        last = filledRows[r][key];
      }
    }
  }
  return colKeys.map((colKey) => {
    let parts = [];
    for (let row of filledRows) {
      if (row[colKey] && row[colKey] !== null) parts.push(row[colKey]);
    }
    return parts;
  });
}

function processRbiJsonFromRows(rows, outputPath) {

  let dataStartIdx = rows.findIndex(row => {
    const firstKey = Object.keys(row)[0];
    return typeof row[firstKey] === 'number';
  });
  if (dataStartIdx === -1) {
    console.error('No data rows found!');
    process.exit(1);
  }
  const headerRows = rows.slice(0, dataStartIdx);
  const colKeys = Object.keys(rows[dataStartIdx]);
  const headerPaths = combineHeaders(headerRows, colKeys);

  const sectorHeaders = [
    'Scheduled Commercial Banks',
    'Small Finance Banks',
    'Payments Banks',
    'Foreign Banks',
    'Regional Rural Banks',
    'Co-operative Banks',
    'Local Area Banks',
    'All Banks',
  ];
  const bankTypeHeaders = [
    'Public Sector Banks',
    'Private Sector Banks',
    'Foreign Banks',
    'Small Finance Banks',
    'Payments Banks',
    'Regional Rural Banks',
    'Co-operative Banks',
    'Local Area Banks',
    'All Banks',
  ];

  let currentSector = '';
  let currentBankType = '';
  const result = [];

  for (let i = dataStartIdx; i < rows.length; i++) {
    const row = rows[i];
    const firstKey = colKeys[0];
    const bankKey = colKeys[1];

    if (typeof row[firstKey] === 'string' && !row[bankKey] && sectorHeaders.includes(row[firstKey].trim())) {
      currentSector = row[firstKey].trim();
      currentBankType = '';
      continue;
    }
    if (typeof row[firstKey] === 'string' && !row[bankKey] && bankTypeHeaders.includes(row[firstKey].trim())) {
      currentBankType = row[firstKey].trim();
      continue;
    }
    if (typeof row[firstKey] === 'number' && typeof row[bankKey] === 'string' && row[bankKey].trim()) {
      const bankObj = {
        "Bank Name": row[bankKey],
        sector: currentSector,
        bankType: currentBankType
      };
      for (let j = 2; j < colKeys.length; j++) {
        const value = row[colKeys[j]];
        let path = headerPaths[j]
          .filter(p => typeof p === 'string' && p.trim())
          .map(p => p.replace(/\|?\s*\d+$/, '').trim())
          .filter(p => !sectorHeaders.includes(p) && !bankTypeHeaders.includes(p))
          .filter(Boolean);
        if (value === undefined || value === null || value === "" || path.length === 0) continue;

        // Only "ATMs & CRMs" gets On-site/Off-site nesting, others are direct numbers
        if (path[0] === 'Infrastructure' && path[1] === 'Number - Outstanding (as on month end)' && path[2] === 'ATMs & CRMs' && (path[3] === 'On-site' || path[3] === 'Off-site')) {
          if (!bankObj.Infrastructure) bankObj.Infrastructure = {};
          if (!bankObj.Infrastructure['Number - Outstanding (as on month end)']) bankObj.Infrastructure['Number - Outstanding (as on month end)'] = {};
          if (!bankObj.Infrastructure['Number - Outstanding (as on month end)']['ATMs & CRMs']) bankObj.Infrastructure['Number - Outstanding (as on month end)']['ATMs & CRMs'] = {};
          bankObj.Infrastructure['Number - Outstanding (as on month end)']['ATMs & CRMs'][path[3]] = value;
        } else if (
          path[0] === 'Infrastructure' &&
          path[1] === 'Number - Outstanding (as on month end)' &&
          path.length >= 3 &&
          path[2] !== 'ATMs & CRMs'
        ) {
          // For all other infra metrics, flatten to direct number (even if path is [Metric, 'Off-site'])
          if (!bankObj.Infrastructure) bankObj.Infrastructure = {};
          if (!bankObj.Infrastructure['Number - Outstanding (as on month end)']) bankObj.Infrastructure['Number - Outstanding (as on month end)'] = {};
          bankObj.Infrastructure['Number - Outstanding (as on month end)'][path[2]] = value;
        } else {
          // Fallback to original logic for other sections (e.g., Card Payments)
          let ref = bankObj;
          for (let k = 0; k < path.length - 1; k++) {
            if (!(path[k] in ref)) {
              ref[path[k]] = {};
            } else if (typeof ref[path[k]] !== 'object' || ref[path[k]] === null) {
              ref[path[k]] = { value: ref[path[k]] };
            }
            ref = ref[path[k]];
          }
          const leaf = path[path.length - 1];
          if (leaf in ref && (typeof ref[leaf] !== 'object' || ref[leaf] === null)) {
            ref[leaf] = { value: ref[leaf] };
          }
          if (typeof ref[leaf] === 'object' && ref[leaf] !== null && !Array.isArray(ref[leaf])) {
            ref[leaf]["value"] = value;
          } else {
            ref[leaf] = value;
          }
        }
      }
      result.push(bankObj);
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log(`Processed data saved to ${outputPath}`);
}


function getMonthMinus2() {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth() + 1; // JS: 0=Jan, 11=Dec; we want 1-based
  month -= 2;
  if (month < 1) {
    month += 12;
    year -= 1;
  }
  return { year, month };
}


function main() {
  const { year, month } = getMonthMinus2();
  const fileBase = `rbi_bankwise_${String(month).padStart(2, '0')}_${year}`;
  const excelPath = path.join('data', 'excel', `${fileBase}.xlsx`);
  if (!fs.existsSync(excelPath)) {
    console.error(`Excel file not found: ${excelPath}`);
    process.exit(1);
  }
  // Convert Excel to JSON (in-memory) using buffer
  let fileBuffer;
  try {
    const stats = fs.statSync(excelPath);
    console.log(`File size: ${stats.size} bytes`);
    fileBuffer = fs.readFileSync(excelPath);
    console.log('fs.readFileSync succeeded.');
  } catch (err) {
    console.error('Error accessing file with fs:', err);
    process.exit(1);
  }
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });
  // Process as before
  const outputDir = path.join('public', 'data');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
  const output = path.join(outputDir, `${fileBase}.json`);
  processRbiJsonFromRows(rows, output);
}

main();
