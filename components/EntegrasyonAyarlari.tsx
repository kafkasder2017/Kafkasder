import React, { useState, useEffect } from 'react';
import { Save, TestTube, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type {
  MuhasebeEntegrasyonu,
  BankaEntegrasyonu,
  WhatsAppMesaj
} from '../services/integrationService';
import {
  muhasebeKaydiGonder,
  bankaHareketleriniAl,
  whatsappMesajGonder,
  tcKimlikDogrula,
  entegrasyonAyarlari,
  entegrasyonAyarlariniKaydet
} from '../services/integrationService';

interface TestSonucu {
  basarili: boolean;
  mesaj: string;
}

const EntegrasyonAyarlari: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'muhasebe' | 'banka' | 'edevlet' | 'whatsapp'>('muhasebe');
  const [loading, setLoading] = useState(false);
  const [testSonuclari, setTestSonuclari] = useState<Record<string, TestSonucu>>({});

  // Muhasebe Ayarları
  const [muhasebeAyarlari, setMuhasebeAyarlari] = useState<MuhasebeEntegrasyonu>({
    yazilimTuru: 'Logo',
    apiUrl: '',
    apiKey: '',
    companyCode: ''
  });

  // Banka Ayarları
  const [bankaAyarlari, setBankaAyarlari] = useState<BankaEntegrasyonu>({
    bankaKodu: '',
    bankaAdi: '',
    apiUrl: '',
    clientId: '',
    clientSecret: '',
    hesapNo: '',
    iban: ''
  });

  // WhatsApp Ayarları
  const [whatsappAyarlari, setWhatsappAyarlari] = useState({
    accessToken: '',
    phoneNumberId: '',
    webhookToken: ''
  });

  // E-Devlet Ayarları
  const [edevletAyarlari, setEdevletAyarlari] = useState({
    aktif: false,
    testModu: true
  });

  useEffect(() => {
    // Mevcut ayarları yükle
    setMuhasebeAyarlari(entegrasyonAyarlari.muhasebe || muhasebeAyarlari);
    setBankaAyarlari(entegrasyonAyarlari.banka || bankaAyarlari);
    setWhatsappAyarlari(entegrasyonAyarlari.whatsapp || whatsappAyarlari);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await entegrasyonAyarlariniKaydet({
        muhasebe: muhasebeAyarlari,
        banka: bankaAyarlari,
        whatsapp: whatsappAyarlari
      });
      alert('Ayarlar başarıyla kaydedildi!');
    } catch (error) {
      alert('Ayarlar kaydedilirken hata oluştu!');
    } finally {
      setLoading(false);
    }
  };

  const testMuhasebeEntegrasyonu = async () => {
    setLoading(true);
    try {
      const testKayit = {
        hesapKodu: '999.99.999',
        aciklama: 'Test Kaydı',
        borc: 0,
        alacak: 1,
        tarih: new Date().toISOString().split('T')[0],
        belgeNo: 'TEST-001',
        kategori: 'DIGER_GELIR' as const
      };

      const sonuc = await muhasebeKaydiGonder(muhasebeAyarlari, testKayit);
      setTestSonuclari(prev => ({
        ...prev,
        muhasebe: {
          basarili: sonuc.basarili,
          mesaj: sonuc.basarili ? 'Muhasebe entegrasyonu başarılı!' : sonuc.hata || 'Bilinmeyen hata'
        }
      }));
    } catch (error: any) {
      setTestSonuclari(prev => ({
        ...prev,
        muhasebe: {
          basarili: false,
          mesaj: error.message
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testBankaEntegrasyonu = async () => {
    setLoading(true);
    try {
      const bugun = new Date().toISOString().split('T')[0];
      const hareketler = await bankaHareketleriniAl(bankaAyarlari, bugun, bugun);
      
      setTestSonuclari(prev => ({
        ...prev,
        banka: {
          basarili: true,
          mesaj: `Banka entegrasyonu başarılı! ${hareketler.length} hareket bulundu.`
        }
      }));
    } catch (error: any) {
      setTestSonuclari(prev => ({
        ...prev,
        banka: {
          basarili: false,
          mesaj: error.message
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testWhatsAppEntegrasyonu = async () => {
    setLoading(true);
    try {
      const testMesaj: WhatsAppMesaj = {
        aliciNumara: '905551234567', // Test numarası
        mesajTipi: 'text',
        icerik: 'Bu bir test mesajıdır.'
      };

      const sonuc = await whatsappMesajGonder(
        testMesaj,
        whatsappAyarlari.accessToken,
        whatsappAyarlari.phoneNumberId
      );

      setTestSonuclari(prev => ({
        ...prev,
        whatsapp: {
          basarili: sonuc.basarili,
          mesaj: sonuc.basarili ? 'WhatsApp entegrasyonu başarılı!' : sonuc.hata || 'Bilinmeyen hata'
        }
      }));
    } catch (error: any) {
      setTestSonuclari(prev => ({
        ...prev,
        whatsapp: {
          basarili: false,
          mesaj: error.message
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const testEDevletEntegrasyonu = async () => {
    setLoading(true);
    try {
      const testSorgu = {
        tcKimlikNo: '12345678901', // Test TC
        ad: 'Test',
        soyad: 'Kullanıcı',
        dogumTarihi: '1990-01-01'
      };

      const sonuc = await tcKimlikDogrula(testSorgu);
      
      setTestSonuclari(prev => ({
        ...prev,
        edevlet: {
          basarili: sonuc !== null,
          mesaj: sonuc ? 'E-Devlet entegrasyonu başarılı!' : 'E-Devlet entegrasyonu başarısız!'
        }
      }));
    } catch (error: any) {
      setTestSonuclari(prev => ({
        ...prev,
        edevlet: {
          basarili: false,
          mesaj: error.message
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  const renderTestSonucu = (key: string) => {
    const sonuc = testSonuclari[key];
    if (!sonuc) return null;

    return (
      <div className={`mt-2 p-2 rounded-md flex items-center gap-2 ${
        sonuc.basarili ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}>
        {sonuc.basarili ? <CheckCircle size={16} /> : <XCircle size={16} />}
        <span className="text-sm">{sonuc.mesaj}</span>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Entegrasyon Ayarları</h1>
        <p className="text-gray-600">
          Muhasebe yazılımları, banka API'leri, E-Devlet ve WhatsApp Business entegrasyonlarını yönetin.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'muhasebe', label: 'Muhasebe Yazılımı' },
            { key: 'banka', label: 'Banka API' },
            { key: 'edevlet', label: 'E-Devlet' },
            { key: 'whatsapp', label: 'WhatsApp Business' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Muhasebe Ayarları */}
      {activeTab === 'muhasebe' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Muhasebe Yazılımı Entegrasyonu</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yazılım Türü
                </label>
                <select
                  value={muhasebeAyarlari.yazilimTuru}
                  onChange={(e) => setMuhasebeAyarlari(prev => ({
                    ...prev,
                    yazilimTuru: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Logo">Logo</option>
                  <option value="Eta">Eta</option>
                  <option value="Mikro">Mikro</option>
                  <option value="Nebim">Nebim</option>
                  <option value="Diger">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API URL
                </label>
                <input
                  type="url"
                  value={muhasebeAyarlari.apiUrl}
                  onChange={(e) => setMuhasebeAyarlari(prev => ({
                    ...prev,
                    apiUrl: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://api.muhasebe.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={muhasebeAyarlari.apiKey}
                  onChange={(e) => setMuhasebeAyarlari(prev => ({
                    ...prev,
                    apiKey: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="API anahtarınızı girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şirket Kodu (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={muhasebeAyarlari.companyCode || ''}
                  onChange={(e) => setMuhasebeAyarlari(prev => ({
                    ...prev,
                    companyCode: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Şirket kodu"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={testMuhasebeEntegrasyonu}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <TestTube size={16} />
                Bağlantıyı Test Et
              </button>
            </div>

            {renderTestSonucu('muhasebe')}
          </div>
        </div>
      )}

      {/* Banka API Ayarları */}
      {activeTab === 'banka' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Banka API Entegrasyonu</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banka Adı
                </label>
                <input
                  type="text"
                  value={bankaAyarlari.bankaAdi}
                  onChange={(e) => setBankaAyarlari(prev => ({
                    ...prev,
                    bankaAdi: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ziraat Bankası"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Banka Kodu
                </label>
                <input
                  type="text"
                  value={bankaAyarlari.bankaKodu}
                  onChange={(e) => setBankaAyarlari(prev => ({
                    ...prev,
                    bankaKodu: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API URL
                </label>
                <input
                  type="url"
                  value={bankaAyarlari.apiUrl}
                  onChange={(e) => setBankaAyarlari(prev => ({
                    ...prev,
                    apiUrl: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://api.banka.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client ID
                </label>
                <input
                  type="text"
                  value={bankaAyarlari.clientId}
                  onChange={(e) => setBankaAyarlari(prev => ({
                    ...prev,
                    clientId: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Client ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Secret
                </label>
                <input
                  type="password"
                  value={bankaAyarlari.clientSecret}
                  onChange={(e) => setBankaAyarlari(prev => ({
                    ...prev,
                    clientSecret: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Client Secret"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hesap No
                </label>
                <input
                  type="text"
                  value={bankaAyarlari.hesapNo}
                  onChange={(e) => setBankaAyarlari(prev => ({
                    ...prev,
                    hesapNo: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1234567890"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IBAN
                </label>
                <input
                  type="text"
                  value={bankaAyarlari.iban}
                  onChange={(e) => setBankaAyarlari(prev => ({
                    ...prev,
                    iban: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="TR00 0000 0000 0000 0000 0000 00"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={testBankaEntegrasyonu}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <TestTube size={16} />
                Bağlantıyı Test Et
              </button>
            </div>

            {renderTestSonucu('banka')}
          </div>
        </div>
      )}

      {/* E-Devlet Ayarları */}
      {activeTab === 'edevlet' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">E-Devlet Entegrasyonu</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edevlet-aktif"
                  checked={edevletAyarlari.aktif}
                  onChange={(e) => setEdevletAyarlari(prev => ({
                    ...prev,
                    aktif: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="edevlet-aktif" className="text-sm font-medium text-gray-700">
                  E-Devlet entegrasyonunu etkinleştir
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="edevlet-test"
                  checked={edevletAyarlari.testModu}
                  onChange={(e) => setEdevletAyarlari(prev => ({
                    ...prev,
                    testModu: e.target.checked
                  }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="edevlet-test" className="text-sm font-medium text-gray-700">
                  Test modu (Gerçek API çağrıları yapılmaz)
                </label>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Önemli Bilgi:</p>
                    <p>
                      E-Devlet entegrasyonu için resmi başvuru yapmanız ve API erişim izni almanız gerekmektedir.
                      Şu an sadece TC Kimlik No doğrulama servisi kullanılabilir.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={testEDevletEntegrasyonu}
                disabled={loading || !edevletAyarlari.aktif}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <TestTube size={16} />
                Bağlantıyı Test Et
              </button>
            </div>

            {renderTestSonucu('edevlet')}
          </div>
        </div>
      )}

      {/* WhatsApp Business Ayarları */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">WhatsApp Business API</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Token
                </label>
                <input
                  type="password"
                  value={whatsappAyarlari.accessToken}
                  onChange={(e) => setWhatsappAyarlari(prev => ({
                    ...prev,
                    accessToken: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="WhatsApp Business API Access Token"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={whatsappAyarlari.phoneNumberId}
                  onChange={(e) => setWhatsappAyarlari(prev => ({
                    ...prev,
                    phoneNumberId: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone Number ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Webhook Token
                </label>
                <input
                  type="password"
                  value={whatsappAyarlari.webhookToken}
                  onChange={(e) => setWhatsappAyarlari(prev => ({
                    ...prev,
                    webhookToken: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Webhook doğrulama token'ı"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Kurulum Adımları:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Meta for Developers hesabı oluşturun</li>
                    <li>WhatsApp Business API uygulaması oluşturun</li>
                    <li>Telefon numaranızı doğrulayın</li>
                    <li>Access Token ve Phone Number ID'yi alın</li>
                    <li>Webhook URL'ini yapılandırın</li>
                  </ol>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={testWhatsAppEntegrasyonu}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <TestTube size={16} />
                Test Mesajı Gönder
              </button>
            </div>

            {renderTestSonucu('whatsapp')}
          </div>
        </div>
      )}

      {/* Kaydet Butonu */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          <Save size={16} />
          {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
      </div>
    </div>
  );
};

export default EntegrasyonAyarlari;