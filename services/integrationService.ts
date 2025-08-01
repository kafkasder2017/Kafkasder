import {
  type Bagis,
  type Person,
  type FinansalKayit,
  type HesapKategorisi,
  type FinansalIslemTuru,
  KimlikTuru,
  RizaBeyaniStatus,
  SponsorlukTipi,
  Uyruk,
  DosyaBaglantisi,
  PersonStatus,
  BagisTuru
} from '../types';
import { createBagis, createFinansalKayit, createPerson } from './apiService';

// Muhasebe Yazılımları Entegrasyonu
export interface MuhasebeEntegrasyonu {
  yazilimTuru: 'Logo' | 'Eta' | 'Mikro' | 'Nebim' | 'Diger';
  apiUrl: string;
  apiKey: string;
  companyCode?: string;
}

export interface MuhasebeKaydi {
  hesapKodu: string;
  aciklama: string;
  borc: number;
  alacak: number;
  tarih: string;
  belgeNo: string;
  kategori: HesapKategorisi;
}

// Banka API Entegrasyonu
export interface BankaEntegrasyonu {
  bankaKodu: string;
  bankaAdi: string;
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  hesapNo: string;
  iban: string;
}

export interface BankaHareketi {
  tarih: string;
  aciklama: string;
  tutar: number;
  bakiye: number;
  referansNo: string;
  gonderenHesap?: string;
  gonderenAd?: string;
}

// E-Devlet Entegrasyonu
export interface EDevletSorgu {
  tcKimlikNo: string;
  ad?: string;
  soyad?: string;
  dogumTarihi?: string;
}

export interface EDevletSonuc {
  tcKimlikNo: string;
  ad: string;
  soyad: string;
  dogumTarihi: string;
  dogumYeri: string;
  babaAdi: string;
  anaAdi: string;
  medeniDurum: string;
  adres?: string;
  gecerli: boolean;
}

// WhatsApp Business API
export interface WhatsAppMesaj {
  aliciNumara: string;
  mesajTipi: 'text' | 'template' | 'media';
  icerik: string;
  templateAdi?: string;
  templateParametreleri?: string[];
  medyaUrl?: string;
}

export interface WhatsAppSonuc {
  basarili: boolean;
  mesajId?: string;
  hata?: string;
}

// Muhasebe Entegrasyonu Fonksiyonları
export const muhasebeKaydiGonder = async (
entegrasyon: MuhasebeEntegrasyonu, kayit: MuhasebeKaydi): Promise<{ basarili: boolean; hata?: string }> => {
  try {
    const response = await fetch(`${entegrasyon.apiUrl}/api/kayit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${entegrasyon.apiKey}`,
        'Company-Code': entegrasyon.companyCode || ''
      },
      body: JSON.stringify({
        hesapKodu: kayit.hesapKodu,
        aciklama: kayit.aciklama,
        borc: kayit.borc,
        alacak: kayit.alacak,
        tarih: kayit.tarih,
        belgeNo: kayit.belgeNo,
        kategori: kayit.kategori
      })
    });

    if (!response.ok) {
      throw new Error(`Muhasebe API hatası: ${response.statusText}`);
    }

    return { basarili: true };
  } catch (error: any) {
    console.error('Muhasebe entegrasyonu hatası:', error);
    return { basarili: false, hata: error.message };
  }
};

export const bagisiMuhasebeKaydet = async (
  bagis: Bagis,
  entegrasyon: MuhasebeEntegrasyonu
): Promise<void> => {
  const kayit: MuhasebeKaydi = {
    hesapKodu: '100.01.001', // Bağış Gelirleri
    aciklama: `Bağış - ${bagis.aciklama}`,
    borc: 0,
    alacak: bagis.tutar,
    tarih: bagis.tarih,
    belgeNo: bagis.makbuzNo,
    kategori: 'BAGIS' as HesapKategorisi
  };

  const result = await muhasebeKaydiGonder(entegrasyon, kayit);
  if (!result.basarili) {
    throw new Error(`Muhasebe kaydı gönderilemedi: ${result.hata}`);
  }
};

// Banka API Fonksiyonları
export const bankaHareketleriniAl = async (
  entegrasyon: BankaEntegrasyonu,
  baslangicTarihi: string,
  bitisTarihi: string
): Promise<BankaHareketi[]> => {
  try {
    // OAuth token alma
    const tokenResponse = await fetch(`${entegrasyon.apiUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: entegrasyon.clientId,
        client_secret: entegrasyon.clientSecret
      })
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // Hesap hareketlerini alma
    const response = await fetch(
      `${entegrasyon.apiUrl}/api/hesap/${entegrasyon.hesapNo}/hareketler?baslangic=${baslangicTarihi}&bitis=${bitisTarihi}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Banka API hatası: ${response.statusText}`);
    }

    const data = await response.json();
    return data.hareketler || [];
  } catch (error: any) {
    console.error('Banka API hatası:', error);
    return [];
  }
};

export const otomatikBagisKaydet = async (
  hareketler: BankaHareketi[]
): Promise<number> => {
  let kaydedilenSayisi = 0;

  for (const hareket of hareketler) {
    // Sadece gelen para transferlerini bağış olarak kaydet
    if (hareket.tutar > 0 && hareket.gonderenAd) {
      try {
        // Önce kişiyi bul veya oluştur
        let bagisciId = 1; // Varsayılan bağışçı
        
        if (hareket.gonderenAd && hareket.gonderenAd !== 'Bilinmeyen') {
          // Kişiyi veritabanında ara, bulamazsa oluştur
          const yeniKisi: Omit<Person, 'id'> = {
            ad: hareket.gonderenAd.split(' ')[0] || 'Bilinmeyen',
            soyad: hareket.gonderenAd.split(' ').slice(1).join(' ') || '',
            uyruk: [Uyruk.TC],
            kimlikTuru: KimlikTuru.TC,
            kimlikNo: '',
            dogumTarihi: '',
            cepTelefonu: '',
            ulke: 'Türkiye',
            sehir: '',
            yerlesim: '',
            mahalle: '',
            adres: '',
            kategori: 'Bağışçı',
            dosyaNumarasi: `AUTO-${Date.now()}`,
            sponsorlukTipi: SponsorlukTipi.BIREYSEL,
            kayitDurumu: 'Kaydedildi',
            rizaBeyani: 'ALINMADI' as RizaBeyaniStatus,
            kayitTarihi: new Date().toISOString(),
            kaydiAcanBirim: 'Sistem',
            dosyaBaglantisi: DosyaBaglantisi.BAGIMSIZ,
            isKaydiSil: false,
            durum: PersonStatus.AKTIF
          };
          
          const kisi = await createPerson(yeniKisi);
          bagisciId = kisi.id;
        }

        // Bağışı kaydet
        const bagis: Omit<Bagis, 'id'> = {
          bagisciId,
          tutar: hareket.tutar,
          paraBirimi: 'TRY',
          bagisTuru: BagisTuru.BANKA_TRANSFERI,
          tarih: hareket.tarih,
          aciklama: `Otomatik bağış - ${hareket.aciklama}`,
          makbuzNo: hareket.referansNo
        };

        await createBagis(bagis);

        // Finansal kayıt oluştur
        const finansalKayit: Omit<FinansalKayit, 'id'> = {
          tarih: hareket.tarih,
          aciklama: `Bağış - ${hareket.gonderenAd}`,
          tur: 'GELIR' as FinansalIslemTuru,
          kategori: 'BAGIS' as HesapKategorisi,
          tutar: hareket.tutar,
          belgeNo: hareket.referansNo
        };

        await createFinansalKayit(finansalKayit);
        kaydedilenSayisi++;
      } catch (error) {
        console.error('Bağış kaydı hatası:', error);
      }
    }
  }

  return kaydedilenSayisi;
};

// E-Devlet Entegrasyonu
export const tcKimlikDogrula = async (
  sorgu: EDevletSorgu
): Promise<EDevletSonuc | null> => {
  try {
    // Bu gerçek bir E-Devlet API çağrısı olacak
    // Şu an için mock veri döndürüyoruz
    const response = await fetch('https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx/TCKimlikNoDogrula', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/soap+xml; charset=utf-8'
      },
      body: `<?xml version="1.0" encoding="utf-8"?>
        <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
          <soap12:Body>
            <TCKimlikNoDogrula xmlns="http://tckimlik.nvi.gov.tr/WS">
              <TCKimlikNo>${sorgu.tcKimlikNo}</TCKimlikNo>
              <Ad>${sorgu.ad || ''}</Ad>
              <Soyad>${sorgu.soyad || ''}</Soyad>
              <DogumYili>${sorgu.dogumTarihi ? new Date(sorgu.dogumTarihi).getFullYear() : ''}</DogumYili>
            </TCKimlikNoDogrula>
          </soap12:Body>
        </soap12:Envelope>`
    });

    // XML yanıtını parse et
    const xmlText = await response.text();
    const gecerli = xmlText.includes('<TCKimlikNoDogrulaResult>true</TCKimlikNoDogrulaResult>');

    if (gecerli) {
      return {
        tcKimlikNo: sorgu.tcKimlikNo,
        ad: sorgu.ad || '',
        soyad: sorgu.soyad || '',
        dogumTarihi: sorgu.dogumTarihi || '',
        dogumYeri: '',
        babaAdi: '',
        anaAdi: '',
        medeniDurum: '',
        gecerli: true
      };
    }

    return null;
  } catch (error) {
    console.error('E-Devlet API hatası:', error);
    return null;
  }
};

// WhatsApp Business API
export const whatsappMesajGonder = async (
  mesaj: WhatsAppMesaj,
  accessToken: string,
  phoneNumberId: string
): Promise<WhatsAppSonuc> => {
  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    
    let body: any = {
      messaging_product: 'whatsapp',
      to: mesaj.aliciNumara
    };

    switch (mesaj.mesajTipi) {
      case 'text':
        body.type = 'text';
        body.text = { body: mesaj.icerik };
        break;
      
      case 'template':
        body.type = 'template';
        body.template = {
          name: mesaj.templateAdi,
          language: { code: 'tr' },
          components: mesaj.templateParametreleri ? [{
            type: 'body',
            parameters: mesaj.templateParametreleri.map(param => ({
              type: 'text',
              text: param
            }))
          }] : []
        };
        break;
      
      case 'media':
        body.type = 'image';
        body.image = { link: mesaj.medyaUrl };
        break;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (response.ok) {
      return {
        basarili: true,
        mesajId: data.messages?.[0]?.id
      };
    } else {
      return {
        basarili: false,
        hata: data.error?.message || 'Bilinmeyen hata'
      };
    }
  } catch (error: any) {
    return {
      basarili: false,
      hata: error.message
    };
  }
};

export const topluWhatsAppMesaji = async (
  alicilar: string[],
  mesaj: Omit<WhatsAppMesaj, 'aliciNumara'>,
  accessToken: string,
  phoneNumberId: string
): Promise<{ basarili: number; basarisiz: number; hatalar: string[] }> => {
  let basarili = 0;
  let basarisiz = 0;
  const hatalar: string[] = [];

  for (const alici of alicilar) {
    const sonuc = await whatsappMesajGonder(
      { ...mesaj, aliciNumara: alici },
      accessToken,
      phoneNumberId
    );

    if (sonuc.basarili) {
      basarili++;
    } else {
      basarisiz++;
      hatalar.push(`${alici}: ${sonuc.hata}`);
    }

    // Rate limiting için kısa bekleme
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { basarili, basarisiz, hatalar };
};

// Entegrasyon ayarlarını yönetme
export const entegrasyonAyarlari = {
  muhasebe: null as MuhasebeEntegrasyonu | null,
  banka: null as BankaEntegrasyonu | null,
  whatsapp: {
    accessToken: '',
    phoneNumberId: '',
    webhookToken: ''
  }
};

export const entegrasyonAyarlariniYukle = async (): Promise<void> => {
  // Supabase'den entegrasyon ayarlarını yükle
  // Bu fonksiyon gerçek implementasyonda ayarları veritabanından alacak
};

export const entegrasyonAyarlariniKaydet = async (
  ayarlar: Partial<typeof entegrasyonAyarlari>
): Promise<void> => {
  // Supabase'e entegrasyon ayarlarını kaydet
  // Bu fonksiyon gerçek implementasyonda ayarları veritabanına kaydedecek
};

function er(entegrasyon: MuhasebeEntegrasyonu, kayit: MuhasebeKaydi) {
  throw new Error('Function not implemented.');
}
