import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

/**
 * Extract raw text from a PDF buffer.
 */
export const extractTextFromPdf = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF. details:', error);
    if (error.stack) console.error(error.stack);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Parse the extracted PDF text into an array of transaction objects.
 * Handles lines where the amount may be on a separate line from the description.
 * Attempts to associate a date (numeric or textual) with each transaction.
 */
export const parseBankStatementStr = (text) => {
  console.log('--- Parsing PDF Text (first 500 chars) ---');
  console.log(text.slice(0, 500));
  console.log('--- End of snippet ---');

  const transactions = [];

  // Helper to clean and parse amount strings
  const parseAmount = (amtStr) => {
    if (!amtStr) return NaN;
    let clean = amtStr.replace(/[R$€]/g, '').trim();
    const isNeg = clean.startsWith('-') || clean.endsWith('-');
    if (isNeg) clean = clean.replace(/^-|-$|\s*-/g, '').trim();
    // Normalise separators
    if (clean.includes(',') && clean.includes('.')) {
      // Assume commas are thousand separators
      clean = clean.replace(/,/g, '');
    } else if (clean.includes(',')) {
      // Assume comma is decimal separator
      clean = clean.replace(/,/g, '.');
    }
    const val = parseFloat(clean);
    return isNeg ? -Math.abs(val) : val;
  };

  const dateRegex = /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/;
  const amountRegex = /(-?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2}))/;

  const lines = text.split('\n');
  let previousLine = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { previousLine = ''; continue; }
    const amountMatch = line.match(amountRegex);
    if (amountMatch) {
      const amountStr = amountMatch[1];
      const amount = parseAmount(amountStr);
      if (isNaN(amount)) { previousLine = line; continue; }
      // Determine description by removing amount
      let description = line.replace(amountStr, '').trim();
      // If description empty, try previous line
      if (!description && previousLine) description = previousLine.trim();
      // Find date: either in current line or previous line
      let date = '';
      const dateMatchCurrent = line.match(dateRegex);
      if (dateMatchCurrent) date = dateMatchCurrent[1];
      else {
        const dateMatchPrev = previousLine.match(dateRegex);
        if (dateMatchPrev) date = dateMatchPrev[1];
      }
      if (!description) description = 'Unknown Transaction';
      transactions.push({ date, description, amount });
    }
    previousLine = line;
  }

  console.log('Parsed transactions count:', transactions.length);
  return transactions;
};
