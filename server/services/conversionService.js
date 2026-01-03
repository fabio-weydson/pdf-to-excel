import { Parser } from 'json2csv';
import * as XLSX from 'xlsx';

export const convertToCsv = (data) => {
  try {
    if (!data || data.length === 0) return '';
    const parser = new Parser();
    const csv = parser.parse(data);
    return csv;
  } catch (error) {
    console.error('Error converting to CSV:', error);
    throw new Error('Failed to convert to CSV');
  }
};

export const convertToExcel = (data) => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    return buffer;
  } catch (error) {
    console.error('Error converting to Excel:', error);
    throw new Error('Failed to convert to Excel');
  }
};

export const convertToText = (data) => {
  return data.map(t => `${t.date}\t${t.description}\t${t.amount}`).join('\n');
};
