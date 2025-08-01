import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import {
  bulkImport,
  parseCSV,
  parseJSON,
  parseExcel,
  generateCSVTemplate,
  SupportedDataType,
  BulkImportResult,
  BulkImportOptions
} from '../services/bulkImportService';

interface FileData {
  name: string;
  size: number;
  type: string;
  data: any[];
}

interface ImportSettings {
  skipErrors: boolean;
  batchSize: number;
  validateOnly: boolean;
}

const dataTypeLabels: Record<SupportedDataType, string> = {
  kisiler: 'Kişiler',
  projeler: 'Projeler',
  bagislar: 'Bağışlar',
  yardim_basvurulari: 'Yardım Başvuruları',
  davalar: 'Davalar',
  odemeler: 'Ödemeler',
  finansal_kayitlar: 'Finansal Kayıtlar',
  gonulluler: 'Gönüllüler',
  vefa_destek: 'Vefa Destek',
  kumbaralar: 'Kumbaralar',
  depo_urunleri: 'Depo Ürünleri',
  yetimler: 'Yetimler',
  ogrenci_burslari: 'Öğrenci Bursları',
  etkinlikler: 'Etkinlikler',
  ayni_yardim_islemleri: 'Ayni Yardım İşlemleri',
  hizmetler: 'Hizmetler',
  hastane_sevkler: 'Hastane Sevkler',
  kurumlar: 'Kurumlar'
};

const BulkImport: React.FC = () => {
  const [selectedDataType, setSelectedDataType] = useState<SupportedDataType>('kisiler');
  const [uploadedFile, setUploadedFile] = useState<FileData | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState<ImportSettings>({
    skipErrors: true,
    batchSize: 50,
    validateOnly: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      let data: any[] = [];
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.csv') || fileType === 'text/csv') {
        const text = await file.text();
        data = parseCSV(text);
      } else if (fileName.endsWith('.json') || fileType === 'application/json') {
        const text = await file.text();
        data = parseJSON(text);
      } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        const text = await file.text();
        data = parseExcel(text);
      } else {
        throw new Error('Desteklenmeyen dosya formatı. CSV, JSON veya Excel dosyası yükleyin.');
      }

      const fileData: FileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        data
      };

      setUploadedFile(fileData);
      setPreviewData(data.slice(0, 10)); // İlk 10 kaydı önizleme için göster
      setShowPreview(true);
      toast.success(`${data.length} kayıt başarıyla yüklendi`);
    } catch (error) {
      toast.error(`Dosya yükleme hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!uploadedFile) {
      toast.error('Lütfen önce bir dosya yükleyin');
      return;
    }

    setIsLoading(true);
    setProgress(0);
    setResult(null);

    const options: BulkImportOptions = {
      batchSize: settings.batchSize,
      skipErrors: settings.skipErrors,
      validateOnly: settings.validateOnly,
      onProgress: (progressData) => {
        setProgress(progressData.percentage);
      }
    };

    try {
      const importResult = await bulkImport(selectedDataType, uploadedFile.data, options);
      setResult(importResult);
      
      if (importResult.success) {
        toast.success(
          settings.validateOnly 
            ? 'Doğrulama tamamlandı'
            : `${importResult.successfulImports} kayıt başarıyla içe aktarıldı`
        );
      } else {
        toast.error(`İçe aktarma başarısız: ${importResult.failedImports} hata`);
      }
    } catch (error) {
      toast.error(`İçe aktarma hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = generateCSVTemplate(selectedDataType);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${selectedDataType}_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Şablon dosyası indirildi');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Toplu Veri Yükleme
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          CSV, JSON veya Excel dosyalarından toplu veri içe aktarımı yapın
        </p>
      </div>

      {/* Veri Türü Seçimi */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          1. Veri Türünü Seçin
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(dataTypeLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSelectedDataType(key as SupportedDataType)}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                selectedDataType === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="text-sm font-medium">{label}</div>
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex gap-2">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Şablon İndir
          </button>
        </div>
      </div>

      {/* Dosya Yükleme */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          2. Dosya Yükleyin
        </h2>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          {uploadedFile ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/20 rounded-full">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatFileSize(uploadedFile.size)} • {uploadedFile.data.length} kayıt
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Farklı Dosya Seç
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">Dosya yükleyin</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  CSV, JSON veya Excel dosyası seçin
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                {isLoading ? 'Yükleniyor...' : 'Dosya Seç'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Önizleme */}
      {showPreview && previewData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            3. Veri Önizlemesi (İlk 10 Kayıt)
          </h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {Object.keys(previewData[0] || {}).map((key) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {previewData.map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((value: any, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300"
                      >
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* İçe Aktarma Ayarları */}
      {uploadedFile && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            4. İçe Aktarma Ayarları
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="validateOnly"
                checked={settings.validateOnly}
                onChange={(e) => setSettings(prev => ({ ...prev, validateOnly: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="validateOnly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Sadece doğrulama yap
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="skipErrors"
                checked={settings.skipErrors}
                onChange={(e) => setSettings(prev => ({ ...prev, skipErrors: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="skipErrors" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Hataları atla
              </label>
            </div>
            
            <div>
              <label htmlFor="batchSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Batch Boyutu
              </label>
              <select
                id="batchSize"
                value={settings.batchSize}
                onChange={(e) => setSettings(prev => ({ ...prev, batchSize: Number(e.target.value) }))}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleImport}
              disabled={isLoading}
              className="w-full md:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  İşleniyor...
                </>
              ) : (
                settings.validateOnly ? 'Doğrulama Yap' : 'İçe Aktar'
              )}
            </button>
          </div>
        </div>
      )}

      {/* İlerleme Çubuğu */}
      {isLoading && progress > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">İlerleme</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Sonuçlar */}
      {result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            İçe Aktarma Sonuçları
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{result.totalRecords}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Toplam Kayıt</div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{result.successfulImports}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Başarılı</div>
            </div>
            
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{result.failedImports}</div>
              <div className="text-sm text-red-600 dark:text-red-400">Başarısız</div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">{(result.duration / 1000).toFixed(2)}s</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Süre</div>
            </div>
          </div>
          
          {result.errors.length > 0 && (
            <div>
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-3">Hatalar</h3>
              <div className="max-h-64 overflow-y-auto">
                {result.errors.map((error, index) => (
                  <div key={index} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-2">
                    <div className="text-sm font-medium text-red-800 dark:text-red-200">Satır {error.row}</div>
                    <div className="text-sm text-red-600 dark:text-red-300">{error.error}</div>
                    {error.data && (
                      <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                        Veri: {JSON.stringify(error.data)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkImport;