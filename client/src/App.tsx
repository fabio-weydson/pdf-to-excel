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
  const handleUploadStart = () => {
    setLastResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Horizontal Navbar */}
      <header className="w-full bg-white shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <div className="font-bold text-xl text-blue-900 flex items-center gap-2">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
              <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            <span>PDF Converter</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <a href="#" className="text-blue-700 font-semibold">{t('convert_button')}</a>
            <a href="#" className="hover:text-blue-900 transition-colors uppercase tracking-wider text-xs">History</a>
            <a href="#" className="hover:text-blue-900 transition-colors uppercase tracking-wider text-xs">Features</a>
            <a href="#" className="hover:text-blue-900 transition-colors uppercase tracking-wider text-xs">About</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
            <label className="text-[10px] font-bold uppercase text-gray-400 mr-2" htmlFor="language-select">🌍</label>
            <select 
              id="language-select" 
              onChange={changeLanguage} 
              value={i18n.language} 
              className="bg-transparent text-xs font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="pt-BR">PT</option>
              <option value="en">EN</option>
            </select>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4 py-12">
        <div className="w-full max-w-4xl flex flex-col items-center">
          <h1 className="text-5xl font-extrabold text-blue-900 mb-4 tracking-tight text-center">
            {t('title')}
          </h1>
          
          <p className="text-lg text-gray-600 mb-12 text-center max-w-2xl leading-relaxed">
            {t('description')}
          </p>

          <FileUpload onConversionComplete={setLastResult} onUploadStart={handleUploadStart} />

          {lastResult && (
            <div className="mt-12 p-8 bg-white rounded-2xl shadow-xl w-full border border-gray-100">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('conversion_success')}</h2>
                  <p className="text-gray-500 mt-1">{t('found_transactions', { count: lastResult.transactionsCount })}</p>
                </div>
                <a
                  href={lastResult.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all transform hover:-translate-y-0.5"
                >
                  {t('download_file')}
                </a>
              </div>

              {lastResult.transactions && lastResult.transactions.length > 0 && (
                <div className="overflow-hidden border border-gray-100 rounded-xl shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">{t('table_date')}</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">{t('table_description')}</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">{t('table_amount')}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {lastResult.transactions.map((tx: any, idx: number) => (
                        <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{tx.date}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{tx.description}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${tx.amount < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {new Intl.NumberFormat(i18n.language, { 
                              style: 'currency', 
                              currency: i18n.language === 'pt-BR' ? 'BRL' : 'USD' 
                            }).format(tx.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
