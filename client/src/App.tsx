import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import './i18n';
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();
  const [lastResult, setLastResult] = useState<any>(null);

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-extrabold text-blue-900 mb-8">{t('title')}</h1>
      
      <p className="text-gray-600 mb-8 text-center max-w-lg">{t('description')}</p>

      <div className="mb-4">
        <label className="mr-2 font-medium" htmlFor="language-select">{t('language')}:</label>
        <select id="language-select" onChange={changeLanguage} value={i18n.language} className="p-1 border rounded">
          <option value="pt-BR">{t('portuguese')}</option>
          <option value="en">{t('english')}</option>
        </select>
      </div>

      <FileUpload onConversionComplete={setLastResult} />

      {lastResult && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-green-600">{t('conversion_success')}</h2>
          <p className="text-gray-700 mb-2">{t('found_transactions', { count: lastResult.transactionsCount })}</p>
          <a
            href={lastResult.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm px-5 py-2.5"
          >
            {t('download_file')}
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
