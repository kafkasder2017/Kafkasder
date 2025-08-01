-- Enable Row Level Security on all tables
ALTER TABLE kullanicilar ENABLE ROW LEVEL SECURITY;
ALTER TABLE sistem_ayarlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE kurumlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE kisiler ENABLE ROW LEVEL SECURITY;
ALTER TABLE banka_hesaplari ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE person_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;
ALTER TABLE acil_durum_kisileri ENABLE ROW LEVEL SECURITY;
ALTER TABLE notlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE aidatlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE bagislar ENABLE ROW LEVEL SECURITY;
ALTER TABLE kumbaralar ENABLE ROW LEVEL SECURITY;
ALTER TABLE depo_urunleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE davalar ENABLE ROW LEVEL SECURITY;
ALTER TABLE projeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE gorevler ENABLE ROW LEVEL SECURITY;
ALTER TABLE yardim_basvurulari ENABLE ROW LEVEL SECURITY;
ALTER TABLE odemeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayni_yardim_islemleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE hizmetler ENABLE ROW LEVEL SECURITY;
ALTER TABLE hastane_sevkleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE ogrenci_burslari ENABLE ROW LEVEL SECURITY;
ALTER TABLE performans_notlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE yetimler ENABLE ROW LEVEL SECURITY;
ALTER TABLE saglik_notlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE egitim_notlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE vefa_destekleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE vefa_notlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE finansal_kayitlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE gonulluler ENABLE ROW LEVEL SECURITY;
ALTER TABLE etkinlikler ENABLE ROW LEVEL SECURITY;
ALTER TABLE etkinlik_katilimcilari ENABLE ROW LEVEL SECURITY;
ALTER TABLE etkinlik_katilimlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE bildirimler ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE gonderilen_mesajlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE denetim_kayitlari ENABLE ROW LEVEL SECURITY;
ALTER TABLE yorumlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE yetkili_hesaplar ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS policies
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS kullanici_rol AS $$
BEGIN
  RETURN (
    SELECT rol 
    FROM kullanicilar 
    WHERE email = auth.email()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_current_user_role() = 'Yönetici';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_current_user_role() IN ('Yönetici', 'Editör');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_muhasebe_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN get_current_user_role() IN ('Yönetici', 'Editör', 'Muhasebe');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM kullanicilar 
    WHERE email = auth.email()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for kullanicilar table
CREATE POLICY "Users can view all users" ON kullanicilar
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert users" ON kullanicilar
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Only admins can update users" ON kullanicilar
  FOR UPDATE USING (is_admin());

CREATE POLICY "Only admins can delete users" ON kullanicilar
  FOR DELETE USING (is_admin());

-- RLS Policies for sistem_ayarlari table
CREATE POLICY "Everyone can view system settings" ON sistem_ayarlari
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify system settings" ON sistem_ayarlari
  FOR ALL USING (is_admin());

-- RLS Policies for kurumlar table
CREATE POLICY "Everyone can view institutions" ON kurumlar
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert institutions" ON kurumlar
  FOR INSERT WITH CHECK (is_editor_or_admin());

CREATE POLICY "Editors and admins can update institutions" ON kurumlar
  FOR UPDATE USING (is_editor_or_admin());

CREATE POLICY "Only admins can delete institutions" ON kurumlar
  FOR DELETE USING (is_admin());

-- RLS Policies for kisiler table
CREATE POLICY "Everyone can view people" ON kisiler
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can insert people" ON kisiler
  FOR INSERT WITH CHECK (is_editor_or_admin());

CREATE POLICY "Editors and admins can update people" ON kisiler
  FOR UPDATE USING (is_editor_or_admin());

CREATE POLICY "Only admins can delete people" ON kisiler
  FOR DELETE USING (is_admin());

-- RLS Policies for banka_hesaplari table
CREATE POLICY "Everyone can view bank accounts" ON banka_hesaplari
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage bank accounts" ON banka_hesaplari
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for person_documents table
CREATE POLICY "Everyone can view documents" ON person_documents
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage documents" ON person_documents
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for person_photos table
CREATE POLICY "Everyone can view photos" ON person_photos
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage photos" ON person_photos
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for dependents table
CREATE POLICY "Everyone can view dependents" ON dependents
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage dependents" ON dependents
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for acil_durum_kisileri table
CREATE POLICY "Everyone can view emergency contacts" ON acil_durum_kisileri
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage emergency contacts" ON acil_durum_kisileri
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for notlar table
CREATE POLICY "Everyone can view notes" ON notlar
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage notes" ON notlar
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for aidatlar table
CREATE POLICY "Everyone can view membership fees" ON aidatlar
  FOR SELECT USING (true);

CREATE POLICY "Muhasebe and above can manage membership fees" ON aidatlar
  FOR ALL USING (is_muhasebe_or_above());

-- RLS Policies for bagislar table
CREATE POLICY "Everyone can view donations" ON bagislar
  FOR SELECT USING (true);

CREATE POLICY "Muhasebe and above can manage donations" ON bagislar
  FOR ALL USING (is_muhasebe_or_above());

-- RLS Policies for kumbaralar table
CREATE POLICY "Everyone can view donation boxes" ON kumbaralar
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage donation boxes" ON kumbaralar
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for depo_urunleri table
CREATE POLICY "Everyone can view warehouse products" ON depo_urunleri
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage warehouse products" ON depo_urunleri
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for davalar table
CREATE POLICY "Everyone can view legal cases" ON davalar
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage legal cases" ON davalar
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for projeler table
CREATE POLICY "Everyone can view projects" ON projeler
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage projects" ON projeler
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for gorevler table
CREATE POLICY "Everyone can view tasks" ON gorevler
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage tasks" ON gorevler
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for yardim_basvurulari table
CREATE POLICY "Everyone can view aid applications" ON yardim_basvurulari
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage aid applications" ON yardim_basvurulari
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for odemeler table
CREATE POLICY "Everyone can view payments" ON odemeler
  FOR SELECT USING (true);

CREATE POLICY "Muhasebe and above can manage payments" ON odemeler
  FOR ALL USING (is_muhasebe_or_above());

-- RLS Policies for ayni_yardim_islemleri table
CREATE POLICY "Everyone can view in-kind aid transactions" ON ayni_yardim_islemleri
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage in-kind aid transactions" ON ayni_yardim_islemleri
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for hizmetler table
CREATE POLICY "Everyone can view services" ON hizmetler
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage services" ON hizmetler
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for hastane_sevkleri table
CREATE POLICY "Everyone can view hospital referrals" ON hastane_sevkleri
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage hospital referrals" ON hastane_sevkleri
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for ogrenci_burslari table
CREATE POLICY "Everyone can view student scholarships" ON ogrenci_burslari
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage student scholarships" ON ogrenci_burslari
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for performans_notlari table
CREATE POLICY "Everyone can view performance notes" ON performans_notlari
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage performance notes" ON performans_notlari
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for yetimler table
CREATE POLICY "Everyone can view orphans" ON yetimler
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage orphans" ON yetimler
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for saglik_notlari table
CREATE POLICY "Everyone can view health notes" ON saglik_notlari
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage health notes" ON saglik_notlari
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for egitim_notlari table
CREATE POLICY "Everyone can view education notes" ON egitim_notlari
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage education notes" ON egitim_notlari
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for vefa_destekleri table
CREATE POLICY "Everyone can view vefa support" ON vefa_destekleri
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage vefa support" ON vefa_destekleri
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for vefa_notlari table
CREATE POLICY "Everyone can view vefa notes" ON vefa_notlari
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage vefa notes" ON vefa_notlari
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for finansal_kayitlar table
CREATE POLICY "Everyone can view financial records" ON finansal_kayitlar
  FOR SELECT USING (true);

CREATE POLICY "Muhasebe and above can manage financial records" ON finansal_kayitlar
  FOR ALL USING (is_muhasebe_or_above());

-- RLS Policies for gonulluler table
CREATE POLICY "Everyone can view volunteers" ON gonulluler
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage volunteers" ON gonulluler
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for etkinlikler table
CREATE POLICY "Everyone can view events" ON etkinlikler
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage events" ON etkinlikler
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for etkinlik_katilimcilari table
CREATE POLICY "Everyone can view event participants" ON etkinlik_katilimcilari
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage event participants" ON etkinlik_katilimcilari
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for etkinlik_katilimlari table
CREATE POLICY "Everyone can view event participations" ON etkinlik_katilimlari
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage event participations" ON etkinlik_katilimlari
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for bildirimler table
CREATE POLICY "Users can view their own notifications" ON bildirimler
  FOR SELECT USING (kullanici_id = get_current_user_id());

CREATE POLICY "Admins can manage all notifications" ON bildirimler
  FOR ALL USING (is_admin());

CREATE POLICY "Users can update their own notifications" ON bildirimler
  FOR UPDATE USING (kullanici_id = get_current_user_id());

-- RLS Policies for api_keys table
CREATE POLICY "Only admins can view API keys" ON api_keys
  FOR SELECT USING (is_admin());

CREATE POLICY "Only admins can manage API keys" ON api_keys
  FOR ALL USING (is_admin());

-- RLS Policies for webhooks table
CREATE POLICY "Only admins can view webhooks" ON webhooks
  FOR SELECT USING (is_admin());

CREATE POLICY "Only admins can manage webhooks" ON webhooks
  FOR ALL USING (is_admin());

-- RLS Policies for gonderilen_mesajlar table
CREATE POLICY "Everyone can view sent messages" ON gonderilen_mesajlar
  FOR SELECT USING (true);

CREATE POLICY "Editors and admins can manage sent messages" ON gonderilen_mesajlar
  FOR ALL USING (is_editor_or_admin());

-- RLS Policies for denetim_kayitlari table
CREATE POLICY "Everyone can view audit logs" ON denetim_kayitlari
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage audit logs" ON denetim_kayitlari
  FOR ALL USING (is_admin());

-- RLS Policies for yorumlar table
CREATE POLICY "Everyone can view comments" ON yorumlar
  FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" ON yorumlar
  FOR INSERT WITH CHECK (kullanici_id = get_current_user_id());

CREATE POLICY "Users can update their own comments" ON yorumlar
  FOR UPDATE USING (kullanici_id = get_current_user_id());

CREATE POLICY "Admins can delete any comment" ON yorumlar
  FOR DELETE USING (is_admin());

-- RLS Policies for saved_views table
CREATE POLICY "Users can view their own saved views" ON saved_views
  FOR SELECT USING (kullanici_id = get_current_user_id());

CREATE POLICY "Users can manage their own saved views" ON saved_views
  FOR ALL USING (kullanici_id = get_current_user_id());

-- RLS Policies for yetkili_hesaplar table
CREATE POLICY "Everyone can view authorized accounts" ON yetkili_hesaplar
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage authorized accounts" ON yetkili_hesaplar
  FOR ALL USING (is_admin());

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users for login functionality
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON kullanicilar TO anon;
GRANT EXECUTE ON FUNCTION get_current_user_role() TO anon;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;
GRANT EXECUTE ON FUNCTION is_editor_or_admin() TO anon;
GRANT EXECUTE ON FUNCTION is_muhasebe_or_above() TO anon;
GRANT EXECUTE ON FUNCTION get_current_user_id() TO anon;