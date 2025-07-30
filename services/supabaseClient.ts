
import { createClient } from '@supabase/supabase-js';
import { Profil as ProfilData, Kullanici as KullaniciData } from '../types';

const supabaseUrl = 'https://eqtsssgwcgiognmoxuuz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVxdHNzc2d3Y2dpb2dubW94dXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzI3NzEsImV4cCI6MjA2OTQwODc3MX0.kCTHrkuSLQ5Pi8ijmXCIPkA5rMzDfS2QpeMQQ8Zg3Sc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const userToProfile = (user: KullaniciData): ProfilData => {
    return {
        id: user.id,
        adSoyad: user.kullaniciAdi,
        email: user.email,
        rol: user.rol,
        telefon: '', // This should be fetched from a 'profiles' table if it exists
        profilFotoUrl: `https://i.pravatar.cc/100?u=${user.email}` // Placeholder
    };
};
