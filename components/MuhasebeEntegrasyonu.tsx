import React, { useState, useEffect } from 'react';
import { Calculator, FileText, Download, Upload, CheckCircle, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { muhasebeKaydiGonder, bagisiMuhasebeKaydet, entegrasyonAyarlari } from '../services/integrationService';
import { getBagislar, getFinansalKayitlar } from '../services/apiService';
import type { Bagis, FinansalKayit } from '../types';

interface MuhasebeRaporu {
  toplamKayit: number;
  gonderilen: number;
  bekleyen: number;
  hata: number;
  sonSenkronizasyon: string;
  toplamTutar: number;
}

interface MuhasebeKaydi {
  id: string;
  tip: 'bagis' | 'gider' | 'gelir' | 'transfer';
  tarih: string;
  tutar: number;
  aciklama: string;
  hesapKodu?: string;
  faturaNumarasi?: string;
  vergiDairesi?: string;
  tcVkn?: string;
  durum: 'bekliyor' | 'gonderildi' | 'onaylandi' | 'reddedildi' | 'hata';
  hata?: string;
  muhasebeId?: string;
  gonderimZamani?: string;
}

interface FiltreSecenekleri {
  baslangicTarihi: string;
  bitisTarihi: string;
  tip: string;
  durum: string;
  minTutar: string;
  maxTutar: string;
}

const MuhasebeEntegrasyonu: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [bagislar, setBagislar] = useState<Bagis[]>([]);
  const [finansalKayitlar, setFinansalKayitlar] = useState<FinansalKayit[]>([]);
  const [muhasebeKayitlari, setMuhasebeKayitlari] = useState<MuhasebeKaydi[]>([]);
  const [rapor, setRapor] = useState<MuhasebeRaporu | null>(null);
  const [selectedKayitlar, setSelectedKayitlar] = useState<Set<string>>(new Set());
  const [filtreler, setFiltreler] = useState<FiltreSecenekleri>({
    baslangicTarihi: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    bitisTarihi: new Date().toISOString().split('T')[0],
    tip: 'all',
    durum: 'all',
    minTutar: '',
    maxTutar: ''
  });
  const [otomatikSenkronizasyon, setOtomatikSenkronizasyon] = useState(false);
  const [senkronizasyonAraligi, setSenkronizasyonAraligi] = useState('daily');
  const [exportFormat, setExportFormat] = useState<'excel' | 'csv' | 'xml'>('excel');

  useEffect(() => {
    loadData();
    loadMuhasebeKayitlari();
    loadOtomatikSenkronizasyonAyarlari();
  }, []);

  const loadData = async () => {
    try {
      const [bagisData, finansalData] = await Promise.all([
        getBagislar(),
        getFinansalKayitlar()
      ]);
      setBagislar(bagisData);
      setFinansalKayitlar(finansalData);
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    }
  };

  const loadMuhasebeKayitlari = () => {
    const savedKayitlar = localStorage.getItem('muhasebeKayitlari');
    const savedRapor = localStorage.getItem('muhasebeRaporu');
    
    if (savedKayitlar) {
      setMuhasebeKayitlari(JSON.parse(savedKayitlar));
    }
    
    if (savedRapor) {
      setRapor(JSON.parse(savedRapor));
    }
  };

  const loadOtomatikSenkronizasyonAyarlari = () => {
    const otomatik = localStorage.getItem('otomatikMuhasebeSenkronizasyonu');
    const aralik = localStorage.getItem('muhasebeSenkronizasyonAraligi');
    
    if (otomatik) {
      setOtomatikSenkronizasyon(JSON.parse(otomatik));
    }
    
    if (aralik) {
      setSenkronizasyonAraligi(aralik);
    }
  };

  const saveMuhasebeKayitlari = (kayitlar: MuhasebeKaydi[], yeniRapor: MuhasebeRaporu) => {
    localStorage.setItem('muhasebeKayitlari', JSON.stringify(kayitlar));
    localStorage.setItem('muhasebeRaporu', JSON.stringify(yeniRapor));
    setMuhasebeKayitlari(kayitlar);
    setRapor(yeniRapor);
  };

  const saveOtomatikSenkronizasyonAyarlari = () => {
    localStorage.setItem('otomatikMuhasebeSenkronizasyonu', JSON.stringify(otomatikSenkronizasyon));
    localStorage.setItem('muhasebeSenkronizasyonAraligi', senkronizasyonAraligi);
  };

  const muhasebeKayitlariniOlustur = () => {
    const yeniKayitlar: MuhasebeKaydi[] = [];
    
    // Bağışları muhasebe kayıtlarına dönüştür
    bagislar.forEach(bagis => {
      if (bagis.tarih >= filtreler.baslangicTarihi && bagis.tarih <= filtreler.bitisTarihi) {
        const mevcutKayit = muhasebeKayitlari.find(k => k.id === `bagis-${bagis.id}`);
        
        if (!mevcutKayit) {
          yeniKayitlar.push({
            id: `bagis-${bagis.id}`,
            tip: 'bagis',
            tarih: bagis.tarih,
            tutar: bagis.tutar,
            aciklama: `Bağış - ${bagis.bagisciAd} ${bagis.bagisciSoyad}`,
            hesapKodu: '120.01.001', // Bağış Gelirleri
            tcVkn: bagis.bagisciTcKimlik,
            durum: 'bekliyor'
          });
        }
      }
    });
    
    // Finansal kayıtları muhasebe kayıtlarına dönüştür
    finansalKayitlar.forEach(kayit => {
      if (kayit.tarih >= filtreler.baslangicTarihi && kayit.tarih <= filtreler.bitisTarihi) {
        const mevcutKayit = muhasebeKayitlari.find(k => k.id === `finansal-${kayit.id}`);
        
        if (!mevcutKayit) {
          const tip = kayit.islemTuru === 'gelir' ? 'gelir' : 'gider';
          
          yeniKayitlar.push({
            id: `finansal-${kayit.id}`,
            tip,
            tarih: kayit.tarih,
            tutar: kayit.tutar,
            aciklama: kayit.aciklama,
            hesapKodu: getHesapKodu(kayit.kategori, tip),
            faturaNumarasi: kayit.faturaNumarasi,
            durum: 'bekliyor'
          });
        }
      }
    });
    
    if (yeniKayitlar.length > 0) {
      const guncelKayitlar = [...muhasebeKayitlari, ...yeniKayitlar];
      const yeniRapor = calculateRapor(guncelKayitlar);
      saveMuhasebeKayitlari(guncelKayitlar, yeniRapor);
      alert(`${yeniKayitlar.length} yeni muhasebe kaydı oluşturuldu!`);
    } else {
      alert('Yeni muhasebe kaydı bulunamadı.');
    }
  };

  const getHesapKodu = (kategori: string, tip: string): string => {
    const hesapKodlari: { [key: string]: string } = {
      // Gelir hesapları
      'bagis-gelir': '120.01.001',
      'aidat-gelir': '120.01.002',
      'etkinlik-gelir': '120.01.003',
      'diger-gelir': '120.01.999',
      
      // Gider hesapları
      'personel-gider': '770.01.001',
      'kira-gider': '770.02.001',
      'elektrik-gider': '770.02.002',
      'telefon-gider': '770.02.003',
      'malzeme-gider': '770.03.001',
      'yardim-gider': '770.04.001',
      'diger-gider': '770.99.999'
    };
    
    const key = `${kategori}-${tip}`;
    return hesapKodlari[key] || (tip === 'gelir' ? '120.01.999' : '770.99.999');
  };

  const calculateRapor = (kayitlar: MuhasebeKaydi[]): MuhasebeRaporu => {
    const gonderilen = kayitlar.filter(k => k.durum === 'gonderildi' || k.durum === 'onaylandi').length;
    const bekleyen = kayitlar.filter(k => k.durum === 'bekliyor').length;
    const hata = kayitlar.filter(k => k.durum === 'hata' || k.durum === 'reddedildi').length;
    const toplamTutar = kayitlar.reduce((sum, k) => sum + k.tutar, 0);
    
    return {
      toplamKayit: kayitlar.length,
      gonderilen,
      bekleyen,
      hata,
      sonSenkronizasyon: new Date().toISOString(),
      toplamTutar
    };
  };

  const seciliKayitlariGonder = async () => {
    if (!entegrasyonAyarlari.muhasebe) {
      alert('Muhasebe entegrasyonu yapılandırılmamış!');
      return;
    }

    if (selectedKayitlar.size === 0) {
      alert('Gönderilecek kayıt seçilmedi!');
      return;
    }

    setLoading(true);
    const guncelKayitlar = [...muhasebeKayitlari];
    let basarili = 0;
    let basarisiz = 0;

    try {
      const seciliKayitlar = muhasebeKayitlari.filter(k => selectedKayitlar.has(k.id));
      
      for (const kayit of seciliKayitlar) {
        try {
          const sonuc = await muhasebeKaydiGonder(entegrasyonAyarlari.muhasebe, {
            tarih: kayit.tarih,
            tutar: kayit.tutar,
            aciklama: kayit.aciklama,
            hesapKodu: kayit.hesapKodu!,
            faturaNumarasi: kayit.faturaNumarasi,
            vergiDairesi: kayit.vergiDairesi,
            tcVkn: kayit.tcVkn
          });

          const kayitIndex = guncelKayitlar.findIndex(k => k.id === kayit.id);
          if (kayitIndex !== -1) {
            guncelKayitlar[kayitIndex] = {
              ...guncelKayitlar[kayitIndex],
              durum: sonuc.basarili ? 'gonderildi' : 'hata',
              muhasebeId: sonuc.muhasebeId,
              hata: sonuc.hata,
              gonderimZamani: new Date().toISOString()
            };
          }

          if (sonuc.basarili) {
            basarili++;
          } else {
            basarisiz++;
          }

          // API limitlerini aşmamak için kısa bekleme
          await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error: any) {
          const kayitIndex = guncelKayitlar.findIndex(k => k.id === kayit.id);
          if (kayitIndex !== -1) {
            guncelKayitlar[kayitIndex] = {
              ...guncelKayitlar[kayitIndex],
              durum: 'hata',
              hata: error.message,
              gonderimZamani: new Date().toISOString()
            };
          }
          basarisiz++;
        }
      }

      const yeniRapor = calculateRapor(guncelKayitlar);
      saveMuhasebeKayitlari(guncelKayitlar, yeniRapor);
      setSelectedKayitlar(new Set());
      
      alert(`Gönderim tamamlandı! ${basarili} başarılı, ${basarisiz} başarısız.`);
      
    } catch (error: any) {
      alert(`Gönderim sırasında hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportMuhasebeKayitlari = () => {
    const filteredKayitlar = getFilteredKayitlar();
    
    if (filteredKayitlar.length === 0) {
      alert('Dışa aktarılacak kayıt bulunamadı!');
      return;
    }

    let content = '';
    let filename = '';
    
    if (exportFormat === 'csv') {
      const headers = ['Tarih', 'Tip', 'Tutar', 'Açıklama', 'Hesap Kodu', 'Fatura No', 'TC/VKN', 'Durum'];
      const rows = filteredKayitlar.map(k => [
        k.tarih,
        k.tip,
        k.tutar,
        k.aciklama,
        k.hesapKodu || '',
        k.faturaNumarasi || '',
        k.tcVkn || '',
        k.durum
      ]);
      
      content = [headers, ...rows].map(row => row.join(',')).join('\n');
      filename = `muhasebe_kayitlari_${filtreler.baslangicTarihi}_${filtreler.bitisTarihi}.csv`;
      
    } else if (exportFormat === 'xml') {
      content = `<?xml version="1.0" encoding="UTF-8"?>\n<MuhasebeKayitlari>\n`;
      filteredKayitlar.forEach(kayit => {
        content += `  <Kayit>\n`;
        content += `    <Tarih>${kayit.tarih}</Tarih>\n`;
        content += `    <Tip>${kayit.tip}</Tip>\n`;
        content += `    <Tutar>${kayit.tutar}</Tutar>\n`;
        content += `    <Aciklama>${kayit.aciklama}</Aciklama>\n`;
        content += `    <HesapKodu>${kayit.hesapKodu || ''}</HesapKodu>\n`;
        content += `    <FaturaNo>${kayit.faturaNumarasi || ''}</FaturaNo>\n`;
        content += `    <TcVkn>${kayit.tcVkn || ''}</TcVkn>\n`;
        content += `    <Durum>${kayit.durum}</Durum>\n`;
        content += `  </Kayit>\n`;
      });
      content += `</MuhasebeKayitlari>`;
      filename = `muhasebe_kayitlari_${filtreler.baslangicTarihi}_${filtreler.bitisTarihi}.xml`;
    }

    const blob = new Blob([content], { 
      type: exportFormat === 'xml' ? 'application/xml' : 'text/csv;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const toggleKayit = (kayitId: string) => {
    const newSelected = new Set(selectedKayitlar);
    if (newSelected.has(kayitId)) {
      newSelected.delete(kayitId);
    } else {
      newSelected.add(kayitId);
    }
    setSelectedKayitlar(newSelected);
  };

  const selectAll = () => {
    const filteredKayitlar = getFilteredKayitlar();
    setSelectedKayitlar(new Set(filteredKayitlar.map(k => k.id)));
  };

  const clearSelection = () => {
    setSelectedKayitlar(new Set());
  };

  const getFilteredKayitlar = () => {
    return muhasebeKayitlari.filter(kayit => {
      const tarihMatch = kayit.tarih >= filtreler.baslangicTarihi && kayit.tarih <= filtreler.bitisTarihi;
      const tipMatch = filtreler.tip === 'all' || kayit.tip === filtreler.tip;
      const durumMatch = filtreler.durum === 'all' || kayit.durum === filtreler.durum;
      
      let tutarMatch = true;
      if (filtreler.minTutar) {
        tutarMatch = tutarMatch && kayit.tutar >= parseFloat(filtreler.minTutar);
      }
      if (filtreler.maxTutar) {
        tutarMatch = tutarMatch && kayit.tutar <= parseFloat(filtreler.maxTutar);
      }
      
      return tarihMatch && tipMatch && durumMatch && tutarMatch;
    });
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

  const getDurumIcon = (durum: string) => {
    switch (durum) {
      case 'gonderildi':
      case 'onaylandi':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'hata':
      case 'reddedildi':
        return <XCircle className="text-red-500" size={16} />;
      case 'bekliyor':
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <AlertTriangle className="text-gray-500" size={16} />;
    }
  };

  const getDurumText = (durum: string) => {
    switch (durum) {
      case 'gonderildi':
        return 'Gönderildi';
      case 'onaylandi':
        return 'Onaylandı';
      case 'reddedildi':
        return 'Reddedildi';
      case 'hata':
        return 'Hata';
      case 'bekliyor':
        return 'Bekliyor';
      default:
        return 'Bilinmeyen';
    }
  };

  const getTipColor = (tip: string) => {
    switch (tip) {
      case 'bagis':
        return 'bg-green-100 text-green-800';
      case 'gelir':
        return 'bg-blue-100 text-blue-800';
      case 'gider':
        return 'bg-red-100 text-red-800';
      case 'transfer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredKayitlar = getFilteredKayitlar();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Muhasebe Entegrasyonu</h1>
        <p className="text-gray-600">
          Finansal kayıtları muhasebe yazılımına otomatik olarak aktarın.
        </p>
      </div>

      {/* Rapor Kartları */}
      {rapor && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Kayıt</p>
                <p className="text-2xl font-bold text-gray-900">{rapor.toplamKayit}</p>
              </div>
              <FileText className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gönderilen</p>
                <p className="text-2xl font-bold text-green-600">{rapor.gonderilen}</p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Bekleyen</p>
                <p className="text-2xl font-bold text-yellow-600">{rapor.bekleyen}</p>
              </div>
              <Clock className="text-yellow-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hata</p>
                <p className="text-2xl font-bold text-red-600">{rapor.hata}</p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Tutar</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(rapor.toplamTutar)}</p>
              </div>
              <TrendingUp className="text-blue-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Kontrol Paneli */}
      <div className="bg-white p-6 rounded-lg border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Muhasebe Kayıt Yönetimi</h3>
          <div className="flex gap-2">
            <button
              onClick={muhasebeKayitlariniOlustur}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Calculator size={16} />
              Kayıtları Oluştur
            </button>
            <button
              onClick={exportMuhasebeKayitlari}
              disabled={filteredKayitlar.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <Download size={16} />
              Dışa Aktar
            </button>
          </div>
        </div>
        
        {/* Filtreler */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Başlangıç Tarihi
            </label>
            <input
              type="date"
              value={filtreler.baslangicTarihi}
              onChange={(e) => setFiltreler(prev => ({
                ...prev,
                baslangicTarihi: e.target.value
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
              value={filtreler.bitisTarihi}
              onChange={(e) => setFiltreler(prev => ({
                ...prev,
                bitisTarihi: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tip
            </label>
            <select
              value={filtreler.tip}
              onChange={(e) => setFiltreler(prev => ({
                ...prev,
                tip: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tümü</option>
              <option value="bagis">Bağış</option>
              <option value="gelir">Gelir</option>
              <option value="gider">Gider</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Durum
            </label>
            <select
              value={filtreler.durum}
              onChange={(e) => setFiltreler(prev => ({
                ...prev,
                durum: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tümü</option>
              <option value="bekliyor">Bekliyor</option>
              <option value="gonderildi">Gönderildi</option>
              <option value="onaylandi">Onaylandı</option>
              <option value="hata">Hata</option>
              <option value="reddedildi">Reddedildi</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Tutar
            </label>
            <input
              type="number"
              value={filtreler.minTutar}
              onChange={(e) => setFiltreler(prev => ({
                ...prev,
                minTutar: e.target.value
              }))}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Tutar
            </label>
            <input
              type="number"
              value={filtreler.maxTutar}
              onChange={(e) => setFiltreler(prev => ({
                ...prev,
                maxTutar: e.target.value
              }))}
              placeholder="∞"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {/* Dışa Aktarma Formatı */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">Dışa Aktarma Formatı:</span>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="excel"
              checked={exportFormat === 'excel'}
              onChange={(e) => setExportFormat(e.target.value as 'excel' | 'csv' | 'xml')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">Excel</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="csv"
              checked={exportFormat === 'csv'}
              onChange={(e) => setExportFormat(e.target.value as 'excel' | 'csv' | 'xml')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">CSV</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="xml"
              checked={exportFormat === 'xml'}
              onChange={(e) => setExportFormat(e.target.value as 'excel' | 'csv' | 'xml')}
              className="w-4 h-4 text-blue-600"
            />
            <span className="text-sm">XML</span>
          </label>
        </div>
      </div>

      {/* Kayıt Listesi */}
      {filteredKayitlar.length > 0 ? (
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Muhasebe Kayıtları ({filteredKayitlar.length})</h3>
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
                  onClick={seciliKayitlariGonder}
                  disabled={selectedKayitlar.size === 0 || loading}
                  className="px-4 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                  <Upload size={14} className="inline mr-1" />
                  Seçilenleri Gönder ({selectedKayitlar.size})
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
                    Tip
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hesap Kodu
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gönderim
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredKayitlar.map((kayit) => {
                  const isSelected = selectedKayitlar.has(kayit.id);
                  
                  return (
                    <tr key={kayit.id} className={isSelected ? 'bg-blue-50' : ''}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleKayit(kayit.id)}
                          disabled={kayit.durum === 'gonderildi' || kayit.durum === 'onaylandi'}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(kayit.tarih)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTipColor(kayit.tip)}`}>
                          {kayit.tip.charAt(0).toUpperCase() + kayit.tip.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(kayit.tutar)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 max-w-xs truncate">
                        {kayit.aciklama}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                        {kayit.hesapKodu}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getDurumIcon(kayit.durum)}
                          <span className="text-sm">{getDurumText(kayit.durum)}</span>
                        </div>
                        {kayit.hata && (
                          <p className="text-xs text-red-600 mt-1">{kayit.hata}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {kayit.gonderimZamani ? formatDate(kayit.gonderimZamani) : '-'}
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
          <Calculator className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Muhasebe kaydı bulunamadı</h3>
          <p className="text-gray-600 mb-4">
            {muhasebeKayitlari.length === 0 
              ? 'Henüz muhasebe kaydı oluşturulmamış. "Kayıtları Oluştur" butonuna tıklayarak başlayın.'
              : 'Seçilen filtrelere uygun kayıt bulunamadı. Filtre ayarlarını kontrol edin.'
            }
          </p>
          {!entegrasyonAyarlari.muhasebe && (
            <p className="text-red-600 text-sm">
              Muhasebe entegrasyonu yapılandırılmamış. Lütfen önce entegrasyon ayarlarını yapın.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default MuhasebeEntegrasyonu;