
import React, { useState, useMemo, useEffect } from 'react';
import { Hizmet, Person, HizmetTuru, HizmetDurumu } from '../types';
import { getHizmetler, createHizmet, updateHizmet, deleteHizmet, getPeople } from '../services/apiService';
import Modal from './Modal';

// Helper functions for styling
const getStatusClass = (status: HizmetDurumu) => {
    switch (status) {
        case HizmetDurumu.TAMAMLANDI: return 'bg-green-100 text-green-800';
        case HizmetDurumu.PLANLANDI: return 'bg-yellow-100 text-yellow-800';
        case HizmetDurumu.IPTAL_EDILDI: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const HizmetTakipYonetimi: React.FC = () => {
    const [hizmetler, setHizmetler] = useState<Hizmet[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<HizmetDurumu | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<HizmetTuru | 'all'>('all');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHizmet, setEditingHizmet] = useState<Partial<Hizmet> | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [hizmetlerData, peopleData] = await Promise.all([
                getHizmetler(),
                getPeople()
            ]);
            setHizmetler(hizmetlerData);
            setPeople(peopleData);
        } catch (err: any) {
            setError(err.message || "Hizmet verileri yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const peopleMap = useMemo(() => new Map(people.map(p => [p.id, `${p.ad} ${p.soyad}`])), [people]);
    
    const filteredHizmetler = useMemo(() => {
        return hizmetler.filter(hizmet => {
            const kisiAdi = peopleMap.get(hizmet.kisiId)?.toLowerCase() || '';
            const matchesSearch = kisiAdi.includes(searchTerm.toLowerCase()) || 
                                  hizmet.hizmetVeren.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || hizmet.durum === statusFilter;
            const matchesType = typeFilter === 'all' || hizmet.hizmetTuru === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [hizmetler, peopleMap, searchTerm, statusFilter, typeFilter]);
    
    const handleAddNewClick = () => {
        setEditingHizmet({ durum: HizmetDurumu.PLANLANDI, tarih: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const handleEditClick = (hizmet: Hizmet) => {
        setEditingHizmet(hizmet);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if(window.confirm('Bu hizmet kaydını silmek istediğinizden emin misiniz?')) {
            try {
                await deleteHizmet(id);
                setHizmetler(prev => prev.filter(h => h.id !== id));
            } catch (err) {
                alert("Hizmet kaydı silinirken hata oluştu.");
            }
        }
    };
    
    const handleSaveHizmet = async (hizmetToSave: Partial<Hizmet>) => {
        try {
            if (hizmetToSave.id) {
                const updated = await updateHizmet(hizmetToSave.id, hizmetToSave);
                setHizmetler(prev => prev.map(h => h.id === updated.id ? updated : h));
            } else {
                const created = await createHizmet(hizmetToSave as Omit<Hizmet, 'id'>);
                setHizmetler(prev => [created, ...prev]);
            }
            setIsModalOpen(false);
            setEditingHizmet(null);
        } catch (err) {
            alert("Hizmet kaydedilirken bir hata oluştu.");
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
                            placeholder="Kişi veya hizmet veren ara..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                         <select 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as HizmetTuru | 'all')}
                         >
                            <option value="all">Tüm Hizmet Türleri</option>
                            {Object.values(HizmetTuru).map(tur => <option key={tur} value={tur}>{tur}</option>)}
                        </select>
                        <select 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as HizmetDurumu | 'all')}
                        >
                            <option value="all">Tüm Durumlar</option>
                            {Object.values(HizmetDurumu).map(durum => <option key={durum} value={durum}>{durum}</option>)}
                        </select>
                        <button onClick={handleAddNewClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            <span>Yeni Hizmet Kaydı</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Hizmet Alan Kişi</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Hizmet Türü / Veren</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Açıklama</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Tarih</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Durum</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredHizmetler.map((hizmet) => (
                                <tr key={hizmet.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{peopleMap.get(hizmet.kisiId) || 'Bilinmeyen Kişi'}</td>
                                    <td className="px-6 py-4">
                                        <div>{hizmet.hizmetTuru}</div>
                                        <div className="text-xs text-slate-500">{hizmet.hizmetVeren}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 max-w-xs truncate">{hizmet.aciklama}</td>
                                    <td className="px-6 py-4">{new Date(hizmet.tarih).toLocaleDateString('tr-TR')}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(hizmet.durum)}`}>
                                            {hizmet.durum}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-4">
                                            <button onClick={() => handleEditClick(hizmet)} className="text-yellow-600 hover:text-yellow-800 font-semibold">Düzenle</button>
                                            <button onClick={() => handleDeleteClick(hizmet.id)} className="text-red-600 hover:text-red-800 font-semibold">Sil</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {filteredHizmetler.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>Arama kriterlerine uygun hizmet kaydı bulunamadı.</p>
                    </div>
                )}
            </div>
            {isModalOpen && editingHizmet && (
                <HizmetFormModal 
                    hizmet={editingHizmet} 
                    people={people}
                    onClose={() => { setIsModalOpen(false); setEditingHizmet(null); }}
                    onSave={handleSaveHizmet}
                />
            )}
        </>
    );
};


const HizmetFormModal: React.FC<{ 
    hizmet: Partial<Hizmet>;
    people: Person[];
    onClose: () => void; 
    onSave: (hizmet: Partial<Hizmet>) => void; 
}> = ({ hizmet, people, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Hizmet>>(hizmet);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isNew = !hizmet.id;

    return (
        <Modal isOpen={true} onClose={onClose} title={isNew ? "Yeni Hizmet Kaydı" : "Hizmet Kaydını Düzenle"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Hizmet Alan Kişi</label>
                        <select name="kisiId" value={formData.kisiId || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                            <option value="" disabled>Kişi Seçin...</option>
                            {people.map(p => <option key={p.id} value={p.id}>{p.ad} {p.soyad}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Hizmet Türü</label>
                        <select name="hizmetTuru" value={formData.hizmetTuru || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(HizmetTuru).map(tur => <option key={tur} value={tur}>{tur}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Hizmeti Veren</label>
                        <input type="text" name="hizmetVeren" value={formData.hizmetVeren || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" placeholder="örn. Gönüllü Avukat Ahmet Y." required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tarih</label>
                        <input type="date" name="tarih" value={formData.tarih || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Durum</label>
                        <select name="durum" value={formData.durum || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(HizmetDurumu).map(durum => <option key={durum} value={durum}>{durum}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Açıklama</label>
                        <textarea name="aciklama" value={formData.aciklama || ''} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" placeholder="Verilen hizmetin detayı..."></textarea>
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

export default HizmetTakipYonetimi;
