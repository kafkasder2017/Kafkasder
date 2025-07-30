import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { OgrenciBursu, BursTuru, BursDurumu } from '../types';
import Modal from './Modal';
import { getOgrenciBurslari, createOgrenciBursu, updateOgrenciBursu, deleteOgrenciBursu } from '../services/apiService';

const getStatusClass = (status: BursDurumu) => {
    switch (status) {
        case BursDurumu.AKTIF: return 'bg-green-100 text-green-800';
        case BursDurumu.TAMAMLANDI: return 'bg-blue-100 text-blue-800';
        case BursDurumu.IPTAL_EDILDI: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const OgrenciBurslari: React.FC = () => {
    const [scholarships, setScholarships] = useState<OgrenciBursu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<BursDurumu | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<BursTuru | 'all'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBurs, setEditingBurs] = useState<Partial<OgrenciBursu> | null>(null);

    useEffect(() => {
        const fetchScholarships = async () => {
            setIsLoading(true);
            try {
                const data = await getOgrenciBurslari();
                setScholarships(data);
                setError('');
            } catch (err: any) {
                setError(err.message || 'Burs verileri yüklenemedi.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchScholarships();
    }, []);

    const filteredBurslar = useMemo(() => {
        return scholarships.filter(burs => {
            const matchesSearch = burs.ogrenciAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  burs.okulAdi.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || burs.durum === statusFilter;
            const matchesType = typeFilter === 'all' || burs.bursTuru === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [scholarships, searchTerm, statusFilter, typeFilter]);

    const handleAddNewClick = () => {
        setEditingBurs({});
        setIsModalOpen(true);
    };

    const handleEditClick = (burs: OgrenciBursu) => {
        setEditingBurs(burs);
        setIsModalOpen(true);
    };

    const handleSaveBurs = async (bursToSave: Partial<OgrenciBursu>) => {
        try {
            if (bursToSave.id) {
                const updated = await updateOgrenciBursu(bursToSave.id, bursToSave);
                setScholarships(scholarships.map(b => b.id === updated.id ? updated : b));
            } else {
                const created = await createOgrenciBursu(bursToSave as Omit<OgrenciBursu, 'id'>);
                setScholarships([created, ...scholarships]);
            }
            setIsModalOpen(false);
            setEditingBurs(null);
        } catch (err) {
            alert('Burs kaydedilirken bir hata oluştu.');
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6">
                    <div className="w-full md:w-1/3">
                        <input
                            type="text"
                            placeholder="Öğrenci veya okul adı..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <select 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as BursTuru | 'all')}
                        >
                            <option value="all">Tüm Burs Tipleri</option>
                            {Object.values(BursTuru).map(tur => <option key={tur} value={tur}>{tur}</option>)}
                        </select>
                        <select 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as BursDurumu | 'all')}
                        >
                            <option value="all">Tüm Durumlar</option>
                            {Object.values(BursDurumu).map(durum => <option key={durum} value={durum}>{durum}</option>)}
                        </select>
                        <button onClick={handleAddNewClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            <span>Yeni Burs Başvurusu</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Öğrenci Adı</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Okul / Bölüm</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Burs Türü</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Aylık Tutar</th>
                                <th scope="col" className="px-6 py-4 font-semibold">GPA</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Süre</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Durum</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredBurslar.map((burs) => (
                                <tr key={burs.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{burs.ogrenciAdi}</td>
                                    <td className="px-6 py-4">
                                        <div>{burs.okulAdi}</div>
                                        <div className="text-xs text-slate-500">{burs.bolum}</div>
                                    </td>
                                    <td className="px-6 py-4">{burs.bursTuru}</td>
                                    <td className="px-6 py-4 font-semibold">{burs.bursMiktari.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                    <td className="px-6 py-4">{typeof burs.gpa === 'number' ? burs.gpa.toFixed(2) : 'N/A'}</td>
                                    <td className="px-6 py-4 text-xs">
                                        {new Date(burs.baslangicTarihi).toLocaleDateString('tr-TR')} - {new Date(burs.bitisTarihi).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(burs.durum)}`}>
                                            {burs.durum}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-4">
                                            <ReactRouterDOM.Link to={`/burslar/${burs.id}`} className="text-blue-600 hover:text-blue-800 font-semibold">Detaylar</ReactRouterDOM.Link>
                                            <button onClick={() => handleEditClick(burs)} className="text-yellow-600 hover:text-yellow-800 font-semibold">Düzenle</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredBurslar.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>Arama kriterlerine uygun burs bulunamadı.</p>
                    </div>
                )}
            </div>
            {isModalOpen && editingBurs && (
                <BursFormModal
                    burs={editingBurs}
                    onClose={() => { setIsModalOpen(false); setEditingBurs(null); }}
                    onSave={handleSaveBurs}
                />
            )}
        </>
    );
};

const BursFormModal: React.FC<{ burs: Partial<OgrenciBursu>; onClose: () => void; onSave: (burs: Partial<OgrenciBursu>) => void; }> = ({ burs, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<OgrenciBursu>>(burs);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const isNumeric = ['bursMiktari', 'gpa'].includes(name);
        setFormData(prev => ({ ...prev, [name]: isNumeric ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };
    
    const isNew = !burs.id;

    return (
        <Modal isOpen={true} onClose={onClose} title={isNew ? "Yeni Burs Başvurusu Ekle" : "Burs Bilgilerini Düzenle"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Öğrenci Adı</label>
                        <input type="text" name="ogrenciAdi" value={formData.ogrenciAdi || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Okul Adı</label>
                        <input type="text" name="okulAdi" value={formData.okulAdi || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Bölüm</label>
                        <input type="text" name="bolum" value={formData.bolum || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Burs Türü</label>
                        <select name="bursTuru" value={formData.bursTuru || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(BursTuru).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Durum</label>
                        <select name="durum" value={formData.durum || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(BursDurumu).map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Aylık Burs Miktarı (TL)</label>
                        <input type="number" name="bursMiktari" value={formData.bursMiktari || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Genel Not Ortalaması (GPA)</label>
                        <input type="number" name="gpa" step="0.01" min="0" max="4" value={formData.gpa || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Başlangıç Tarihi</label>
                        <input type="date" name="baslangicTarihi" value={formData.baslangicTarihi || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Bitiş Tarihi</label>
                        <input type="date" name="bitisTarihi" value={formData.bitisTarihi || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
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


export default OgrenciBurslari;