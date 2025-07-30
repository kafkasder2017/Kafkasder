


import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Dava, DavaStatus, DavaTuru } from '../types';
import Modal from './Modal';
import { generateDavaKonusu } from '../services/geminiService';
import { getDavalar, createDava, updateDava, deleteDava } from '../services/apiService';

const getStatusClass = (status: DavaStatus) => {
    switch (status) {
        case DavaStatus.DEVAM_EDEN: return 'bg-blue-100 text-blue-800';
        case DavaStatus.SONUCLANAN: return 'bg-green-100 text-green-800';
        case DavaStatus.TEMYIZDE: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const HukukiYardim: React.FC = () => {
    const [davalar, setDavalar] = useState<Dava[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<DavaStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<DavaTuru | 'all'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDava, setEditingDava] = useState<Partial<Dava> | null>(null);
    
    const fetchDavalar = async () => {
        try {
            setIsLoading(true);
            const data = await getDavalar();
            setDavalar(data);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Davalar yüklenirken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDavalar();
    }, []);

    const filteredDavalar = useMemo(() => {
        return davalar.filter(dava => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = dava.muvekkil.toLowerCase().includes(lowerSearch) ||
                                  dava.caseNumber.toLowerCase().includes(lowerSearch) ||
                                  dava.sorumluAvukat.toLowerCase().includes(lowerSearch);
            const matchesStatus = statusFilter === 'all' || dava.davaDurumu === statusFilter;
            const matchesType = typeFilter === 'all' || dava.davaTuru === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [davalar, searchTerm, statusFilter, typeFilter]);

    const handleAddNewClick = () => {
        setEditingDava({});
        setIsModalOpen(true);
    };

    const handleEditClick = (dava: Dava) => {
        setEditingDava(dava);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('Bu dava kaydını silmek istediğinizden emin misiniz?')) {
            try {
                await deleteDava(id);
                setDavalar(davalar.filter(d => d.id !== id));
            } catch (err) {
                alert('Dava silinirken bir hata oluştu.');
                console.error(err);
            }
        }
    };

    const handleSaveDava = async (davaToSave: Partial<Dava>) => {
        try {
            if (davaToSave.id) { // Editing
                const updatedDava = await updateDava(davaToSave.id, davaToSave);
                setDavalar(davalar.map(d => d.id === davaToSave.id ? updatedDava : d));
            } else { // Adding new
                const newDava = await createDava(davaToSave as Omit<Dava, 'id'>);
                setDavalar([newDava, ...davalar]);
            }
            setIsModalOpen(false);
            setEditingDava(null);
        } catch (err) {
            alert('Dava kaydedilirken bir hata oluştu.');
            console.error(err);
        }
    };
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return <div className="p-6 bg-red-50 text-red-700 rounded-lg text-center">{error}</div>;
    }

    return (
        <>
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6">
                <div className="w-full md:w-1/3">
                    <input
                        type="text"
                        placeholder="Müvekkil, Dava No, Avukat..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-4">
                     <select 
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as DavaTuru | 'all')}
                     >
                        <option value="all">Tüm Dava Türleri</option>
                        {Object.values(DavaTuru).map(tur => (
                            <option key={tur} value={tur}>{tur}</option>
                        ))}
                    </select>
                    <select 
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as DavaStatus | 'all')}
                    >
                        <option value="all">Tüm Durumlar</option>
                        {Object.values(DavaStatus).map(durum => (
                             <option key={durum} value={durum}>{durum}</option>
                        ))}
                    </select>
                    <button onClick={handleAddNewClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        <span>Yeni Dava Ekle</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Dava No / Konusu</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Müvekkil / Karşı Taraf</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Dava Türü</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Avukat</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Durum</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredDavalar.map((dava) => (
                            <tr key={dava.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4">
                                  <div className="font-medium text-slate-900">{dava.caseNumber}</div>
                                  <div className="text-xs text-slate-500">{dava.davaKonusu}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-900">{dava.muvekkil}</div>
                                    <div className="text-xs text-slate-500">vs. {dava.karsiTaraf}</div>
                                </td>
                                <td className="px-6 py-4">{dava.davaTuru}</td>
                                <td className="px-6 py-4">{dava.sorumluAvukat}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(dava.davaDurumu)}`}>
                                        {dava.davaDurumu}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-4">
                                        <ReactRouterDOM.Link to={`/hukuki-yardim/${dava.id}`} className="text-blue-600 hover:text-blue-800 font-semibold">Detay</ReactRouterDOM.Link>
                                        <button onClick={() => handleEditClick(dava)} className="text-yellow-600 hover:text-yellow-800 font-semibold">Düzenle</button>
                                        <button onClick={() => handleDeleteClick(dava.id)} className="text-red-600 hover:text-red-800 font-semibold">Sil</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {filteredDavalar.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>Arama kriterlerine uygun dava bulunamadı.</p>
                </div>
            )}
        </div>
        {isModalOpen && editingDava && (
            <DavaFormModal
                dava={editingDava}
                onClose={() => { setIsModalOpen(false); setEditingDava(null); }}
                onSave={handleSaveDava}
            />
        )}
        </>
    );
};

const DavaFormModal: React.FC<{ dava: Partial<Dava>, onClose: () => void, onSave: (dava: Partial<Dava>) => void }> = ({ dava, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Dava>>(dava);
    const [isGeneratingKonusu, setIsGeneratingKonusu] = useState(false);
    const [konusuError, setKonusuError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerateDavaKonusu = async () => {
        if (!formData.muvekkil || !formData.karsiTaraf || !formData.davaTuru) {
            setKonusuError("Lütfen önce Müvekkil, Karşı Taraf ve Dava Türü alanlarını doldurun.");
            return;
        }
        setIsGeneratingKonusu(true);
        setKonusuError('');
        try {
            const konusu = await generateDavaKonusu(formData.muvekkil, formData.karsiTaraf, formData.davaTuru);
            setFormData(prev => ({ ...prev, davaKonusu: konusu }));
        } catch (e: any) {
            setKonusuError(e.message || "Konu oluşturulamadı.");
        } finally {
            setIsGeneratingKonusu(false);
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Basic validation
        if (!formData.caseNumber || !formData.muvekkil || !formData.davaTuru || !formData.davaDurumu || !formData.acilisTarihi) {
            alert('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }
        onSave(formData);
    };
    
    const isNew = !dava.id;

    return (
        <Modal isOpen={true} onClose={onClose} title={isNew ? "Yeni Dava Ekle" : "Dava Bilgilerini Düzenle"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Dava Numarası</label>
                        <input type="text" name="caseNumber" value={formData.caseNumber || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Açılış Tarihi</label>
                        <input type="date" name="acilisTarihi" value={formData.acilisTarihi || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Müvekkil</label>
                        <input type="text" name="muvekkil" value={formData.muvekkil || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Karşı Taraf</label>
                        <input type="text" name="karsiTaraf" value={formData.karsiTaraf || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Dava Konusu</label>
                         <div className="relative mt-1">
                             <textarea name="davaKonusu" value={formData.davaKonusu || ''} onChange={handleChange} rows={2} className="block w-full border border-slate-300 rounded-lg shadow-sm p-2 pr-12" required />
                             <button 
                                type="button" 
                                onClick={handleGenerateDavaKonusu}
                                disabled={isGeneratingKonusu}
                                className="absolute top-1/2 right-2 -translate-y-1/2 p-1.5 text-purple-600 hover:bg-purple-100 rounded-full disabled:text-slate-400 disabled:cursor-not-allowed"
                                title="AI ile Dava Konusu Oluştur"
                            >
                                {isGeneratingKonusu ? (
                                    <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 1.9a2.5 2.5 0 0 0 0 3.5L12 10l1.9-1.9a2.5 2.5 0 0 0 0-3.5L12 3z"/><path d="m3 12 1.9 1.9a2.5 2.5 0 0 0 3.5 0L10 12l-1.9-1.9a2.5 2.5 0 0 0-3.5 0L3 12z"/><path d="m12 21 1.9-1.9a2.5 2.5 0 0 0 0-3.5L12 14l-1.9 1.9a2.5 2.5 0 0 0 0 3.5L12 21z"/><path d="m21 12-1.9-1.9a2.5 2.5 0 0 0-3.5 0L14 12l1.9 1.9a2.5 2.5 0 0 0 3.5 0L21 12z"/></svg>
                                )}
                            </button>
                        </div>
                        {konusuError && <p className="text-xs text-red-600 mt-1">{konusuError}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Dava Türü</label>
                        <select name="davaTuru" value={formData.davaTuru || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" required>
                            <option value="" disabled>Seçiniz...</option>
                            {Object.values(DavaTuru).map(tur => <option key={tur} value={tur}>{tur}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Dava Durumu</label>
                        <select name="davaDurumu" value={formData.davaDurumu || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" required>
                            <option value="" disabled>Seçiniz...</option>
                            {Object.values(DavaStatus).map(durum => <option key={durum} value={durum}>{durum}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Sorumlu Avukat</label>
                        <input type="text" name="sorumluAvukat" value={formData.sorumluAvukat || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Mahkeme</label>
                        <input type="text" name="mahkeme" value={formData.mahkeme || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50">İptal</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Kaydet</button>
                </div>
            </form>
        </Modal>
    )
};

export default HukukiYardim;