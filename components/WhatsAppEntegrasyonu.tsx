import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Users, Clock, CheckCircle, XCircle, Phone, FileText, Image, Video } from 'lucide-react';
import { whatsappMesajGonder, topluWhatsAppMesaji, entegrasyonAyarlari } from '../services/integrationService';
import type { WhatsAppMesaj } from '../services/integrationService';
import { getPeople } from '../services/apiService';
import type { Person } from '../types';

interface MesajSablonu {
  id: string;
  baslik: string;
  icerik: string;
  kategori: 'genel' | 'bagis' | 'etkinlik' | 'hatirlatma' | 'tesekkur';
}

interface GonderimRaporu {
  toplamAlici: number;
  basarili: number;
  basarisiz: number;
  bekleyen: number;
  gonderimTarihi: string;
}

interface GonderimDetay {
  aliciId: string;
  telefon: string;
  ad: string;
  durum: 'bekliyor' | 'gonderildi' | 'teslim-edildi' | 'okundu' | 'basarisiz';
  hata?: string;
  gonderimZamani?: string;
  teslimZamani?: string;
  okunmaZamani?: string;
}

const defaultSablonlar: MesajSablonu[] = [
  {
    id: '1',
    baslik: 'Bağış Teşekkürü',
    icerik: 'Sayın {ad} {soyad}, {tutar} TL tutarındaki bağışınız için teşekkür ederiz. Makbuz numaranız: {makbuzNo}',
    kategori: 'tesekkur'
  },
  {
    id: '2',
    baslik: 'Etkinlik Duyurusu',
    icerik: 'Merhaba {ad}, {etkinlikAd} etkinliğimiz {tarih} tarihinde {saat} saatinde {yer} adresinde gerçekleşecektir. Katılımınızı bekliyoruz.',
    kategori: 'etkinlik'
  },
  {
    id: '3',
    baslik: 'Aidat Hatırlatması',
    icerik: 'Sayın {ad} {soyad}, {ay} ayı aidatınız {tutar} TL olup, son ödeme tarihi {sonTarih}. Ödeme için: {odemeLinki}',
    kategori: 'hatirlatma'
  },
  {
    id: '4',
    baslik: 'Genel Bilgilendirme',
    icerik: 'Merhaba {ad}, {mesaj}',
    kategori: 'genel'
  }
];

const WhatsAppEntegrasyonu: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [kisiler, setKisiler] = useState<Person[]>([]);
  const [selectedKisiler, setSelectedKisiler] = useState<Set<number>>(new Set());
  const [mesajTipi, setMesajTipi] = useState<'tekli' | 'toplu'>('tekli');
  const [sablonlar, setSablonlar] = useState<MesajSablonu[]>(defaultSablonlar);
  const [selectedSablon, setSelectedSablon] = useState<string>('');
  const [mesajIcerik, setMesajIcerik] = useState('');
  const [gonderimRaporu, setGonderimRaporu] = useState<GonderimRaporu | null>(null);
  const [gonderimDetaylari, setGonderimDetaylari] = useState<GonderimDetay[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('all');
  
  // Tekli mesaj için
  const [tekliAlici, setTekliAlici] = useState({
    telefon: '',
    ad: '',
    soyad: ''
  });
  
  // Medya ekleme
  const [medyaDosyasi, setMedyaDosyasi] = useState<File | null>(null);
  const [medyaTipi, setMedyaTipi] = useState<'resim' | 'video' | 'dokuman' | null>(null);
  
  // Zamanlama
  const [zamanlanmisMesaj, setZamanlanmisMesaj] = useState(false);
  const [gonderimTarihi, setGonderimTarihi] = useState('');
  const [gonderimSaati, setGonderimSaati] = useState('');

  useEffect(() => {
    loadKisiler();
    loadSablonlar();
    loadGonderimRaporu();
  }, []);

  const loadKisiler = async () => {
    try {
      const data = await getPeople();
      setKisiler(data.filter(k => k.cepTelefonu && k.cepTelefonu.length > 0));
    } catch (error) {
      console.error('Kişiler yüklenirken hata:', error);
    }
  };

  const loadSablonlar = () => {
    const savedSablonlar = localStorage.getItem('whatsappSablonlar');
    if (savedSablonlar) {
      setSablonlar(JSON.parse(savedSablonlar));
    }
  };

  const loadGonderimRaporu = () => {
    const savedRapor = localStorage.getItem('whatsappGonderimRaporu');
    const savedDetaylar = localStorage.getItem('whatsappGonderimDetaylari');
    
    if (savedRapor) {
      setGonderimRaporu(JSON.parse(savedRapor));
    }
    
    if (savedDetaylar) {
      setGonderimDetaylari(JSON.parse(savedDetaylar));
    }
  };

  const saveSablonlar = (yeniSablonlar: MesajSablonu[]) => {
    localStorage.setItem('whatsappSablonlar', JSON.stringify(yeniSablonlar));
    setSablonlar(yeniSablonlar);
  };

  const saveGonderimRaporu = (rapor: GonderimRaporu, detaylar: GonderimDetay[]) => {
    localStorage.setItem('whatsappGonderimRaporu', JSON.stringify(rapor));
    localStorage.setItem('whatsappGonderimDetaylari', JSON.stringify(detaylar));
    setGonderimRaporu(rapor);
    setGonderimDetaylari(detaylar);
  };

  const sablonSec = (sablonId: string) => {
    const sablon = sablonlar.find(s => s.id === sablonId);
    if (sablon) {
      setSelectedSablon(sablonId);
      setMesajIcerik(sablon.icerik);
    }
  };

  const mesajGonder = async () => {
    if (!entegrasyonAyarlari.whatsapp) {
      alert('WhatsApp entegrasyonu yapılandırılmamış!');
      return;
    }

    if (!mesajIcerik.trim()) {
      alert('Mesaj içeriği boş olamaz!');
      return;
    }

    if (mesajTipi === 'tekli') {
      await tekliMesajGonder();
    } else {
      await topluMesajGonder();
    }
  };

  const tekliMesajGonder = async () => {
    if (!tekliAlici.telefon) {
      alert('Telefon numarası gerekli!');
      return;
    }

    setLoading(true);
    try {
      // Mesajı kişiselleştir
      let kisiselMesaj = mesajIcerik
        .replace('{ad}', tekliAlici.ad || '')
        .replace('{soyad}', tekliAlici.soyad || '');

      const mesaj: WhatsAppMesaj = {
        aliciNumara: tekliAlici.telefon,
        mesajTipi: 'text',
        icerik: kisiselMesaj,
        medyaUrl: medyaDosyasi ? URL.createObjectURL(medyaDosyasi) : undefined
      };

      const sonuc = await whatsappMesajGonder(
        mesaj,
        entegrasyonAyarlari.whatsapp.accessToken,
        entegrasyonAyarlari.whatsapp.phoneNumberId
      );

      if (sonuc.basarili) {
        alert('Mesaj başarıyla gönderildi!');
        setTekliAlici({ telefon: '', ad: '', soyad: '' });
        setMesajIcerik('');
        setMedyaDosyasi(null);
        setMedyaTipi(null);
      } else {
        alert(`Mesaj gönderilemedi: ${sonuc.hata}`);
      }
    } catch (error: any) {
      alert(`Mesaj gönderme hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const topluMesajGonder = async () => {
    if (selectedKisiler.size === 0) {
      alert('Mesaj gönderilecek kişi seçilmedi!');
      return;
    }

    setLoading(true);
    const yeniDetaylar: GonderimDetay[] = [];
    let basarili = 0;
    let basarisiz = 0;

    try {
      const seciliKisiler = kisiler.filter(k => selectedKisiler.has(k.id));
      
      // Mesajları hazırla
      const mesajlar = seciliKisiler.map(kisi => {
        let kisiselMesaj = mesajIcerik
          .replace('{ad}', kisi.ad)
          .replace('{soyad}', kisi.soyad)
          .replace('{telefon}', kisi.cepTelefonu || '');

        return {
          telefon: kisi.cepTelefonu!,
          mesaj: kisiselMesaj,
          kisiId: kisi.id,
          ad: kisi.ad
        };
      });

      // Toplu gönderim
      const alicilar = mesajlar.map(m => m.telefon);
      const mesajSablonu: Omit<WhatsAppMesaj, 'aliciNumara'> = {
        mesajTipi: 'text',
        icerik: mesajIcerik,
        medyaUrl: medyaDosyasi ? URL.createObjectURL(medyaDosyasi) : undefined
      };

      const sonuc = await topluWhatsAppMesaji(
        alicilar,
        mesajSablonu,
        entegrasyonAyarlari.whatsapp.accessToken,
        entegrasyonAyarlari.whatsapp.phoneNumberId
      );

      // Sonuçları işle
      basarili = sonuc.basarili;
      basarisiz = sonuc.basarisiz;
      
      // Detayları oluştur
      seciliKisiler.forEach((kisi, index) => {
        const detay: GonderimDetay = {
          aliciId: kisi.id.toString(),
          telefon: kisi.cepTelefonu!,
          ad: `${kisi.ad} ${kisi.soyad}`,
          durum: index < sonuc.basarili ? 'gonderildi' : 'basarisiz',
          gonderimZamani: new Date().toISOString()
        };

        if (index >= sonuc.basarili) {
          detay.hata = sonuc.hatalar[index - sonuc.basarili] || 'Bilinmeyen hata';
        }

        yeniDetaylar.push(detay);
      });

      // Raporu güncelle
      const yeniRapor: GonderimRaporu = {
        toplamAlici: seciliKisiler.length,
        basarili,
        basarisiz,
        bekleyen: 0,
        gonderimTarihi: new Date().toISOString()
      };

      saveGonderimRaporu(yeniRapor, [...gonderimDetaylari, ...yeniDetaylar]);
      setSelectedKisiler(new Set());
      setMesajIcerik('');
      setMedyaDosyasi(null);
      setMedyaTipi(null);
      
      alert(`Toplu mesaj gönderimi tamamlandı! ${basarili} başarılı, ${basarisiz} başarısız.`);
      
    } catch (error: any) {
      alert(`Toplu mesaj gönderme hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleKisi = (kisiId: number) => {
    const newSelected = new Set(selectedKisiler);
    if (newSelected.has(kisiId)) {
      newSelected.delete(kisiId);
    } else {
      newSelected.add(kisiId);
    }
    setSelectedKisiler(newSelected);
  };

  const selectAll = () => {
    setSelectedKisiler(new Set(filteredKisiler.map(k => k.id)));
  };

  const clearSelection = () => {
    setSelectedKisiler(new Set());
  };

  const handleMedyaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setMedyaDosyasi(file);
      
      // Dosya tipini belirle
      if (file.type.startsWith('image/')) {
        setMedyaTipi('resim');
      } else if (file.type.startsWith('video/')) {
        setMedyaTipi('video');
      } else {
        setMedyaTipi('dokuman');
      }
    }
  };

  const removeMedya = () => {
    setMedyaDosyasi(null);
    setMedyaTipi(null);
  };

  const filteredKisiler = kisiler.filter(kisi => {
    const searchMatch = 
      kisi.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kisi.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
              kisi.cepTelefonu?.includes(searchTerm);
    
    return searchMatch;
  });

  const formatTelefon = (telefon: string) => {
    return telefon.replace(/^(\+90|90)?/, '+90 ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getDurumIcon = (durum: string) => {
    switch (durum) {
      case 'gonderildi':
        return <Send className="text-blue-500" size={16} />;
      case 'teslim-edildi':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'okundu':
        return <CheckCircle className="text-green-600" size={16} />;
      case 'basarisiz':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return <Clock className="text-yellow-500" size={16} />;
    }
  };

  const getDurumText = (durum: string) => {
    switch (durum) {
      case 'gonderildi':
        return 'Gönderildi';
      case 'teslim-edildi':
        return 'Teslim Edildi';
      case 'okundu':
        return 'Okundu';
      case 'basarisiz':
        return 'Başarısız';
      default:
        return 'Bekliyor';
    }
  };

  const getMedyaIcon = () => {
    switch (medyaTipi) {
      case 'resim':
        return <Image className="text-green-500" size={16} />;
      case 'video':
        return <Video className="text-blue-500" size={16} />;
      case 'dokuman':
        return <FileText className="text-orange-500" size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">WhatsApp Business Entegrasyonu</h1>
        <p className="text-gray-600">
          WhatsApp Business API üzerinden tekli ve toplu mesaj gönderin.
        </p>
      </div>

      {/* Rapor Kartları */}
      {gonderimRaporu && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Alıcı</p>
                <p className="text-2xl font-bold text-gray-900">{gonderimRaporu.toplamAlici}</p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Başarılı</p>
                <p className="text-2xl font-bold text-green-600">{gonderimRaporu.basarili}</p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Başarısız</p>
                <p className="text-2xl font-bold text-red-600">{gonderimRaporu.basarisiz}</p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Son Gönderim</p>
                <p className="text-sm font-bold text-blue-600">{formatDate(gonderimRaporu.gonderimTarihi)}</p>
              </div>
              <Clock className="text-blue-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Mesaj Tipi Seçimi */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="tekli"
              checked={mesajTipi === 'tekli'}
              onChange={(e) => setMesajTipi(e.target.value as 'tekli' | 'toplu')}
              className="w-4 h-4 text-blue-600"
            />
            <span>Tekli Mesaj</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="toplu"
              checked={mesajTipi === 'toplu'}
              onChange={(e) => setMesajTipi(e.target.value as 'tekli' | 'toplu')}
              className="w-4 h-4 text-blue-600"
            />
            <span>Toplu Mesaj</span>
          </label>
        </div>

        {/* Tekli Mesaj Formu */}
        {mesajTipi === 'tekli' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefon Numarası
              </label>
              <input
                type="text"
                value={tekliAlici.telefon}
                onChange={(e) => setTekliAlici(prev => ({
                  ...prev,
                  telefon: e.target.value
                }))}
                placeholder="+90 555 123 45 67"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad
              </label>
              <input
                type="text"
                value={tekliAlici.ad}
                onChange={(e) => setTekliAlici(prev => ({
                  ...prev,
                  ad: e.target.value
                }))}
                placeholder="Alıcının adı"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soyad
              </label>
              <input
                type="text"
                value={tekliAlici.soyad}
                onChange={(e) => setTekliAlici(prev => ({
                  ...prev,
                  soyad: e.target.value
                }))}
                placeholder="Alıcının soyadı"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Şablon Seçimi */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mesaj Şablonu
          </label>
          <select
            value={selectedSablon}
            onChange={(e) => sablonSec(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Şablon seçin...</option>
            {sablonlar.map(sablon => (
              <option key={sablon.id} value={sablon.id}>
                {sablon.baslik} ({sablon.kategori})
              </option>
            ))}
          </select>
        </div>

        {/* Mesaj İçeriği */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mesaj İçeriği
          </label>
          <textarea
            value={mesajIcerik}
            onChange={(e) => setMesajIcerik(e.target.value)}
            placeholder="Mesajınızı yazın... {ad}, {soyad} gibi değişkenler kullanabilirsiniz."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Kullanılabilir değişkenler: {'{ad}'}, {'{soyad}'}, {'{telefon}'}
          </p>
        </div>

        {/* Medya Ekleme */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Medya Dosyası (İsteğe Bağlı)
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx"
              onChange={handleMedyaUpload}
              className="hidden"
              id="medya-upload"
            />
            <label
              htmlFor="medya-upload"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer flex items-center gap-2"
            >
              <FileText size={16} />
              Dosya Seç
            </label>
            
            {medyaDosyasi && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-md">
                {getMedyaIcon()}
                <span className="text-sm text-blue-700">{medyaDosyasi.name}</span>
                <button
                  onClick={removeMedya}
                  className="text-red-500 hover:text-red-700"
                >
                  <XCircle size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Gönder Butonu */}
        <div className="flex justify-end">
          <button
            onClick={mesajGonder}
            disabled={loading || !mesajIcerik.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <MessageCircle size={16} />
            {loading ? 'Gönderiliyor...' : 'Mesaj Gönder'}
          </button>
        </div>
      </div>

      {/* Toplu Mesaj için Kişi Seçimi */}
      {mesajTipi === 'toplu' && (
        <div className="bg-white p-6 rounded-lg border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Alıcı Seçimi</h3>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Tümünü Seç
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Seçimi Temizle
              </button>
              <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded">
                {selectedKisiler.size} kişi seçili
              </span>
            </div>
          </div>
          
          {/* Arama */}
          <div className="mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ad, soyad veya telefon ile ara..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Kişi Listesi */}
          <div className="max-h-64 overflow-y-auto border rounded-md">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Seç
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Ad Soyad
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                    Telefon
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKisiler.map((kisi) => (
                  <tr key={kisi.id} className={selectedKisiler.has(kisi.id) ? 'bg-blue-50' : ''}>
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selectedKisiler.has(kisi.id)}
                        onChange={() => toggleKisi(kisi.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {kisi.ad} {kisi.soyad}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        {formatTelefon(kisi.cepTelefonu!)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gönderim Geçmişi */}
      {gonderimDetaylari.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Gönderim Geçmişi</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alıcı
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefon
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gönderim Zamanı
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hata
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gonderimDetaylari.slice(-20).reverse().map((detay, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {detay.ad}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTelefon(detay.telefon)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getDurumIcon(detay.durum)}
                        <span className="text-sm">{getDurumText(detay.durum)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {detay.gonderimZamani ? formatDate(detay.gonderimZamani) : '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-red-600">
                      {detay.hata || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Boş Durum */}
      {kisiler.length === 0 && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <MessageCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Telefon numarası olan kişi yok</h3>
          <p className="text-gray-600 mb-4">
            WhatsApp mesajı göndermek için telefon numarası olan kişi kayıtları gerekli.
          </p>
          {!entegrasyonAyarlari.whatsapp && (
            <p className="text-red-600 text-sm">
              WhatsApp entegrasyonu yapılandırılmamış. Lütfen önce entegrasyon ayarlarını yapın.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default WhatsAppEntegrasyonu;