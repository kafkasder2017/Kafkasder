


import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Yetim, EgitimSeviyesi, DestekDurumu } from '../types';
import Modal from './Modal';
import { getYetimler, createYetim, updateYetim, deleteYetim } from '../services/apiService';

const getStatusClass = (status: DestekDurumu) => {
    return status === DestekDurumu.DESTEK_ALIYOR ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
};

const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};

const YetimYonetimi: React.FC = () => {
    const [orphans, setOrphans] = useState<Yetim[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<DestekDurumu | 'all'>('all');
    const [educationFilter, setEducationFilter] = useState<EgitimSeviyesi | 'all'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingYetim, setEditingYetim] = useState<Partial<Yetim> | null>(null);

    useEffect(() => {
        const fetchOrphans = async () => {
            setIsLoading(true);
            try {
                const data = await getYetimler();
                setOrphans(data);
                setError('');
            } catch (err: any) {
                setError(err.message || 'Yetim verileri yüklenemedi.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrphans();
    }, []);

    const filteredYetimler = useMemo(() => {
        return orphans.filter(yetim => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = yetim.adiSoyadi.toLowerCase().includes(lowerSearch) ||
                                  yetim.veliAdi.toLowerCase().includes(lowerSearch);
            const matchesStatus = statusFilter === 'all' || yetim.destekDurumu === statusFilter;
            const matchesEducation = educationFilter === 'all' || yetim.egitimSeviyesi === educationFilter;
            return matchesSearch && matchesStatus && matchesEducation;
        }).sort((a,b) => new Date(b.kayitTarihi).getTime() - new Date(a.kayitTarihi).getTime());
    }, [orphans, searchTerm, statusFilter, educationFilter]);

    const handleAddNewClick = () => {
        setEditingYetim({});
        setIsModalOpen(true);
    };

    const handleEditClick = (yetim: Yetim) => {
        setEditingYetim(yetim);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('Bu kaydı silmek istediğinizden emin misiniz?')) {
            try {
                await deleteYetim(id);
                setOrphans(orphans.filter(y => y.id !== id));
            } catch (err) {
                alert('Kayıt silinirken bir hata oluştu.');
            }
        }
    };
    
    const handleSaveYetim = async (yetimToSave: Partial<Yetim>) => {
        try {
            if (yetimToSave.id) {
                const updated = await updateYetim(yetimToSave.id, yetimToSave);
                setOrphans(orphans.map(y => y.id === updated.id ? updated : y));
            } else {
                const created = await createYetim(yetimToSave as Omit<Yetim, 'id'>);
                setOrphans([created, ...orphans]);
            }
            setIsModalOpen(false);
            setEditingYetim(null);
        } catch (err) {
            alert('Kayıt kaydedilirken bir hata oluştu.');
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
                            placeholder="Yetim veya veli adı..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                         <select 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={educationFilter}
                            onChange={(e) => setEducationFilter(e.target.value as EgitimSeviyesi | 'all')}
                         >
                            <option value="all">Tüm Eğitim Seviyeleri</option>
                            {Object.values(EgitimSeviyesi).map(seviye => <option key={seviye} value={seviye}>{seviye}</option>)}
                        </select>
                        <select 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as DestekDurumu | 'all')}
                        >
                            <option value="all">Tüm Destek Durumları</option>
                            {Object.values(DestekDurumu).map(durum => <option key={durum} value={durum}>{durum}</option>)}
                        </select>
                        <button onClick={handleAddNewClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            <span>Yeni Yetim Ekle</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Adı Soyadı</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Yaş / Cinsiyet</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Veli Bilgileri</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Eğitim Durumu</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Destek Durumu</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Kayıt Tarihi</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredYetimler.map((yetim) => (
                                <tr key={yetim.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{yetim.adiSoyadi}</td>
                                    <td className="px-6 py-4">
                                        <div>{calculateAge(yetim.dogumTarihi)}</div>
                                        <div className="text-xs text-slate-500">{yetim.cinsiyet}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>{yetim.veliAdi}</div>
                                        <div className="text-xs text-slate-500">{yetim.veliTelefonu}</div>
                                    </td>
                                     <td className="px-6 py-4">
                                        <div>{yetim.egitimSeviyesi}</div>
                                        <div className="text-xs text-slate-500">{yetim.okulAdi}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(yetim.destekDurumu)}`}>
                                            {yetim.destekDurumu}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{new Date(yetim.kayitTarihi).toLocaleDateString('tr-TR')}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-4">
                                            <ReactRouterDOM.Link to={`/yetimler/${yetim.id}`} className="text-blue-600 hover:text-blue-800 font-semibold">Detay</ReactRouterDOM.Link>
                                            <button onClick={() => handleEditClick(yetim)} className="text-yellow-600 hover:text-yellow-800 font-semibold">Düzenle</button>
                                            <button onClick={() => handleDeleteClick(yetim.id)} className="text-red-600 hover:text-red-800 font-semibold">Sil</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredYetimler.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>Arama kriterlerine uygun yetim kaydı bulunamadı.</p>
                    </div>
                )}
            </div>
            {isModalOpen && editingYetim && (
                <YetimFormModal 
                    yetim={editingYetim} 
                    onClose={() => { setIsModalOpen(false); setEditingYetim(null); }}
                    onSave={handleSaveYetim}
                />
            )}
        </>
    );
};


const YetimFormModal: React.FC<{ yetim: Partial<Yetim>; onClose: () => void; onSave: (yetim: Partial<Yetim>) => void; }> = ({ yetim, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Yetim>>(yetim);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isNew = !yetim.id;

    return (
        <Modal isOpen={true} onClose={onClose} title={isNew ? "Yeni Yetim Ekle" : "Yetim Bilgilerini Düzenle"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Adı Soyadı</label>
                        <input type="text" name="adiSoyadi" value={formData.adiSoyadi || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Doğum Tarihi</label>
                        <input type="date" name="dogumTarihi" value={formData.dogumTarihi || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Cinsiyet</label>
                        <select name="cinsiyet" value={formData.cinsiyet || 'Kız'} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" required>
                            <option value="Kız">Kız</option>
                            <option value="Erkek">Erkek</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Şehir</label>
                        <input type="text" name="sehir" value={formData.sehir || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" />
                    </div>
                    <div className="md:col-span-2 border-t pt-4 mt-2">
                         <h4 className="text-md font-semibold text-slate-800 mb-2">Veli Bilgileri</h4>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Veli Adı Soyadı</label>
                        <input type="text" name="veliAdi" value={formData.veliAdi || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Veli Telefonu</label>
                        <input type="tel" name="veliTelefonu" value={formData.veliTelefonu || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" />
                    </div>
                     <div className="md:col-span-2 border-t pt-4 mt-2">
                         <h4 className="text-md font-semibold text-slate-800 mb-2">Eğitim ve Destek Bilgileri</h4>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Eğitim Seviyesi</label>
                        <select name="egitimSeviyesi" value={formData.egitimSeviyesi || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(EgitimSeviyesi).map(seviye => <option key={seviye} value={seviye}>{seviye}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Okul Adı</label>
                        <input type="text" name="okulAdi" value={formData.okulAdi || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Destek Durumu</label>
                        <select name="destekDurumu" value={formData.destekDurumu || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(DestekDurumu).map(durum => <option key={durum} value={durum}>{durum}</option>)}
                        </select>
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

export default YetimYonetimi;