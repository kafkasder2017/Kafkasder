
import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Kurum, Person, KurumTuru, PersonStatus } from '../types';
import { getKurumlar, createKurum, updateKurum, deleteKurum, getPeople } from '../services/apiService';
import Modal from './Modal';

const getStatusClass = (status: PersonStatus) => {
    switch (status) {
        case PersonStatus.AKTIF: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case PersonStatus.PASIF: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case PersonStatus.BEKLEMEDE: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300';
    }
};

const KurumYonetimi: React.FC = () => {
    const [kurumlar, setKurumlar] = useState<Kurum[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<PersonStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<KurumTuru | 'all'>('all');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingKurum, setEditingKurum] = useState<Partial<Kurum> | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [kurumlarData, peopleData] = await Promise.all([getKurumlar(), getPeople()]);
            setKurumlar(kurumlarData);
            setPeople(peopleData);
        } catch (err: any) {
            setError(err.message || 'Kurum verileri yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const peopleMap = useMemo(() => new Map(people.map(p => [p.id, `${p.ad} ${p.soyad}`])), [people]);

    const filteredKurumlar = useMemo(() => {
        return kurumlar.filter(kurum => {
            const lowerSearch = searchTerm.toLowerCase();
            const matchesSearch = kurum.resmiUnvan.toLowerCase().includes(lowerSearch) ||
                (kurum.kisaAd && kurum.kisaAd.toLowerCase().includes(lowerSearch)) ||
                (kurum.vergiNumarasi && kurum.vergiNumarasi.includes(lowerSearch));
            const matchesStatus = statusFilter === 'all' || kurum.status === statusFilter;
            const matchesType = typeFilter === 'all' || kurum.kurumTuru === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [kurumlar, searchTerm, statusFilter, typeFilter]);

    const handleAddNewClick = () => {
        setEditingKurum({});
        setIsModalOpen(true);
    };

    const handleEditClick = (kurum: Kurum) => {
        setEditingKurum(kurum);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if (window.confirm('Bu kurumu silmek istediğinizden emin misiniz?')) {
            try {
                await deleteKurum(id);
                fetchData();
            } catch (err) {
                alert('Kurum silinirken bir hata oluştu.');
            }
        }
    };

    const handleSave = async (kurumToSave: Partial<Kurum>) => {
        try {
            if (kurumToSave.id) {
                await updateKurum(kurumToSave.id, kurumToSave);
            } else {
                const payload = { ...kurumToSave, kayitTarihi: new Date().toISOString().split('T')[0] };
                await createKurum(payload as Omit<Kurum, 'id'>);
            }
            fetchData();
            setIsModalOpen(false);
            setEditingKurum(null);
        } catch (err) {
            alert('Kurum kaydedilirken bir hata oluştu.');
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;

    return (
        <>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6">
                    <input
                        type="text"
                        placeholder="Kurum adı veya vergi no ile ara..."
                        className="w-full md:w-1/3 px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex items-center space-x-4">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as KurumTuru | 'all')}
                            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700"
                        >
                            <option value="all">Tüm Kurum Türleri</option>
                            {Object.values(KurumTuru).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as PersonStatus | 'all')}
                            className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700"
                        >
                            <option value="all">Tüm Durumlar</option>
                            {Object.values(PersonStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button onClick={handleAddNewClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            <span>Yeni Kurum Ekle</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
                        <thead className="text-xs text-zinc-700 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Kurum Ünvanı</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Kurum Türü</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Yetkili Kişi</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Telefon</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Durum</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {filteredKurumlar.map(kurum => (
                                <tr key={kurum.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100">{kurum.resmiUnvan}</td>
                                    <td className="px-6 py-4">{kurum.kurumTuru}</td>
                                    <td className="px-6 py-4">{kurum.yetkiliKisiId ? peopleMap.get(kurum.yetkiliKisiId) : '-'}</td>
                                    <td className="px-6 py-4">{kurum.telefon}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(kurum.status)}`}>{kurum.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-3">
                                            <button onClick={() => handleEditClick(kurum)} className="text-yellow-600 hover:text-yellow-800 font-semibold">Düzenle</button>
                                            <button onClick={() => handleDeleteClick(kurum.id)} className="text-red-600 hover:text-red-800 font-semibold">Sil</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredKurumlar.length === 0 && (
                        <div className="text-center py-10 text-zinc-500">
                            <p>Arama kriterlerine uygun kurum bulunamadı.</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <KurumFormModal
                    kurum={editingKurum}
                    people={people}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                />
            )}
        </>
    );
};

interface KurumFormModalProps {
    kurum: Partial<Kurum> | null;
    people: Person[];
    onClose: () => void;
    onSave: (kurum: Partial<Kurum>) => void;
}

const KurumFormModal: React.FC<KurumFormModalProps> = ({ kurum, people, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Kurum>>(kurum || {});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isNew = !kurum?.id;

    return (
        <Modal isOpen={true} onClose={onClose} title={isNew ? 'Yeni Kurum Ekle' : 'Kurum Bilgilerini Düzenle'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Resmi Ünvan</label>
                        <input type="text" name="resmiUnvan" value={formData.resmiUnvan || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Kısa Ad</label>
                        <input type="text" name="kisaAd" value={formData.kisaAd || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Kurum Türü</label>
                        <select name="kurumTuru" value={formData.kurumTuru || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700" required>
                            <option value="" disabled>Seçiniz...</option>
                            {Object.values(KurumTuru).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Durum</label>
                        <select name="status" value={formData.status || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700" required>
                            <option value="" disabled>Seçiniz...</option>
                            {Object.values(PersonStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Vergi Dairesi</label>
                        <input type="text" name="vergiDairesi" value={formData.vergiDairesi || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Vergi Numarası</label>
                        <input type="text" name="vergiNumarasi" value={formData.vergiNumarasi || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Telefon</label>
                        <input type="tel" name="telefon" value={formData.telefon || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">E-posta</label>
                        <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Adres</label>
                        <textarea name="adres" value={formData.adres || ''} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" required />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Yetkili Kişi</label>
                        <select name="yetkiliKisiId" value={formData.yetkiliKisiId || ''} onChange={e => setFormData(p => ({...p, yetkiliKisiId: Number(e.target.value) || undefined}))} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700">
                            <option value="">Yok</option>
                            {people.map(p => <option key={p.id} value={p.id}>{p.ad} {p.soyad}</option>)}
                        </select>
                    </div>
                </div>
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-4 py-2 rounded-lg font-semibold border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600">İptal</button>
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Kaydet</button>
                </div>
            </form>
        </Modal>
    );
};

export default KurumYonetimi;