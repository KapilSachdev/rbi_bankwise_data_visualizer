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

