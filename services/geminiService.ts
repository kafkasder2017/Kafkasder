import { GoogleGenAI, Type } from "@google/genai";
import { DashboardStats, Person, YardimBasvurusu, BasvuruOncelik, DepoUrunu, StokTahmini, GonderimTuru, ExtractedKimlikData, DashboardInsight, ChatMessage, Etkinlik, Gonullu, GonulluDurum, Beceri, VolunteerSuggestion, HesapKategorisi, ExtractedApplicationData, Sentiment, YardimTuru, AnalyticsSummary } from '../types';
import { getPeople, getYardimBasvurulari } from "./apiService";

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
const STABLE_MODEL = "gemini-2.5-flash";


const fileToGenerativePart = async (file: File | string) => {
    const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });

    if (typeof file === 'string') {
        const match = file.match(/^data:(image\/\w+);base64,(.+)$/);
        if (!match) throw new Error('Invalid data URL format');
        return {
            inlineData: {
                data: match[2],
                mimeType: match[1],
            },
        };
    }
    
    const data = await toBase64(file);
    return {
        inlineData: {
            data,
            mimeType: file.type,
        },
    };
};

async function filterDataWithAI<T extends { id: any }>(
    dataToFilter: T[],
    contextPrompt: string,
    errorContext: string
): Promise<number[]> {
    if (!process.env.API_KEY) {
        throw new Error("API anahtarı ayarlanmamış.");
    }
    
    const dataSample = dataToFilter.slice(0, 200);

    const prompt = `
        You are an expert data filtering assistant for a Turkish NGO.
        ${contextPrompt}
        
        You MUST return a valid JSON array containing ONLY the numeric 'id' values of the matching items from the dataset provided below.
        Do not include any other text, explanation, or markdown fences.
        For example: [1, 5, 23]. If no items match, return an empty array [].
        The user is Turkish, so interpret queries correctly based on the data structure.

        DATA TO FILTER:
        ${JSON.stringify(dataSample, null, 2)} 

        Based on the user's request, filter the "DATA TO FILTER". Return only the resulting JSON array of numeric IDs.
    `;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER }
                }
            }
        });
        
        const result = JSON.parse(response.text);
        if (Array.isArray(result)) {
            return result.map((id: any) => Number(id));
        }
        console.error(`AI response is not an array for ${errorContext}:`, result);
        throw new Error("Yapay zekadan gelen yanıt beklenen formatta değil.");

    } catch (error) {
        console.error(`Error with ${errorContext} from Gemini:`, error);
        const errorMessage = errorContext === 'Smart Search' 
            ? "Akıllı arama sırasında bir hata oluştu. Lütfen tekrar deneyin."
            : "Akıllı filtreleme sırasında bir hata oluştu. Lütfen tekrar deneyin.";
        throw new Error(errorMessage);
    }
}


export const generateReportSummary = async (stats: DashboardStats): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış. Lütfen yönetici ile iletişime geçin."));
    }

    const prompt = `
        Kafkasder derneği yönetim paneli için bir durum özeti raporu oluştur. Raporu Türkçe ve profesyonel bir dille yaz. 
        Mevcut istatistikler şunlar:
        - Toplam Üye Sayısı: ${stats.totalMembers}
        - Bu Ayki Bağış Tutarı: ${stats.monthlyDonations.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        - Aktif Proje Sayısı: ${stats.activeProjects}
        - Onay Bekleyen Başvuru Sayısı: ${stats.pendingApplications}

        Bu verilere dayanarak, derneğin mevcut durumu hakkında kısa ve öz bir analiz yap. 
        Özellikle bağış durumunu ve bekleyen başvuruların önemini vurgula. 
        Gelecek adımlar için kısa bir tavsiye ekleyebilirsin.
    `;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating report summary from Gemini:", error);
        throw new Error("Yapay zeka raporu oluşturulurken bir hata oluştu.");
    }
};


export const filterDataConversational = async <T>(
    fullData: T[],
    currentFilteredData: T[] | null,
    history: ChatMessage[],
    newUserInput: string
): Promise<T[]> => {
    const dataToFilter = currentFilteredData === null ? fullData : currentFilteredData;
    const recentHistory = history.slice(-4).map(h => `${h.role}: ${h.text}`).join('\n');
    
    const contextPrompt = `
        Your task is to filter a JSON dataset based on a conversational user request.
        PREVIOUS CONVERSATION for context:
        ${recentHistory}

        USER'S LATEST REQUEST: "${newUserInput}"
    `;
    
    const returnedIds = await filterDataWithAI(dataToFilter as any[], contextPrompt, "Conversational Filter");
    
    const returnedIdsSet = new Set(returnedIds);
    if (returnedIdsSet.size === 0) return [];
    
    const originalDataMap = new Map(fullData.map(item => [(item as any).id, item]));
    
    return Array.from(returnedIdsSet)
        .map(id => originalDataMap.get(id))
        .filter(Boolean) as T[];
};

export const smartSearchPeople = async (query: string): Promise<Person[]> => {
    const allPeople = await getPeople();
    const aidRecipients = allPeople.filter(p => p.aldigiYardimTuru && p.aldigiYardimTuru.length > 0);
    
    const contextPrompt = `
        Your task is to filter a JSON dataset of aid recipients based on a user's search query.
        USER'S SEARCH QUERY: "${query}"
    `;

    const returnedIds = await filterDataWithAI(aidRecipients, contextPrompt, "Smart Search");

    const returnedIdsSet = new Set(returnedIds);
    if (returnedIdsSet.size === 0) return [];

    const originalDataMap = new Map(aidRecipients.map(item => [item.id, item]));
    
    return Array.from(returnedIdsSet)
        .map(id => originalDataMap.get(id))
        .filter(Boolean) as Person[];
};

export const generateDavaKonusu = async (muvekkil: string, karsiTaraf: string, davaTuru: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış. Lütfen yönetici ile iletişime geçin."));
    }
    
    if (!muvekkil || !karsiTaraf || !davaTuru) {
        return Promise.reject(new Error("Dava konusu oluşturmak için Müvekkil, Karşı Taraf ve Dava Türü alanları gereklidir."));
    }

    const prompt = `
        Aşağıdaki bilgilere dayanarak profesyonel ve kısa bir Türkçe dava konusu başlığı oluştur:
        - Müvekkil: ${muvekkil}
        - Karşı Taraf: ${karsiTaraf}
        - Dava Türü: ${davaTuru}

        Örnek: "Tazminat Talebi", "İşe İade Davası", "Boşanma ve Velayet Talebi".
        Sadece dava konusu metnini döndür, başka hiçbir açıklama ekleme.
    `;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating case subject from Gemini:", error);
        throw new Error("Yapay zeka ile dava konusu oluşturulurken bir hata oluştu.");
    }
};

export const analyzeApplication = async (applicationText: string): Promise<{ ozet: string; oncelik: BasvuruOncelik }> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }
    const prompt = `
        Bir STK çalışanı olarak, aşağıdaki yardım başvurusu metnini analiz et.
        Metin: "${applicationText}"

        Görevin:
        1. Başvurunun 1-2 cümlelik kısa bir özetini çıkar.
        2. Başvurunun aciliyetine göre bir öncelik seviyesi belirle ('Yüksek', 'Orta', 'Düşük').

        Cevabını JSON formatında döndür. Başka hiçbir metin ekleme.
    `;
    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        ozet: { type: Type.STRING },
                        oncelik: { type: Type.STRING, enum: Object.values(BasvuruOncelik) },
                    },
                    required: ["ozet", "oncelik"]
                }
            }
        });

        const parsed = JSON.parse(response.text);
        if(parsed.ozet && parsed.oncelik) {
            return parsed as { ozet: string; oncelik: BasvuruOncelik };
        }
        throw new Error("Yapay zekadan gelen yanıt beklenen formatta değil.");
    } catch (error) {
        console.error("Error analyzing application:", error);
        throw new Error("Başvuru analizi sırasında bir hata oluştu.");
    }
};

export const predictStockNeeds = async (stockData: DepoUrunu[]): Promise<StokTahmini[]> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }
    const prompt = `
        Bir STK'nın lojistik ve depo yönetimi uzmanı olarak, aşağıdaki depo envanterini (JSON formatında) analiz et.
        Veri: ${JSON.stringify(stockData, null, 2)}

        Görevin, en kritik 3-5 stok sorununu belirlemek ve her biri için bir öneri oluşturmaktır.
        Analiz Kriterleri:
        1.  Kritik Stok Seviyesi: 'quantity' değeri 'minStockLevel' değerinin altında veya çok yakınında olan ürünler.
        2.  Yaklaşan Son Kullanma Tarihi (SKT): 'expirationDate' değeri bugüne çok yakın veya geçmiş olan ürünler. Öncelik sırasına göre sırala.
        3.  Genel Tavsiyeler: Mevsimsel ihtiyaçlar (örn: kış için battaniye, okul dönemi için kırtasiye) veya genel stok dengesizlikleri hakkında öngörülerde bulun.

        Sadece JSON dizisini döndür, başka hiçbir metin veya açıklama ekleme.
    `;
    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            urunAdi: { type: Type.STRING },
                            oneri: { type: Type.STRING },
                            oncelik: { type: Type.STRING, enum: ['Yüksek', 'Orta', 'Düşük'] }
                        },
                        required: ["urunAdi", "oneri", "oncelik"]
                    }
                }
            }
        });
        const parsed = JSON.parse(response.text);
         if (Array.isArray(parsed)) {
            return parsed as StokTahmini[];
        }
        throw new Error("Yapay zekadan gelen yanıt beklenen formatta değil.");
    } catch (error) {
        console.error("Error predicting stock needs:", error);
        throw new Error("Stok ihtiyaç tahmini sırasında bir hata oluştu.");
    }
};

export const generateProjectPlan = async (title: string): Promise<{ description: string; budget: number; }> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }
    const prompt = `
        Bir STK proje yöneticisi olarak, başlığı "${title}" olan yeni bir proje için bir plan taslağı oluştur.
        
        Görevin:
        1.  Projeyi detaylı bir şekilde açıklayan profesyonel bir "description" (proje açıklaması) metni yaz.
        2.  Proje için makul bir "budget" (bütçe) rakamı (sadece sayı olarak) öner.

        Cevabını JSON formatında döndür. Başka hiçbir metin ekleme.
    `;
    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: { 
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        description: { type: Type.STRING },
                        budget: { type: Type.NUMBER }
                    },
                    required: ["description", "budget"]
                }
            }
        });

        const parsed = JSON.parse(response.text);
        if (parsed.description && typeof parsed.budget === 'number') {
            return parsed as { description: string; budget: number; };
        }
        throw new Error("Yapay zekadan gelen yanıt beklenen formatta değil.");
    } catch (error) {
        console.error("Error generating project plan:", error);
        throw new Error("Proje planı oluşturulurken bir hata oluştu.");
    }
};

export const generateCommunicationMessage = async (topic: string, audience: string, type: GonderimTuru): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }

    const prompt = `
        Bir sivil toplum kuruluşu (KAFKASDER) için bir iletişim metni hazırla.
        
        - Konu: "${topic}"
        - Hedef Kitle: "${audience}"
        - Mesaj Formatı: "${type}"

        Kurallar:
        1.  Dil samimi, profesyonel ve saygılı olmalı.
        2.  ${type === GonderimTuru.SMS ? 'Mesaj çok kısa ve net olmalı (SMS formatına uygun).' : 'Mesaj, bir e-posta formatında daha detaylı olabilir.'}
        3.  Mesajın sonuna "KAFKASDER" imzasını ekle.
        
        Sadece oluşturduğun mesaj metnini döndür. Başka hiçbir açıklama veya metin ekleme.
    `;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating communication message:", error);
        throw new Error("AI ile mesaj oluşturulurken bir hata oluştu.");
    }
};

export const generateAidatHatirlatma = async (uyeAdi: string, donem: string, tutar: number): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }
    
    const prompt = `
        KAFKASDER derneği için bir üye aidat hatırlatma mesajı oluştur. Mesaj kısa, nazik ve bilgilendirici olmalı. SMS formatına uygun olsun.
        
        Kullanılacak Bilgiler:
        - Üye Adı: ${uyeAdi}
        - Aidat Dönemi: ${donem}
        - Tutar: ${tutar} TL

        Sadece oluşturduğun SMS metnini döndür. Başka hiçbir açıklama veya metin ekleme.
        Örnek: "Sayin ${uyeAdi}, ${donem} donemi ${tutar} TL aidat odemenizi hatirlatmak isteriz. Desteginiz icin tesekkurler. KAFKASDER"
    `;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating due reminder:", error);
        throw new Error("AI ile hatırlatma mesajı oluşturulurken bir hata oluştu.");
    }
};

export const generateDonationReportSummary = async (stats: { totalDonations: number, donorCount: number, topDonationType: string, monthlyAverage: number }): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }

    const prompt = `
        Bir STK'nın bağış raporu için yönetici özeti oluştur. Raporu Türkçe, profesyonel ve analitik bir dille yaz.
        
        Mevcut İstatistikler:
        - Toplam Bağış Tutarı: ${stats.totalDonations.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
        - Toplam Bağışçı Sayısı: ${stats.donorCount}
        - En Popüler Bağış Türü: ${stats.topDonationType}
        - Son 12 Ay Ortalaması: ${stats.monthlyAverage.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}

        Bu verilere dayanarak, derneğin bağış performansını analiz et. Öne çıkan noktaları, güçlü ve zayıf yönleri vurgula. 
        Gelecekteki bağış toplama stratejileri için 1-2 cümlelik bir öneride bulun. 
        Örneğin, en popüler bağış türünün neden başarılı olduğunu veya aylık ortalamanın ne anlama geldiğini yorumla.
    `;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating donation report summary from Gemini:", error);
        throw new Error("Yapay zeka rapor özeti oluşturulurken bir hata oluştu.");
    }
};

export const analyzeDocumentContent = async (docName: string, docType: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }

    const prompt = `
        Bir STK çalışanı olarak, tipi "${docType}" ve adı "${docName}" olan bir dokümanın ne hakkında olabileceğini 1-2 cümleyle, profesyonel bir dille özetle. 
        Örneğin, "Kimlik Fotokopisi" için, "Bu, kişinin kimlik bilgilerini (ad, soyad, TC No vb.) içeren resmi bir belgedir." gibi bir özet oluştur. 
        Sadece oluşturduğun özet metnini döndür. Başka hiçbir açıklama ekleme.
    `;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error analyzing document content:", error);
        throw new Error("AI doküman analizi sırasında bir hata oluştu.");
    }
};

export const extractInfoFromDocumentImage = async (imageData: string | File): Promise<ExtractedKimlikData> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }

    const imagePart = await fileToGenerativePart(imageData);

    const prompt = `Lütfen bu kimlik belgesi resmindeki bilgileri JSON formatında çıkar. İstenen alanlar: ad, soyad, kimlikNo, ve dogumTarihi (YYYY-MM-DD formatında).`;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        ad: { type: Type.STRING, description: 'Kişinin adı.' },
                        soyad: { type: Type.STRING, description: 'Kişinin soyadı.' },
                        kimlikNo: { type: Type.STRING, description: 'T.C. Kimlik Numarası veya pasaport numarası.' },
                        dogumTarihi: { type: Type.STRING, description: 'Doğum tarihi YYYY-MM-DD formatında.' },
                    },
                    required: ["ad", "soyad", "kimlikNo", "dogumTarihi"]
                },
            },
        });
        
        const parsed = JSON.parse(response.text);
        
        if (parsed.ad && parsed.soyad && parsed.kimlikNo && parsed.dogumTarihi) {
            return parsed as ExtractedKimlikData;
        }

        throw new Error("Yapay zekadan gelen yanıt beklenen formatta değil.");

    } catch (error) {
        console.error("Error extracting info from document image:", error);
        throw new Error("Kimlik belgesi analizi sırasında bir hata oluştu.");
    }
};

export const summarizeUploadedDocument = async (file: File): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }
    
    const supportedMimeTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'];
    if (!supportedMimeTypes.includes(file.type)) {
        console.log(`Unsupported file type for summarization: ${file.type}`);
        return '';
    }

    try {
        const filePart = await fileToGenerativePart(file);

        const prompt = `Bu belgenin içeriğini analiz et ve bir STK çalışanı için 2-3 cümlelik, en önemli bilgileri içeren, Türkçe bir özet çıkar. Belge bir dilekçe, rapor, fatura veya kimlik belgesi olabilir. İçeriği ne olursa olsun, amacını ve kilit noktalarını özetle. Sadece özet metnini döndür.`;

        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: { parts: [filePart, { text: prompt }] },
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error summarizing document from Gemini:", error);
        return '';
    }
};


export const generateDashboardInsights = async (
    stats: {
        pendingApplications: number;
        lateProjects: number;
        lowStockItems: number;
        monthlyDonationTotal: number;
    }
): Promise<DashboardInsight[]> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }

    const prompt = `
        Bir STK yönetim paneli için AI asistanı olarak, aşağıdaki verileri analiz et ve yöneticinin dikkat etmesi gereken en önemli 2-3 konuyu belirle. 
        Her bir konu için kısa, eyleme geçirilebilir bir metin, bir tür ('success', 'warning', 'info') ve bir öncelik ('high', 'medium', 'low') belirle.
        
        Veriler:
        - Onay Bekleyen Başvuru Sayısı: ${stats.pendingApplications}
        - Raporu Gecikmiş Proje Sayısı: ${stats.lateProjects}
        - Stoğu Kritik Seviyede Olan Ürün Sayısı: ${stats.lowStockItems}
        - Bu Ayki Toplam Bağış: ${stats.monthlyDonationTotal.toLocaleString('tr-TR')} TL

        Analiz Kuralları:
        - Eğer onay bekleyen başvuru sayısı 5'ten fazlaysa, bu 'high' öncelikli bir 'warning'dir.
        - Eğer gecikmiş proje varsa, bu 'medium' öncelikli bir 'warning'dir.
        - Eğer stoğu kritik ürün varsa, bu 'high' öncelikli bir 'warning'dir.
        - Eğer bu ayki bağışlar 50,000 TL'den fazlaysa, bu 'success' türünde bir 'info'dur.
        - Diğer durumlar için genel 'info' mesajları oluştur.
        
        Sadece JSON dizisini döndür, başka hiçbir metin veya açıklama ekleme.
    `;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            type: { type: Type.STRING, enum: ['success', 'warning', 'info'] },
                            priority: { type: Type.STRING, enum: ['high', 'medium', 'low'] }
                        },
                        required: ["text", "type", "priority"]
                    }
                }
            }
        });

        const parsed = JSON.parse(response.text);

        if (Array.isArray(parsed)) {
            return parsed as DashboardInsight[];
        }
        throw new Error("Yapay zekadan gelen yanıt beklenen formatta değil.");

    } catch (error) {
        console.error("Error generating dashboard insights:", error);
        throw new Error("AI analizleri oluşturulurken bir hata oluştu.");
    }
};

export interface EnrichedGonullu extends Gonullu {
    person: Person;
}

export const suggestVolunteersForEvent = async (
    event: Etkinlik,
    volunteers: EnrichedGonullu[]
): Promise<VolunteerSuggestion[]> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }

    const activeVolunteers = volunteers.filter(v => v.durum === GonulluDurum.AKTIF);
    
    const simplifiedVolunteers = activeVolunteers.map(v => ({
        personId: v.personId,
        name: `${v.person.ad} ${v.person.soyad}`,
        skills: v.beceriler,
        availability: v.musaitlik,
    }));

    const prompt = `
        Bir STK etkinlik koordinatörüsün. Görevin, aşağıdaki etkinlik için en uygun gönüllüleri önermek.
        
        ETKİNLİK DETAYLARI:
        - Adı: ${event.ad}
        - Açıklama: ${event.aciklama}
        - Tarih: ${event.tarih}
        - Konum: ${event.konum}

        MEVCUT AKTİF GÖNÜLLÜLER LİSTESİ:
        ${JSON.stringify(simplifiedVolunteers, null, 2)}

        GÖREVİN:
        1. Etkinliğin açıklamasını ve gereksinimlerini analiz et.
        2. Gönüllülerin becerilerini ('skills') ve müsaitlik durumlarını ('availability') göz önünde bulundur.
        3. Bu etkinlik için en uygun 3 ila 5 gönüllüyü seç.
        4. Her bir öneri için, neden uygun olduklarını açıklayan kısa bir 'reasoning' (gerekçe) yaz.
        5. Her bir öneri için, etkinlikle en alakalı olan becerilerini 'relevantSkills' listesine ekle.

        Cevabını aşağıdaki JSON formatında bir dizi olarak döndür. Başka hiçbir metin veya açıklama ekleme.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            personId: { type: Type.INTEGER },
                            volunteerName: { type: Type.STRING },
                            reasoning: { type: Type.STRING },
                            relevantSkills: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING }
                            }
                        },
                        required: ["personId", "volunteerName", "reasoning", "relevantSkills"]
                    }
                }
            }
        });
        
        const parsed = JSON.parse(response.text);
        
        if (Array.isArray(parsed)) {
            return parsed as VolunteerSuggestion[];
        }
        throw new Error("Yapay zekadan gelen yanıt beklenen formatta değil.");

    } catch (error) {
        console.error("Error suggesting volunteers:", error);
        throw new Error("AI ile gönüllü önerileri oluşturulurken bir hata oluştu.");
    }
};

export const suggestFinancialCategory = async (description: string): Promise<HesapKategorisi> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }

    const categories = Object.values(HesapKategorisi);

    const prompt = `
        Bir STK'nın muhasebe asistanı olarak, aşağıdaki finansal işlem açıklamasına en uygun kategoriyi belirle.
        
        İşlem Açıklaması: "${description}"

        Mevcut Kategoriler: [${categories.join(', ')}]

        Cevabını {"kategori": "EN_UYGUN_KATEGORI"} formatında bir JSON nesnesi olarak döndür. Başka hiçbir metin veya açıklama ekleme.
        Örneğin, açıklama "Temmuz ayı ofis elektrik faturası" ise, cevap {"kategori": "Fatura Ödemesi"} olmalı.
    `;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        kategori: { type: Type.STRING, enum: categories }
                    },
                    required: ["kategori"]
                }
            }
        });
        
        const parsed = JSON.parse(response.text);
        
        if (parsed.kategori) {
            return parsed.kategori as HesapKategorisi;
        }

        throw new Error("AI geçerli bir kategori öneremedi.");

    } catch (error) {
        console.error("Error suggesting financial category:", error);
        throw new Error("AI ile kategori önerisi alınırken bir hata oluştu.");
    }
};

export const extractApplicationInfoFromDocument = async (file: File): Promise<ExtractedApplicationData> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }

    const filePart = await fileToGenerativePart(file);

    const prompt = `Bu belge bir yardım başvuru formudur. Lütfen metni analiz ederek aşağıdaki bilgileri JSON formatında çıkar:
    1. 'kisiKimlikNo': Başvuru sahibinin T.C. Kimlik Numarası.
    2. 'talepTuru': Başvurulan yardım türü. Olası değerler: ${Object.values(YardimTuru).join(', ')}.
    3. 'talepTutari': Talep edilen nakit yardım tutarı (sayı olarak). Eğer belirtilmemişse 0 döndür.
    4. 'talepDetayi': Başvuranın talebini ve durumunu özetleyen metin.
    
    Sadece JSON nesnesini döndür.`;
    
    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: { parts: [filePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        kisiKimlikNo: { type: Type.STRING },
                        talepTuru: { type: Type.STRING, enum: Object.values(YardimTuru) },
                        talepTutari: { type: Type.NUMBER },
                        talepDetayi: { type: Type.STRING },
                    },
                    required: ["kisiKimlikNo", "talepTuru", "talepTutari", "talepDetayi"]
                }
            }
        });

        return JSON.parse(response.text) as ExtractedApplicationData;

    } catch (error) {
        console.error("Error extracting application info from document:", error);
        throw new Error("Belge analizi sırasında bir hata oluştu.");
    }
};

export const analyzeCommentSentiment = async (commentText: string): Promise<{ sentiment: Sentiment; reason: string }> => {
    if (!process.env.API_KEY) {
        throw new Error("API anahtarı ayarlanmamış.");
    }

    const prompt = `
        Bir STK yardım başvuru sistemindeki aşağıdaki Türkçe yorumu analiz et.
        Yorum: "${commentText}"

        Görevin:
        1. Yorumun duygu durumunu (sentiment) sınıflandır. Olası değerler: 'Pozitif', 'Nötr', 'Negatif', 'Acil'.
           - 'Acil': Yorumda acil müdahale, kritik bir ihtiyaç, tehlike veya çok ciddi bir zorluk belirtiliyorsa bu kategori seçilmelidir (örneğin "elektriğimiz kesildi", "bebek maması bitti", "çok zor durumdayız").
           - 'Negatif': Genel bir mutsuzluk, şikayet veya hayal kırıklığı belirtiyorsa bu kategori seçilmelidir.
           - 'Pozitif': Memnuniyet, teşekkür veya olumlu bir gelişme belirtiyorsa bu kategori seçilmelidir.
           - 'Nötr': Bilgi verme, soru sorma gibi duygusal yoğunluğu olmayan yorumlar için bu kategori seçilmelidir.
        2. Bu sınıflandırma için kısa (tek cümlelik) bir gerekçe (reason) yaz.

        Cevabını aşağıdaki JSON formatında döndür. Başka hiçbir metin ekleme.
    `;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sentiment: { type: Type.STRING, enum: Object.values(Sentiment) },
                        reason: { type: Type.STRING }
                    },
                    required: ["sentiment", "reason"]
                }
            }
        });
        
        const parsed = JSON.parse(response.text);

        if (parsed.sentiment && parsed.reason) {
            return parsed as { sentiment: Sentiment; reason: string };
        }
        throw new Error("Yapay zekadan gelen yanıt beklenen formatta değil.");
    } catch (error) {
        console.error("Error analyzing comment sentiment:", error);
        throw new Error("AI ile yorum analizi sırasında bir hata oluştu.");
    }
};

export const generateImageTags = async (file: File): Promise<string[]> => {
    if (!process.env.API_KEY) {
        console.warn("API_KEY not set. Cannot generate image tags.");
        return [];
    }
    
    if (!file.type.startsWith('image/')) {
        console.log(`Unsupported file type for tagging: ${file.type}`);
        return [];
    }

    try {
        const imagePart = await fileToGenerativePart(file);

        const prompt = `Bu görselin içeriğini analiz et ve en alakalı 3 ila 5 anahtar kelimeyi (etiketi) belirle. Etiketler Türkçe olmalı ve bir STK'nın (sivil toplum kuruluşu) bağlamı için anlamlı olmalı (örn: "gıda yardımı", "etkinlik", "sağlık taraması", "çocuklar"). Cevabını sadece bir JSON dizisi olarak döndür. Başka hiçbir metin ekleme. Örnek: ["gıda kolisi", "yardım dağıtımı", "gönüllüler"]`;

        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: { parts: [imagePart, { text: prompt }] },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const parsed = JSON.parse(response.text);
        if (Array.isArray(parsed)) {
            return parsed.map(String);
        }
        console.warn("Gemini image tagging response was not an array:", parsed);
        return [];
    } catch (error) {
        console.error("Error generating image tags from Gemini:", error);
        return [];
    }
};

export const generateAnalyticsSummary = async (
    data: {
        totalPeople: number;
        aidRecipientsByNationality: { name: string; value: number }[];
        applicationsByStatus: { name: string; value: number }[];
        monthlyFinancials: { name: string; income: number; expense: number }[];
    }
): Promise<AnalyticsSummary> => {
    if (!process.env.API_KEY) {
        return Promise.reject(new Error("API anahtarı ayarlanmamış."));
    }

    const prompt = `
        Bir STK yöneticisi için kapsamlı bir analiz raporu oluştur. Raporu Türkçe, profesyonel ve analitik bir dille yaz.
        
        Mevcut Veriler:
        - Toplam Kayıtlı Kişi: ${data.totalPeople}
        - Yardım Alanların Uyruk Dağılımı: ${JSON.stringify(data.aidRecipientsByNationality)}
        - Yardım Başvurularının Durum Dağılımı: ${JSON.stringify(data.applicationsByStatus)}
        - Son Ayların Finansal Akışı (Gelir/Gider): ${JSON.stringify(data.monthlyFinancials)}

        Bu verilere dayanarak, aşağıdaki JSON formatında bir rapor oluştur:
        1.  "summary": Derneğin genel durumu hakkında 2-3 cümlelik bir yönetici özeti.
        2.  "actionableInsights": Yöneticinin hemen aksiyon alabileceği 2-3 adet somut öneri.
        3.  "positiveTrends": Verilerdeki olumlu eğilimler ve güçlü yönler.
        4.  "areasForAttention": Dikkat edilmesi veya iyileştirilmesi gereken alanlar.

        Tüm metinler Türkçe olmalı. Sadece JSON nesnesini döndür, başka hiçbir metin veya açıklama ekleme.
    `;

    try {
        const response = await ai.models.generateContent({
            model: STABLE_MODEL,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        summary: { type: Type.STRING },
                        actionableInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
                        positiveTrends: { type: Type.ARRAY, items: { type: Type.STRING } },
                        areasForAttention: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["summary", "actionableInsights", "positiveTrends", "areasForAttention"]
                }
            }
        });
        
        const parsed = JSON.parse(response.text);

        if (parsed.summary && Array.isArray(parsed.actionableInsights)) {
            return parsed as AnalyticsSummary;
        }
        throw new Error("Yapay zekadan gelen yanıt beklenen formatta değil.");

    } catch (error) {
        console.error("Error generating analytics summary from Gemini:", error);
        throw new Error("Yapay zeka analiz özeti oluşturulurken bir hata oluştu.");
    }
};