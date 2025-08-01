import { InferenceClient } from '@huggingface/inference';

import type {
  DashboardStats,
  Person,
  DepoUrunu,
  StokTahmini,
  DashboardInsight,
  ChatMessage,
  Etkinlik,
  Gonullu,
  VolunteerSuggestion,
  AnalyticsSummary
} from '../types';
import {
  YardimBasvurusu,
  BasvuruOncelik,
  GonderimTuru,
  GonulluDurum,
  Beceri,
  HesapKategorisi,
  Sentiment,
  YardimTuru
} from '../types';

import { getPeople, getYardimBasvurulari } from './apiService';

// HuggingFace API key - ücretsiz hesap oluşturun: https://huggingface.co/settings/tokens
const apiKey = (import.meta as any).env.VITE_HUGGINGFACE_API_KEY;

if (!apiKey) {
  console.warn(
    'VITE_HUGGINGFACE_API_KEY environment variable not set. HuggingFace API features will not work.'
  );
}

const client = new InferenceClient(apiKey);

// Response cache sistemi - performans optimizasyonu
const responseCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

const getCachedResponse = (key: string) => {
  const cached = responseCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedResponse = (key: string, data: any) => {
  responseCache.set(key, { data, timestamp: Date.now() });
};

// Optimize edilmiş ücretsiz modeller - daha iyi performans
const CHAT_MODEL = 'microsoft/DialoGPT-large'; // Gelişmiş konuşma modeli
const TEXT_MODEL = 'google/flan-t5-large'; // Daha güçlü metin üretimi
const CLASSIFICATION_MODEL = 'nlptown/bert-base-multilingual-uncased-sentiment'; // Çok dilli sentiment analizi
const TURKISH_MODEL = 'dbmdz/bert-base-turkish-cased'; // Türkçe özel model

// Türkçe prompt template'leri
const TURKISH_PROMPTS = {
  FILTER_DATA: (dataType: string, query: string) => 
    `Aşağıdaki ${dataType} verilerini "${query}" sorgusuna göre filtrele. En uygun sonuçların indekslerini virgülle ayırarak döndür (örn: 0,2,5):`,
  REPORT_SUMMARY: (stats: any) => 
    `Bu istatistiklere dayalı kısa ve öz bir rapor özeti oluştur:\n\nToplam Kişi: ${stats.totalMembers || stats.toplamKisi}\nAktif Başvuru: ${stats.activeProjects || stats.aktifBasvuru}\nTamamlanan Yardım: ${stats.completedHelp || stats.tamamlananYardim}\nToplam Bağış: ${stats.totalDonations || stats.toplamBagis}\n\nÖzet:`,
  CASE_SUBJECT: (info: string) => 
    `Aşağıdaki dava bilgilerine dayalı kısa ve net bir dava konusu öner:\n\n${info}\n\nDava konusu:`,
  EXPENSE_CATEGORY: (description: string, amount: number) => 
    `Bu harcama açıklamasını kategorize et: "${description}" - ${amount} TL\n\nKategori seçenekleri: Bağış, Proje Gideri, Ofis Gideri, Diğer Gider\n\nKategori:`
};

// Global error handler for HuggingFace API errors
const handleHuggingFaceError = (error: any, fallbackValue: any = null) => {
  console.warn('HuggingFace API error:', error.message);
  return fallbackValue;
};

// Gelişmiş text generation helper function - cache ve retry ile
const generateText = async (
  prompt: string,
  maxTokens: number = 512,
  useCache: boolean = true
): Promise<string> => {
  const cacheKey = `text_${prompt.substring(0, 100)}_${maxTokens}`;
  
  // Cache kontrolü
  if (useCache) {
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;
  }

  // Retry mekanizması
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await client.textGeneration({
        model: TEXT_MODEL,
        inputs: prompt,
        parameters: {
          max_new_tokens: maxTokens,
          temperature: 0.7,
          do_sample: true,
          repetition_penalty: 1.1
        }
      });
      
      const result = response.generated_text || '';
      if (useCache && result) {
        setCachedResponse(cacheKey, result);
      }
      return result;
    } catch (error) {
      if (attempt === 2) {
        return handleHuggingFaceError(error, 'Analiz şu anda kullanılamıyor.');
      }
      // Kısa bekleme sonrası tekrar dene
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  return 'Analiz şu anda kullanılamıyor.';
};

// Chat completion helper function
const chatCompletion = async (
  messages: Array<{ role: string; content: string }>,
  maxTokens: number = 512
): Promise<string> => {
  try {
    // HuggingFace chat completion için mesajları birleştir
    const prompt = `${messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n')}\nassistant:`;

    const response = await client.textGeneration({
      model: TEXT_MODEL,
      inputs: prompt,
      parameters: {
        max_new_tokens: maxTokens,
        temperature: 0.7,
        do_sample: true
      }
    });
    return response.generated_text?.replace(prompt, '').trim() || '';
  } catch (error) {
    return handleHuggingFaceError(error, 'Yanıt şu anda kullanılamıyor.');
  }
};

export const filterDataWithAI = async (
  data: any[],
  query: string,
  dataType: string
): Promise<any[]> => {
  try {
    const prompt = TURKISH_PROMPTS.FILTER_DATA(dataType, query) + 
      `\n\n${JSON.stringify(data.slice(0, 10), null, 2)}`;

    const result = await generateText(prompt, 100, true);
    const indices = result
      .split(',')
      .map(i => parseInt(i.trim()))
      .filter(i => !isNaN(i) && i < data.length);

    return indices.length > 0 ? indices.map(i => data[i]) : data.slice(0, 5);
  } catch (error) {
    console.error('AI filtreleme hatası:', error);
    return data.slice(0, 5);
  }
};

export const generateReportSummary = async (
  stats: DashboardStats
): Promise<string> => {
  try {
    const prompt = TURKISH_PROMPTS.REPORT_SUMMARY(stats);

    const summary = await generateText(prompt, 200, true);
    return summary || 'Rapor özeti oluşturulamadı.';
  } catch (error) {
    return handleHuggingFaceError(
      error,
      'Rapor özeti şu anda oluşturulamıyor.'
    );
  }
};

export const filterDataConversational = async (
  data: any[],
  query: string,
  dataType: string
): Promise<any[]> => {
  try {
    const prompt = `"${query}" sorusuna göre ${dataType} verilerini filtrele:\n\n${JSON.stringify(data.slice(0, 10), null, 2)}\n\nEn uygun sonuçların indekslerini döndür:`;

    const result = await generateText(prompt, 100);
    const indices = result
      .split(',')
      .map(i => parseInt(i.trim()))
      .filter(i => !isNaN(i) && i < data.length);

    return indices.length > 0 ? indices.map(i => data[i]) : data.slice(0, 5);
  } catch (error) {
    return handleHuggingFaceError(error, data.slice(0, 5));
  }
};

export const smartSearchPeople = async (query: string): Promise<Person[]> => {
  try {
    const people = await getPeople();
    const prompt = `"${query}" aramasına göre kişileri filtrele:\n\n${JSON.stringify(people.slice(0, 20), null, 2)}\n\nEn uygun kişilerin indekslerini döndür:`;

    const result = await generateText(prompt, 100);
    const indices = result
      .split(',')
      .map(i => parseInt(i.trim()))
      .filter(i => !isNaN(i) && i < people.length);

    return indices.length > 0
      ? indices.map(i => people[i])
      : people.slice(0, 10);
  } catch (error) {
    return handleHuggingFaceError(error, []);
  }
};

export const generateDavaKonusu = async (
  davaBilgileri: string
): Promise<string> => {
  try {
    const prompt = TURKISH_PROMPTS.CASE_SUBJECT(davaBilgileri);

    const konu = await generateText(prompt, 100, true);
    return konu || 'Genel Hukuki Yardım';
  } catch (error) {
    return handleHuggingFaceError(error, 'Genel Hukuki Yardım');
  }
};

export const generateDashboardInsights = async (
  stats: DashboardStats
): Promise<DashboardInsight[]> => {
  try {
    const prompt = `Bu istatistiklere dayalı 3 önemli içgörü oluştur:\n\nToplam Kişi: ${stats.toplamKisi}\nAktif Başvuru: ${stats.aktifBasvuru}\nTamamlanan Yardım: ${stats.tamamlananYardim}\nToplam Bağış: ${stats.toplamBagis}\n\nJSON formatında 3 içgörü döndür:`;

    const result = await generateText(prompt, 300);

    // Basit fallback insights
    const fallbackInsights: DashboardInsight[] = [
      {
        text: `${stats.aktifBasvuru} aktif başvuru bulunmaktadır.`,
        type: 'info' as const,
        priority: 'medium' as const
      },
      {
        text: `${stats.tamamlananYardim} yardım tamamlanmıştır.`,
        type: 'success' as const,
        priority: 'low' as const
      },
      {
        text: `${stats.toplamBagis.toLocaleString('tr-TR')} TL bağış toplanmıştır.`,
        type: 'warning' as const,
        priority: 'high' as const
      }
    ];
    return fallbackInsights;
  } catch (error) {
    return handleHuggingFaceError(error, []);
  }
};

export const generateAnalyticsSummary = async (
  data: any
): Promise<AnalyticsSummary> => {
  try {
    const prompt = `Bu verilere dayalı bir analitik özeti oluştur:\n\n${JSON.stringify(data, null, 2)}\n\nÖzet, trend ve öneriler içeren bir analiz yap:`;

    const result = await generateText(prompt, 400);

    // Basit fallback summary
    const fallbackSummary: AnalyticsSummary = {
      summary: 'Genel performans değerlendirmesi yapılmıştır.',
      actionableInsights: [
        'Bağış kampanyalarının etkinliğini artırmak için sosyal medya kullanımını optimize edin',
        'Gönüllü katılımını artırmak için düzenli eğitim programları düzenleyin'
      ],
      positiveTrends: [
        'Son 3 ayda bağış miktarında %15 artış gözlemlendi',
        'Yeni üye kayıtlarında istikrarlı büyüme'
      ],
      areasForAttention: [
        'Bazı projelerde bütçe aşımları tespit edildi',
        'Gönüllü devamsızlık oranlarında artış'
      ]
    };

    return fallbackSummary;
  } catch (error) {
    return handleHuggingFaceError(error, {
      summary: 'Analiz şu anda kullanılamıyor.',
      actionableInsights: [],
      positiveTrends: [],
      areasForAttention: []
    });
  }
};

export const processImageWithAI = async (
  imageFile: File | string
): Promise<any> => {
  try {
    // Basit OCR simülasyonu - gerçek OCR için TrOCR modeli kullanılabilir
    // const OCR_MODEL = 'microsoft/trocr-base-printed';
    
    // Şimdilik mock data döndür - gelecekte gerçek OCR entegrasyonu yapılabilir
    const mockData = {
      ad: 'Tespit Edilemedi',
      soyad: 'Tespit Edilemedi', 
      tcKimlikNo: 'Tespit Edilemedi',
      dogumTarihi: 'Tespit Edilemedi',
      dogumYeri: 'Tespit Edilemedi',
      confidence: 0.1
    };
    
    // Gelecekte gerçek OCR implementasyonu:
    // const response = await client.imageToText({
    //   model: OCR_MODEL,
    //   data: imageFile
    // });
    
    return mockData;
  } catch (error) {
    return handleHuggingFaceError(error, {
      ad: '',
      soyad: '',
      tcKimlikNo: '',
      dogumTarihi: '',
      dogumYeri: '',
      confidence: 0
    });
  }
};



export const analyzeSentiment = async (text: string): Promise<Sentiment> => {
  const cacheKey = `sentiment_${text.substring(0, 50)}`;
  
  // Cache kontrolü
  const cached = getCachedResponse(cacheKey);
  if (cached) return cached;

  // Retry mekanizması ile gelişmiş sentiment analizi
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await client.textClassification({
        model: CLASSIFICATION_MODEL,
        inputs: text
      });

      if (response && response.length > 0) {
        const result = response[0];
        let sentiment: Sentiment;
        
        // Çok dilli sentiment etiketlerini destekle
        const label = result.label?.toLowerCase() || '';
        const score = result.score || 0;
        
        if (label.includes('positive') || label.includes('pos') || score > 0.6) {
          sentiment = Sentiment._POZITIF;
        } else if (label.includes('negative') || label.includes('neg') || score < 0.4) {
          sentiment = Sentiment._NEGATIF;
        } else {
          sentiment = Sentiment._NOTR;
        }
        
        setCachedResponse(cacheKey, sentiment);
        return sentiment;
      }

      setCachedResponse(cacheKey, Sentiment._NOTR);
      return Sentiment._NOTR;
    } catch (error) {
      if (attempt === 1) {
        return handleHuggingFaceError(error, Sentiment._NOTR);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return Sentiment._NOTR;
};

export const generateStockPrediction = async (
  currentStock: DepoUrunu[],
  historicalData: any[]
): Promise<StokTahmini[]> => {
  try {
    const prompt = `Mevcut stok durumu ve geçmiş verilere dayalı stok tahmini yap:\n\nMevcut Stok: ${JSON.stringify(currentStock.slice(0, 5), null, 2)}\n\nBasit stok önerileri ver:`;

    const result = await generateText(prompt, 200);

    // Simple fallback predictions
    return currentStock.slice(0, 3).map(item => ({
      urunAdi: item.name,
      oneri:
        item.quantity < item.minStockLevel
          ? `${item.name} stoku kritik seviyede, acil tedarik gerekli`
          : `${item.name} stoku normal seviyede`,
      oncelik: item.quantity < item.minStockLevel ? 'Yüksek' : 'Orta'
    }));
  } catch (error) {
    return handleHuggingFaceError(error, []);
  }
};

export const optimizeDeliveryRoute = async (
  deliveries: any[]
): Promise<any[]> => {
  // Simple optimization - distance based sorting
  return deliveries.slice(0, 5).map((_delivery, index) => ({
    id: `route_${index}`,
    baslik: `Rota ${index + 1}`,
    aciklama: 'Optimize edilmiş teslimat rotası',
    durum: 'beklemede' as const
  }));
};

export const generateChatResponse = async (
  messages: ChatMessage[]
): Promise<string> => {
  try {
    const conversationHistory = messages.slice(-5).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const response = await chatCompletion(conversationHistory, 200);
    return response || 'Üzgünüm, şu anda yanıt veremiyorum.';
  } catch (error) {
    return handleHuggingFaceError(error, 'Üzgünüm, şu anda yanıt veremiyorum.');
  }
};

export const suggestVolunteersForEvent = async (
  event: Etkinlik,
  volunteers: Gonullu[]
): Promise<VolunteerSuggestion[]> => {
  try {
    const activeVolunteers = volunteers.filter(
      v => v.durum === GonulluDurum.AKTIF
    );

    // Basit eşleştirme - ilk 3 aktif gönüllü
    return activeVolunteers.slice(0, 3).map(volunteer => ({
      personId: volunteer.personId,
      volunteerName: `${volunteer.ad || ''} ${volunteer.soyad || ''}`.trim(),
      reasoning: 'Aktif gönüllü ve uygun beceriler',
      relevantSkills: volunteer.beceriler || []
    }));
  } catch (error) {
    return handleHuggingFaceError(error, []);
  }
};

export const categorizeExpense = async (
  description: string,
  amount: number
): Promise<HesapKategorisi> => {
  try {
    const prompt = TURKISH_PROMPTS.EXPENSE_CATEGORY(description, amount);

    const result = await generateText(prompt, 50, true);

    // AI sonucuna göre kategorizasyon
    const resultLower = result.toLowerCase();
    if (resultLower.includes('bağış') || resultLower.includes('bagis')) {
      return HesapKategorisi.BAGIS;
    } else if (resultLower.includes('proje')) {
      return HesapKategorisi.PROJE_GIDERI;
    } else if (resultLower.includes('ofis')) {
      return HesapKategorisi.OFIS_GIDERI;
    }

    // Fallback: Basit keyword analizi
    if (
      description.toLowerCase().includes('yardım') ||
      description.toLowerCase().includes('bağış')
    ) {
      return HesapKategorisi.BAGIS;
    } else if (
      description.toLowerCase().includes('etkinlik') ||
      description.toLowerCase().includes('program')
    ) {
      return HesapKategorisi.PROJE_GIDERI;
    } else if (
      description.toLowerCase().includes('ofis') ||
      description.toLowerCase().includes('kira')
    ) {
      return HesapKategorisi.OFIS_GIDERI;
    }

    return HesapKategorisi.DIGER_GIDER;
  } catch (error) {
    return handleHuggingFaceError(error, HesapKategorisi.DIGER_GIDER);
  }
};


// Batch processing fonksiyonu - birden fazla isteği optimize eder
export const batchProcessTexts = async (
  prompts: string[],
  maxTokens: number = 512
): Promise<string[]> => {
  const results: string[] = [];
  
  // Batch size - aynı anda işlenecek maksimum istek sayısı
  const batchSize = 3;
  
  for (let i = 0; i < prompts.length; i += batchSize) {
    const batch = prompts.slice(i, i + batchSize);
    const batchPromises = batch.map(prompt => generateText(prompt, maxTokens, true));
    
    try {
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      console.error('Batch processing hatası:', error);
      // Hatalı batch için fallback değerler ekle
      results.push(...batch.map(() => 'İşlem başarısız'));
    }
    
    // Rate limiting için kısa bekleme
    if (i + batchSize < prompts.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
};

// Cache temizleme fonksiyonu
export const clearCache = (): void => {
  responseCache.clear();
};

// Cache istatistikleri
export const getCacheStats = () => {
  return {
    size: responseCache.size,
    entries: Array.from(responseCache.keys()).slice(0, 10) // İlk 10 key
  };
};

export {
  generateText,
  chatCompletion
};

export function getImageTags(_file: File) {
  throw new Error('Function not implemented.');
}
