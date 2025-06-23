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

const isBankNameSimilar = (a, b) => normalize(a) === normalize(b);

export const mapBankShortName = (bankName) => {
  if (!bankName || typeof bankName !== "string") return "";
  for (const [shortName, names] of Object.entries(BANK_ACRONYMS)) {
    if (names.some(fullName => isBankNameSimilar(bankName, fullName))) {
      return shortName;
    }
  }
  return bankName.trim();
};

