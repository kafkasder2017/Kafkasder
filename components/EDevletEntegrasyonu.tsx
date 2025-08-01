import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, XCircle, Search, User, FileText, AlertTriangle, RefreshCw } from 'lucide-react';
import { tcKimlikDogrula, entegrasyonAyarlari } from '../services/integrationService';
import { getPeople, updatePerson } from '../services/apiService';
import type { Person } from '../types';

interface DogrulamaRaporu {
  toplamKisi: number;
  dogrulanmis: number;
  dogrulanamayan: number;
  hata: number;
  sonGuncelleme: string;
}

interface DogrulamaDetay {
  kisiId: string;
  tcKimlik: string;
  ad: string;
  soyad: string;
  dogumTarihi?: string;
  durum: 'bekliyor' | 'basarili' | 'basarisiz' | 'hata';
  mesaj?: string;
  dogrulamaZamani?: string;
}

const EDevletEntegrasyonu: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [kisiler, setKisiler] = useState<Person[]>([]);
  const [dogrulamaDetaylari, setDogrulamaDetaylari] = useState<DogrulamaDetay[]>([]);
  const [rapor, setRapor] = useState<DogrulamaRaporu | null>(null);
  const [selectedKisiler, setSelectedKisiler] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDurum, setFilterDurum] = useState<string>('all');
  const [tekliDogrulama, setTekliDogrulama] = useState({
    tcKimlik: '',
    ad: '',
    soyad: '',
    dogumYili: ''
  });
  const [tekliSonuc, setTekliSonuc] = useState<{gecerli: boolean; hata?: string} | null>(null);

  useEffect(() => {
    loadKisiler();
    loadDogrulamaRaporu();
  }, []);

  const loadKisiler = async () => {
    try {
      const data = await getPeople();
      setKisiler(data.filter(k => k.kimlikNo && typeof k.kimlikNo === 'string' && k.kimlikNo.length === 11));
    } catch (error) {
      console.error('Kişiler yüklenirken hata:', error);
    }
  };

  const loadDogrulamaRaporu = () => {
    const savedRapor = localStorage.getItem('edevletDogrulamaRaporu');
    const savedDetaylar = localStorage.getItem('edevletDogrulamaDetaylari');
    
    if (savedRapor) {
      setRapor(JSON.parse(savedRapor));
    }
    
    if (savedDetaylar) {
      setDogrulamaDetaylari(JSON.parse(savedDetaylar));
    }
  };

  const saveDogrulamaRaporu = (yeniRapor: DogrulamaRaporu, yeniDetaylar: DogrulamaDetay[]) => {
    localStorage.setItem('edevletDogrulamaRaporu', JSON.stringify(yeniRapor));
    localStorage.setItem('edevletDogrulamaDetaylari', JSON.stringify(yeniDetaylar));
    setRapor(yeniRapor);
    setDogrulamaDetaylari(yeniDetaylar);
  };

  const tekliKimlikDogrula = async () => {
    // E-devlet entegrasyonu her zaman kullanılabilir

    if (!tekliDogrulama.tcKimlik || !tekliDogrulama.ad || !tekliDogrulama.soyad || !tekliDogrulama.dogumYili) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    setLoading(true);
    try {
      const sonuc = await tcKimlikDogrula({
        tcKimlikNo: tekliDogrulama.tcKimlik,
        ad: tekliDogrulama.ad,
        soyad: tekliDogrulama.soyad,
        dogumTarihi: new Date(parseInt(tekliDogrulama.dogumYili), 0, 1).toISOString()
      });
      
      setTekliSonuc(sonuc ? {gecerli: sonuc.gecerli} : {gecerli: false, hata: 'Doğrulama başarısız'});
    } catch (error: any) {
      setTekliSonuc({
        gecerli: false,
        hata: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const topluKimlikDogrula = async () => {
    // E-devlet entegrasyonu her zaman kullanılabilir

    if (selectedKisiler.size === 0) {
      alert('Doğrulanacak kişi seçilmedi!');
      return;
    }

    setLoading(true);
    const yeniDetaylar: DogrulamaDetay[] = [...dogrulamaDetaylari];
    let dogrulanmis = rapor?.dogrulanmis || 0;
    let dogrulanamayan = rapor?.dogrulanamayan || 0;
    let hata = rapor?.hata || 0;

    try {
      const seciliKisiler = kisiler.filter(k => selectedKisiler.has(k.id.toString()));
      
      for (const kisi of seciliKisiler) {
        try {
          // Mevcut detayı bul veya yeni oluştur
          let detayIndex = yeniDetaylar.findIndex(d => d.kisiId === kisi.id.toString());
          if (detayIndex === -1) {
            yeniDetaylar.push({
              kisiId: kisi.id.toString(),
              tcKimlik: kisi.kimlikNo!,
              ad: kisi.ad,
              soyad: kisi.soyad,
              dogumTarihi: kisi.dogumTarihi,
              durum: 'bekliyor'
            });
            detayIndex = yeniDetaylar.length - 1;
          }

          // Doğrulama yap
          const dogumYili = kisi.dogumTarihi ? new Date(kisi.dogumTarihi).getFullYear() : undefined;
          
          if (!dogumYili) {
            yeniDetaylar[detayIndex] = {
              ...yeniDetaylar[detayIndex],
              durum: 'hata',
              mesaj: 'Doğum tarihi bulunamadı',
              dogrulamaZamani: new Date().toISOString()
            };
            hata++;
            continue;
          }

          const sonuc = await tcKimlikDogrula({
            tcKimlikNo: kisi.kimlikNo!,
            ad: kisi.ad,
            soyad: kisi.soyad,
            dogumTarihi: kisi.dogumTarihi
          });

          if (sonuc && sonuc.gecerli) {
            yeniDetaylar[detayIndex] = {
              ...yeniDetaylar[detayIndex],
              durum: 'basarili',
              mesaj: 'Kimlik doğrulandı',
              dogrulamaZamani: new Date().toISOString()
            };
            dogrulanmis++;
            
            // Kişi kaydını güncelle
            await updatePerson(kisi.id, {
              ...kisi
            });
          } else {
            yeniDetaylar[detayIndex] = {
              ...yeniDetaylar[detayIndex],
              durum: 'basarisiz',
              mesaj: 'Kimlik doğrulanamadı',
              dogrulamaZamani: new Date().toISOString()
            };
            dogrulanamayan++;
          }

          // Kısa bekleme (API limitlerini aşmamak için)
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error: any) {
          let detayIndex = yeniDetaylar.findIndex(d => d.kisiId === kisi.id.toString());
          if (detayIndex === -1) {
            yeniDetaylar.push({
              kisiId: kisi.id.toString(),
              tcKimlik: kisi.kimlikNo!,
              ad: kisi.ad,
              soyad: kisi.soyad,
              dogumTarihi: kisi.dogumTarihi,
              durum: 'hata',
              mesaj: error.message,
              dogrulamaZamani: new Date().toISOString()
            });
          } else {
            yeniDetaylar[detayIndex] = {
              ...yeniDetaylar[detayIndex],
              durum: 'hata',
              mesaj: error.message,
              dogrulamaZamani: new Date().toISOString()
            };
          }
          hata++;
        }
      }

      // Raporu güncelle
      const yeniRapor: DogrulamaRaporu = {
        toplamKisi: kisiler.length,
        dogrulanmis,
        dogrulanamayan,
        hata,
        sonGuncelleme: new Date().toISOString()
      };

      saveDogrulamaRaporu(yeniRapor, yeniDetaylar);
      setSelectedKisiler(new Set());
      
      alert(`Doğrulama tamamlandı! ${dogrulanmis} başarılı, ${dogrulanamayan} başarısız, ${hata} hata.`);
      
    } catch (error: any) {
      alert(`Toplu doğrulama sırasında hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleKisi = (kisiId: string) => {
    const newSelected = new Set(selectedKisiler);
    if (newSelected.has(kisiId)) {
      newSelected.delete(kisiId);
    } else {
      newSelected.add(kisiId);
    }
    setSelectedKisiler(newSelected);
  };

  const selectAll = () => {
    setSelectedKisiler(new Set(filteredKisiler.map(k => k.id.toString())));
  };

  const clearSelection = () => {
    setSelectedKisiler(new Set());
  };

  const getKisiDurumu = (kisiId: string) => {
    const detay = dogrulamaDetaylari.find(d => d.kisiId === kisiId);
    return detay?.durum || 'dogrulanmamis';
  };

  const filteredKisiler = kisiler.filter(kisi => {
    const searchMatch = 
      kisi.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kisi.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kisi.kimlikNo?.includes(searchTerm);
    
    const durumMatch = filterDurum === 'all' || getKisiDurumu(kisi.id.toString()) === filterDurum;
    
    return searchMatch && durumMatch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getDurumIcon = (durum: string) => {
    switch (durum) {
      case 'basarili':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'basarisiz':
        return <XCircle className="text-red-500" size={16} />;
      case 'hata':
        return <AlertTriangle className="text-yellow-500" size={16} />;
      case 'bekliyor':
        return <RefreshCw className="text-blue-500 animate-spin" size={16} />;
      default:
        return <User className="text-gray-400" size={16} />;
    }
  };

  const getDurumText = (durum: string) => {
    switch (durum) {
      case 'basarili':
        return 'Doğrulandı';
      case 'basarisiz':
        return 'Doğrulanamadı';
      case 'hata':
        return 'Hata';
      case 'bekliyor':
        return 'Bekliyor';
      default:
        return 'Doğrulanmamış';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">E-Devlet Entegrasyonu</h1>
        <p className="text-gray-600">
          TC Kimlik numaralarını e-devlet sistemi üzerinden doğrulayın.
        </p>
      </div>

      {/* Rapor Kartları */}
      {rapor && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kişi</p>
                <p className="text-2xl font-bold text-gray-900">{rapor.toplamKisi}</p>
              </div>
              <User className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doğrulanmış</p>
                <p className="text-2xl font-bold text-green-600">{rapor.dogrulanmis}</p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Doğrulanamayan</p>
                <p className="text-2xl font-bold text-red-600">{rapor.dogrulanamayan}</p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hata</p>
                <p className="text-2xl font-bold text-yellow-600">{rapor.hata}</p>
              </div>
              <AlertTriangle className="text-yellow-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Tekli Doğrulama */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <h3 className="text-lg font-medium mb-4">Tekli Kimlik Doğrulama</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              TC Kimlik No
            </label>
            <input
              type="text"
              value={tekliDogrulama.tcKimlik}
              onChange={(e) => setTekliDogrulama(prev => ({
                ...prev,
                tcKimlik: e.target.value.replace(/\D/g, '').slice(0, 11)
              }))}
              placeholder="12345678901"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ad
            </label>
            <input
              type="text"
              value={tekliDogrulama.ad}
              onChange={(e) => setTekliDogrulama(prev => ({
                ...prev,
                ad: e.target.value.toUpperCase()
              }))}
              placeholder="MEHMET"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Soyad
            </label>
            <input
              type="text"
              value={tekliDogrulama.soyad}
              onChange={(e) => setTekliDogrulama(prev => ({
                ...prev,
                soyad: e.target.value.toUpperCase()
              }))}
              placeholder="YILMAZ"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doğum Yılı
            </label>
            <input
              type="text"
              value={tekliDogrulama.dogumYili}
              onChange={(e) => setTekliDogrulama(prev => ({
                ...prev,
                dogumYili: e.target.value.replace(/\D/g, '').slice(0, 4)
              }))}
              placeholder="1990"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={tekliKimlikDogrula}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Shield size={16} />
              {loading ? 'Doğrulanıyor...' : 'Doğrula'}
            </button>
          </div>
        </div>
        
        {/* Tekli Sonuç */}
        {tekliSonuc && (
          <div className={`mt-4 p-4 rounded-lg ${
            tekliSonuc.gecerli ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {tekliSonuc.gecerli ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <XCircle className="text-red-500" size={20} />
              )}
              <span className={`font-medium ${
                tekliSonuc.gecerli ? 'text-green-800' : 'text-red-800'
              }`}>
                {tekliSonuc.gecerli ? 'Kimlik doğrulandı!' : 'Kimlik doğrulanamadı!'}
              </span>
            </div>
            {tekliSonuc.hata && (
              <p className="text-red-600 text-sm mt-1">{tekliSonuc.hata}</p>
            )}
          </div>
        )}
      </div>

      {/* Toplu Doğrulama Kontrolleri */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Toplu Kimlik Doğrulama</h3>
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
            <button
              onClick={topluKimlikDogrula}
              disabled={selectedKisiler.size === 0 || loading}
              className="px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Seçilenleri Doğrula ({selectedKisiler.size})
            </button>
          </div>
        </div>
        
        {/* Filtreler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Arama
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ad, soyad veya TC kimlik ile ara..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durum Filtresi
            </label>
            <select
              value={filterDurum}
              onChange={(e) => setFilterDurum(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="dogrulanmamis">Doğrulanmamış</option>
              <option value="basarili">Doğrulanmış</option>
              <option value="basarisiz">Doğrulanamayan</option>
              <option value="hata">Hata</option>
            </select>
          </div>
        </div>
      </div>

      {/* Kişi Listesi */}
      {filteredKisiler.length > 0 ? (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-medium">Kişi Listesi ({filteredKisiler.length})</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seç
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    TC Kimlik
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad Soyad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doğum Tarihi
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Doğrulama
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKisiler.map((kisi) => {
                  const durum = getKisiDurumu(kisi.id.toString());
                  const detay = dogrulamaDetaylari.find(d => d.kisiId === kisi.id.toString());
                  const isSelected = selectedKisiler.has(String(kisi.id));
                  
                  return (
                    <tr key={kisi.id} className={isSelected ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleKisi(kisi.id.toString())}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {kisi.kimlikNo}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {kisi.ad} {kisi.soyad}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {kisi.dogumTarihi ? formatDate(kisi.dogumTarihi) : 'Belirtilmemiş'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getDurumIcon(durum)}
                          <span className="text-sm">{getDurumText(durum)}</span>
                        </div>
                        {detay?.mesaj && (
                          <p className="text-xs text-gray-500 mt-1">{detay.mesaj}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {detay?.dogrulamaZamani ? formatDate(detay.dogrulamaZamani) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-8 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Kişi bulunamadı</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterDurum !== 'all' 
              ? 'Arama kriterlerinize uygun kişi bulunamadı.'
              : 'TC kimlik numarası olan kişi kaydı bulunamadı.'
            }
          </p>
          <p className="text-gray-600 text-sm">
            E-devlet entegrasyonu aktif.
          </p>
        </div>
      )}
    </div>
  );
};

export default EDevletEntegrasyonu;