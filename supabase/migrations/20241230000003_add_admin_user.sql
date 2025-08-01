-- Add new admin user
INSERT INTO kullanicilar (kullanici_adi, email, rol, durum, created_at) 
VALUES ('isahamid', 'isahamid095@gmail.com', 'Yönetici', 'Aktif', NOW())
ON CONFLICT (email) DO UPDATE SET 
  rol = 'Yönetici',
  durum = 'Aktif';