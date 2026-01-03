import { useState } from 'react';
import { supabase } from '../supabase';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
  onConversionComplete: (result: any) => void;
  onUploadStart: () => void;
}

export const FileUpload = ({ onConversionComplete, onUploadStart }: FileUploadProps) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<string>('xlsx');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUploadAndConvert = async () => {
    if (!file) {
      setError(t('error_missing_file'));
      return;
    }

    setUploading(true);
    setError(null);
    onUploadStart();

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('bank-statements')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`${t('upload_failed')}: ${uploadError.message}`);
      }

      // 2. Call Backend API
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await axios.post(`${apiUrl}/convert`, {
        filePath,
        format
      });

      onConversionComplete(response.data);
      setFile(null);

    } catch (err: any) {
      console.error(err);
      setError(err.message || t('unexpected_error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {t('upload_label')}
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
              </svg>
              <p className="text-sm text-gray-500"><span className="font-semibold">{t('click_to_upload')}</span> {t('drag_and_drop')}</p>
              <p className="text-xs text-gray-500">{t('pdf_only')}</p>
            </div>
            <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
          </label>
        </div>
        {file && <p className="mt-2 text-sm text-green-600">{t('selected')}: {file.name}</p>}
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          {t('output_format_label')}
        </label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value)}
          className="block w-full p-2.5 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="xlsx">{t('format_xlsx')}</option>
          <option value="csv">{t('format_csv')}</option>
          <option value="txt">{t('format_txt')}</option>
        </select>
      </div>

      {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}

      <button
        onClick={handleUploadAndConvert}
        disabled={uploading || !file}
        className={`w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 focus:outline-none ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {uploading ? t('processing') : t('convert_button')}
      </button>
    </div>
  );
};
