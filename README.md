# 🏛️ KAFKASDER Yönetim Paneli

Kafkas Dernekleri Federasyonu için geliştirilmiş kapsamlı STK yönetim sistemi.

## 🌟 Özellikler

### 📊 **Ana Modüller**
- **Dashboard**: Genel istatistikler ve özet bilgiler
- **Kişi Yönetimi**: Üye, bağışçı ve yardım alan kişiler
- **Bağış Yönetimi**: Bağış takibi ve raporlama
- **Proje Yönetimi**: Proje planlama ve takibi
- **Muhasebe Entegrasyonu**: Logo, Eta, Mikro entegrasyonu
- **WhatsApp Entegrasyonu**: Toplu mesaj gönderimi
- **E-Devlet Entegrasyonu**: TC Kimlik doğrulama
- **Banka Entegrasyonu**: Otomatik bağış takibi

### 🤖 **AI Destekli Özellikler**
- Akıllı arama ve filtreleme
- Otomatik öncelik belirleme
- Sentiment analizi
- Gönüllü önerileri

### 📱 **Modern Teknolojiler**
- React 18 + TypeScript
- Vite build sistemi
- Supabase backend
- PWA desteği
- Responsive tasarım

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn

### Adımlar
```bash
# Repository'yi klonlayın
git clone https://github.com/kafkasder2017/Kafkasder.git
cd Kafkasder

# Bağımlılıkları yükleyin
npm install

# Environment variables ayarlayın
cp .env.example .env.local
# .env.local dosyasını düzenleyin

# Geliştirme sunucusunu başlatın
npm run dev
```

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📦 Deploy

### Vercel (Önerilen)
```bash
# Vercel CLI yükleyin
npm i -g vercel

# Deploy edin
vercel --prod
```

### Manuel Deploy
```bash
# Build oluşturun
npm run build

# Dist klasörünü sunucuya yükleyin
```

## 🗄️ Veritabanı

Supabase PostgreSQL kullanılmaktadır. Migration dosyaları `supabase/migrations/` klasöründe bulunur.

### Ana Tablolar
- `persons`: Kişi bilgileri
- `donations`: Bağış kayıtları
- `projects`: Proje bilgileri
- `financial_records`: Finansal kayıtlar
- `users`: Kullanıcı hesapları

## 🔧 Geliştirme

### Script'ler
```bash
npm run dev          # Geliştirme sunucusu
npm run build        # Production build
npm run preview      # Build önizleme
npm run lint         # ESLint kontrolü
npm run test         # Test çalıştırma
```

### Kod Standartları
- TypeScript strict mode
- ESLint + Prettier
- Husky pre-commit hooks

## 📊 Raporlama

Sistem aşağıdaki raporları otomatik olarak oluşturur:
- Aylık bağış raporları
- Üye aktivite raporları
- Proje ilerleme raporları
- Finansal özet raporları

## 🔐 Güvenlik

- Row Level Security (RLS)
- Role-based access control
- Audit logging
- Input validation
- XSS koruması

## 📞 Destek

Teknik destek için:
- Email: tech@kafkasder.org
- GitHub Issues: [Proje Issues](https://github.com/kafkasder2017/Kafkasder/issues)

## 📄 Lisans

Bu proje KAFKASDER için özel olarak geliştirilmiştir.

---

**Geliştirici**: KAFKASDER Teknoloji Ekibi  
**Versiyon**: 1.0.0  
**Son Güncelleme**: Ağustos 2024