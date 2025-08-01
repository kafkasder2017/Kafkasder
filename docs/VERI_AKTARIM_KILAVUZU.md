# 📊 Veri Aktarım Kılavuzu

## 🎯 **Genel Bakış**

Bu kılavuz, mevcut verilerinizi KAFKASDER Yönetim Paneli'ne nasıl aktaracağınızı adım adım açıklar.

## 📋 **Hazırlık Aşaması**

### 1️⃣ **Veri Analizi**
- Mevcut veri formatınızı belirleyin (Excel, CSV, Access, vb.)
- Veri kalitesini kontrol edin (eksik, hatalı, tekrarlanan kayıtlar)
- Veri yapısını analiz edin (alan adları, veri tipleri)

### 2️⃣ **Veri Temizleme**
- Tekrarlanan kayıtları kaldırın
- Eksik verileri tamamlayın
- Format tutarlılığını sağlayın (telefon, tarih, para birimi)

### 3️⃣ **Yedekleme**
- Mevcut verilerinizin yedeğini alın
- Test ortamında önce deneme yapın

## 📁 **Desteklenen Veri Türleri**

### 👥 **Kişi Verileri**
- **Dosya Formatı**: CSV
- **Gerekli Alanlar**: ad, soyad
- **Opsiyonel Alanlar**: tc_kimlik, telefon, email, adres, kategori, dogum_tarihi

**Örnek CSV:**
```csv
ad,soyad,tc_kimlik,telefon,email,adres,kategori,dogum_tarihi
Ahmet,Yılmaz,12345678901,05551234567,ahmet@example.com,İstanbul,Üye,1990-01-01
Ayşe,Kaya,98765432109,05559876543,ayse@example.com,Ankara,Bağışçı,1985-05-15
```

### 💰 **Bağış Verileri**
- **Dosya Formatı**: CSV
- **Gerekli Alanlar**: bagisci_ad, tutar
- **Opsiyonel Alanlar**: bagisci_soyad, para_birimi, bagis_turu, tarih, aciklama

**Örnek CSV:**
```csv
bagisci_ad,bagisci_soyad,tutar,para_birimi,bagis_turu,tarih,aciklama
Mehmet,Demir,1000,TRY,Nakit,2024-01-15,Aylık bağış
Fatma,Şahin,500,TRY,Kart,2024-01-16,Online bağış
```

### 📊 **Proje Verileri**
- **Dosya Formatı**: CSV
- **Gerekli Alanlar**: proje_adi
- **Opsiyonel Alanlar**: sorumlu, baslangic_tarihi, bitis_tarihi, butce, durum, aciklama

**Örnek CSV:**
```csv
proje_adi,sorumlu,baslangic_tarihi,bitis_tarihi,butce,durum,aciklama
Eğitim Desteği,Ayşe Kaya,2024-01-01,2024-12-31,50000,Devam Ediyor,Öğrenci burs projesi
Sağlık Kampanyası,Ali Veli,2024-02-01,2024-06-30,25000,Planlama,Genel sağlık taraması
```

### 📅 **Etkinlik Verileri**
- **Dosya Formatı**: CSV
- **Gerekli Alanlar**: etkinlik_adi, tarih
- **Opsiyonel Alanlar**: saat, konum, sorumlu, durum, aciklama

**Örnek CSV:**
```csv
etkinlik_adi,tarih,saat,konum,sorumlu,durum,aciklama
Yıllık Genel Kurul,2024-03-15,14:00,KAFKASDER Merkez,Ali Veli,Planlandı,2024 yılı genel kurul toplantısı
Ramazan İftarı,2024-04-10,19:00,Kültür Merkezi,Fatma Şahin,Planlandı,Ramazan iftar organizasyonu
```

## 🔄 **Veri Aktarım Süreci**

### 1️⃣ **Şablon İndirme**
1. Panel'e giriş yapın
2. "Toplu Veri Aktarımı" sayfasına gidin
3. Aktarım yapacağınız veri türünü seçin
4. "Şablon İndir (CSV)" butonuna tıklayın

### 2️⃣ **Veri Hazırlama**
1. İndirilen şablonu açın
2. Verilerinizi şablona uygun formatta girin
3. Veri kalitesini kontrol edin
4. Dosyayı CSV formatında kaydedin

### 3️⃣ **Veri Yükleme**
1. Hazırladığınız CSV dosyasını seçin
2. Veri önizlemesini kontrol edin
3. "Verileri İçe Aktar" butonuna tıklayın
4. Sonuçları inceleyin

### 4️⃣ **Doğrulama**
1. Aktarılan verileri kontrol edin
2. Hataları düzeltin
3. Eksik verileri tamamlayın

## ⚠️ **Önemli Notlar**

### 📝 **Veri Formatı Kuralları**
- **Tarih Formatı**: YYYY-MM-DD (2024-01-15)
- **Telefon Formatı**: 05551234567 (başında 0 olmadan)
- **TC Kimlik**: 11 haneli, sadece rakam
- **Para Birimi**: TRY, USD, EUR
- **Kategori**: Üye, Bağışçı, Yardım Alan

### 🔍 **Veri Doğrulama**
- Zorunlu alanların dolu olduğundan emin olun
- TC kimlik numaralarının 11 haneli olduğunu kontrol edin
- Telefon numaralarının doğru formatta olduğunu kontrol edin
- E-posta adreslerinin geçerli olduğunu kontrol edin

### 🚨 **Hata Durumları**
- **Eksik Zorunlu Alan**: Kayıt atlanır, hata raporlanır
- **Geçersiz Format**: Kayıt atlanır, uyarı raporlanır
- **Tekrarlanan Kayıt**: İlk kayıt kabul edilir, diğerleri atlanır

## 📊 **Aktarım Sonrası Kontroller**

### ✅ **Başarılı Aktarım Kontrolü**
1. **Kişi Sayısı**: Toplam kişi sayısını kontrol edin
2. **Bağış Toplamı**: Bağış tutarlarının doğru olduğunu kontrol edin
3. **Proje Durumu**: Projelerin doğru durumda olduğunu kontrol edin
4. **Etkinlik Tarihleri**: Etkinlik tarihlerinin doğru olduğunu kontrol edin

### 🔧 **Düzeltme İşlemleri**
1. **Hatalı Kayıtlar**: Hata raporundaki kayıtları düzeltin
2. **Eksik Veriler**: Eksik alanları manuel olarak tamamlayın
3. **Tekrarlanan Kayıtlar**: Tekrarlanan kayıtları birleştirin veya silin

## 📈 **Performans İpuçları**

### ⚡ **Hızlı Aktarım**
- **Dosya Boyutu**: 10,000 kayıttan fazla için dosyayı bölün
- **Ağ Bağlantısı**: Stabil internet bağlantısı kullanın
- **Tarayıcı**: Chrome veya Firefox kullanın
- **Zaman**: Yoğun saatlerde aktarım yapmayın

### 🎯 **Veri Kalitesi**
- **Ön Kontrol**: Aktarım öncesi veri kalitesini kontrol edin
- **Test Aktarımı**: Önce küçük bir veri seti ile test edin
- **Yedekleme**: Her aktarım öncesi yedek alın

## 🆘 **Sorun Giderme**

### ❌ **Yaygın Hatalar**

#### "Dosya formatı desteklenmiyor"
- **Çözüm**: Dosyayı CSV formatında kaydedin
- **Kontrol**: Dosya uzantısının .csv olduğundan emin olun

#### "Zorunlu alan eksik"
- **Çözüm**: Şablondaki zorunlu alanları doldurun
- **Kontrol**: Ad ve soyad alanlarının dolu olduğunu kontrol edin

#### "Geçersiz tarih formatı"
- **Çözüm**: Tarihleri YYYY-MM-DD formatında girin
- **Kontrol**: Excel'de tarih formatını kontrol edin

#### "TC kimlik numarası geçersiz"
- **Çözüm**: TC kimlik numaralarının 11 haneli olduğunu kontrol edin
- **Kontrol**: Başında 0 olmadığından emin olun

### 📞 **Destek**

Sorun yaşadığınızda:
1. **Hata Mesajını** not edin
2. **Ekran Görüntüsü** alın
3. **Veri Örneği** hazırlayın
4. **Teknik Ekiple** iletişime geçin: tech@kafkasder.org

## 📋 **Kontrol Listesi**

### ✅ **Aktarım Öncesi**
- [ ] Veri yedeği alındı
- [ ] Veri kalitesi kontrol edildi
- [ ] Şablon indirildi
- [ ] Veriler şablona uygun formatta hazırlandı
- [ ] Test aktarımı yapıldı

### ✅ **Aktarım Sırasında**
- [ ] Doğru veri türü seçildi
- [ ] CSV dosyası yüklendi
- [ ] Veri önizlemesi kontrol edildi
- [ ] Aktarım başlatıldı
- [ ] Sonuçlar incelendi

### ✅ **Aktarım Sonrası**
- [ ] Başarılı kayıt sayısı kontrol edildi
- [ ] Hata raporu incelendi
- [ ] Eksik veriler tamamlandı
- [ ] Veriler doğrulandı
- [ ] Yedekleme yapıldı

---

**📞 Teknik Destek**: tech@kafkasder.org  
**📚 Detaylı Dokümantasyon**: [docs.kafkasder.org](https://docs.kafkasder.org) 