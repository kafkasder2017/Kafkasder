import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
    DashboardStats,
    RecentActivity,
    DashboardInsight,
    Person,
    Proje,
    YardimBasvurusu,
    Bagis,
    ProjeStatus,
    BasvuruStatus,
    MembershipType,
} from '../types';
import {
    getPeople,
    getProjeler,
    getYardimBasvurulari,
    getBagislar,
} from '../services/apiService';
import { generateDashboardInsights } from '../services/geminiService';

export function useSupabaseQuery<T extends { id: any }>(tableName: string) {
    const [data, setData] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        
        const { data: fetchedData, error: fetchError } = await supabase
            .from(tableName)
            .select('*')
            .order('id', { ascending: false });

        if (fetchError) {
            console.error(`Error fetching ${tableName}:`, fetchError);
            setError(`Veri yüklenemedi: ${fetchError.message}`);
            setIsLoading(false);
        } else {
            setData(fetchedData as T[]);
            setIsLoading(false);
        }
    }, [tableName]);

    useEffect(() => {
        fetchData();

        // --- Realtime Subscription ---
        // Close previous channel if it exists
        if (channelRef.current) {
            channelRef.current.unsubscribe();
        }

        const channel = supabase.channel(`public:${tableName}`)
            .on<T>(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: tableName },
                (payload) => {
                    console.log('New insert:', payload.new);
                    setData(currentData => [payload.new as T, ...currentData]);
                }
            )
            .on<T>(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: tableName },
                (payload) => {
                     console.log('Update:', payload.new);
                    setData(currentData =>
                        currentData.map(item =>
                            item.id === payload.new.id ? (payload.new as T) : item
                        )
                    );
                }
            )
            .on<T>(
                'postgres_changes',
                { event: 'DELETE', schema: 'public', table: tableName },
                (payload) => {
                     console.log('Delete:', payload.old);
                    setData(currentData =>
                        currentData.filter(item => item.id !== (payload.old as Partial<T>).id)
                    );
                }
            )
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to ${tableName}`);
                }
                if (status === 'CHANNEL_ERROR') {
                    console.error(`Subscription error on ${tableName}:`, err);
                    setError(`Gerçek zamanlı bağlantı hatası: ${err?.message}`);
                }
            });
            
        channelRef.current = channel;

        // Cleanup function to unsubscribe when component unmounts
        return () => {
            if (channelRef.current) {
                channelRef.current.unsubscribe();
                channelRef.current = null;
            }
        };
    }, [tableName, fetchData]);

    return { data, isLoading, error, refresh: fetchData };
}

export const usePeople = () => useSupabaseQuery<Person>('kisiler');

export const useDashboardData = () => {
    const [stats, setStats] = useState<DashboardStats>({ totalMembers: 0, monthlyDonations: 0, activeProjects: 0, pendingApplications: 0 });
    const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
    const [monthlyDonationData, setMonthlyDonationData] = useState<any[]>([]);
    const [insights, setInsights] = useState<DashboardInsight[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [error, setError] = useState('');

    const refreshInsights = useCallback(async (currentStats?: DashboardStats) => {
        setIsAiLoading(true);
        try {
            const statsToUse = currentStats || stats;
            // Placeholders as dashboard insights expects these.
            const insightsData = await generateDashboardInsights({
                pendingApplications: statsToUse.pendingApplications,
                lateProjects: 0, 
                lowStockItems: 0, 
                monthlyDonationTotal: statsToUse.monthlyDonations
            });
            setInsights(insightsData);
        } catch(err) {
            console.error("AI insights failed to generate:", err);
            // Fail gracefully without showing error to user
        } finally {
            setIsAiLoading(false);
        }
    }, [stats]);


    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const [people, projects, applications, donations] = await Promise.all([
                getPeople(),
                getProjeler(),
                getYardimBasvurulari(),
                getBagislar(),
            ]);

            // Calculate Stats
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const totalMembers = people.filter(p => p.membershipType && p.membershipType !== MembershipType.GONULLU).length;
            const monthlyDonations = donations
                .filter(d => new Date(d.tarih) >= startOfMonth)
                .reduce((sum, d) => sum + d.tutar, 0);
            const activeProjects = projects.filter(p => p.status === ProjeStatus.DEVAM_EDIYOR).length;
            const pendingApplications = applications.filter(a => a.durum === BasvuruStatus.BEKLEYEN || a.durum === BasvuruStatus.INCELENEN).length;
            
            const newStats = { totalMembers, monthlyDonations, activeProjects, pendingApplications };
            setStats(newStats);

            // Recent Activities
            const sortedDonations = [...donations].sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime()).slice(0, 2);
            const sortedPeople = [...people].sort((a, b) => new Date(b.kayitTarihi).getTime() - new Date(a.kayitTarihi).getTime()).slice(0, 2);
            const sortedApplications = [...applications].sort((a, b) => new Date(b.basvuruTarihi).getTime() - new Date(a.basvuruTarihi).getTime()).slice(0, 2);
            
            const peopleMap = new Map(people.map(p => [p.id, `${p.ad} ${p.soyad}`]));

            const activities: RecentActivity[] = [
                ...sortedDonations.map(d => ({
                    id: `donation-${d.id}`,
                    type: 'donation' as 'donation',
                    timestamp: d.tarih,
                    description: `${peopleMap.get(d.bagisciId) || 'Bilinmeyen kişi'} <strong>bağış yaptı.</strong>`,
                    amount: d.tutar.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }),
                    link: '/bagis-yonetimi/tum-bagislar',
                })),
                ...sortedPeople.map(p => ({
                    id: `person-${p.id}`,
                    type: 'person' as 'person',
                    timestamp: p.kayitTarihi,
                    description: `${p.ad} ${p.soyad} için <strong>Yeni kişi kaydı:</strong>`,
                    link: `/kisiler/${p.id}`,
                })),
                ...sortedApplications.map(a => ({
                    id: `application-${a.id}`,
                    type: 'application' as 'application',
                    timestamp: a.basvuruTarihi,
                    description: `${peopleMap.get(a.basvuruSahibiId) || 'Bilinmeyen kişi'} <strong>yeni bir başvuru yaptı.</strong>`,
                    link: `/yardimlar/${a.id}`,
                })),
            ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);
            setRecentActivities(activities);
            
            // Monthly Donation Chart Data
            const monthlyDonationsAgg = donations.reduce((acc, d) => {
                const month = d.tarih.slice(0, 7); // YYYY-MM
                acc[month] = (acc[month] || 0) + d.tutar;
                return acc;
            }, {} as Record<string, number>);

            const chartData = Object.entries(monthlyDonationsAgg)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => a.name.localeCompare(b.name))
                .slice(-6); // Last 6 months
            setMonthlyDonationData(chartData);
            
            // AI Insights
            refreshInsights(newStats);


        } catch (err: any) {
            setError(err.message || 'Dashboard verileri yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    }, [refreshInsights]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data: {
            stats,
            recentActivities,
            monthlyDonationData,
            insights,
        },
        isLoading,
        isAiLoading,
        error,
        refresh: fetchData
    };
};
