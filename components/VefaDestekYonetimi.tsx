import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { VefaDestek, VefaDestekTuru, VefaDestekDurumu } from '../types';
import Modal from './Modal';
import { getVefaDestekList, createVefaDestek, updateVefaDestek, deleteVefaDestek } from '../services/apiService';

const getStatusClass = (status: VefaDestekDurumu) => {
    return status === VefaDestekDurumu.AKTIF ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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


const VefaDestekYonetimi: React.FC = () => {
    const [vefaDestekList, setVefaDestekList] = useState<VefaDestek[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<VefaDestekDurumu | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<VefaDestekTuru | 'all'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVefa, setEditingVefa] = useState<Partial<VefaDestek> | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError('');
            try {
                const data = await getVefaDestekList();
                setVefaDestekList(data);
            } catch (err: any) {
                setError(err.message || "Vefa Destek verileri yüklenemedi.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredVefaList = useMemo(() => {
        return vefaDestekList.filter(vefa => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = vefa.adiSoyadi.toLowerCase().includes(lowerSearch) ||
                                  vefa.sorumluGonullu.toLowerCase().includes(lowerSearch);
            const matchesStatus = statusFilter === 'all' || vefa.destekDurumu === statusFilter;
            const matchesType = typeFilter === 'all' || vefa.destekTuru === typeFilter;
            return matchesSearch && matchesType && matchesStatus;
        }).sort((a,b) => new Date(b.kayitTarihi).getTime() - new Date(a.kayitTarihi).getTime());
    }, [vefaDestekList, searchTerm, statusFilter, typeFilter]);

    const handleAddNewClick = () => {
        setEditingVefa({});
        setIsModalOpen(true);
    };

    const handleEditClick = (vefa: VefaDestek) => {
        setEditingVefa(vefa);
        setIsModalOpen(true);
    };
    
    const handleDeleteClick = async (id: number) => {
        if (window.confirm('Bu Vefa Destek kaydını silmek istediğinizden emin misiniz?')) {
            try {
                await deleteVefaDestek(id);
                setVefaDestekList(vefaDestekList.filter(v => v.id !== id));
            } catch (err) {
                alert("Kayıt silinirken hata oluştu.");
            }
        }
    };

    const handleSaveVefa = async (vefaToSave: Partial<VefaDestek>) => {
        try {
            if (vefaToSave.id) { // Editing existing
                const updated = await updateVefaDestek(vefaToSave.id, vefaToSave);
                setVefaDestekList(vefaDestekList.map(v => v.id === updated.id ? updated : v));
            } else { // Adding new
                const newVefaPayload: Omit<VefaDestek, 'id'> = { 
                    ...vefaToSave, 
                    kayitTarihi: new Date().toISOString().split('T')[0] 
                } as Omit<VefaDestek, 'id'>;
                const created = await createVefaDestek(newVefaPayload);
                setVefaDestekList([created, ...vefaDestekList]);
            }
            setIsModalOpen(false);
            setEditingVefa(null);
        } catch (err) {
            alert("Kayıt kaydedilirken bir hata oluştu.");
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
                            placeholder="Ad, soyad veya sorumlu ara..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                         <select 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as VefaDestekTuru | 'all')}
                         >
                            <option value="all">Tüm Destek Türleri</option>
                            {Object.values(VefaDestekTuru).map(tur => <option key={tur} value={tur}>{tur}</option>)}
                        </select>
                        <select 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as VefaDestekDurumu | 'all')}
                        >
                            <option value="all">Tüm Destek Durumları</option>
                            {Object.values(VefaDestekDurumu).map(durum => <option key={durum} value={durum}>{durum}</option>)}
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
                                <th scope="col" className="px-6 py-4 font-semibold">Adı Soyadı</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Yaş</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Destek Türü</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Sorumlu Gönüllü</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Destek Durumu</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredVefaList.map((vefa) => (
                                <tr key={vefa.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{vefa.adiSoyadi}</td>
                                    <td className="px-6 py-4">{calculateAge(vefa.dogumTarihi)}</td>
                                    <td className="px-6 py-4">{vefa.destekTuru}</td>
                                    <td className="px-6 py-4">{vefa.sorumluGonullu}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(vefa.destekDurumu)}`}>
                                            {vefa.destekDurumu}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-4">
                                            <ReactRouterDOM.Link to={`/vefa-destek/${vefa.id}`} className="text-blue-600 hover:text-blue-800 font-semibold">Detay</ReactRouterDOM.Link>
                                            <button onClick={() => handleEditClick(vefa)} className="text-yellow-600 hover:text-yellow-800 font-semibold">Düzenle</button>
                                            <button onClick={() => handleDeleteClick(vefa.id)} className="text-red-600 hover:text-red-800 font-semibold">Sil</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredVefaList.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>Arama kriterlerine uygun Vefa Destek kaydı bulunamadı.</p>
                    </div>
                )}
            </div>
            {isModalOpen && editingVefa && (
                <VefaFormModal 
                    vefa={editingVefa} 
                    onClose={() => { setIsModalOpen(false); setEditingVefa(null); }}
                    onSave={handleSaveVefa}
                />
            )}
        </>
    );
};


const VefaFormModal: React.FC<{ vefa: Partial<VefaDestek>; onClose: () => void; onSave: (vefa: Partial<VefaDestek>) => void; }> = ({ vefa, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<VefaDestek>>(vefa);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.adiSoyadi || !formData.dogumTarihi || !formData.destekTuru || !formData.destekDurumu || !formData.sorumluGonullu) {
            alert('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }
        onSave(formData as VefaDestek);
    };

    const isNew = !vefa.id;

    return (
        <Modal isOpen={true} onClose={onClose} title={isNew ? "Yeni Vefa Destek Kaydı" : "Vefa Destek Bilgilerini Düzenle"}>
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
                        <label className="block text-sm font-medium text-slate-700">Telefon</label>
                         <input type="tel" name="telefon" value={formData.telefon || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Sorumlu Gönüllü</label>
                        <input type="text" name="sorumluGonullu" value={formData.sorumluGonullu || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Adres</label>
                        <textarea name="adres" value={formData.adres || ''} onChange={handleChange} rows={2} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2"></textarea>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Destek Türü</label>
                        <select name="destekTuru" value={formData.destekTuru || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(VefaDestekTuru).map(tur => <option key={tur} value={tur}>{tur}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Destek Durumu</label>
                        <select name="destekDurumu" value={formData.destekDurumu || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(VefaDestekDurumu).map(durum => <option key={durum} value={durum}>{durum}</option>)}
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

export default VefaDestekYonetimi;