import React, { useState, useEffect } from 'react';
import { Settings, Save, Palette, Bell, Shield, Database, Globe, Users, Building, FileText } from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import { SistemAyarlari } from '../types';

const Ayarlar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'genel' | 'görünüm' | 'bildirimler' | 'güvenlik' | 'entegrasyon' | 'yedekleme'>('genel');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Genel Ayarlar
  const [genelAyarlar, setGenelAyarlar] = useState({
    dernekAdi: 'KAFKASDER',
    dernekAdresi: 'İstanbul, Türkiye',
    logoUrl: '',
    telefon: '',
    email: 'info@kafkasder.org',
    website: 'https://kafkasder.org',
    vergiDairesi: '',
    vergiNumarasi: '',
    varsayilanParaBirimi: 'TRY' as 'TRY' | 'USD' | 'EUR',
    tarihFormati: 'DD/MM/YYYY' as 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD',
    saatDilimi: 'Europe/Istanbul',
    dil: 'tr' as 'tr' | 'en' | 'ar'
  });

  // Görünüm Ayarları
  const [gorunumAyarlari, setGorunumAyarlari] = useState({
    tema: 'light' as 'light' | 'dark' | 'auto',
    anaRenk: '#3B82F6',
    ikincilRenk: '#64748B',
    fontBoyutu: 'medium' as 'small' | 'medium' | 'large',
    dashboardLayout: 'grid' as 'grid' | 'list',
    sidebarGenislik: 'normal' as 'compact' | 'normal' | 'wide',
    animasyonlar: true,
    yuvarlakKoseler: true
  });

  // Bildirim Ayarları
  const [bildirimAyarlari, setBildirimAyarlari] = useState({
    emailBildirimleri: true,
    smsBildirimleri: false,
    pushBildirimleri: true,
    yeniBagisBildirimi: true,
    yeniUyeBildirimi: true,
    yeniBasvuruBildirimi: true,
    gunlukOzet: false,
    haftalikRapor: true,
    aylikRapor: true,
    bildirimZamani: '09:00'
  });

  // Güvenlik Ayarları
  const [guvenlikAyarlari, setGuvenlikAyarlari] = useState({
    ikiFaktorluDogrulama: false,
    oturumSuresi: 24, // saat
    maksimumGirisDenemesi: 5,
    sifreKarmaSikligi: 'medium' as 'low' | 'medium' | 'high',
    otomatikCikis: true,
    ipKisitlamasi: false,
    izinliIpAdresleri: '',
    veriSifreleme: true,
    auditLog: true
  });

  // Entegrasyon Ayarları
  const [entegrasyonAyarlari, setEntegrasyonAyarlari] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    smtpSecure: true,
    whatsappApiKey: '',
    whatsappPhoneNumber: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
    recaptchaSiteKey: '',
    recaptchaSecretKey: ''
  });

  // Yedekleme Ayarları
  const [yedeklemeAyarlari, setYedeklemeAyarlari] = useState({
    otomatikYedekleme: true,
    yedeklemeSikligi: 'daily' as 'daily' | 'weekly' | 'monthly',
    yedeklemeZamani: '02:00',
    yedeklemeSaklamaSuresi: 30, // gün
    bulutYedekleme: false,
    bulutProvider: 'google' as 'google' | 'dropbox' | 'onedrive',
    bulutApiKey: '',
    veriSikistirma: true,
    sifreliYedekleme: true
  });

  useEffect(() => {
    loadAyarlar();
  }, []);

  const loadAyarlar = async () => {
    try {
      const { data, error } = await supabase
        .from('sistem_ayarlari')
        .select('*')
        .eq('id', 1)
        .single();

      if (data) {
        setGenelAyarlar(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    }
  };

  const saveAyarlar = async () => {
    setLoading(true);
    setSaved(false);

    try {
      const ayarlar = {
        id: 1,
        ...genelAyarlar,
        gorunum_ayarlari: gorunumAyarlari,
        bildirim_ayarlari: bildirimAyarlari,
        guvenlik_ayarlari: guvenlikAyarlari,
        entegrasyon_ayarlari: entegrasyonAyarlari,
        yedekleme_ayarlari: yedeklemeAyarlari,
        guncelleme_tarihi: new Date().toISOString()
      };

      const { error } = await supabase
        .from('sistem_ayarlari')
        .upsert(ayarlar);

      if (error) throw error;

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'genel':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">🏢 Kurum Bilgileri</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dernek Adı *
                </label>
                <input
                  type="text"
                  value={genelAyarlar.dernekAdi}
                  onChange={(e) => setGenelAyarlar(prev => ({ ...prev, dernekAdi: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo URL
                </label>
                <input
                  type="url"
                  value={genelAyarlar.logoUrl}
                  onChange={(e) => setGenelAyarlar(prev => ({ ...prev, logoUrl: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adres
                </label>
                <textarea
                  value={genelAyarlar.dernekAdresi}
                  onChange={(e) => setGenelAyarlar(prev => ({ ...prev, dernekAdresi: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={genelAyarlar.telefon}
                  onChange={(e) => setGenelAyarlar(prev => ({ ...prev, telefon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta
                </label>
                <input
                  type="email"
                  value={genelAyarlar.email}
                  onChange={(e) => setGenelAyarlar(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-900 mt-8">🌍 Sistem Ayarları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Varsayılan Para Birimi
                </label>
                <select
                  value={genelAyarlar.varsayilanParaBirimi}
                  onChange={(e) => setGenelAyarlar(prev => ({ ...prev, varsayilanParaBirimi: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TRY">Türk Lirası (₺)</option>
                  <option value="USD">Amerikan Doları ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tarih Formatı
                </label>
                <select
                  value={genelAyarlar.tarihFormati}
                  onChange={(e) => setGenelAyarlar(prev => ({ ...prev, tarihFormati: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="DD/MM/YYYY">GG/AA/YYYY</option>
                  <option value="MM/DD/YYYY">AA/GG/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-AA-GG</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dil
                </label>
                <select
                  value={genelAyarlar.dil}
                  onChange={(e) => setGenelAyarlar(prev => ({ ...prev, dil: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="tr">Türkçe</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'görünüm':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">🎨 Görünüm Ayarları</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tema
                </label>
                <select
                  value={gorunumAyarlari.tema}
                  onChange={(e) => setGorunumAyarlari(prev => ({ ...prev, tema: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Açık Tema</option>
                  <option value="dark">Koyu Tema</option>
                  <option value="auto">Otomatik</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ana Renk
                </label>
                <input
                  type="color"
                  value={gorunumAyarlari.anaRenk}
                  onChange={(e) => setGorunumAyarlari(prev => ({ ...prev, anaRenk: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Boyutu
                </label>
                <select
                  value={gorunumAyarlari.fontBoyutu}
                  onChange={(e) => setGorunumAyarlari(prev => ({ ...prev, fontBoyutu: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="small">Küçük</option>
                  <option value="medium">Orta</option>
                  <option value="large">Büyük</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dashboard Düzeni
                </label>
                <select
                  value={gorunumAyarlari.dashboardLayout}
                  onChange={(e) => setGorunumAyarlari(prev => ({ ...prev, dashboardLayout: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="grid">Izgara</option>
                  <option value="list">Liste</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="animasyonlar"
                  checked={gorunumAyarlari.animasyonlar}
                  onChange={(e) => setGorunumAyarlari(prev => ({ ...prev, animasyonlar: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="animasyonlar" className="ml-2 text-sm text-gray-700">
                  Animasyonları etkinleştir
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="yuvarlakKoseler"
                  checked={gorunumAyarlari.yuvarlakKoseler}
                  onChange={(e) => setGorunumAyarlari(prev => ({ ...prev, yuvarlakKoseler: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="yuvarlakKoseler" className="ml-2 text-sm text-gray-700">
                  Yuvarlak köşeler
                </label>
              </div>
            </div>
          </div>
        );

      case 'bildirimler':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">🔔 Bildirim Ayarları</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailBildirimleri"
                  checked={bildirimAyarlari.emailBildirimleri}
                  onChange={(e) => setBildirimAyarlari(prev => ({ ...prev, emailBildirimleri: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailBildirimleri" className="ml-2 text-sm text-gray-700">
                  E-posta bildirimleri
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsBildirimleri"
                  checked={bildirimAyarlari.smsBildirimleri}
                  onChange={(e) => setBildirimAyarlari(prev => ({ ...prev, smsBildirimleri: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="smsBildirimleri" className="ml-2 text-sm text-gray-700">
                  SMS bildirimleri
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pushBildirimleri"
                  checked={bildirimAyarlari.pushBildirimleri}
                  onChange={(e) => setBildirimAyarlari(prev => ({ ...prev, pushBildirimleri: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="pushBildirimleri" className="ml-2 text-sm text-gray-700">
                  Push bildirimleri
                </label>
              </div>
            </div>

            <h4 className="text-md font-medium text-gray-800 mt-6">📧 Bildirim Türleri</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="yeniBagisBildirimi"
                  checked={bildirimAyarlari.yeniBagisBildirimi}
                  onChange={(e) => setBildirimAyarlari(prev => ({ ...prev, yeniBagisBildirimi: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="yeniBagisBildirimi" className="ml-2 text-sm text-gray-700">
                  Yeni bağış bildirimi
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="yeniUyeBildirimi"
                  checked={bildirimAyarlari.yeniUyeBildirimi}
                  onChange={(e) => setBildirimAyarlari(prev => ({ ...prev, yeniUyeBildirimi: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="yeniUyeBildirimi" className="ml-2 text-sm text-gray-700">
                  Yeni üye bildirimi
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="yeniBasvuruBildirimi"
                  checked={bildirimAyarlari.yeniBasvuruBildirimi}
                  onChange={(e) => setBildirimAyarlari(prev => ({ ...prev, yeniBasvuruBildirimi: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="yeniBasvuruBildirimi" className="ml-2 text-sm text-gray-700">
                  Yeni başvuru bildirimi
                </label>
              </div>
            </div>
          </div>
        );

      case 'güvenlik':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">🔒 Güvenlik Ayarları</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ikiFaktorluDogrulama"
                  checked={guvenlikAyarlari.ikiFaktorluDogrulama}
                  onChange={(e) => setGuvenlikAyarlari(prev => ({ ...prev, ikiFaktorluDogrulama: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="ikiFaktorluDogrulama" className="ml-2 text-sm text-gray-700">
                  İki faktörlü doğrulama (2FA)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="otomatikCikis"
                  checked={guvenlikAyarlari.otomatikCikis}
                  onChange={(e) => setGuvenlikAyarlari(prev => ({ ...prev, otomatikCikis: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="otomatikCikis" className="ml-2 text-sm text-gray-700">
                  Otomatik çıkış
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="veriSifreleme"
                  checked={guvenlikAyarlari.veriSifreleme}
                  onChange={(e) => setGuvenlikAyarlari(prev => ({ ...prev, veriSifreleme: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="veriSifreleme" className="ml-2 text-sm text-gray-700">
                  Veri şifreleme
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="auditLog"
                  checked={guvenlikAyarlari.auditLog}
                  onChange={(e) => setGuvenlikAyarlari(prev => ({ ...prev, auditLog: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="auditLog" className="ml-2 text-sm text-gray-700">
                  Denetim kayıtları
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oturum Süresi (Saat)
                </label>
                <input
                  type="number"
                  value={guvenlikAyarlari.oturumSuresi}
                  onChange={(e) => setGuvenlikAyarlari(prev => ({ ...prev, oturumSuresi: parseInt(e.target.value) }))}
                  min="1"
                  max="168"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maksimum Giriş Denemesi
                </label>
                <input
                  type="number"
                  value={guvenlikAyarlari.maksimumGirisDenemesi}
                  onChange={(e) => setGuvenlikAyarlari(prev => ({ ...prev, maksimumGirisDenemesi: parseInt(e.target.value) }))}
                  min="3"
                  max="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      case 'entegrasyon':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">🔗 Entegrasyon Ayarları</h3>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-blue-800 mb-2">📧 SMTP Ayarları</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={entegrasyonAyarlari.smtpHost}
                    onChange={(e) => setEntegrasyonAyarlari(prev => ({ ...prev, smtpHost: e.target.value }))}
                    placeholder="smtp.gmail.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={entegrasyonAyarlari.smtpPort}
                    onChange={(e) => setEntegrasyonAyarlari(prev => ({ ...prev, smtpPort: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Kullanıcı
                  </label>
                  <input
                    type="email"
                    value={entegrasyonAyarlari.smtpUser}
                    onChange={(e) => setEntegrasyonAyarlari(prev => ({ ...prev, smtpUser: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Şifre
                  </label>
                  <input
                    type="password"
                    value={entegrasyonAyarlari.smtpPassword}
                    onChange={(e) => setEntegrasyonAyarlari(prev => ({ ...prev, smtpPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">📱 WhatsApp Ayarları</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp API Key
                  </label>
                  <input
                    type="password"
                    value={entegrasyonAyarlari.whatsappApiKey}
                    onChange={(e) => setEntegrasyonAyarlari(prev => ({ ...prev, whatsappApiKey: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Telefon Numarası
                  </label>
                  <input
                    type="tel"
                    value={entegrasyonAyarlari.whatsappPhoneNumber}
                    onChange={(e) => setEntegrasyonAyarlari(prev => ({ ...prev, whatsappPhoneNumber: e.target.value }))}
                    placeholder="905551234567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 'yedekleme':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">💾 Yedekleme Ayarları</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="otomatikYedekleme"
                  checked={yedeklemeAyarlari.otomatikYedekleme}
                  onChange={(e) => setYedeklemeAyarlari(prev => ({ ...prev, otomatikYedekleme: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="otomatikYedekleme" className="ml-2 text-sm text-gray-700">
                  Otomatik yedekleme
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="bulutYedekleme"
                  checked={yedeklemeAyarlari.bulutYedekleme}
                  onChange={(e) => setYedeklemeAyarlari(prev => ({ ...prev, bulutYedekleme: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="bulutYedekleme" className="ml-2 text-sm text-gray-700">
                  Bulut yedekleme
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sifreliYedekleme"
                  checked={yedeklemeAyarlari.sifreliYedekleme}
                  onChange={(e) => setYedeklemeAyarlari(prev => ({ ...prev, sifreliYedekleme: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="sifreliYedekleme" className="ml-2 text-sm text-gray-700">
                  Şifreli yedekleme
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yedekleme Sıklığı
                </label>
                <select
                  value={yedeklemeAyarlari.yedeklemeSikligi}
                  onChange={(e) => setYedeklemeAyarlari(prev => ({ ...prev, yedeklemeSikligi: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="daily">Günlük</option>
                  <option value="weekly">Haftalık</option>
                  <option value="monthly">Aylık</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yedekleme Zamanı
                </label>
                <input
                  type="time"
                  value={yedeklemeAyarlari.yedeklemeZamani}
                  onChange={(e) => setYedeklemeAyarlari(prev => ({ ...prev, yedeklemeZamani: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-gray-600" />
              <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
            </div>
            <button
              onClick={saveAyarlar}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Kaydediliyor...' : saved ? 'Kaydedildi!' : 'Kaydet'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'genel', label: 'Genel', icon: Building },
              { id: 'görünüm', label: 'Görünüm', icon: Palette },
              { id: 'bildirimler', label: 'Bildirimler', icon: Bell },
              { id: 'güvenlik', label: 'Güvenlik', icon: Shield },
              { id: 'entegrasyon', label: 'Entegrasyon', icon: Globe },
              { id: 'yedekleme', label: 'Yedekleme', icon: Database }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Ayarlar;
