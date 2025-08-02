-- Missing tables based on types.ts interfaces

-- Table for Durusma (Court Hearings)
CREATE TABLE durusmalar (
    id SERIAL PRIMARY KEY,
    dava_id INTEGER REFERENCES davalar(id) ON DELETE CASCADE,
    tarih DATE NOT NULL,
    saat TIME NOT NULL,
    aciklama TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Gelisime (Case Developments)
CREATE TABLE gelismeler (
    id SERIAL PRIMARY KEY,
    dava_id INTEGER REFERENCES davalar(id) ON DELETE CASCADE,
    tarih DATE NOT NULL,
    aciklama TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Masraf (Case Expenses)
CREATE TABLE masraflar (
    id SERIAL PRIMARY KEY,
    dava_id INTEGER REFERENCES davalar(id) ON DELETE CASCADE,
    tarih DATE NOT NULL,
    aciklama TEXT NOT NULL,
    tutar DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for StokTahmini (Stock Predictions)
CREATE TABLE stok_tahminleri (
    id SERIAL PRIMARY KEY,
    urun_adi VARCHAR(255) NOT NULL,
    oneri TEXT NOT NULL,
    oncelik VARCHAR(20) CHECK (oncelik IN ('Yüksek', 'Orta', 'Düşük')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for EtkinlikKatilimi (Event Participation History)
CREATE TABLE etkinlik_katilim_gecmisi (
    id SERIAL PRIMARY KEY,
    gonullu_id INTEGER REFERENCES gonulluler(id) ON DELETE CASCADE,
    etkinlik_adi VARCHAR(255) NOT NULL,
    tarih DATE NOT NULL,
    rol VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Profil (User Profiles)
CREATE TABLE profiller (
    id SERIAL PRIMARY KEY,
    kullanici_id INTEGER REFERENCES kullanicilar(id) ON DELETE CASCADE,
    ad_soyad VARCHAR(255) NOT NULL,
    telefon VARCHAR(20),
    profil_foto_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Dosya (Files)
CREATE TABLE dosyalar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(20) CHECK (file_type IN ('pdf', 'image', 'word', 'excel', 'other')) NOT NULL,
    size BIGINT NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    parent_id UUID REFERENCES dosyalar(id) ON DELETE CASCADE,
    url TEXT,
    tags TEXT[],
    path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for Klasor (Folders)
CREATE TABLE klasorler (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES klasorler(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for ChatMessage (Chat Messages)
CREATE TABLE chat_mesajlari (
    id SERIAL PRIMARY KEY,
    sender VARCHAR(255) NOT NULL,
    content JSONB,
    role VARCHAR(10) CHECK (role IN ('user', 'model')) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for DashboardInsight (Dashboard Insights)
CREATE TABLE dashboard_insights (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('success', 'warning', 'info')) NOT NULL,
    priority VARCHAR(10) CHECK (priority IN ('high', 'medium', 'low')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for AnalyticsSummary (Analytics Summary)
CREATE TABLE analytics_summary (
    id SERIAL PRIMARY KEY,
    summary TEXT NOT NULL,
    actionable_insights TEXT[] NOT NULL,
    positive_trends TEXT[] NOT NULL,
    areas_for_attention TEXT[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for VolunteerSuggestion (Volunteer Suggestions)
CREATE TABLE gonullu_onerileri (
    id SERIAL PRIMARY KEY,
    person_id INTEGER REFERENCES kisiler(id) ON DELETE CASCADE,
    volunteer_name VARCHAR(255) NOT NULL,
    reasoning TEXT NOT NULL,
    relevant_skills beceri[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for CalendarEvent (Calendar Events)
CREATE TABLE takvim_etkinlikleri (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type calendar_event_type NOT NULL,
    link VARCHAR(255),
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to new tables
CREATE TRIGGER update_durusmalar_updated_at BEFORE UPDATE ON durusmalar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gelismeler_updated_at BEFORE UPDATE ON gelismeler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_masraflar_updated_at BEFORE UPDATE ON masraflar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stok_tahminleri_updated_at BEFORE UPDATE ON stok_tahminleri FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_etkinlik_katilim_gecmisi_updated_at BEFORE UPDATE ON etkinlik_katilim_gecmisi FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiller_updated_at BEFORE UPDATE ON profiller FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dosyalar_updated_at BEFORE UPDATE ON dosyalar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_klasorler_updated_at BEFORE UPDATE ON klasorler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_mesajlari_updated_at BEFORE UPDATE ON chat_mesajlari FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dashboard_insights_updated_at BEFORE UPDATE ON dashboard_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_analytics_summary_updated_at BEFORE UPDATE ON analytics_summary FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gonullu_onerileri_updated_at BEFORE UPDATE ON gonullu_onerileri FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_takvim_etkinlikleri_updated_at BEFORE UPDATE ON takvim_etkinlikleri FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on new tables
ALTER TABLE durusmalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE gelismeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE masraflar ENABLE ROW LEVEL SECURITY;
ALTER TABLE stok_tahminleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE etkinlik_katilim_gecmisi ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiller ENABLE ROW LEVEL SECURITY;
ALTER TABLE dosyalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE klasorler ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_mesajlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE gonullu_onerileri ENABLE ROW LEVEL SECURITY;
ALTER TABLE takvim_etkinlikleri ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for authenticated users)
CREATE POLICY "Allow all operations for authenticated users" ON durusmalar FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON gelismeler FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON masraflar FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON stok_tahminleri FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON etkinlik_katilim_gecmisi FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON profiller FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON dosyalar FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON klasorler FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON chat_mesajlari FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON dashboard_insights FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON analytics_summary FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON gonullu_onerileri FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow all operations for authenticated users" ON takvim_etkinlikleri FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_durusmalar_dava_id ON durusmalar(dava_id);
CREATE INDEX idx_durusmalar_tarih ON durusmalar(tarih);
CREATE INDEX idx_gelismeler_dava_id ON gelismeler(dava_id);
CREATE INDEX idx_gelismeler_tarih ON gelismeler(tarih);
CREATE INDEX idx_masraflar_dava_id ON masraflar(dava_id);
CREATE INDEX idx_masraflar_tarih ON masraflar(tarih);
CREATE INDEX idx_etkinlik_katilim_gecmisi_gonullu_id ON etkinlik_katilim_gecmisi(gonullu_id);
CREATE INDEX idx_etkinlik_katilim_gecmisi_tarih ON etkinlik_katilim_gecmisi(tarih);
CREATE INDEX idx_profiller_kullanici_id ON profiller(kullanici_id);
CREATE INDEX idx_dosyalar_parent_id ON dosyalar(parent_id);
CREATE INDEX idx_dosyalar_file_type ON dosyalar(file_type);
CREATE INDEX idx_klasorler_parent_id ON klasorler(parent_id);
CREATE INDEX idx_chat_mesajlari_role ON chat_mesajlari(role);
CREATE INDEX idx_dashboard_insights_type ON dashboard_insights(type);
CREATE INDEX idx_dashboard_insights_priority ON dashboard_insights(priority);
CREATE INDEX idx_gonullu_onerileri_person_id ON gonullu_onerileri(person_id);
CREATE INDEX idx_takvim_etkinlikleri_date ON takvim_etkinlikleri(date);
CREATE INDEX idx_takvim_etkinlikleri_type ON takvim_etkinlikleri(type);