# 🎨 KAFKASDER Yönetim Paneli - Özelleştirme Kılavuzu

## 🎯 **Genel Bakış**

Bu kılavuz, KAFKASDER Yönetim Paneli'ni kurumunuza özel olarak nasıl özelleştireceğinizi adım adım açıklar.

## 🏢 **Kurum Bilgileri Özelleştirme**

### 1️⃣ **Temel Bilgiler**
1. **Sistem Ayarları** → **Genel** sekmesine gidin
2. **Dernek Adı**: KAFKASDER (değiştirilebilir)
3. **Logo URL**: Kurum logonuzun URL'sini girin
4. **Adres**: Kurum adresinizi girin
5. **İletişim Bilgileri**: Telefon ve e-posta adreslerinizi girin

### 2️⃣ **Vergi Bilgileri**
- **Vergi Dairesi**: Kurumunuzun bağlı olduğu vergi dairesi
- **Vergi Numarası**: Kurum vergi numaranız

### 3️⃣ **Sistem Ayarları**
- **Varsayılan Para Birimi**: TRY, USD, EUR
- **Tarih Formatı**: GG/AA/YYYY, AA/GG/YYYY, YYYY-AA-GG
- **Dil**: Türkçe, İngilizce, Arapça

## 🎨 **Görünüm Özelleştirme**

### 1️⃣ **Tema Seçimi**
- **Açık Tema**: Beyaz arka plan, koyu yazılar
- **Koyu Tema**: Koyu arka plan, açık yazılar
- **Otomatik**: Sistem ayarlarına göre otomatik değişim

### 2️⃣ **Renk Özelleştirme**
- **Ana Renk**: Kurumunuzun kurumsal rengi
- **İkincil Renk**: Tamamlayıcı renk
- **Renk Paleti**: Önceden tanımlanmış renk şemaları

### 3️⃣ **Font ve Boyut**
- **Font Boyutu**: Küçük, Orta, Büyük
- **Dashboard Düzeni**: Izgara veya Liste görünümü
- **Sidebar Genişliği**: Kompakt, Normal, Geniş

### 4️⃣ **Görsel Efektler**
- **Animasyonlar**: Açık/Kapalı
- **Yuvarlak Köşeler**: Açık/Kapalı
- **Gölge Efektleri**: Açık/Kapalı

## 🔔 **Bildirim Ayarları**

### 1️⃣ **Bildirim Kanalları**
- **E-posta Bildirimleri**: Açık/Kapalı
- **SMS Bildirimleri**: Açık/Kapalı
- **Push Bildirimleri**: Açık/Kapalı

### 2️⃣ **Bildirim Türleri**
- **Yeni Bağış Bildirimi**: Açık/Kapalı
- **Yeni Üye Bildirimi**: Açık/Kapalı
- **Yeni Başvuru Bildirimi**: Açık/Kapalı
- **Günlük Özet**: Açık/Kapalı
- **Haftalık Rapor**: Açık/Kapalı
- **Aylık Rapor**: Açık/Kapalı

### 3️⃣ **Bildirim Zamanı**
- **Bildirim Saati**: Günlük bildirimlerin gönderilme saati

## 🔒 **Güvenlik Ayarları**

### 1️⃣ **Kimlik Doğrulama**
- **İki Faktörlü Doğrulama (2FA)**: Açık/Kapalı
- **Oturum Süresi**: 1-168 saat arası
- **Maksimum Giriş Denemesi**: 3-10 arası
- **Otomatik Çıkış**: Açık/Kapalı

### 2️⃣ **Veri Güvenliği**
- **Veri Şifreleme**: Açık/Kapalı
- **Denetim Kayıtları**: Açık/Kapalı
- **IP Kısıtlaması**: Açık/Kapalı
- **İzinli IP Adresleri**: Belirli IP'lerden erişim

### 3️⃣ **Şifre Politikası**
- **Şifre Karmaşıklığı**: Düşük, Orta, Yüksek
- **Şifre Değiştirme Zorunluluğu**: Açık/Kapalı
- **Şifre Geçerlilik Süresi**: Gün cinsinden

## 🔗 **Entegrasyon Ayarları**

### 1️⃣ **E-posta (SMTP) Ayarları**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP Kullanıcı: your-email@gmail.com
SMTP Şifre: your-app-password
```

**Gmail için App Password oluşturma:**
1. Google Hesabı → Güvenlik
2. 2 Adımlı Doğrulama → Uygulama Şifreleri
3. "Diğer" seçin ve şifre oluşturun

### 2️⃣ **WhatsApp Entegrasyonu**
- **WhatsApp API Key**: Meta Developer Console'dan alın
- **WhatsApp Telefon Numarası**: 905551234567 formatında

**WhatsApp Business API Kurulumu:**
1. Meta Developer Console'a gidin
2. WhatsApp Business API uygulaması oluşturun
3. API anahtarınızı alın
4. Telefon numaranızı doğrulayın

### 3️⃣ **Analytics Entegrasyonu**
- **Google Analytics ID**: GA4 ölçüm kimliği
- **Facebook Pixel ID**: Facebook reklam takibi

### 4️⃣ **Güvenlik Entegrasyonu**
- **reCAPTCHA Site Key**: Google reCAPTCHA
- **reCAPTCHA Secret Key**: Sunucu tarafı doğrulama

## 💾 **Yedekleme Ayarları**

### 1️⃣ **Otomatik Yedekleme**
- **Otomatik Yedekleme**: Açık/Kapalı
- **Yedekleme Sıklığı**: Günlük, Haftalık, Aylık
- **Yedekleme Zamanı**: Saat seçimi
- **Yedekleme Saklama Süresi**: Gün cinsinden

### 2️⃣ **Bulut Yedekleme**
- **Bulut Yedekleme**: Açık/Kapalı
- **Bulut Sağlayıcı**: Google Drive, Dropbox, OneDrive
- **Bulut API Key**: Seçilen sağlayıcının API anahtarı

### 3️⃣ **Yedekleme Güvenliği**
- **Veri Sıkıştırma**: Açık/Kapalı
- **Şifreli Yedekleme**: Açık/Kapalı

## 📊 **Dashboard Özelleştirme**

### 1️⃣ **Widget Yönetimi**
- **Bağış İstatistikleri**: Açık/Kapalı
- **Üye Sayısı**: Açık/Kapalı
- **Proje Durumu**: Açık/Kapalı
- **Etkinlik Takvimi**: Açık/Kapalı
- **Son Aktiviteler**: Açık/Kapalı

### 2️⃣ **Grafik Türleri**
- **Çizgi Grafik**: Trend analizi
- **Pasta Grafik**: Kategori dağılımı
- **Sütun Grafik**: Karşılaştırmalı veriler
- **Hedef Grafik**: Performans takibi

### 3️⃣ **Zaman Aralığı**
- **Günlük**: Son 24 saat
- **Haftalık**: Son 7 gün
- **Aylık**: Son 30 gün
- **Yıllık**: Son 12 ay

## 👥 **Kullanıcı Rolleri ve Yetkileri**

### 1️⃣ **Rol Tanımlama**
- **Yönetici**: Tam yetki
- **Editör**: Veri girişi ve düzenleme
- **Muhasebe**: Finansal modüller
- **Gönüllü**: Sınırlı erişim

### 2️⃣ **Modül Yetkileri**
- **Kişi Yönetimi**: Görüntüleme, Ekleme, Düzenleme, Silme
- **Bağış Yönetimi**: Görüntüleme, Ekleme, Düzenleme, Silme
- **Proje Yönetimi**: Görüntüleme, Ekleme, Düzenleme, Silme
- **Raporlama**: Görüntüleme, İndirme, Paylaşma

### 3️⃣ **Veri Erişimi**
- **Tüm Veriler**: Tam erişim
- **Departman Verileri**: Sadece kendi departmanı
- **Kendi Verileri**: Sadece kendi oluşturduğu veriler

## 📋 **Rapor Özelleştirme**

### 1️⃣ **Standart Raporlar**
- **Bağış Raporu**: Özelleştirilebilir
- **Üye Raporu**: Özelleştirilebilir
- **Proje Raporu**: Özelleştirilebilir
- **Finansal Rapor**: Özelleştirilebilir

### 2️⃣ **Özel Raporlar**
- **Alan Seçimi**: Hangi alanların görüneceği
- **Filtreleme**: Hangi kriterlere göre filtreleneceği
- **Sıralama**: Hangi alana göre sıralanacağı
- **Gruplama**: Hangi alana göre gruplanacağı

### 3️⃣ **Rapor Formatları**
- **PDF**: Yazdırma için
- **Excel**: Veri analizi için
- **CSV**: Veri aktarımı için

## 🎯 **İş Akışı Özelleştirme**

### 1️⃣ **Onay Süreçleri**
- **Bağış Onayı**: Otomatik/Manuel
- **Yardım Başvurusu Onayı**: Otomatik/Manuel
- **Proje Onayı**: Otomatik/Manuel
- **Harcama Onayı**: Otomatik/Manuel

### 2️⃣ **Otomatik İşlemler**
- **Bağış Makbuzu**: Otomatik oluşturma
- **Hatırlatma E-postaları**: Otomatik gönderim
- **Rapor Zamanlaması**: Otomatik rapor gönderimi
- **Yedekleme**: Otomatik yedekleme

### 3️⃣ **Bildirim Kuralları**
- **E-posta Şablonları**: Özelleştirilebilir
- **SMS Şablonları**: Özelleştirilebilir
- **Push Bildirimleri**: Özelleştirilebilir

## 🔧 **Gelişmiş Özelleştirme**

### 1️⃣ **API Entegrasyonu**
- **Webhook URL'leri**: Dış sistemlere veri gönderimi
- **API Anahtarları**: Dış sistemlerden veri alma
- **Veri Senkronizasyonu**: Otomatik veri güncelleme

### 2️⃣ **Özel Alanlar**
- **Kişi Özel Alanları**: Ek bilgi alanları
- **Bağış Özel Alanları**: Ek bağış bilgileri
- **Proje Özel Alanları**: Ek proje detayları

### 3️⃣ **Özel Kategoriler**
- **Kişi Kategorileri**: Özel kişi türleri
- **Bağış Kategorileri**: Özel bağış türleri
- **Proje Kategorileri**: Özel proje türleri

## 📱 **Mobil Özelleştirme**

### 1️⃣ **PWA Ayarları**
- **Uygulama Adı**: Mobil cihazlarda görünecek ad
- **Uygulama İkonu**: Mobil cihazlarda görünecek ikon
- **Splash Screen**: Açılış ekranı
- **Tema Rengi**: Mobil tema rengi

### 2️⃣ **Mobil Optimizasyon**
- **Responsive Tasarım**: Tüm ekran boyutlarına uyum
- **Touch-Friendly**: Dokunmatik ekran optimizasyonu
- **Offline Çalışma**: İnternet olmadan da kullanım
- **Push Bildirimler**: Mobil bildirimler

## 🆘 **Sorun Giderme**

### ❌ **Yaygın Sorunlar**

#### "Ayarlar kaydedilmiyor"
- **Çözüm**: Tarayıcı önbelleğini temizleyin
- **Kontrol**: İnternet bağlantınızı kontrol edin

#### "E-posta gönderilmiyor"
- **Çözüm**: SMTP ayarlarını kontrol edin
- **Kontrol**: Gmail App Password kullandığınızdan emin olun

#### "WhatsApp mesajları gönderilmiyor"
- **Çözüm**: WhatsApp API ayarlarını kontrol edin
- **Kontrol**: Telefon numarasının doğrulandığından emin olun

#### "Yedekleme çalışmıyor"
- **Çözüm**: Yedekleme ayarlarını kontrol edin
- **Kontrol**: Disk alanının yeterli olduğundan emin olun

### 📞 **Destek**

Özelleştirme sorunlarınız için:
1. **Sorun Detayını** not edin
2. **Ekran Görüntüsü** alın
3. **Ayarlar Dosyasını** yedekleyin
4. **Teknik Ekiple** iletişime geçin: tech@kafkasder.org

## 📋 **Özelleştirme Kontrol Listesi**

### ✅ **Temel Özelleştirme**
- [ ] Kurum bilgileri güncellendi
- [ ] Logo yüklendi
- [ ] İletişim bilgileri eklendi
- [ ] Para birimi ayarlandı
- [ ] Tarih formatı seçildi

### ✅ **Görünüm Özelleştirme**
- [ ] Tema seçildi
- [ ] Renkler ayarlandı
- [ ] Font boyutu belirlendi
- [ ] Dashboard düzeni seçildi
- [ ] Görsel efektler ayarlandı

### ✅ **Bildirim Ayarları**
- [ ] Bildirim kanalları seçildi
- [ ] Bildirim türleri belirlendi
- [ ] Bildirim zamanı ayarlandı
- [ ] E-posta şablonları özelleştirildi

### ✅ **Güvenlik Ayarları**
- [ ] İki faktörlü doğrulama ayarlandı
- [ ] Oturum süresi belirlendi
- [ ] Şifre politikası ayarlandı
- [ ] Veri şifreleme etkinleştirildi

### ✅ **Entegrasyon Ayarları**
- [ ] SMTP ayarları yapılandırıldı
- [ ] WhatsApp entegrasyonu kuruldu
- [ ] Analytics entegrasyonu eklendi
- [ ] Güvenlik entegrasyonu yapılandırıldı

### ✅ **Yedekleme Ayarları**
- [ ] Otomatik yedekleme ayarlandı
- [ ] Yedekleme sıklığı belirlendi
- [ ] Bulut yedekleme yapılandırıldı
- [ ] Yedekleme güvenliği sağlandı

---

**📞 Teknik Destek**: tech@kafkasder.org  
**📚 Detaylı Dokümantasyon**: [docs.kafkasder.org](https://docs.kafkasder.org) 