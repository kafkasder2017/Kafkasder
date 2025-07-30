import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import * as ReactRouterDOM from 'react-router-dom';
import { DashboardInsight, DashboardStats, RecentActivity } from '../types';
import { ICONS } from '../constants';
import { useDashboardData } from '../hooks/useData';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-zinc-800 p-5 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 flex items-center gap-4">
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">{value}</p>
        </div>
    </div>
);

const timeSince = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " yıl önce";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " ay önce";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " gün önce";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " saat önce";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " dakika önce";
    return "az önce";
};

const RecentActivityList: React.FC<{ activities: RecentActivity[] }> = ({ activities }) => {
    const activityIcons = {
        donation: <div className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 p-2 rounded-full">{React.cloneElement(ICONS.DONATION, { strokeWidth: 2 })}</div>,
        person: <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-2 rounded-full">{React.cloneElement(ICONS.PEOPLE, { strokeWidth: 2 })}</div>,
        application: <div className="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400 p-2 rounded-full">{React.cloneElement(ICONS.AID_RECIPIENT, { strokeWidth: 2 })}</div>,
    };
    
    if (activities.length === 0) {
        return (
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 h-full flex items-center justify-center">
                <p className="text-zinc-500 dark:text-zinc-400">Son aktivite bulunmuyor.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Son Aktiviteler</h3>
            <ul className="space-y-4">
                {activities.map(activity => (
                    <li key={activity.id}>
                        <ReactRouterDOM.Link to={activity.link} className="flex items-center space-x-4 group">
                            <div className="flex-shrink-0">
                                {activityIcons[activity.type]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-white" dangerouslySetInnerHTML={{ __html: activity.description.replace(/(Yeni kişi kaydı:|bağış yaptı.|yeni bir başvuru yaptı.)/g, '<strong>$1</strong>') }}></p>
                                {activity.amount && <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{activity.amount}</p>}
                            </div>
                            <time className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">{timeSince(activity.timestamp)}</time>
                        </ReactRouterDOM.Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const AiInsightCard: React.FC<{ insights: DashboardInsight[], onRefresh: () => void, isLoading: boolean }> = ({ insights, onRefresh, isLoading }) => {
    const getInsightStyle = (type: DashboardInsight['type']) => {
        switch (type) {
            case 'success': return { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>, color: 'text-green-500' };
            case 'warning': return { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.636-1.214 2.522-1.214 3.158 0l5.42 10.372c.636 1.214-.364 2.729-1.579 2.729H4.416c-1.215 0-2.215-1.515-1.579-2.729L8.257 3.099zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-3a1 1 0 00-1 1v2a1 1 0 102 0v-2a1 1 0 00-1-1z" clipRule="evenodd" /></svg>, color: 'text-yellow-500' };
            case 'info': return { icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>, color: 'text-blue-500' };
            default: return { icon: null, color: '' };
        }
    };

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-purple-500">{ICONS.LIGHTBULB}</span>
                    <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">AI Destekli Analizler</h3>
                </div>
                <button onClick={onRefresh} disabled={isLoading} className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full disabled:opacity-50">
                    {isLoading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zinc-500"></div> : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" /></svg>}
                </button>
            </div>
            {insights.length > 0 ? (
                 <ul className="space-y-3">
                    {insights.map((insight, index) => {
                        const { icon, color } = getInsightStyle(insight.type);
                        return (
                             <li key={index} className="flex items-start space-x-3 p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
                                <div className={`flex-shrink-0 mt-0.5 ${color}`}>{icon}</div>
                                <p className="text-sm text-zinc-700 dark:text-zinc-300">{insight.text}</p>
                            </li>
                        )
                    })}
                </ul>
            ) : (
                <div className="text-center text-sm text-zinc-500 py-4">
                    {isLoading ? "Analizler oluşturuluyor..." : "Oluşturulacak bir analiz bulunamadı."}
                </div>
            )}
        </div>
    );
};

const MonthlyDonationsChart: React.FC<{ data: any[] }> = ({ data }) => {
    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">Aylık Bağış Grafiği</h3>
            <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.5} />
                        <XAxis dataKey="name" stroke="currentColor" className="text-xs" />
                        <YAxis stroke="currentColor" className="text-xs" tickFormatter={(value) => `${Number(value) / 1000}k`} />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid #e2e8f0',
                                borderRadius: '0.5rem',
                            }}
                            formatter={(value: number) => [value.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }), 'Toplam Bağış']}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="value" name="Bağış" stroke="#0A84FF" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


const Dashboard = () => {
    const { data, isLoading, isAiLoading, refresh } = useDashboardData();

    if (isLoading) {
         return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    }

    const { stats } = data;

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Toplam Üye Sayısı" 
                    value={stats.totalMembers} 
                    icon={ICONS.PEOPLE} 
                    color="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                />
                <StatCard 
                    title="Bu Ayki Bağışlar" 
                    value={stats.monthlyDonations.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} 
                    icon={ICONS.DONATION} 
                    color="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                />
                <StatCard 
                    title="Aktif Projeler" 
                    value={stats.activeProjects} 
                    icon={ICONS.CLIPBOARD_DOCUMENT_LIST} 
                    color="bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400"
                />
                <StatCard 
                    title="Bekleyen Başvurular" 
                    value={stats.pendingApplications} 
                    icon={ICONS.AID_RECIPIENT} 
                    color="bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400"
                />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <AiInsightCard insights={data.insights} onRefresh={refresh} isLoading={isAiLoading} />
                    <MonthlyDonationsChart data={data.monthlyDonationData} />
                </div>
                <div className="space-y-6">
                    <RecentActivityList activities={data.recentActivities} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;