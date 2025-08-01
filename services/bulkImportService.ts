import {
  createPerson,
  createProje,
  createBagis,
  createYardimBasvurusu,
  createDava,
  createOdeme,
  createFinansalKayit,
  createGonullu,
  createVefaDestek,
  createKumbara,
  createDepoUrunu,
  createYetim,
  createOgrenciBursu,
  createEtkinlik,
  createAyniYardimIslemi,
  createHizmet,
  createHastaneSevk,
  createKurum
} from './apiService';

import type {
  Person,
  Proje,
  Bagis,
  YardimBasvurusu,
  Dava,
  Odeme,
  FinansalKayit,
  Gonullu,
  VefaDestek,
  Kumbara,
  DepoUrunu,
  Yetim,
  OgrenciBursu,
  Etkinlik,
  AyniYardimIslemi,
  Hizmet,
  HastaneSevk,
  Kurum
} from '../types';

// Desteklenen veri türleri
export type SupportedDataType = 
  | 'kisiler'
  | 'projeler'
  | 'bagislar'
  | 'yardim_basvurulari'
  | 'davalar'
  | 'odemeler'
  | 'finansal_kayitlar'
  | 'gonulluler'
  | 'vefa_destek'
  | 'kumbaralar'
  | 'depo_urunleri'
  | 'yetimler'
  | 'ogrenci_burslari'
  | 'etkinlikler'
  | 'ayni_yardim_islemleri'
  | 'hizmetler'
  | 'hastane_sevkler'
  | 'kurumlar';

// Toplu import sonucu
export interface BulkImportResult {
  success: boolean;
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  duration: number;
}

// Toplu import seçenekleri
export interface BulkImportOptions {
  batchSize?: number; // Varsayılan: 50
  skipErrors?: boolean; // Hatalı kayıtları atla ve devam et
  validateOnly?: boolean; // Sadece doğrulama yap, kaydetme
  onProgress?: (progress: { current: number; total: number; percentage: number }) => void;
}

// Veri türüne göre create fonksiyonları
const createFunctions = {
  kisiler: createPerson,
  projeler: createProje,
  bagislar: createBagis,
  yardim_basvurulari: createYardimBasvurusu,
  davalar: createDava,
  odemeler: createOdeme,
  finansal_kayitlar: createFinansalKayit,
  gonulluler: createGonullu,
  vefa_destek: createVefaDestek,
  kumbaralar: createKumbara,
  depo_urunleri: createDepoUrunu,
  yetimler: createYetim,
  ogrenci_burslari: createOgrenciBursu,
  etkinlikler: createEtkinlik,
  ayni_yardim_islemleri: createAyniYardimIslemi,
  hizmetler: createHizmet,
  hastane_sevkler: createHastaneSevk,
  kurumlar: createKurum
};

// Veri doğrulama fonksiyonları
const validateRecord = (dataType: SupportedDataType, record: any): string[] => {
  const errors: string[] = [];
  
  // Genel doğrulamalar
  if (!record || typeof record !== 'object') {
    errors.push('Geçersiz veri formatı');
    return errors;
  }

  // Veri türüne özel doğrulamalar
  switch (dataType) {
    case 'kisiler':
      if (!record.ad || typeof record.ad !== 'string') {
        errors.push('Ad alanı zorunludur');
      }
      if (!record.soyad || typeof record.soyad !== 'string') {
        errors.push('Soyad alanı zorunludur');
      }
      if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
        errors.push('Geçersiz email formatı');
      }
      if (record.telefon && !/^[0-9+\-\s()]+$/.test(record.telefon)) {
        errors.push('Geçersiz telefon formatı');
      }
      break;
      
    case 'projeler':
      if (!record.ad || typeof record.ad !== 'string') {
        errors.push('Proje adı zorunludur');
      }
      if (!record.aciklama || typeof record.aciklama !== 'string') {
        errors.push('Proje açıklaması zorunludur');
      }
      break;
      
    case 'bagislar':
      if (!record.bagisci_adi || typeof record.bagisci_adi !== 'string') {
        errors.push('Bağışçı adı zorunludur');
      }
      if (!record.miktar || isNaN(parseFloat(record.miktar))) {
        errors.push('Geçerli bir miktar giriniz');
      }
      break;
      
    case 'yardim_basvurulari':
      if (!record.basvuran_adi || typeof record.basvuran_adi !== 'string') {
        errors.push('Başvuran adı zorunludur');
      }
      if (!record.yardim_turu || typeof record.yardim_turu !== 'string') {
        errors.push('Yardım türü zorunludur');
      }
      break;
      
    case 'odemeler':
      if (!record.miktar || isNaN(parseFloat(record.miktar))) {
        errors.push('Geçerli bir miktar giriniz');
      }
      if (!record.aciklama || typeof record.aciklama !== 'string') {
        errors.push('Ödeme açıklaması zorunludur');
      }
      break;
      
    case 'gonulluler':
      if (!record.ad || typeof record.ad !== 'string') {
        errors.push('Gönüllü adı zorunludur');
      }
      if (!record.soyad || typeof record.soyad !== 'string') {
        errors.push('Gönüllü soyadı zorunludur');
      }
      if (record.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)) {
        errors.push('Geçersiz email formatı');
      }
      break;
      
    case 'yetimler':
      if (!record.ad || typeof record.ad !== 'string') {
        errors.push('Yetim adı zorunludur');
      }
      if (!record.soyad || typeof record.soyad !== 'string') {
        errors.push('Yetim soyadı zorunludur');
      }
      if (!record.dogum_tarihi) {
        errors.push('Doğum tarihi zorunludur');
      }
      break;
      
    case 'etkinlikler':
      if (!record.ad || typeof record.ad !== 'string') {
        errors.push('Etkinlik adı zorunludur');
      }
      if (!record.tarih) {
        errors.push('Etkinlik tarihi zorunludur');
      }
      break;
      
    case 'kurumlar':
      if (!record.ad || typeof record.ad !== 'string') {
        errors.push('Kurum adı zorunludur');
      }
      break;
  }
  
  return errors;
};

// Toplu veri yükleme ana fonksiyonu
export const bulkImport = async (
  dataType: SupportedDataType,
  records: any[],
  options: BulkImportOptions = {}
): Promise<BulkImportResult> => {
  const startTime = Date.now();
  const {
    batchSize = 50,
    skipErrors = true,
    validateOnly = false,
    onProgress
  } = options;
  
  const result: BulkImportResult = {
    success: false,
    totalRecords: records.length,
    successfulImports: 0,
    failedImports: 0,
    errors: [],
    duration: 0
  };
  
  if (!records || records.length === 0) {
    result.errors.push({ row: 0, error: 'Hiç veri bulunamadı' });
    result.duration = Date.now() - startTime;
    return result;
  }
  
  const createFunction = createFunctions[dataType];
  if (!createFunction) {
    result.errors.push({ row: 0, error: `Desteklenmeyen veri türü: ${dataType}` });
    result.duration = Date.now() - startTime;
    return result;
  }
  
  // Batch'ler halinde işle
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    
    for (let j = 0; j < batch.length; j++) {
      const rowIndex = i + j + 1; // 1-based index
      const record = batch[j];
      
      try {
        // Veri doğrulama
        const validationErrors = validateRecord(dataType, record);
        if (validationErrors.length > 0) {
          result.errors.push({
            row: rowIndex,
            error: validationErrors.join(', '),
            data: record
          });
          result.failedImports++;
          
          if (!skipErrors) {
            result.duration = Date.now() - startTime;
            return result;
          }
          continue;
        }
        
        // Sadece doğrulama modunda kaydetme
        if (!validateOnly) {
          // ID alanını kaldır (otomatik oluşturulacak)
          const { id, ...recordWithoutId } = record;
          
          await createFunction(recordWithoutId);
        }
        
        result.successfulImports++;
        
      } catch (error: any) {
        result.errors.push({
          row: rowIndex,
          error: error.message || 'Bilinmeyen hata',
          data: record
        });
        result.failedImports++;
        
        if (!skipErrors) {
          result.duration = Date.now() - startTime;
          return result;
        }
      }
      
      // İlerleme bildirimi
      if (onProgress) {
        const current = i + j + 1;
        const percentage = Math.round((current / records.length) * 100);
        onProgress({ current, total: records.length, percentage });
      }
    }
    
    // Batch'ler arası kısa bekleme (rate limiting)
    if (i + batchSize < records.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  result.success = result.failedImports === 0 || (skipErrors && result.successfulImports > 0);
  result.duration = Date.now() - startTime;
  
  return result;
};

// CSV parse fonksiyonu
export const parseCSV = (csvText: string): any[] => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const records: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const record: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Sayısal değerleri dönüştür
      if (value && !isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
        record[header] = parseFloat(value);
      } else {
        record[header] = value;
      }
    });
    
    records.push(record);
  }
  
  return records;
};

// JSON parse fonksiyonu
export const parseJSON = (jsonText: string): any[] => {
  try {
    const data = JSON.parse(jsonText);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    throw new Error('Geçersiz JSON formatı');
  }
};

// Excel parse fonksiyonu (basit TSV formatı)
export const parseExcel = (excelText: string): any[] => {
  const lines = excelText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split('\t').map(h => h.trim());
  const records: any[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split('\t').map(v => v.trim());
    const record: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || '';
      // Sayısal değerleri dönüştür
      if (value && !isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
        record[header] = parseFloat(value);
      } else {
        record[header] = value;
      }
    });
    
    records.push(record);
  }
  
  return records;
};

// Veri türü şablonları
export const getDataTemplate = (dataType: SupportedDataType): any => {
  const templates: Record<SupportedDataType, Record<string, any>> = {
    kisiler: {
      ad: 'Örnek Ad',
      soyad: 'Örnek Soyad',
      email: 'ornek@email.com',
      telefon: '05551234567',
      adres: 'Örnek Adres',
      notlar: 'Örnek notlar'
    },
    projeler: {
      ad: 'Örnek Proje',
      aciklama: 'Proje açıklaması',
      baslangic_tarihi: '2024-01-01',
      bitis_tarihi: '2024-12-31',
      butce: 10000,
      durum: 'Aktif'
    },
    bagislar: {
      bagisci_adi: 'Örnek Bağışçı',
      miktar: 1000,
      tarih: '2024-01-01',
      aciklama: 'Bağış açıklaması',
      kategori: 'Genel'
    },
    yardim_basvurulari: {
      basvuran_adi: 'Örnek Başvuran',
      yardim_turu: 'Gıda Yardımı',
      aciklama: 'Yardım açıklaması',
      tarih: '2024-01-01',
      durum: 'Beklemede'
    },
    davalar: {
      dava_no: 'Örnek Dava No',
      konu: 'Dava Konusu',
      durum: 'Devam Ediyor',
      tarih: '2024-01-01',
      aciklama: 'Dava açıklaması'
    },
    odemeler: {
      miktar: 1000,
      aciklama: 'Ödeme açıklaması',
      tarih: '2024-01-01',
      tur: 'Gider'
    },
    finansal_kayitlar: {
      miktar: 1000,
      tur: 'Gelir',
      kategori: 'Bağış',
      tarih: '2024-01-01',
      aciklama: 'Finansal kayıt açıklaması'
    },
    gonulluler: {
      ad: 'Örnek Ad',
      soyad: 'Örnek Soyad',
      email: 'gonullu@email.com',
      telefon: '05551234567',
      uzmanlık_alani: 'Eğitim',
      musaitlik: 'Hafta sonu'
    },
    vefa_destek: {
      kisi_adi: 'Örnek Kişi',
      destek_turu: 'Alışveriş',
      tarih: '2024-01-01',
      durum: 'Tamamlandı'
    },
    kumbaralar: {
      ad: 'Örnek Kumbara',
      hedef_miktar: 5000,
      mevcut_miktar: 1000,
      aciklama: 'Kumbara açıklaması'
    },
    depo_urunleri: {
      urun_adi: 'Örnek Ürün',
      miktar: 100,
      birim: 'Adet',
      kategori: 'Gıda'
    },
    yetimler: {
      ad: 'Örnek Ad',
      soyad: 'Örnek Soyad',
      dogum_tarihi: '2010-01-01',
      cinsiyet: 'Erkek',
      adres: 'Örnek Adres',
      vasi_adi: 'Vasi Adı'
    },
    ogrenci_burslari: {
      ogrenci_adi: 'Örnek Öğrenci',
      okul: 'Örnek Okul',
      sinif: '9',
      burs_miktari: 500,
      donem: '2024-2025'
    },
    etkinlikler: {
      ad: 'Örnek Etkinlik',
      aciklama: 'Etkinlik açıklaması',
      tarih: '2024-01-01',
      saat: '14:00',
      yer: 'Etkinlik Yeri',
      kapasite: 100
    },
    ayni_yardim_islemleri: {
      alici_adi: 'Örnek Alıcı',
      yardim_turu: 'Gıda Paketi',
      miktar: 1,
      tarih: '2024-01-01'
    },
    hizmetler: {
      hizmet_adi: 'Örnek Hizmet',
      aciklama: 'Hizmet açıklaması',
      kategori: 'Sağlık',
      durum: 'Aktif'
    },
    hastane_sevkler: {
      hasta_adi: 'Örnek Hasta',
      hastane: 'Örnek Hastane',
      sevk_tarihi: '2024-01-01',
      aciklama: 'Sevk açıklaması'
    },
    kurumlar: {
      ad: 'Örnek Kurum',
      adres: 'Kurum Adresi',
      telefon: '02121234567',
      email: 'kurum@email.com',
      yetkili_kisi: 'Yetkili Adı'
    }
  };
  
  return templates[dataType] || {};
};

// CSV şablonu oluştur
export const generateCSVTemplate = (dataType: SupportedDataType): string => {
  const template = getDataTemplate(dataType);
  const headers = Object.keys(template).join(',');
  const values = Object.values(template).join(',');
  return `${headers}\n${values}`;
};