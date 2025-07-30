

import React, { useState, useMemo, useEffect } from 'react';
import { Person, PersonStatus, Uyruk, YardimTuruDetay, KimlikTuru } from '../types';
import { smartSearchPeople } from '../services/geminiService';
import { getPeople, createPerson, updatePerson, deletePerson } from '../services/apiService';
import Modal from './Modal';


const getStatusClass = (status: PersonStatus) => {
    switch (status) {
        case PersonStatus.AKTIF: return 'bg-green-100 text-green-800';
        case PersonStatus.PASIF: return 'bg-red-100 text-red-800';
        case PersonStatus.BEKLEMEDE: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const YardimAlanlar: React.FC = () => {
    const [yardimAlanlar, setYardimAlanlar] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PersonStatus | 'all'>('all');
    const [nationalityFilter, setNationalityFilter] = useState<Uyruk | 'all'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAlan, setEditingAlan] = useState<Partial<Person> | null>(null);

    const [smartSearchQuery, setSmartSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [smartSearchResults, setSmartSearchResults] = useState<Person[] | null>(null);
    const [searchError, setSearchError] = useState('');

    const fetchYardimAlanlar = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getPeople();
             const recipients = data.filter(p => p.aldigiYardimTuru && p.aldigiYardimTuru.length > 0);
            setYardimAlanlar(recipients);
        } catch (err: any) {
            setError(err.message || "Yardım Alanlar listesi yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchYardimAlanlar();
    }, []);

    const displayedData = useMemo(() => {
        if (smartSearchResults !== null) {
            return smartSearchResults;
        }
        return yardimAlanlar.filter(alan => {
            const matchesSearch = `${alan.ad} ${alan.soyad}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  alan.kimlikNo.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || alan.durum === statusFilter;
            const matchesNationality = nationalityFilter === 'all' || alan.uyruk.includes(nationalityFilter as Uyruk);
            return matchesSearch && matchesStatus && matchesNationality;
        });
    }, [yardimAlanlar, searchTerm, statusFilter, nationalityFilter, smartSearchResults]);

    const handleSmartSearch = async () => {
        if (!smartSearchQuery.trim()) return;
        
        setIsSearching(true);
        setSearchError('');
        setSmartSearchResults(null);

        try {
            const results = await smartSearchPeople(smartSearchQuery);
            setSmartSearchResults(results);
        } catch (e: any) {
            setSearchError(e.message || 'Bilinmeyen bir hata oluştu.');
        } finally {
            setIsSearching(false);
        }
    };
    
    const handleClearSmartSearch = () => {
        setSmartSearchQuery('');
        setSmartSearchResults(null);
        setSearchError('');
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
            try {
                await deletePerson(id);
                await fetchYardimAlanlar(); // Refresh list
                if (smartSearchResults) {
                    setSmartSearchResults(smartSearchResults.filter(p => p.id !== id));
                }
            } catch (err) {
                alert('Kayıt silinirken bir hata oluştu.');
            }
        }
    };
    
    const handleSave = async (alanToSave: Partial<Person>) => {
        try {
            if (alanToSave.id) {
                await updatePerson(alanToSave.id, alanToSave);
            } else {
                const payload = { 
                    ...alanToSave,
                    kayitTarihi: new Date().toISOString().split('T')[0],
                    kaydiAcanBirim: 'Panel',
                } as Omit<Person, 'id'>;
                await createPerson(payload);
            }
            await fetchYardimAlanlar();
            setIsModalOpen(false);
            setEditingAlan(null);
        } catch(err) {
            alert("Kayıt kaydedilirken bir hata oluştu.");
        }
    };
    
    const handleAddNew = () => {
        setEditingAlan({});
        setIsModalOpen(true);
    };

    const handleEdit = (alan: Person) => {
        setEditingAlan(alan);
        setIsModalOpen(true);
    };
    
    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    }

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-sm">
                 <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <label htmlFor="smart-search" className="block text-sm font-semibold text-slate-700 mb-2">
                        Akıllı Arama (AI Destekli)
                    </label>
                    <div className="flex items-center space-x-2">
                        <input 
                            id="smart-search"
                            type="text"
                            placeholder="Örn: 'Ankara'da oturan ve gıda kolisi alanlar'"
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={smartSearchQuery}
                            onChange={(e) => setSmartSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                            disabled={isSearching}
                        />
                        <button 
                            onClick={handleSmartSearch} 
                            disabled={isSearching || !smartSearchQuery}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:bg-purple-300 disabled:cursor-not-allowed"
                            aria-label="Akıllı Arama Yap"
                        >
                            {isSearching ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 1.9a2.5 2.5 0 0 0 0 3.5L12 10l1.9-1.9a2.5 2.5 0 0 0 0-3.5L12 3z"/><path d="m3 12 1.9 1.9a2.5 2.5 0 0 0 3.5 0L10 12l-1.9-1.9a2.5 2.5 0 0 0-3.5 0L3 12z"/><path d="m12 21 1.9-1.9a2.5 2.5 0 0 0 0-3.5L12 14l-1.9 1.9a2.5 2.5 0 0 0 0 3.5L12 21z"/></svg>
                            )}
                            <span>Ara</span>
                        </button>
                        {(smartSearchResults !== null || smartSearchQuery) && (
                            <button 
                                onClick={handleClearSmartSearch}
                                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300"
                            >
                                Temizle
                            </button>
                        )}
                    </div>
                    {searchError && <p className="text-red-600 text-sm mt-2">{searchError}</p>}
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6">
                    <div className="w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Ad, Soyad veya Kimlik No ile ara..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={smartSearchResults !== null}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <select 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100"
                            value={nationalityFilter}
                            onChange={(e) => setNationalityFilter(e.target.value as Uyruk | 'all')}
                            disabled={smartSearchResults !== null}
                        >
                            <option value="all">Tüm Uyruklar</option>
                            {Object.values(Uyruk).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <select 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as PersonStatus | 'all')}
                            disabled={smartSearchResults !== null}
                        >
                            <option value="all">Tüm Durumlar</option>
                            {Object.values(PersonStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={handleAddNew} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            <span>Yeni Kayıt Ekle</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Ad Soyad</th>
                                <th scope="col" className="px-6 py-3">Kimlik No</th>
                                <th scope="col" className="px-6 py-3">Uyruk</th>
                                <th scope="col" className="px-6 py-3">Şehir</th>
                                <th scope="col" className="px-6 py-3">Durum</th>
                                <th scope="col" className="px-6 py-3 text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedData.map((alan) => (
                                <tr key={alan.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{alan.ad} {alan.soyad}</td>
                                    <td className="px-6 py-4">{alan.kimlikNo}</td>
                                    <td className="px-6 py-4">{alan.uyruk.join(', ')}</td>
                                    <td className="px-6 py-4">{alan.sehir}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(alan.durum)}`}>
                                            {alan.durum}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-3">
                                            <button onClick={() => handleEdit(alan)} className="text-yellow-600 hover:text-yellow-800 font-medium">Düzenle</button>
                                            <button onClick={() => handleDeleteClick(alan.id)} className="text-red-600 hover:text-red-800 font-medium">Sil</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {displayedData.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        {smartSearchResults !== null 
                            ? <p>Akıllı arama kriterlerinize uygun kayıt bulunamadı.</p>
                            : <p>Arama kriterlerine uygun kayıt bulunamadı.</p>
                        }
                    </div>
                )}
            </div>
            {isModalOpen && (
                <YardimAlanFormModal
                    alan={editingAlan}
                    onClose={() => { setIsModalOpen(false); setEditingAlan(null); }}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

const YardimAlanFormModal: React.FC<{
    alan: Partial<Person> | null,
    onClose: () => void,
    onSave: (alan: Partial<Person>) => void
}> = ({ alan, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Person>>(alan || { aldigiYardimTuru: [], uyruk: [] });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleYardimTuruChange = (tur: YardimTuruDetay) => {
        setFormData(prev => {
            const currentTuru = prev.aldigiYardimTuru || [];
            const newTuru = currentTuru.includes(tur)
                ? currentTuru.filter(t => t !== tur)
                : [...currentTuru, tur];
            return { ...prev, aldigiYardimTuru: newTuru };
        });
    };
    
    const handleUyrukChange = (uyruk: Uyruk) => {
        setFormData(prev => {
            const currentUyruk = prev.uyruk || [];
            const newUyruk = currentUyruk.includes(uyruk)
                ? currentUyruk.filter(u => u !== uyruk)
                : [...currentUyruk, uyruk];
            return { ...prev, uyruk: newUyruk };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const isNew = !alan?.id;

    return (
        <Modal isOpen={true} onClose={onClose} title={isNew ? 'Yeni Yardım Alan Ekle' : 'Yardım Alan Bilgilerini Düzenle'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Ad</label>
                        <input type="text" name="ad" value={formData.ad || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Soyad</label>
                        <input type="text" name="soyad" value={formData.soyad || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Kimlik No</label>
                        <input type="text" name="kimlikNo" value={formData.kimlikNo || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                     <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-slate-700 mb-2">Uyruk</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {Object.values(Uyruk).map(u => (
                                <label key={u} className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer text-sm ${formData.uyruk?.includes(u) ? 'bg-blue-100 border-blue-300' : 'border-slate-200'}`}>
                                    <input type="checkbox" checked={formData.uyruk?.includes(u)} onChange={() => handleUyrukChange(u)} className="rounded"/>
                                    <span>{u}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Şehir</label>
                        <input type="text" name="sehir" value={formData.sehir || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">İlçe</label>
                        <input type="text" name="yerlesim" value={formData.yerlesim || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Açık Adres</label>
                        <textarea name="adres" value={formData.adres || ''} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Durum</label>
                        <select name="durum" value={formData.durum || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(PersonStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Aldığı Yardım Türleri</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.values(YardimTuruDetay).map(tur => (
                                <label key={tur} className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer text-sm ${formData.aldigiYardimTuru?.includes(tur) ? 'bg-blue-100 border-blue-300' : 'border-slate-200'}`}>
                                    <input type="checkbox" checked={formData.aldigiYardimTuru?.includes(tur)} onChange={() => handleYardimTuruChange(tur)} className="rounded"/>
                                    <span>{tur}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
                 <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50">İptal</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Kaydet</button>
                 </div>
            </form>
        </Modal>
    );
};

export default YardimAlanlar;