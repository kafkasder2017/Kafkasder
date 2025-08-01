import React, { useState, useRef } from 'react';
import { Upload, FileText, Users, DollarSign, Calendar, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { Person, Bagis, Proje, Etkinlik, Uyruk, KimlikTuru, SponsorlukTipi, RizaBeyaniStatus, DosyaBaglantisi, PersonStatus } from '../types';

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  warnings: string[];
}

interface ImportTemplate {
  name: string;
  description: string;
  fields: string[];
  sampleData: any[];
}

const BulkImport: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'persons' | 'donations' | 'projects' | 'events'>('persons');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ImportResult | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importTemplates: Record<string, ImportTemplate> = {
    persons: {
      name: 'Kişi Verileri',
      description: 'Üye, bağışçı ve yardım alan kişilerin bilgileri',
      fields: ['ad', 'soyad', 'tc_kimlik', 'telefon', 'email', 'adres', 'kategori', 'dogum_tarihi'],
      sampleData: [
        {
          ad: 'Ahmet',
          soyad: 'Yılmaz',
          tc_kimlik: '12345678901',
          telefon: '05551234567',
          email: 'ahmet@example.com',
          adres: 'İstanbul, Türkiye',
          kategori: 'Üye',
          dogum_tarihi: '1990-01-01'
        }
      ]
    },
    donations: {
      name: 'Bağış Verileri',
      description: 'Bağış kayıtları ve detayları',
      fields: ['bagisci_ad', 'bagisci_soyad', 'tutar', 'para_birimi', 'bagis_turu', 'tarih', 'aciklama'],
      sampleData: [
        {
          bagisci_ad: 'Mehmet',
          bagisci_soyad: 'Demir',
          tutar: 1000,
          para_birimi: 'TRY',
          bagis_turu: 'Nakit',
          tarih: '2024-01-15',
          aciklama: 'Aylık bağış'
        }
      ]
    },
    projects: {
      name: 'Proje Verileri',
      description: 'Proje bilgileri ve detayları',
      fields: ['proje_adi', 'sorumlu', 'baslangic_tarihi', 'bitis_tarihi', 'butce', 'durum', 'aciklama'],
      sampleData: [
        {
          proje_adi: 'Eğitim Desteği',
          sorumlu: 'Ayşe Kaya',
          baslangic_tarihi: '2024-01-01',
          bitis_tarihi: '2024-12-31',
          butce: 50000,
          durum: 'Devam Ediyor',
          aciklama: 'Öğrenci burs projesi'
        }
      ]
    },
    events: {
      name: 'Etkinlik Verileri',
      description: 'Etkinlik bilgileri ve organizasyon detayları',
      fields: ['etkinlik_adi', 'tarih', 'saat', 'konum', 'sorumlu', 'durum', 'aciklama'],
      sampleData: [
        {
          etkinlik_adi: 'Yıllık Genel Kurul',
          tarih: '2024-03-15',
          saat: '14:00',
          konum: 'KAFKASDER Merkez',
          sorumlu: 'Ali Veli',
          durum: 'Planlandı',
          aciklama: '2024 yılı genel kurul toplantısı'
        }
      ]
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    await previewFile(file);
  };

  const previewFile = async (file: File) => {
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1, 6).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      }).filter(row => Object.values(row).some(val => val !== ''));

      setPreviewData(data);
    } catch (error) {
      console.error('Dosya önizleme hatası:', error);
    }
  };

  const downloadTemplate = () => {
    const template = importTemplates[importType];
    const csvContent = [
      template.fields.join(','),
      ...template.sampleData.map(row => 
        template.fields.map(field => `"${row[field] || ''}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${importType}_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processImport = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    const result: ImportResult = { success: 0, failed: 0, errors: [], warnings: [] };

    try {
      const text = await selectedFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        return row;
      }).filter(row => Object.values(row).some(val => val !== ''));

      // Veri doğrulama
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2; // Header + 1

        try {
          switch (importType) {
            case 'persons':
              await importPerson(row, result, rowNumber);
              break;
            case 'donations':
              await importDonation(row, result, rowNumber);
              break;
            case 'projects':
              await importProject(row, result, rowNumber);
              break;
            case 'events':
              await importEvent(row, result, rowNumber);
              break;
          }
        } catch (error: any) {
          result.failed++;
          result.errors.push(`Satır ${rowNumber}: ${error.message}`);
        }
      }

      setResults(result);
    } catch (error: any) {
      result.failed++;
      result.errors.push(`Genel hata: ${error.message}`);
      setResults(result);
    } finally {
      setIsProcessing(false);
    }
  };

  const importPerson = async (row: any, result: ImportResult, rowNumber: number) => {
    // Veri doğrulama
    if (!row.ad || !row.soyad) {
      throw new Error('Ad ve soyad zorunludur');
    }

    if (row.tc_kimlik && row.tc_kimlik.length !== 11) {
      result.warnings.push(`Satır ${rowNumber}: TC kimlik numarası 11 haneli olmalıdır`);
    }

    const personData: Partial<Person> = {
      ad: row.ad,
      soyad: row.soyad,
      kimlikNo: row.tc_kimlik || '',
      cepTelefonu: row.telefon || '',
      email: row.email || '',
      adres: row.adres || '',
      kategori: row.kategori || 'Üye',
      dogumTarihi: row.dogum_tarihi || '',
      uyruk: [Uyruk.TC],
      kimlikTuru: KimlikTuru.TC,
      ulke: 'Türkiye',
      sehir: '',
      yerlesim: '',
      mahalle: '',
      dosyaNumarasi: `IMPORT-${Date.now()}-${rowNumber}`,
      sponsorlukTipi: SponsorlukTipi.BIREYSEL,
      kayitDurumu: 'Kaydedildi',
      rizaBeyani: RizaBeyaniStatus.ALINMADI,
      kayitTarihi: new Date().toISOString(),
      kaydiAcanBirim: 'Toplu Import',
      dosyaBaglantisi: DosyaBaglantisi.BAGIMSIZ,
      isKaydiSil: false,
      durum: PersonStatus.AKTIF
    };

    const { error } = await supabase.from('persons').insert(personData);
    if (error) throw new Error(error.message);

    result.success++;
  };

  const importDonation = async (row: any, result: ImportResult, rowNumber: number) => {
    if (!row.tutar || !row.bagisci_ad) {
      throw new Error('Tutar ve bağışçı adı zorunludur');
    }

    // Önce kişiyi bul veya oluştur
    let personId = 1; // Varsayılan
    if (row.bagisci_ad) {
      const { data: person } = await supabase
        .from('persons')
        .select('id')
        .eq('ad', row.bagisci_ad)
        .eq('soyad', row.bagisci_soyad || '')
        .single();

      if (!person) {
        // Kişi yoksa oluştur
        const { data: newPerson } = await supabase
          .from('persons')
          .insert({
            ad: row.bagisci_ad,
            soyad: row.bagisci_soyad || '',
            kategori: 'Bağışçı',
            dosyaNumarasi: `DONOR-${Date.now()}`,
            kayitTarihi: new Date().toISOString()
          })
          .select('id')
          .single();

        personId = newPerson?.id || 1;
      } else {
        personId = person.id;
      }
    }

    const donationData: Partial<Bagis> = {
      bagisciId: personId,
      tutar: parseFloat(row.tutar),
      paraBirimi: row.para_birimi || 'TRY',
      bagisTuru: row.bagis_turu || 'Nakit',
      tarih: row.tarih || new Date().toISOString().split('T')[0],
      aciklama: row.aciklama || 'Toplu import ile eklenen bağış',
      makbuzNo: `IMPORT-${Date.now()}-${rowNumber}`
    };

    const { error } = await supabase.from('bagislar').insert(donationData);
    if (error) throw new Error(error.message);

    result.success++;
  };

  const importProject = async (row: any, result: ImportResult, rowNumber: number) => {
    if (!row.proje_adi) {
      throw new Error('Proje adı zorunludur');
    }

    const projectData: Partial<Proje> = {
      name: row.proje_adi,
      manager: row.sorumlu || '',
      status: row.durum || 'Planlama',
      startDate: row.baslangic_tarihi || new Date().toISOString().split('T')[0],
      endDate: row.bitis_tarihi || '',
      budget: parseFloat(row.butce) || 0,
      spent: 0,
      progress: 0,
      description: row.aciklama || ''
    };

    const { error } = await supabase.from('projeler').insert(projectData);
    if (error) throw new Error(error.message);

    result.success++;
  };

  const importEvent = async (row: any, result: ImportResult, rowNumber: number) => {
    if (!row.etkinlik_adi || !row.tarih) {
      throw new Error('Etkinlik adı ve tarihi zorunludur');
    }

    const eventData: Partial<Etkinlik> = {
      ad: row.etkinlik_adi,
      tarih: row.tarih,
      saat: row.saat || '',
      konum: row.konum || '',
      aciklama: row.aciklama || '',
      status: row.durum || 'Planlama',
      sorumluId: 1 // Varsayılan sorumlu
    };

    const { error } = await supabase.from('etkinlikler').insert(eventData);
    if (error) throw new Error(error.message);

    result.success++;
  };

  const resetImport = () => {
    setSelectedFile(null);
    setResults(null);
    setPreviewData([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Toplu Veri Aktarımı</h1>
        
        {/* Import Türü Seçimi */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Veri Türü Seçin
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(importTemplates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => setImportType(key as any)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  importType === key
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  {key === 'persons' && <Users className="w-5 h-5" />}
                  {key === 'donations' && <DollarSign className="w-5 h-5" />}
                  {key === 'projects' && <FileText className="w-5 h-5" />}
                  {key === 'events' && <Calendar className="w-5 h-5" />}
                  <span className="font-medium">{template.name}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Template İndirme */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">📋 Şablon İndirin</h3>
          <p className="text-sm text-blue-600 mb-3">
            {importTemplates[importType].name} için uygun şablonu indirin ve verilerinizi bu formatta hazırlayın.
          </p>
          <button
            onClick={downloadTemplate}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Şablon İndir (CSV)
          </button>
        </div>

        {/* Dosya Yükleme */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CSV Dosyası Seçin
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              {selectedFile ? selectedFile.name : 'Dosya seçmek için tıklayın veya sürükleyin'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Dosya Seç
            </button>
          </div>
        </div>

        {/* Önizleme */}
        {previewData.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-2">👀 Veri Önizleme (İlk 5 satır)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    {Object.keys(previewData[0] || {}).map(header => (
                      <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row, index) => (
                    <tr key={index} className="border-t border-gray-200">
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-2 text-sm text-gray-900">
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

        {/* İşlem Butonları */}
        <div className="flex space-x-4">
          <button
            onClick={processImport}
            disabled={!selectedFile || isProcessing}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'İşleniyor...' : 'Verileri İçe Aktar'}
          </button>
          <button
            onClick={resetImport}
            className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Sıfırla
          </button>
        </div>

        {/* Sonuçlar */}
        {results && (
          <div className="mt-6 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">📊 İçe Aktarma Sonuçları</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-green-700 font-medium">
                    Başarılı: {results.success}
                  </span>
                </div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 font-medium">
                    Başarısız: {results.failed}
                  </span>
                </div>
              </div>
            </div>

            {results.errors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-700 mb-2">❌ Hatalar</h4>
                <div className="bg-red-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                  {results.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 mb-1">{error}</p>
                  ))}
                </div>
              </div>
            )}

            {results.warnings.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-yellow-700 mb-2">⚠️ Uyarılar</h4>
                <div className="bg-yellow-50 p-3 rounded-lg max-h-32 overflow-y-auto">
                  {results.warnings.map((warning, index) => (
                    <p key={index} className="text-sm text-yellow-600 mb-1">{warning}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkImport;