import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, Eye, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import type { BankaHareketi, BankaEntegrasyonu } from '../services/integrationService';
import {
  bankaHareketleriniAl,
  otomatikBagisKaydet,
  entegrasyonAyarlari
} from '../services/integrationService';
import { getBagislar } from '../services/apiService';
import type { Bagis } from '../types';

interface OtomatikBagisRaporu {
  toplamHareket: number;
  bagisOlabilecek: number;
  kaydedilen: number;
  toplam: number;
  tarihAraligi: { baslangic: string; bitis: string };
}

const OtomatikBagisTakibi: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hareketler, setHareketler] = useState<BankaHareketi[]>([]);
  const [bagislar, setBagislar] = useState<Bagis[]>([]);
  const [rapor, setRapor] = useState<OtomatikBagisRaporu | null>(null);
  const [tarihAraligi, setTarihAraligi] = useState({
    baslangic: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    bitis: new Date().toISOString().split('T')[0]
  });
  const [selectedHareketler, setSelectedHareketler] = useState<Set<string>>(new Set());
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    loadBagislar();
    loadLastSyncTime();
  }, []);

  const loadBagislar = async () => {
    try {
      const data = await getBagislar();
      setBagislar(data);
    } catch (error) {
      console.error('Bağışlar yüklenirken hata:', error);
    }
  };

  const loadLastSyncTime = () => {
    const lastSync = localStorage.getItem('lastBankSync');
    if (lastSync) {
      setLastSyncTime(lastSync);
    }
  };

  const saveLastSyncTime = () => {
    const now = new Date().toISOString();
    localStorage.setItem('lastBankSync', now);
    setLastSyncTime(now);
  };

  const bankaHareketleriniGetir = async () => {
    if (!entegrasyonAyarlari.banka) {
      alert('Banka entegrasyonu yapılandırılmamış!');
      return;
    }

    setLoading(true);
    try {
      const data = await bankaHareketleriniAl(
        entegrasyonAyarlari.banka,
        tarihAraligi.baslangic,
        tarihAraligi.bitis
      );
      
      setHareketler(data);
      
      // Rapor oluştur
      const bagisOlabilecek = data.filter(h => 
        h.tutar > 0 && 
        h.gonderenAd && 
        h.gonderenAd !== 'Bilinmeyen' &&
        !bagislar.some(b => b.makbuzNo === h.referansNo)
      );
      
      const toplam = bagisOlabilecek.reduce((sum, h) => sum + h.tutar, 0);
      
      setRapor({
        toplamHareket: data.length,
        bagisOlabilecek: bagisOlabilecek.length,
        kaydedilen: 0,
        toplam,
        tarihAraligi
      });
      
      // Otomatik seçim
      const autoSelected = new Set(
        bagisOlabilecek.map(h => h.referansNo)
      );
      setSelectedHareketler(autoSelected);
      
    } catch (error: any) {
      alert(`Banka hareketleri alınırken hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const bagislariKaydet = async () => {
    if (selectedHareketler.size === 0) {
      alert('Kaydedilecek hareket seçilmedi!');
      return;
    }

    setLoading(true);
    try {
      const seciliHareketler = hareketler.filter(h => 
        selectedHareketler.has(h.referansNo)
      );
      
      const kaydedilenSayisi = await otomatikBagisKaydet(seciliHareketler);
      
      alert(`${kaydedilenSayisi} bağış başarıyla kaydedildi!`);
      
      // Raporu güncelle
      if (rapor) {
        setRapor({
          ...rapor,
          kaydedilen: kaydedilenSayisi
        });
      }
      
      // Seçimi temizle
      setSelectedHareketler(new Set());
      
      // Son senkronizasyon zamanını kaydet
      saveLastSyncTime();
      
      // Bağışları yeniden yükle
      await loadBagislar();
      
    } catch (error: any) {
      alert(`Bağışlar kaydedilirken hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleHareket = (referansNo: string) => {
    const newSelected = new Set(selectedHareketler);
    if (newSelected.has(referansNo)) {
      newSelected.delete(referansNo);
    } else {
      newSelected.add(referansNo);
    }
    setSelectedHareketler(newSelected);
  };

  const selectAll = () => {
    const bagisOlabilecek = hareketler.filter(h => 
      h.tutar > 0 && 
      h.gonderenAd && 
      h.gonderenAd !== 'Bilinmeyen' &&
      !bagislar.some(b => b.makbuzNo === h.referansNo)
    );
    setSelectedHareketler(new Set(bagisOlabilecek.map(h => h.referansNo)));
  };

  const clearSelection = () => {
    setSelectedHareketler(new Set());
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Tarih', 'Gönderen', 'Tutar', 'Açıklama', 'Referans No', 'Durum'].join(','),
      ...hareketler.map(h => [
        h.tarih,
        h.gonderenAd || 'Bilinmeyen',
        h.tutar,
        h.aciklama,
        h.referansNo,
        selectedHareketler.has(h.referansNo) ? 'Seçili' : 'Seçili Değil'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `banka_hareketleri_${tarihAraligi.baslangic}_${tarihAraligi.bitis}.csv`;
    link.click();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const isHareketBagis = (hareket: BankaHareketi) => {
    return hareket.tutar > 0 && 
           hareket.gonderenAd && 
           hareket.gonderenAd !== 'Bilinmeyen' &&
           !bagislar.some(b => b.makbuzNo === hareket.referansNo);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Otomatik Bağış Takibi</h1>
        <p className="text-gray-600">
          Banka hesap hareketlerini analiz ederek otomatik bağış kaydı yapın.
        </p>
      </div>

      {/* Kontrol Paneli */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={tarihAraligi.baslangic}
              onChange={(e) => setTarihAraligi(prev => ({
                ...prev,
                baslangic: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bitiş Tarihi
            </label>
            <input
              type="date"
              value={tarihAraligi.bitis}
              onChange={(e) => setTarihAraligi(prev => ({
                ...prev,
                bitis: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={bankaHareketleriniGetir}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Yükleniyor...' : 'Hareketleri Getir'}
            </button>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={exportToCSV}
              disabled={hareketler.length === 0}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Download size={16} />
              CSV İndir
            </button>
          </div>
        </div>

        {/* Son Senkronizasyon */}
        {lastSyncTime && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock size={16} />
            <span>Son senkronizasyon: {formatDate(lastSyncTime)} {new Date(lastSyncTime).toLocaleTimeString('tr-TR')}</span>
          </div>
        )}
      </div>

      {/* Rapor Kartları */}
      {rapor && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Hareket</p>
                <p className="text-2xl font-bold text-gray-900">{rapor.toplamHareket}</p>
              </div>
              <Eye className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bağış Olabilecek</p>
                <p className="text-2xl font-bold text-orange-600">{rapor.bagisOlabilecek}</p>
              </div>
              <TrendingUp className="text-orange-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kaydedilen</p>
                <p className="text-2xl font-bold text-green-600">{rapor.kaydedilen}</p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Tutar</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(rapor.toplam)}</p>
              </div>
              <TrendingUp className="text-blue-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Hareket Listesi */}
      {hareketler.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Banka Hareketleri</h3>
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
                  onClick={bagislariKaydet}
                  disabled={selectedHareketler.size === 0 || loading}
                  className="px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Seçilenleri Kaydet ({selectedHareketler.size})
                </button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seç
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gönderen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referans No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {hareketler.map((hareket, index) => {
                  const isBagis = isHareketBagis(hareket);
                  const isSelected = selectedHareketler.has(hareket.referansNo);
                  const isAlreadyRecorded = bagislar.some(b => b.makbuzNo === hareket.referansNo);
                  
                  return (
                    <tr 
                      key={index} 
                      className={`${
                        isBagis ? 'bg-green-50' : 
                        isAlreadyRecorded ? 'bg-blue-50' : 
                        hareket.tutar < 0 ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleHareket(hareket.referansNo)}
                          disabled={!isBagis}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(hareket.tarih)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {hareket.gonderenAd || 'Bilinmeyen'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={hareket.tutar >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatCurrency(hareket.tutar)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {hareket.aciklama}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {hareket.referansNo}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isAlreadyRecorded ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <CheckCircle size={12} />
                            Kayıtlı
                          </span>
                        ) : isBagis ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <TrendingUp size={12} />
                            Bağış Olabilir
                          </span>
                        ) : hareket.tutar < 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <XCircle size={12} />
                            Gider
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <Eye size={12} />
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Boş Durum */}
      {hareketler.length === 0 && !loading && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <TrendingUp className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz hareket yok</h3>
          <p className="text-gray-600 mb-4">
            Banka hareketlerini getirmek için tarih aralığını seçin ve "Hareketleri Getir" butonuna tıklayın.
          </p>
          {!entegrasyonAyarlari.banka && (
            <p className="text-red-600 text-sm">
              Banka entegrasyonu yapılandırılmamış. Lütfen önce entegrasyon ayarlarını yapın.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default OtomatikBagisTakibi;