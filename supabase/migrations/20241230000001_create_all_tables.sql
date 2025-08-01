-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create ENUM types
CREATE TYPE person_status AS ENUM ('Aktif', 'Pasif', 'Beklemede');
CREATE TYPE kimlik_turu AS ENUM ('T.C. Kimlik No', 'Pasaport', 'Yabancı Kimlik No');
CREATE TYPE uyruk AS ENUM ('T.C.', 'Suriye', 'Çeçenistan', 'Afganistan', 'Diğer');
CREATE TYPE yardim_turu_detay AS ENUM ('Nakit', 'Kart (LCW, Gıda vb.)', 'Yardım Kolisi', 'Fatura Ödemesi');
CREATE TYPE sponsorluk_tipi AS ENUM ('Bireysel', 'Kurumsal', 'Proje Bazlı', 'Yok');
CREATE TYPE dosya_baglantisi AS ENUM ('Partner Kurum', 'Bağımsız', 'Dernek Merkezi');
CREATE TYPE riza_beyani_status AS ENUM ('Alındı', 'Alınmadı', 'Beklemede');
CREATE TYPE dokuman_tipi AS ENUM ('Kimlik Fotokopisi', 'Pasaport', 'İkametgah Belgesi', 'Sağlık Raporu', 'Dilekçe', 'Başvuru Formu', 'Rıza Beyanı', 'Diğer');
CREATE TYPE yakinlik_turu AS ENUM ('Eşi', 'Oğlu', 'Kızı', 'Annesi', 'Babası', 'Kardeşi', 'Diğer');
CREATE TYPE medeni_durum AS ENUM ('Bekar', 'Evli', 'Dul', 'Boşanmış');
CREATE TYPE egitim_durumu AS ENUM ('Okur Yazar Değil', 'İlkokul', 'Ortaokul', 'Lise', 'Üniversite', 'Yüksek Lisans/Doktora');
CREATE TYPE is_durumu AS ENUM ('Çalışıyor', 'İşsiz', 'Öğrenci', 'Emekli', 'Ev Hanımı');
CREATE TYPE yasadigi_yer AS ENUM ('Kira', 'Kendine Ait', 'Akraba Yanı', 'Diğer');
CREATE TYPE gelir_kaynagi AS ENUM ('Maaş', 'Devlet Yardımı', 'Zekat', 'Tarımsal', 'Diğer');
CREATE TYPE kan_grubu AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-');
CREATE TYPE hastalik AS ENUM ('Kronik Hastalık', 'Kalp Rahatsızlığı', 'Tansiyon', 'Diyabet', 'Astım', 'Diğer');
CREATE TYPE personel_etiket AS ENUM ('Düzenli Yardım Yapılabilir', 'Gelecek Başvuruları Reddedilmeli', 'Olumsuz', 'Sahte Evrak/Yalan Beyan');
CREATE TYPE ozel_durum AS ENUM ('Depremzede');
CREATE TYPE membership_type AS ENUM ('Standart', 'Gönüllü', 'Onursal');
CREATE TYPE aidat_durumu AS ENUM ('Ödendi', 'Beklemede');
CREATE TYPE kurum_turu AS ENUM ('Resmi Kurum', 'Sivil Toplum Kuruluşu', 'Özel Sektor', 'Diğer');
CREATE TYPE bagis_turu AS ENUM ('Nakit', 'Ayni', 'Hizmet');
CREATE TYPE bagis_durumu AS ENUM ('Alındı', 'Beklemede', 'İptal');
CREATE TYPE depo_urun_birimi AS ENUM ('Adet', 'Kg', 'Litre', 'Paket', 'Kutu');
CREATE TYPE dava_turu AS ENUM ('Hukuki', 'Ceza', 'İdari');
CREATE TYPE dava_durumu AS ENUM ('Açıldı', 'Devam Ediyor', 'Kazanıldı', 'Kaybedildi', 'Uzlaşma');
CREATE TYPE proje_status AS ENUM ('Planlama', 'Devam Ediyor', 'Tamamlandı', 'İptal Edildi');
CREATE TYPE gorev_status AS ENUM ('Yapılacak', 'Yapılıyor', 'Tamamlandı');
CREATE TYPE gorev_oncelik AS ENUM ('Düşük', 'Normal', 'Yüksek');
CREATE TYPE yardim_turu AS ENUM ('Eğitim Yardımı', 'Sağlık Yardımı', 'Acil Yardım', 'Diğer');
CREATE TYPE basvuru_status AS ENUM ('Bekleyen', 'İncelenen', 'Onaylanan', 'Reddedilen', 'Tamamlanan', 'Başkan Reddetti');
CREATE TYPE basvuru_oncelik AS ENUM ('Düşük', 'Orta', 'Yüksek');
CREATE TYPE odeme_turu AS ENUM ('Bağış Girişi', 'Yardım Ödemesi', 'Burs Ödemesi', 'Yetim Desteği', 'Vefa Desteği', 'Gider Ödemesi');
CREATE TYPE odeme_durumu AS ENUM ('Bekleyen', 'Tamamlanan', 'İptal');
CREATE TYPE odeme_yontemi AS ENUM ('Nakit', 'Banka Transferi', 'Kredi Kartı');
CREATE TYPE hizmet_turu AS ENUM ('Danışmanlık', 'Eğitim', 'Sağlık Taraması', 'Psikolojik Destek', 'Hukuki Destek', 'Tercümanlık', 'Diğer');
CREATE TYPE hizmet_durumu AS ENUM ('Planlandı', 'Tamamlandı', 'İptal Edildi');
CREATE TYPE sevk_durumu AS ENUM ('Planlandı', 'Randevu Alındı', 'Gidildi', 'İptal Edildi');
CREATE TYPE burs_turu AS ENUM ('Lisans', 'Yüksek Lisans', 'Doktora', 'Özel');
CREATE TYPE burs_durumu AS ENUM ('Aktif', 'Tamamlandı', 'İptal Edildi');
CREATE TYPE egitim_seviyesi AS ENUM ('Okul Öncesi', 'İlkokul', 'Ortaokul', 'Lise', 'Mezun');
CREATE TYPE destek_durumu AS ENUM ('Destek Alıyor', 'Destek Almıyor');
CREATE TYPE vefa_destek_turu AS ENUM ('Evde Temizlik', 'Alışveriş Desteği', 'Sosyal Aktivite', 'Teknik Destek', 'Diğer');
CREATE TYPE vefa_destek_durumu AS ENUM ('Aktif', 'Pasif');
CREATE TYPE finansal_islem_turu AS ENUM ('Gelir', 'Gider');
CREATE TYPE hesap_kategorisi AS ENUM ('Bağış', 'Üye Aidatı', 'Kira Gideri', 'Fatura Ödemesi', 'Ofis Gideri', 'Proje Gideri', 'Diğer Gelir', 'Diğer Gider');
CREATE TYPE kullanici_rol AS ENUM ('Yönetici', 'Editör', 'Muhasebe', 'Gönüllü');
CREATE TYPE kullanici_durum AS ENUM ('Aktif', 'Pasif');
CREATE TYPE beceri AS ENUM ('Organizasyon', 'Eğitim Verme', 'Saha Çalışması', 'İletişim ve Halkla İlişiler', 'Teknik Destek', 'İlk Yardım', 'Yabancı Dil');
CREATE TYPE gonullu_durum AS ENUM ('Aktif', 'Pasif');
CREATE TYPE etkinlik_status AS ENUM ('Planlama', 'Yayında', 'Tamamlandı', 'İptal Edildi');
CREATE TYPE bildirim_turu AS ENUM ('Sistem', 'Kullanıcı', 'Toplu Duyuru');
CREATE TYPE bildirim_durumu AS ENUM ('Okunmadı', 'Okundu');
CREATE TYPE webhook_event AS ENUM ('Yeni Bağış', 'Yeni Üye', 'Yeni Başvuru');
CREATE TYPE gonderim_turu AS ENUM ('SMS', 'E-posta');
CREATE TYPE hedef_kitle AS ENUM ('Tüm Kişiler', 'Tüm Üyeler', 'Tüm Gönüllüler', 'Tüm Yardım Alanlar');
CREATE TYPE log_action AS ENUM ('Oluşturma', 'Güncelleme', 'Silme', 'Giriş', 'Çıkış', 'Onaylama', 'Reddetme', 'Ödeme Oluşturma', 'Akıllı Arama');
CREATE TYPE log_entity_type AS ENUM ('Kişi', 'Yardım Başvurusu', 'Proje', 'Bağış', 'Kullanıcı', 'Vefa Destek', 'Yetim', 'Burs', 'Sistem', 'Yorum');
CREATE TYPE sentiment AS ENUM ('Pozitif', 'Nötr', 'Negatif', 'Acil');
CREATE TYPE calendar_event_type AS ENUM ('Etkinlik', 'Görev', 'Duruşma');

-- Create main tables
CREATE TABLE kullanicilar (
    id SERIAL PRIMARY KEY,
    kullanici_adi VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    sifre_hash VARCHAR(255),
    rol kullanici_rol NOT NULL DEFAULT 'Gönüllü',
    durum kullanici_durum NOT NULL DEFAULT 'Aktif',
    son_giris TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE sistem_ayarlari (
    id SERIAL PRIMARY KEY,
    dernek_adi VARCHAR(255) NOT NULL,
    dernek_adresi TEXT,
    logo_url VARCHAR(500),
    smtp_host VARCHAR(255),
    smtp_port INTEGER,
    smtp_user VARCHAR(255),
    varsayilan_para_birimi VARCHAR(3) DEFAULT 'TRY',
    tarih_formati VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kurumlar (
    id SERIAL PRIMARY KEY,
    resmi_unvan VARCHAR(255) NOT NULL,
    kisa_ad VARCHAR(100),
    kurum_turu kurum_turu NOT NULL,
    vergi_dairesi VARCHAR(255),
    vergi_numarasi VARCHAR(50),
    telefon VARCHAR(20),
    email VARCHAR(255),
    adres TEXT,
    yetkili_kisi VARCHAR(255),
    notlar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kisiler (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(255) NOT NULL,
    soyad VARCHAR(255) NOT NULL,
    uyruk uyruk[] DEFAULT ARRAY['T.C.']::uyruk[],
    kimlik_turu kimlik_turu NOT NULL,
    kimlik_no VARCHAR(50) NOT NULL,
    dogum_tarihi DATE,
    cep_telefonu VARCHAR(20),
    sabit_telefon VARCHAR(20),
    yurtdisi_telefon VARCHAR(20),
    email VARCHAR(255),
    ulke VARCHAR(100) DEFAULT 'Türkiye',
    sehir VARCHAR(100),
    yerlesim VARCHAR(100),
    mahalle VARCHAR(100),
    adres TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    kategori VARCHAR(50),
    dosya_numarasi VARCHAR(100) UNIQUE,
    sponsorluk_tipi sponsorluk_tipi DEFAULT 'Yok',
    kayit_durumu VARCHAR(20) DEFAULT 'Taslak',
    riza_beyani riza_beyani_status DEFAULT 'Beklemede',
    baba_adi VARCHAR(255),
    ana_adi VARCHAR(255),
    gecerlilik_veren_kurum VARCHAR(255),
    seri_numarasi VARCHAR(100),
    pasaport_turu VARCHAR(100),
    pasaport_no VARCHAR(100),
    pasaport_gecerlilik_tarihi DATE,
    vize_baslangic_bitis VARCHAR(255),
    geri_donus_belgesi BOOLEAN DEFAULT FALSE,
    cinsiyet VARCHAR(10),
    dogum_yeri VARCHAR(100),
    medeni_durum medeni_durum,
    egitim egitim_durumu,
    is_durumu is_durumu,
    calistigi_sektor VARCHAR(255),
    meslek_grubu VARCHAR(255),
    meslek_aciklamasi TEXT,
    adli_sicil_kaydi BOOLEAN DEFAULT FALSE,
    yasadigi_yer yasadigi_yer,
    aylik_gelir DECIMAL(10, 2),
    aylik_gider DECIMAL(10, 2),
    sosyal_guvence BOOLEAN DEFAULT FALSE,
    gelir_kaynaklari gelir_kaynagi[],
    kan_grubu kan_grubu,
    sigara_kullanimi BOOLEAN DEFAULT FALSE,
    engellilik_durum BOOLEAN DEFAULT FALSE,
    engellilik_aciklama TEXT,
    kullanilan_protezler TEXT,
    tibbi_cihazlar TEXT,
    kullanilan_ilaclar TEXT,
    ameliyatlar TEXT,
    hastaliklar hastalik[],
    hastaliklar_aciklama TEXT,
    etiketler personel_etiket[],
    ozel_durumlar ozel_durum[],
    kayit_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    kaydi_acan_birim VARCHAR(255),
    kayit_eden VARCHAR(255),
    kayit_ip INET,
    aciklamalar JSONB,
    dosya_baglantisi dosya_baglantisi DEFAULT 'Dernek Merkezi',
    is_kaydi_sil BOOLEAN DEFAULT FALSE,
    durum person_status DEFAULT 'Aktif',
    membership_type membership_type,
    aldigi_yardim_turu yardim_turu_detay[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE banka_hesaplari (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kisi_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    iban VARCHAR(34) NOT NULL,
    hesap_adi VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE person_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kisi_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    ad VARCHAR(255) NOT NULL,
    tip dokuman_tipi NOT NULL,
    path VARCHAR(500) NOT NULL,
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE person_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kisi_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    aciklama TEXT,
    yuklenme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE dependents (
    id SERIAL PRIMARY KEY,
    kisi_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    dependent_kisi_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    relationship yakinlik_turu NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE acil_durum_kisileri (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kisi_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    ad VARCHAR(255) NOT NULL,
    yakinlik yakinlik_turu NOT NULL,
    telefon1 VARCHAR(20) NOT NULL,
    telefon2 VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE notlar (
    id SERIAL PRIMARY KEY,
    kisi_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    tarih TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    icerik TEXT NOT NULL,
    giren_kullanici VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE aidatlar (
    id SERIAL PRIMARY KEY,
    uye_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    donem VARCHAR(20) NOT NULL,
    tutar DECIMAL(10, 2) NOT NULL,
    odeme_tarihi DATE,
    durum aidat_durumu DEFAULT 'Beklemede',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bagislar (
    id SERIAL PRIMARY KEY,
    bagisci_id INTEGER REFERENCES kisiler(id),
    kurum_id INTEGER REFERENCES kurumlar(id),
    tutar DECIMAL(12, 2),
    para_birimi VARCHAR(3) DEFAULT 'TRY',
    bagis_turu bagis_turu NOT NULL,
    tarih DATE NOT NULL,
    aciklama TEXT,
    durum bagis_durumu DEFAULT 'Alındı',
    makbuz_no VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kumbaralar (
    id SERIAL PRIMARY KEY,
    konum VARCHAR(255) NOT NULL,
    sorumlu_kisi VARCHAR(255),
    son_toplama_tarihi DATE,
    toplam_tutar DECIMAL(10, 2) DEFAULT 0,
    notlar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE depo_urunleri (
    id SERIAL PRIMARY KEY,
    urun_adi VARCHAR(255) NOT NULL,
    kategori VARCHAR(100),
    mevcut_miktar DECIMAL(10, 2) DEFAULT 0,
    birim depo_urun_birimi NOT NULL,
    minimum_stok DECIMAL(10, 2) DEFAULT 0,
    son_giris_tarihi DATE,
    son_cikis_tarihi DATE,
    notlar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE davalar (
    id SERIAL PRIMARY KEY,
    dava_adi VARCHAR(255) NOT NULL,
    dava_turu dava_turu NOT NULL,
    mahkeme VARCHAR(255),
    dava_no VARCHAR(100),
    baslangic_tarihi DATE,
    durum dava_durumu DEFAULT 'Açıldı',
    avukat VARCHAR(255),
    aciklama TEXT,
    sonraki_durusma DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE projeler (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    manager VARCHAR(255),
    status proje_status DEFAULT 'Planlama',
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12, 2),
    spent DECIMAL(12, 2) DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gorevler (
    id SERIAL PRIMARY KEY,
    proje_id INTEGER REFERENCES projeler(id) ON DELETE CASCADE,
    baslik VARCHAR(255) NOT NULL,
    aciklama TEXT,
    sorumlu_id INTEGER REFERENCES kisiler(id),
    son_tarih DATE,
    oncelik gorev_oncelik DEFAULT 'Normal',
    durum gorev_status DEFAULT 'Yapılacak',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE yardim_basvurulari (
    id SERIAL PRIMARY KEY,
    basvuru_sahibi_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    basvuru_turu yardim_turu NOT NULL,
    talep_tutari DECIMAL(10, 2),
    oncelik basvuru_oncelik DEFAULT 'Orta',
    basvuru_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    durum basvuru_status DEFAULT 'Bekleyen',
    degerlendirme_notu TEXT,
    talep_detayi TEXT,
    ai_ozet TEXT,
    ai_oncelik basvuru_oncelik,
    odeme_id INTEGER,
    baskan_onayi BOOLEAN,
    baskan_onay_notu TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE odemeler (
    id SERIAL PRIMARY KEY,
    odeme_turu odeme_turu NOT NULL,
    kisi VARCHAR(255) NOT NULL,
    tutar DECIMAL(12, 2) NOT NULL,
    para_birimi VARCHAR(3) DEFAULT 'TRY',
    aciklama TEXT,
    odeme_yontemi odeme_yontemi NOT NULL,
    odeme_tarihi DATE NOT NULL,
    durum odeme_durumu DEFAULT 'Bekleyen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ayni_yardim_islemleri (
    id SERIAL PRIMARY KEY,
    kisi_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    urun_id INTEGER REFERENCES depo_urunleri(id),
    miktar DECIMAL(10, 2) NOT NULL,
    birim depo_urun_birimi NOT NULL,
    tarih DATE DEFAULT CURRENT_DATE,
    notlar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hizmetler (
    id SERIAL PRIMARY KEY,
    kisi_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    hizmet_turu hizmet_turu NOT NULL,
    hizmet_veren VARCHAR(255),
    tarih DATE NOT NULL,
    aciklama TEXT,
    durum hizmet_durumu DEFAULT 'Planlandı',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hastane_sevkleri (
    id SERIAL PRIMARY KEY,
    kisi_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    hastane_adi VARCHAR(255) NOT NULL,
    bolum VARCHAR(255),
    doktor_adi VARCHAR(255),
    sevk_tarihi DATE NOT NULL,
    randevu_tarihi DATE,
    sevk_nedeni TEXT,
    durum sevk_durumu DEFAULT 'Planlandı',
    sonuc TEXT,
    maliyet DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE ogrenci_burslari (
    id SERIAL PRIMARY KEY,
    ogrenci_adi VARCHAR(255) NOT NULL,
    okul_adi VARCHAR(255) NOT NULL,
    bolum VARCHAR(255),
    burs_turu burs_turu NOT NULL,
    burs_miktari DECIMAL(10, 2) NOT NULL,
    baslangic_tarihi DATE NOT NULL,
    bitis_tarihi DATE,
    durum burs_durumu DEFAULT 'Aktif',
    gpa DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE performans_notlari (
    id SERIAL PRIMARY KEY,
    burs_id INTEGER REFERENCES ogrenci_burslari(id) ON DELETE CASCADE,
    tarih DATE NOT NULL,
    gpa DECIMAL(3, 2) NOT NULL,
    notlar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE yetimler (
    id SERIAL PRIMARY KEY,
    adi_soyadi VARCHAR(255) NOT NULL,
    dogum_tarihi DATE NOT NULL,
    cinsiyet VARCHAR(10),
    veli_adi VARCHAR(255),
    veli_telefonu VARCHAR(20),
    sehir VARCHAR(100),
    egitim_seviyesi egitim_seviyesi,
    okul_adi VARCHAR(255),
    destek_durumu destek_durumu DEFAULT 'Destek Almıyor',
    kayit_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE saglik_notlari (
    id SERIAL PRIMARY KEY,
    yetim_id INTEGER REFERENCES yetimler(id) ON DELETE CASCADE,
    tarih DATE NOT NULL,
    notlar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE egitim_notlari (
    id SERIAL PRIMARY KEY,
    yetim_id INTEGER REFERENCES yetimler(id) ON DELETE CASCADE,
    tarih DATE NOT NULL,
    notlar TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vefa_destekleri (
    id SERIAL PRIMARY KEY,
    adi_soyadi VARCHAR(255) NOT NULL,
    dogum_tarihi DATE,
    telefon VARCHAR(20),
    adres TEXT,
    destek_turu vefa_destek_turu NOT NULL,
    destek_durumu vefa_destek_durumu DEFAULT 'Aktif',
    sorumlu_gonullu VARCHAR(255),
    kayit_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vefa_notlari (
    id SERIAL PRIMARY KEY,
    vefa_id INTEGER REFERENCES vefa_destekleri(id) ON DELETE CASCADE,
    tarih DATE NOT NULL,
    notlar TEXT NOT NULL,
    giren_kullanici VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE finansal_kayitlar (
    id SERIAL PRIMARY KEY,
    tarih DATE NOT NULL,
    aciklama TEXT NOT NULL,
    tur finansal_islem_turu NOT NULL,
    kategori hesap_kategorisi NOT NULL,
    tutar DECIMAL(12, 2) NOT NULL,
    belge_no VARCHAR(100),
    proje_id INTEGER REFERENCES projeler(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gonulluler (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    baslangic_tarihi DATE NOT NULL,
    durum gonullu_durum DEFAULT 'Aktif',
    beceriler beceri[],
    ilgi_alanlari TEXT[],
    musaitlik TEXT,
    toplam_saat INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE etkinlikler (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(255) NOT NULL,
    tarih DATE NOT NULL,
    saat TIME,
    konum VARCHAR(255),
    aciklama TEXT,
    status etkinlik_status DEFAULT 'Planlama',
    sorumlu_id INTEGER REFERENCES kisiler(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE etkinlik_katilimcilari (
    id SERIAL PRIMARY KEY,
    etkinlik_id INTEGER REFERENCES etkinlikler(id) ON DELETE CASCADE,
    person_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    kayit_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(etkinlik_id, person_id)
);

CREATE TABLE etkinlik_katilimlari (
    id SERIAL PRIMARY KEY,
    gonullu_id INTEGER REFERENCES gonulluler(id) ON DELETE CASCADE,
    etkinlik_adi VARCHAR(255) NOT NULL,
    tarih DATE NOT NULL,
    rol VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE bildirimler (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
    tur bildirim_turu NOT NULL,
    baslik VARCHAR(255) NOT NULL,
    icerik TEXT NOT NULL,
    tarih TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    durum bildirim_durumu DEFAULT 'Okunmadı',
    gonderen VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    key VARCHAR(255) UNIQUE NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE webhooks (
    id SERIAL PRIMARY KEY,
    url VARCHAR(500) NOT NULL,
    event webhook_event NOT NULL,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE gonderilen_mesajlar (
    id SERIAL PRIMARY KEY,
    gonderim_turu gonderim_turu NOT NULL,
    hedef_kitle VARCHAR(255) NOT NULL,
    kisi_sayisi INTEGER NOT NULL,
    baslik VARCHAR(255) NOT NULL,
    icerik TEXT NOT NULL,
    gonderim_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    gonderen_kullanici VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE denetim_kayitlari (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    kullanici_id INTEGER REFERENCES kullanicilar(id),
    kullanici_adi VARCHAR(255),
    eylem log_action NOT NULL,
    entity_tipi log_entity_type NOT NULL,
    entity_id INTEGER,
    aciklama TEXT NOT NULL,
    detaylar JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE yorumlar (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
    kullanici_adi VARCHAR(255),
    kullanici_avatar_url VARCHAR(500),
    icerik TEXT NOT NULL,
    entity_tipi log_entity_type NOT NULL,
    entity_id INTEGER NOT NULL,
    sentiment sentiment,
    ai_sentiment_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE saved_views (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    filters JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE yetkili_hesaplar (
    id SERIAL PRIMARY KEY,
    ad_soyad VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_kisiler_kimlik_no ON kisiler(kimlik_no);
CREATE INDEX idx_kisiler_durum ON kisiler(durum);
CREATE INDEX idx_kisiler_kategori ON kisiler(kategori);
CREATE INDEX idx_bagislar_tarih ON bagislar(tarih);
CREATE INDEX idx_bagislar_bagisci_id ON bagislar(bagisci_id);
CREATE INDEX idx_yardim_basvurulari_durum ON yardim_basvurulari(durum);
CREATE INDEX idx_yardim_basvurulari_basvuru_tarihi ON yardim_basvurulari(basvuru_tarihi);
CREATE INDEX idx_odemeler_tarih ON odemeler(odeme_tarihi);
CREATE INDEX idx_etkinlikler_tarih ON etkinlikler(tarih);
CREATE INDEX idx_denetim_kayitlari_timestamp ON denetim_kayitlari(timestamp);
CREATE INDEX idx_yorumlar_entity ON yorumlar(entity_tipi, entity_id);

-- Create trigger function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at column
CREATE TRIGGER update_kullanicilar_updated_at BEFORE UPDATE ON kullanicilar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sistem_ayarlari_updated_at BEFORE UPDATE ON sistem_ayarlari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kurumlar_updated_at BEFORE UPDATE ON kurumlar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kisiler_updated_at BEFORE UPDATE ON kisiler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_aidatlar_updated_at BEFORE UPDATE ON aidatlar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bagislar_updated_at BEFORE UPDATE ON bagislar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kumbaralar_updated_at BEFORE UPDATE ON kumbaralar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_depo_urunleri_updated_at BEFORE UPDATE ON depo_urunleri FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_davalar_updated_at BEFORE UPDATE ON davalar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projeler_updated_at BEFORE UPDATE ON projeler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gorevler_updated_at BEFORE UPDATE ON gorevler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_yardim_basvurulari_updated_at BEFORE UPDATE ON yardim_basvurulari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_odemeler_updated_at BEFORE UPDATE ON odemeler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hizmetler_updated_at BEFORE UPDATE ON hizmetler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hastane_sevkleri_updated_at BEFORE UPDATE ON hastane_sevkleri FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ogrenci_burslari_updated_at BEFORE UPDATE ON ogrenci_burslari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_yetimler_updated_at BEFORE UPDATE ON yetimler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_vefa_destekleri_updated_at BEFORE UPDATE ON vefa_destekleri FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_finansal_kayitlar_updated_at BEFORE UPDATE ON finansal_kayitlar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gonulluler_updated_at BEFORE UPDATE ON gonulluler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_etkinlikler_updated_at BEFORE UPDATE ON etkinlikler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_yetkili_hesaplar_updated_at BEFORE UPDATE ON yetkili_hesaplar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default data
INSERT INTO sistem_ayarlari (dernek_adi, dernek_adresi, varsayilan_para_birimi, tarih_formati) 
VALUES ('Yardım Eli Derneği', 'Merkez Adres', 'TRY', 'DD/MM/YYYY');

INSERT INTO kullanicilar (kullanici_adi, email, rol, durum) 
VALUES 
('admin', 'admin@yardimeli.org', 'Yönetici', 'Aktif'),
('isahamid', 'isahamid095@gmail.com', 'Yönetici', 'Aktif');