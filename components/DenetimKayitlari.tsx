import React, { useState, useEffect, useMemo } from 'react';
import { getDenetimKayitlari } from '../services/apiService';
import { DenetimKaydi, LogAction, LogEntityType } from '../types';
import { ICONS } from '../constants';

const getActionClass = (action: LogAction) => {
    switch (action) {
        case LogAction.CREATE: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case LogAction.UPDATE: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        case LogAction.DELETE: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case LogAction.LOGIN:
        case LogAction.LOGOUT: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
        default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300';
    }
};

const getEntityIcon = (entityType: LogEntityType) => {
    const iconStyle = "w-5 h-5 inline-block mr-2 text-zinc-500 dark:text-zinc-400";
    switch(entityType) {
        case LogEntityType.PERSON: return <span className={iconStyle}>{ICONS.PEOPLE}</span>;
        case LogEntityType.APPLICATION: return <span className={iconStyle}>{ICONS.AID_RECIPIENT}</span>;
        case LogEntityType.PROJECT: return <span className={iconStyle}>{ICONS.CALENDAR}</span>;
        case LogEntityType.DONATION: return <span className={iconStyle}>{ICONS.DONATION}</span>;
        case LogEntityType.USER: return <span className={iconStyle}>{ICONS.PEOPLE}</span>;
        case LogEntityType.VEFA: return <span className={iconStyle}>{ICONS.HEART_HAND}</span>;
        case LogEntityType.YETIM: return <span className={iconStyle}>{ICONS.ORPHAN}</span>;
        case LogEntityType.BURS: return <span className={iconStyle}>{ICONS.SCHOLARSHIP}</span>;
        case LogEntityType.SYSTEM: return <span className={iconStyle}>{ICONS.SETTINGS}</span>;
        case LogEntityType.COMMENT: return <span className={iconStyle}>{ICONS.MESSAGE}</span>;
        default: return null;
    }
};

const DenetimKayitlari: React.FC = () => {
    const [logs, setLogs] = useState<DenetimKaydi[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({
        user: '',
        action: 'all' as LogAction | 'all',
        entity: 'all' as LogEntityType | 'all',
        startDate: '',
        endDate: '',
    });

    useEffect(() => {
        const fetchLogs = async () => {
            setIsLoading(true);
            try {
                const data = await getDenetimKayitlari();
                setLogs(data);
            } catch (err: any) {
                setError(err.message || 'Denetim kayıtları yüklenemedi.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleQuickDateFilter = (period: 'today' | '7d' | '30d') => {
        const end = new Date();
        let start = new Date();
    
        if (period === 'today') {
            start.setHours(0, 0, 0, 0);
        } else if (period === '7d') {
            start.setDate(end.getDate() - 7);
            start.setHours(0, 0, 0, 0);
        } else if (period === '30d') {
            start.setDate(end.getDate() - 30);
            start.setHours(0, 0, 0, 0);
        }
    
        setFilters(prev => ({
            ...prev,
            startDate: start.toISOString().split('T')[0],
            endDate: end.toISOString().split('T')[0],
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            user: '',
            action: 'all',
            entity: 'all',
            startDate: '',
            endDate: '',
        });
    };
    
    const filteredLogs = useMemo(() => {
        return logs
            .filter(log => {
                const logDate = new Date(log.timestamp);
                const startDate = filters.startDate ? new Date(filters.startDate) : null;
                const endDate = filters.endDate ? new Date(filters.endDate) : null;
                if (startDate) startDate.setHours(0,0,0,0);
                if (endDate) endDate.setHours(23,59,59,999);

                return (
                    (filters.user === '' || log.kullaniciAdi.toLowerCase().includes(filters.user.toLowerCase())) &&
                    (filters.action === 'all' || log.eylem === filters.action) &&
                    (filters.entity === 'all' || log.entityTipi === filters.entity) &&
                    (!startDate || logDate >= startDate) &&
                    (!endDate || logDate <= endDate)
                );
            })
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [logs, filters]);


    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    }
    
    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">Denetim Kayıtları</h2>
            
            {/* Filters */}
            <div className="space-y-4 mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" name="user" placeholder="Kullanıcı Adı..." value={filters.user} onChange={handleFilterChange} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700" />
                    <select name="action" value={filters.action} onChange={handleFilterChange} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700">
                        <option value="all">Tüm Eylemler</option>
                        {Object.values(LogAction).map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <select name="entity" value={filters.entity} onChange={handleFilterChange} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700">
                        <option value="all">Tüm Varlıklar</option>
                        {Object.values(LogEntityType).map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm"/>
                        <span className="text-zinc-500">-</span>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-sm"/>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleQuickDateFilter('today')} className="text-sm px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700">Bugün</button>
                        <button onClick={() => handleQuickDateFilter('7d')} className="text-sm px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700">Son 7 Gün</button>
                        <button onClick={() => handleQuickDateFilter('30d')} className="text-sm px-3 py-1.5 border border-zinc-300 dark:border-zinc-600 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700">Son 30 Gün</button>
                    </div>
                     <button onClick={handleClearFilters} className="text-sm px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md ml-auto">Filtreleri Temizle</button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
                    <thead className="text-xs text-zinc-700 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Zaman Damgası</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Kullanıcı</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Eylem</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Varlık</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Açıklama</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                        {filteredLogs.map(log => (
                             <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                                <td className="px-6 py-4 text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('tr-TR')}</td>
                                <td className="px-6 py-4 font-medium">{log.kullaniciAdi}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getActionClass(log.eylem)}`}>
                                        {log.eylem}
                                    </span>
                                </td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        {getEntityIcon(log.entityTipi)}
                                        <span>{log.entityTipi} {log.entityId && `(#${log.entityId})`}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">{log.aciklama}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredLogs.length === 0 && (
                    <div className="text-center py-10 text-zinc-500">
                        <p>Filtre kriterlerine uygun denetim kaydı bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DenetimKayitlari;