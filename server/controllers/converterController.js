import { supabase } from '../supabase.js';
import { extractTextFromPdf, parseBankStatementStr } from '../services/pdfService.js';
import { convertToCsv, convertToExcel, convertToText } from '../services/conversionService.js';
import fs from 'fs';
import path from 'path';

export const convertFile = async (req, res) => {
  const { filePath, format, userId } = req.body;

  if (!filePath || !format) {
    return res.status(400).json({ error: req.t('missing_params') });
  }

  try {
    console.log('--- Downloading file from Supabase ---');
    // 1. Download file from Supabase
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('bank-statements')
      .download(filePath);

    if (downloadError) {
      console.error('Supabase download error:', downloadError);
      return res.status(500).json({ error: req.t('download_error'), details: downloadError });
    }

    // 2. Parse PDF
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await extractTextFromPdf(buffer);
    const transactions = parseBankStatementStr(text);
    console.log('--- Transactions parsed ---');
    console.log('Transactions count:', transactions.length);
    if (transactions.length === 0) {
      return res.status(400).json({ error: req.t('no_transactions') });
    }

    // 3. Convert
    let outputBuffer;
    let contentType;
    let extension;

    switch (format.toLowerCase()) {
      case 'csv':
        outputBuffer = Buffer.from(convertToCsv(transactions));
        contentType = 'text/csv';
        extension = 'csv';
        break;
      case 'xlsx':
        outputBuffer = convertToExcel(transactions);
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        extension = 'xlsx';
        break;
      case 'txt':
        outputBuffer = Buffer.from(convertToText(transactions));
        contentType = 'text/plain';
        extension = 'txt';
        break;
      default:
        return res.status(400).json({ error: req.t('invalid_format') });
    }

    // 4. Upload result to Supabase
    const fileName = path.basename(filePath, path.extname(filePath));
    const outputFilePath = `${userId || 'anonymous'}/converted/${fileName}_${Date.now()}.${extension}`;

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('bank-statements')
      .upload(outputFilePath, outputBuffer, {
        contentType: contentType,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ error: req.t('upload_error'), details: uploadError });
    }

    // 5. Get Signed URL
    console.log('Generating signed URL for:', outputFilePath);
    const { data: signedUrlData, error: urlError } = await supabase
      .storage
      .from('bank-statements')
      .createSignedUrl(outputFilePath, 60 * 60); // 1 hour

    if (urlError) {
      console.error('Supabase URL error object:', JSON.stringify(urlError, null, 2));
      return res.status(500).json({ error: req.t('url_error'), details: urlError });
    }

    console.log('Signed URL:', signedUrlData?.signedUrl);

    res.json({
      message: req.t('conversion_success'),
      downloadUrl: signedUrlData.signedUrl,
      transactionsCount: transactions.length
    });

  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: req.t('internal_error'), details: error.message });
  }
};
