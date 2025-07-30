import React, { useState, useMemo, useEffect } from 'react';
import { FinansalKayit, FinansalIslemTuru, HesapKategorisi, Proje } from '../types';
import Modal from './Modal';
import { getFinansalKayitlar, createFinansalKayit, deleteFinansalKayit, getProjeler, updateFinansalKayit } from '../services/apiService';
import { suggestFinancialCategory } from '../services/geminiService';

const StatCard: React.FC<{ title: string; value: string; color: string; icon: React.ReactNode }> = ({ title, value, color, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);

const FinansalKayitlar: React.FC = () => {
    const [kayitlar, setKayitlar] = useState<FinansalKayit[]>([]);
    const [projects, setProjects] = useState<Proje[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<FinansalIslemTuru | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<HesapKategorisi | 'all'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKayit, setEditingKayit] = useState<Partial<FinansalKayit> | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [kayitlarData, projelerData] = await Promise.all([getFinansalKayitlar(), getProjeler()]);
            setKayitlar(kayitlarData);
            setProjects(projelerData);
        } catch(err: any) {
            setError(err.message || "Finansal veriler yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const { filteredKayitlar, totalGelir, totalGider, bakiye } = useMemo(() => {
        let currentTotalGelir = 0;
        let currentTotalGider = 0;
        
        kayitlar.forEach(k => {
            if (k.tur === FinansalIslemTuru.GELIR) {
                currentTotalGelir += k.tutar;
            } else {
                currentTotalGider += k.tutar;
            }
        });

        const filtered = kayitlar.filter(kayit => {
            const matchesSearch = kayit.aciklama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (kayit.belgeNo && kayit.belgeNo.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesType = typeFilter === 'all' || kayit.tur === typeFilter;
            const matchesCategory = categoryFilter === 'all' || kayit.kategori === categoryFilter;
            return matchesSearch && matchesType && matchesCategory;
        }).sort((a, b) => new Date(b.tarih).getTime() - new Date(a.tarih).getTime());
        
        return { 
            filteredKayitlar: filtered, 
            totalGelir: currentTotalGelir, 
            totalGider: currentTotalGider, 
            bakiye: currentTotalGelir - currentTotalGider 
        };
    }, [kayitlar, searchTerm, typeFilter, categoryFilter]);

    const handleAddNewClick = () => {
        setEditingKayit({});
        setIsModalOpen(true);
    };

    const handleEditClick = (kayit: FinansalKayit) => {
        setEditingKayit(kayit);
        setIsModalOpen(true);
    };
    
    const handleDeleteClick = async (id: number) => {
        if(window.confirm("Bu kaydı silmek istediğinizden emin misiniz?")) {
            try {
                await deleteFinansalKayit(id);
                setKayitlar(prev => prev.filter(k => k.id !== id));
            } catch (err) {
                alert("Kayıt silinirken bir hata oluştu.");
            }
        }
    };
    
    const handleSaveKayit = async (kayitToSave: Partial<FinansalKayit>) => {
        try {
            if(kayitToSave.id) {
                const updated = await updateFinansalKayit(kayitToSave.id, kayitToSave);
                setKayitlar(prev => prev.map(k => k.id === updated.id ? updated : k));
            } else {
                const newKayit = await createFinansalKayit(kayitToSave as Omit<FinansalKayit, 'id'>);
                setKayitlar(prev => [newKayit, ...prev]);
            }
            setIsModalOpen(false);
            setEditingKayit(null);
        } catch(err) {
            alert("Kayıt kaydedilirken bir hata oluştu.");
        }
    };
    
    if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;

    return (
        <>
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Toplam Gelir" 
                        value={totalGelir.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        color="bg-green-100 text-green-600"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>}
                    />
                    <StatCard 
                        title="Toplam Gider" 
                        value={totalGider.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        color="bg-red-100 text-red-600"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>}
                    />
                     <StatCard 
                        title="Bakiye" 
                        value={bakiye.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        color="bg-blue-100 text-blue-600"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
                    />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                     <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6">
                        <div className="w-full md:w-1/3">
                            <input
                                type="text"
                                placeholder="Açıklama veya Belge No ile ara..."
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <select 
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value as HesapKategorisi | 'all')}
                            >
                                <option value="all">Tüm Kategoriler</option>
                                {Object.values(HesapKategorisi).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <select 
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as FinansalIslemTuru | 'all')}
                            >
                                <option value="all">Tüm İşlem Türleri</option>
                                <option value={FinansalIslemTuru.GELIR}>Gelir</option>
                                <option value={FinansalIslemTuru.GIDER}>Gider</option>
                            </select>
                            <button onClick={handleAddNewClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                <span>Yeni Kayıt Ekle</span>
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                             <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-semibold">Tarih</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Açıklama</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Kategori</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Tutar</th>
                                    <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                                </tr>
                            </thead>
                             <tbody className="divide-y divide-slate-200">
                                {filteredKayitlar.map((kayit) => {
                                    const ilgiliProje = kayit.projeId ? projects.find(p => p.id === kayit.projeId) : null;
                                    return (
                                        <tr key={kayit.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4">{new Date(kayit.tarih).toLocaleDateString('tr-TR')}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-slate-900">{kayit.aciklama}</div>
                                                <div className="flex items-center space-x-2">
                                                    {kayit.belgeNo && <div className="text-xs text-slate-500">Belge No: {kayit.belgeNo}</div>}
                                                    {ilgiliProje && <div className="text-xs text-purple-600 font-semibold bg-purple-100 px-1.5 py-0.5 rounded-full">{ilgiliProje.name}</div>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">{kayit.kategori}</td>
                                            <td className={`px-6 py-4 font-semibold ${kayit.tur === FinansalIslemTuru.GELIR ? 'text-green-600' : 'text-red-600'}`}>
                                                {kayit.tur === FinansalIslemTuru.GELIR ? '+' : '-'} {kayit.tutar.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-4">
                                                    <button onClick={() => handleEditClick(kayit)} className="text-yellow-600 hover:text-yellow-800 font-semibold">Düzenle</button>
                                                    <button onClick={() => handleDeleteClick(kayit.id)} className="text-red-600 hover:text-red-800 font-semibold">Sil</button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                     {filteredKayitlar.length === 0 && (
                        <div className="text-center py-10 text-slate-500">
                            <p>Arama kriterlerine uygun kayıt bulunamadı.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && editingKayit && (
                <FinansalKayitFormModal
                    kayit={editingKayit}
                    projects={projects}
                    onClose={() => { setIsModalOpen(false); setEditingKayit(null); }}
                    onSave={handleSaveKayit}
                />
            )}
        </>
    );
};

export const FinansalKayitFormModal: React.FC<{
    kayit: Partial<FinansalKayit>, 
    projects: Proje[],
    onClose: () => void, 
    onSave: (kayit: Partial<FinansalKayit>) => void
}> = ({ kayit, projects, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<FinansalKayit>>(kayit);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionError, setSuggestionError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        let newState = { ...formData };
        
        if (name === 'tutar') {
            newState.tutar = parseFloat(value) || 0;
        } else if (name === 'projeId') {
            newState.projeId = value ? parseInt(value, 10) : undefined;
        } else if (name === 'tur' && value === FinansalIslemTuru.GELIR) {
            // Gelir seçilince proje bağlantısını kaldır
            newState.tur = value as FinansalIslemTuru;
            delete newState.projeId;
        }
        else {
            (newState as any)[name] = value;
        }
        setFormData(newState);
    }

    const handleSuggestCategory = async () => {
        if (!formData.aciklama) {
            setSuggestionError("Lütfen önce bir açıklama girin.");
            return;
        }
        setIsSuggesting(true);
        setSuggestionError('');
        try {
            const suggestedCategory = await suggestFinancialCategory(formData.aciklama);
            setFormData(prev => ({ ...prev, kategori: suggestedCategory }));
        } catch (err: any) {
            setSuggestionError(err.message || "Öneri alınamadı.");
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as FinansalKayit);
    }
    
    const isNew = !kayit.id;

    return (
        <Modal isOpen={true} onClose={onClose} title={isNew ? 'Yeni Finansal Kayıt Ekle' : 'Finansal Kaydı Düzenle'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">İşlem Tarihi</label>
                        <input type="date" name="tarih" value={formData.tarih || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">İşlem Türü</label>
                        <select name="tur" value={formData.tur || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                            <option value="" disabled>Seçiniz...</option>
                            <option value={FinansalIslemTuru.GELIR}>Gelir</option>
                            <option value={FinansalIslemTuru.GIDER}>Gider</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Açıklama</label>
                        <textarea name="aciklama" value={formData.aciklama || ''} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required></textarea>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Kategori</label>
                         <div className="relative mt-1">
                            <select name="kategori" value={formData.kategori || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg bg-white pr-28" required>
                                <option value="" disabled>Seçiniz...</option>
                                {Object.values(HesapKategorisi).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                            <button
                                type="button"
                                onClick={handleSuggestCategory}
                                disabled={isSuggesting || !formData.aciklama}
                                className="absolute top-1/2 right-1.5 -translate-y-1/2 bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-semibold hover:bg-purple-200 disabled:bg-slate-100 disabled:text-slate-400 flex items-center space-x-1"
                            >
                               {isSuggesting ? (
                                    <div className="w-4 h-4 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 1.9a2.5 2.5 0 0 0 0 3.5L12 10l1.9-1.9a2.5 2.5 0 0 0 0-3.5L12 3z"/></svg>
                                )}
                                <span>AI Önerisi</span>
                            </button>
                        </div>
                        {suggestionError && <p className="text-xs text-red-600 mt-1">{suggestionError}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tutar (TL)</label>
                        <input type="number" step="0.01" name="tutar" value={formData.tutar || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Belge No (varsa)</label>
                        <input type="text" name="belgeNo" value={formData.belgeNo || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" />
                    </div>
                    {formData.tur === FinansalIslemTuru.GIDER && (
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">İlişkili Proje (İsteğe Bağlı)</label>
                            <select name="projeId" value={formData.projeId || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white">
                                <option value="">Proje Seçilmedi</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                    )}
                </div>
                 <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50">İptal</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Kaydet</button>
                 </div>
            </form>
        </Modal>
    );
};

export default FinansalKayitlar;