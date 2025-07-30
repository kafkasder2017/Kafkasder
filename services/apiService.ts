

import {
    Kullanici, Dava, Person, Proje, YardimBasvurusu, OgrenciBursu, Yetim,
    Odeme, Kumbara, DepoUrunu, FinansalKayit, Gonullu, Etkinlik,
    VefaDestek, GonderilenMesaj, AyniYardimIslemi, Hizmet, HastaneSevk,
    Bagis, Aidat, ApiKey, Webhook, SistemAyarlari, DosyaSistemiOgesi, Dosya,
    Bildirim, AidatDurumu, YetkiliHesap, KullaniciDurum, DenetimKaydi, Yorum, Kurum,
    Profil as ProfilData,
    BildirimDurumu
} from '../types';
import { supabase, userToProfile } from './supabaseClient';


// --- Generic Supabase Helper Functions ---
const handleSupabaseError = (error: any, context: string) => {
    console.error(`Supabase error in ${context}:`, error);
    throw new Error(`Veritabanı hatası (${context}): ${error.message}`);
};

const getAll = async <T>(tableName: string): Promise<T[]> => {
    const { data, error } = await supabase.from(tableName).select('*').order('id', { ascending: false });
    if (error) handleSupabaseError(error, `get all ${tableName}`);
    return data as T[];
};

const getById = async <T>(tableName: string, id: number): Promise<T> => {
    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) handleSupabaseError(error, `get by id ${id} from ${tableName}`);
    return data as T;
};

const createRecord = async (tableName: string, record: any): Promise<any> => {
    // Supabase returns an array for insert, so we expect a single record back.
    const { data, error } = await supabase.from(tableName).insert(record).select();
    if (error) handleSupabaseError(error, `create in ${tableName}`);
    if (!data || data.length === 0) throw new Error("Kayıt oluşturulduktan sonra veri alınamadı.");
    return data[0];
};

const updateRecord = async (tableName: string, id: number, updates: any): Promise<any> => {
    const { data, error } = await supabase.from(tableName).update(updates).eq('id', id).select();
    if (error) handleSupabaseError(error, `update id ${id} in ${tableName}`);
     if (!data || data.length === 0) throw new Error("Kayıt güncellendikten sonra veri alınamadı.");
    return data[0];
};

const deleteRecord = async (tableName: string, id: number): Promise<void> => {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) handleSupabaseError(error, `delete id ${id} in ${tableName}`);
};


// --- AUTHENTICATION ---
export const login = async (email: string, password: string): Promise<Kullanici> => {
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;
    if (!user) throw new Error("Giriş başarısız, kullanıcı bulunamadı.");
    
    // Fetch profile and update last sign-in time
    const { data: userProfile, error: profileError } = await supabase
        .from('kullanicilar')
        .select('*')
        .eq('email', user.email)
        .single();
        
    if (profileError || !userProfile) {
        // If profile doesn't exist, sign out to prevent inconsistent state
        await supabase.auth.signOut();
        throw profileError || new Error("Kullanıcı profili bulunamadı.");
    }
    
    // Update last sign in time (don't block login for this)
    updateRecord('kullanicilar', userProfile.id, { sonGiris: new Date().toISOString() })
        .catch(err => console.error("Failed to update last sign-in time:", err));
        
    return userProfile;
};

export const signInWithGoogle = async (): Promise<void> => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) throw error;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getProfileForUser = async (user: any): Promise<ProfilData | null> => {
    const { data, error } = await supabase
        .from('kullanicilar')
        .select('*')
        .eq('email', user.email)
        .single();

    if (error) {
        // 'PGRST116' is the code for "No rows found"
        if (error.code === 'PGRST116') return null;
        handleSupabaseError(error, `getProfileForUser`);
    }
    
    return data ? userToProfile(data) : null;
};

// --- API FUNCTIONS --- //

// Denetim Kayıtları
export const getDenetimKayitlari = (): Promise<DenetimKaydi[]> => getAll<DenetimKaydi>('denetim_kayitlari');
export const createDenetimKaydi = (kayit: Omit<DenetimKaydi, 'id'>): Promise<DenetimKaydi> => createRecord('denetim_kayitlari', kayit);

// Yorumlar
export const createYorum = (yorum: Omit<Yorum, 'id'>): Promise<Yorum> => createRecord('yorumlar', yorum);

// Kişiler
export const getPeople = (): Promise<Person[]> => getAll<Person>('kisiler');
export const getPersonById = (id: number): Promise<Person> => getById<Person>('kisiler', id);
export const createPerson = (person: Omit<Person, 'id'>): Promise<Person> => createRecord('kisiler', person);
export const updatePerson = (id: number, person: Partial<Person>): Promise<Person> => updateRecord('kisiler', id, person);
export const deletePerson = (id: number): Promise<void> => deleteRecord('kisiler', id);

// Kullanıcılar
export const getUsers = (): Promise<Kullanici[]> => getAll<Kullanici>('kullanicilar');
export const createUser = async (user: Partial<Kullanici> & { password?: string }): Promise<Kullanici> => {
    if (!user.email || !user.password) throw new Error("Email and password are required");

    // Supabase handles auth user creation in the background via a trigger is better, 
    // but for frontend-only logic, we do it here.
    const { data, error: authError } = await supabase.auth.signUp({ 
        email: user.email, 
        password: user.password 
    });

    if (authError) throw authError;
    if (!data.user) throw new Error("User creation failed in Auth.");
    
    const profileToCreate = {
        kullaniciAdi: user.kullaniciAdi, 
        email: user.email, 
        rol: user.rol,
        durum: user.durum || KullaniciDurum.AKTIF,
    };
    return createRecord('kullanicilar', profileToCreate);
};
export const updateUser = (id: number, user: Partial<Kullanici>): Promise<Kullanici> => updateRecord('kullanicilar', id, user);
export const deleteUser = (id: number): Promise<void> => deleteRecord('kullanicilar', id); // Note: this doesn't delete the auth user.

// Projeler
export const getProjeler = (): Promise<Proje[]> => getAll<Proje>('projeler');
export const getProjeById = (id: number): Promise<Proje> => getById<Proje>('projeler', id);
export const createProje = (proje: Omit<Proje, 'id'>): Promise<Proje> => createRecord('projeler', proje);
export const updateProje = (id: number, proje: Partial<Proje>): Promise<Proje> => updateRecord('projeler', id, proje);
export const deleteProje = (id: number): Promise<void> => deleteRecord('projeler', id);

// Bağışlar
export const getBagislar = (): Promise<Bagis[]> => getAll<Bagis>('bagislar');
export const createBagis = (bagis: Omit<Bagis, 'id'>): Promise<Bagis> => createRecord('bagislar', bagis);
export const updateBagis = (id: number, bagis: Partial<Bagis>): Promise<Bagis> => updateRecord('bagislar', id, bagis);
export const deleteBagis = (id: number): Promise<void> => deleteRecord('bagislar', id);

// Yardım Başvuruları
export const getYardimBasvurulari = (): Promise<YardimBasvurusu[]> => getAll<YardimBasvurusu>('yardim_basvurulari');
export const getYardimBasvurusuById = (id: number): Promise<YardimBasvurusu> => getById<YardimBasvurusu>('yardim_basvurulari', id);
export const createYardimBasvurusu = (basvuru: Omit<YardimBasvurusu, 'id'>): Promise<YardimBasvurusu> => createRecord('yardim_basvurulari', basvuru);
export const updateYardimBasvurusu = (id: number, basvuru: Partial<YardimBasvurusu>): Promise<YardimBasvurusu> => updateRecord('yardim_basvurulari', id, basvuru);
export const deleteYardimBasvurusu = (id: number): Promise<void> => deleteRecord('yardim_basvurulari', id);

// Davalar
export const getDavalar = (): Promise<Dava[]> => getAll<Dava>('davalar');
export const getDavaById = (id: number): Promise<Dava> => getById<Dava>('davalar', id);
export const createDava = (dava: Omit<Dava, 'id'>): Promise<Dava> => createRecord('davalar', dava);
export const updateDava = (id: number, dava: Partial<Dava>): Promise<Dava> => updateRecord('davalar', id, dava);
export const deleteDava = (id: number): Promise<void> => deleteRecord('davalar', id);

// Ödemeler
export const getOdemeler = (): Promise<Odeme[]> => getAll<Odeme>('odemeler');
export const createOdeme = (odeme: Omit<Odeme, 'id'>): Promise<Odeme> => createRecord('odemeler', odeme);
export const updateOdeme = (id: number, odeme: Partial<Odeme>): Promise<Odeme> => updateRecord('odemeler', id, odeme);
export const deleteOdeme = (id: number): Promise<void> => deleteRecord('odemeler', id);

// Finansal Kayıtlar
export const getFinansalKayitlar = (): Promise<FinansalKayit[]> => getAll<FinansalKayit>('finansal_kayitlar');
export const createFinansalKayit = (kayit: Omit<FinansalKayit, 'id'>): Promise<FinansalKayit> => createRecord('finansal_kayitlar', kayit);
export const updateFinansalKayit = (id: number, kayit: Partial<FinansalKayit>): Promise<FinansalKayit> => updateRecord('finansal_kayitlar', id, kayit);
export const deleteFinansalKayit = (id: number): Promise<void> => deleteRecord('finansal_kayitlar', id);

// Gönüllüler
export const getGonulluler = (): Promise<Gonullu[]> => getAll<Gonullu>('gonulluler');
export const getGonulluById = (id: number): Promise<Gonullu> => getById<Gonullu>('gonulluler', id);
export const createGonullu = (gonullu: Omit<Gonullu, 'id'>): Promise<Gonullu> => createRecord('gonulluler', gonullu);
export const updateGonullu = (id: number, gonullu: Partial<Gonullu>): Promise<Gonullu> => updateRecord('gonulluler', id, gonullu);

// Vefa Destek
export const getVefaDestekList = (): Promise<VefaDestek[]> => getAll<VefaDestek>('vefa_destek');
export const getVefaDestekById = (id: number): Promise<VefaDestek> => getById<VefaDestek>('vefa_destek', id);
export const createVefaDestek = (vefa: Omit<VefaDestek, 'id'>): Promise<VefaDestek> => createRecord('vefa_destek', vefa);
export const updateVefaDestek = (id: number, vefa: Partial<VefaDestek>): Promise<VefaDestek> => updateRecord('vefa_destek', id, vefa);
export const deleteVefaDestek = (id: number): Promise<void> => deleteRecord('vefa_destek', id);

// Kumbara
export const getKumbaralar = (): Promise<Kumbara[]> => getAll<Kumbara>('kumbaralar');
export const createKumbara = (kumbara: Omit<Kumbara, 'id'>): Promise<Kumbara> => createRecord('kumbaralar', kumbara);
export const updateKumbara = (id: number, kumbara: Partial<Kumbara>): Promise<Kumbara> => updateRecord('kumbaralar', id, kumbara);
export const deleteKumbara = (id: number): Promise<void> => deleteRecord('kumbaralar', id);

// Depo
export const getDepoUrunleri = (): Promise<DepoUrunu[]> => getAll<DepoUrunu>('depo_urunleri');
export const createDepoUrunu = (urun: Omit<DepoUrunu, 'id'>): Promise<DepoUrunu> => createRecord('depo_urunleri', urun);
export const updateDepoUrunu = (id: number, urun: Partial<DepoUrunu>): Promise<DepoUrunu> => updateRecord('depo_urunleri', id, urun);

// Yetimler
export const getYetimler = (): Promise<Yetim[]> => getAll<Yetim>('yetimler');
export const getYetimById = (id: number): Promise<Yetim> => getById<Yetim>('yetimler', id);
export const createYetim = (yetim: Omit<Yetim, 'id'>): Promise<Yetim> => createRecord('yetimler', yetim);
export const updateYetim = (id: number, yetim: Partial<Yetim>): Promise<Yetim> => updateRecord('yetimler', id, yetim);
export const deleteYetim = (id: number): Promise<void> => deleteRecord('yetimler', id);

// Burslar
export const getOgrenciBurslari = (): Promise<OgrenciBursu[]> => getAll<OgrenciBursu>('ogrenci_burslari');
export const getOgrenciBursuById = (id: number): Promise<OgrenciBursu> => getById<OgrenciBursu>('ogrenci_burslari', id);
export const createOgrenciBursu = (burs: Omit<OgrenciBursu, 'id'>): Promise<OgrenciBursu> => createRecord('ogrenci_burslari', burs);
export const updateOgrenciBursu = (id: number, burs: Partial<OgrenciBursu>): Promise<OgrenciBursu> => updateRecord('ogrenci_burslari', id, burs);
export const deleteOgrenciBursu = (id: number): Promise<void> => deleteRecord('ogrenci_burslari', id);

// Etkinlikler
export const getEtkinlikler = (): Promise<Etkinlik[]> => getAll<Etkinlik>('etkinlikler');
export const getEtkinlikById = (id: number): Promise<Etkinlik> => getById<Etkinlik>('etkinlikler', id);
export const createEtkinlik = (etkinlik: Omit<Etkinlik, 'id'>): Promise<Etkinlik> => createRecord('etkinlikler', etkinlik);
export const updateEtkinlik = (id: number, etkinlik: Partial<Etkinlik>): Promise<Etkinlik> => updateRecord('etkinlikler', id, etkinlik);
export const deleteEtkinlik = (id: number): Promise<void> => deleteRecord('etkinlikler', id);

// Toplu İletişim
export const getMessages = (): Promise<GonderilenMesaj[]> => getAll<GonderilenMesaj>('gonderilen_mesajlar');
export const createMessageLog = (log: Omit<GonderilenMesaj, 'id'>): Promise<GonderilenMesaj> => createRecord('gonderilen_mesajlar', log);

// Ayni Yardim
export const getAyniYardimIslemleri = (): Promise<AyniYardimIslemi[]> => getAll<AyniYardimIslemi>('ayni_yardim_islemleri');
export const createAyniYardimIslemi = (islem: Omit<AyniYardimIslemi, 'id'>): Promise<AyniYardimIslemi> => createRecord('ayni_yardim_islemleri', islem);

// Hizmetler
export const getHizmetler = (): Promise<Hizmet[]> => getAll<Hizmet>('hizmetler');
export const createHizmet = (hizmet: Omit<Hizmet, 'id'>): Promise<Hizmet> => createRecord('hizmetler', hizmet);
export const updateHizmet = (id: number, hizmet: Partial<Hizmet>): Promise<Hizmet> => updateRecord('hizmetler', id, hizmet);
export const deleteHizmet = (id: number): Promise<void> => deleteRecord('hizmetler', id);

// Hastane Sevk
export const getHastaneSevkler = (): Promise<HastaneSevk[]> => getAll<HastaneSevk>('hastane_sevkler');
export const createHastaneSevk = (sevk: Omit<HastaneSevk, 'id'>): Promise<HastaneSevk> => createRecord('hastane_sevkler', sevk);
export const updateHastaneSevk = (id: number, sevk: Partial<HastaneSevk>): Promise<HastaneSevk> => updateRecord('hastane_sevkler', id, sevk);
export const deleteHastaneSevk = (id: number): Promise<void> => deleteRecord('hastane_sevkler', id);

// API Keys & Webhooks
const generateApiKey = () => `KFK_${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`;

export const getApiKeys = (): Promise<ApiKey[]> => getAll<ApiKey>('api_keys');
export const createApiKey = async (keyData: { name: string }): Promise<{ newKey: ApiKey, fullKey: string }> => {
    const fullKey = generateApiKey();
    // Store only a portion of the key for display purposes
    const storedKey = `${fullKey.slice(0, 7)}...${fullKey.slice(-4)}`;

    const recordToCreate: Omit<ApiKey, 'id'> = {
        name: keyData.name,
        key: storedKey,
        createdDate: new Date().toISOString(),
        status: 'Active',
    };

    const newKey: ApiKey = await createRecord('api_keys', recordToCreate);

    return { newKey, fullKey };
};
export const updateApiKey = (id: number, key: Partial<ApiKey>): Promise<ApiKey> => updateRecord('api_keys', id, key);
export const deleteApiKey = (id: number): Promise<void> => deleteRecord('api_keys', id);

export const getWebhooks = (): Promise<Webhook[]> => getAll<Webhook>('webhooks');
export const createWebhook = (webhook: Omit<Webhook, 'id'>): Promise<Webhook> => createRecord('webhooks', webhook);
export const updateWebhook = (id: number, webhook: Partial<Webhook>): Promise<Webhook> => updateRecord('webhooks', id, webhook);
export const deleteWebhook = (id: number): Promise<void> => deleteRecord('webhooks', id);

// Ayarlar
export const getSistemAyarlari = (): Promise<SistemAyarlari> => getById<SistemAyarlari>('ayarlar', 1);
export const updateSistemAyarlari = (settings: Partial<SistemAyarlari>): Promise<SistemAyarlari> => updateRecord('ayarlar', 1, settings);

// Aidatlar
export const getAidatlarByUyeId = async (uyeId: number): Promise<Aidat[]> => {
    const { data, error } = await supabase.from('aidatlar').select('*').eq('uyeId', uyeId);
    if (error) handleSupabaseError(error, `getAidatlarByUyeId for user ${uyeId}`);
    return data as Aidat[];
};
export const createAidat = (aidat: Omit<Aidat, 'id'>): Promise<Aidat> => createRecord('aidatlar', aidat);
export const updateAidat = (id: number, aidat: Partial<Aidat>): Promise<Aidat> => updateRecord('aidatlar', id, aidat);

// Bildirimler
export const getBildirimler = (): Promise<Bildirim[]> => getAll<Bildirim>('bildirimler');
export const createBildirim = (bildirim: Omit<Bildirim, 'id'>): Promise<Bildirim> => createRecord('bildirimler', bildirim);
export const updateBildirim = (id: number, bildirim: Partial<Bildirim>): Promise<Bildirim> => updateRecord('bildirimler', id, bildirim);
export const deleteBildirim = (id: number): Promise<void> => deleteRecord('bildirimler', id);
export const markAllAsRead = async () => {
    // This is a placeholder. In a real app, this would be a specific RPC call in Supabase
    // for efficiency, and to handle user-specific notifications.
    const { data: unread, error: selectError } = await supabase.from('bildirimler').select('id').eq('durum', 'Okunmadı');
    if(selectError || !unread) return;
    const idsToUpdate = unread.map(u => u.id);
    if(idsToUpdate.length === 0) return;
    const { error } = await supabase.from('bildirimler').update({ durum: BildirimDurumu.OKUNDU }).in('id', idsToUpdate);
    if(error) handleSupabaseError(error, 'markAllAsRead');
};


// File Storage
export const listFiles = async (path: string): Promise<DosyaSistemiOgesi[]> => {
    const { data, error } = await supabase.storage.from('dokumanlar').list(path, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) handleSupabaseError(error, `listFiles at ${path}`);
    
    // Here we're assuming folders don't have metadata, files do.
    // In a real app, you might have a separate table for file/folder metadata.
    const items: DosyaSistemiOgesi[] = (data || []).map(item => {
        if (!item.id) { // Assumes folders are items without an id from list call (a simplification)
            return { id: item.name, name: item.name, type: 'folder', parentId: path || null };
        } else {
             let fileType: Dosya['fileType'] = 'other';
             if (item.metadata.mimetype.startsWith('image/')) fileType = 'image';
             else if (item.metadata.mimetype === 'application/pdf') fileType = 'pdf';

            return { 
                id: item.id,
                name: item.name,
                type: 'file',
                fileType,
                size: item.metadata.size,
                uploadDate: item.created_at,
                parentId: path || null,
                path: `${path}/${item.name}`,
                url: getPublicUrl(`${path}/${item.name}`)
            };
        }
    });
    return items;
};

export const createFolder = async (path: string): Promise<void> => {
    // Supabase storage creates folders implicitly when you upload a file with a path.
    // We create a .emptyFolder file to "materialize" the folder.
    const { error } = await supabase.storage.from('dokumanlar').upload(`${path}/.emptyFolder`, new Blob(['']));
    if (error) handleSupabaseError(error, `createFolder at ${path}`);
};

export const uploadFile = async (path: string, file: File): Promise<Dosya> => {
    const filePath = path ? `${path}/${file.name}` : file.name;
    const { data, error } = await supabase.storage.from('dokumanlar').upload(filePath, file);
    if (error) handleSupabaseError(error, `uploadFile to ${filePath}`);
    
    // This is a simplification. We can't get all metadata back from a simple upload.
    // A better approach is to store file metadata in a separate DB table.
    let fileType: Dosya['fileType'] = 'other';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type === 'application/pdf') fileType = 'pdf';

    const newFile: Dosya = {
        id: data?.path || filePath, name: file.name, type: 'file', fileType, size: file.size,
        uploadDate: new Date().toISOString(), parentId: path || null, url: getPublicUrl(filePath), path: filePath
    };
    return newFile;
};
export const updateFile = async (id: string, updates: Partial<Dosya>): Promise<Dosya> => {
    // This is a placeholder. File metadata should be in a database table to be updatable.
    console.warn("updateFile is a placeholder and doesn't persist changes to Supabase Storage metadata.");
    return { id, ...updates } as Dosya;
};
export const deleteFiles = async (paths: string[]): Promise<void> => {
    const { error } = await supabase.storage.from('dokumanlar').remove(paths);
    if (error) handleSupabaseError(error, `deleteFiles`);
};

export const getPublicUrl = (path: string): string => {
    const { data } = supabase.storage.from('dokumanlar').getPublicUrl(path);
    return data.publicUrl;
};

// Kurumlar
export const getKurumlar = (): Promise<Kurum[]> => getAll<Kurum>('kurumlar');
export const getKurumById = (id: number): Promise<Kurum> => getById<Kurum>('kurumlar', id);
export const createKurum = (kurum: Omit<Kurum, 'id'>): Promise<Kurum> => createRecord('kurumlar', kurum);
export const updateKurum = (id: number, kurum: Partial<Kurum>): Promise<Kurum> => updateRecord('kurumlar', id, kurum);
export const deleteKurum = (id: number): Promise<void> => deleteRecord('kurumlar', id);