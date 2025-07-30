import React, { useState, useMemo, useRef } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import toast from 'react-hot-toast';
import { Person, PersonStatus, MembershipType, Uyruk, KimlikTuru, YardimTuruDetay, SavedView, ExtractedKimlikData, KullaniciRol, ChatMessage, SponsorlukTipi, DosyaBaglantisi, RizaBeyaniStatus } from '../types';
import { createPerson, updatePerson, deletePerson } from '../services/apiService';
import { extractInfoFromDocumentImage, filterDataConversational } from '../services/geminiService';
import { usePeople } from '../hooks/useData';
import Modal from './Modal';
import CameraCaptureModal from './CameraCaptureModal';
import SmartChatModal from './SmartChatModal';

const getStatusClass = (status: PersonStatus) => {
    switch (status) {
        case PersonStatus.AKTIF: return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
        case PersonStatus.PASIF: return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
        case PersonStatus.BEKLEMEDE: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
        default: return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300';
    }
};

const KisiFormModal: React.FC<{
    person: Partial<Person> | null,
    onClose: () => void,
    onSave: (person: Partial<Person>) => void
}> = ({ person, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Person>>(person || { aldigiYardimTuru: [], uyruk: [] });
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMultiSelectChange = (field: 'uyruk' | 'aldigiYardimTuru', value: Uyruk | YardimTuruDetay) => {
        setFormData(prev => {
            const currentValues = (prev[field] as any[]) || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [field]: newValues };
        });
    };

    const handleCapture = async (dataUrl: string) => {
        setIsCameraOpen(false);
        setIsProcessing(true);
        try {
            const extractedData: ExtractedKimlikData = await extractInfoFromDocumentImage(dataUrl);
            setFormData(prev => ({
                ...prev,
                ad: extractedData.ad,
                soyad: extractedData.soyad,
                kimlikNo: extractedData.kimlikNo,
                dogumTarihi: extractedData.dogumTarihi,
            }));
            toast.success("Kimlik bilgileri başarıyla okundu!");
        } catch (error) {
            console.error(error);
            toast.error("Kimlik bilgileri okunurken bir hata oluştu.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const isNew = !person?.id;

    return (
        <>
            <Modal isOpen={true} onClose={onClose} title={isNew ? 'Yeni Kişi Ekle' : 'Kişi Bilgilerini Düzenle'}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsCameraOpen(true)}
                            disabled={isProcessing}
                            className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-4 py-2 rounded-lg font-semibold hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isProcessing
                                ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500"></div>
                                : <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path><circle cx="12" cy="13" r="3"></circle></svg>
                            }
                            <span>Kimlik Tara (AI)</span>
                        </button>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Ad</label>
                            <input type="text" name="ad" value={formData.ad || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Soyad</label>
                            <input type="text" name="soyad" value={formData.soyad || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Kimlik Numarası</label>
                            <input type="text" name="kimlikNo" value={formData.kimlikNo || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Cep Telefonu</label>
                            <input type="tel" name="cepTelefonu" value={formData.cepTelefonu || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Adres</label>
                            <textarea name="adres" value={formData.adres || ''} onChange={handleChange} rows={2} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Durum</label>
                            <select name="durum" value={formData.durum || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700" required>
                                <option value="" disabled>Seçiniz...</option>
                                {Object.values(PersonStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-4 py-2 rounded-lg font-semibold border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600">İptal</button>
                        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">Kaydet</button>
                    </div>
                </form>
            </Modal>
            {isCameraOpen && <CameraCaptureModal onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />}
        </>
    );
};


const KisiYonetimi: React.FC = () => {
    const { data: people, isLoading, error, refresh } = usePeople();

    const [filters, setFilters] = useState({
        searchTerm: '',
        statusFilter: 'all' as PersonStatus | 'all',
        nationalityFilter: 'all' as Uyruk | 'all',
        yardimTuruFilter: 'all' as YardimTuruDetay | 'all',
    });
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingPerson, setEditingPerson] = useState<Partial<Person> | null>(null);

    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [smartSearchResults, setSmartSearchResults] = useState<Person[] | null>(null);

    const displayedData = useMemo(() => {
        if (smartSearchResults !== null) {
            return smartSearchResults;
        }
        return people.filter(person => {
            const matchesSearch = `${person.ad} ${person.soyad}`.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                person.kimlikNo.includes(filters.searchTerm);
            const matchesStatus = filters.statusFilter === 'all' || person.durum === filters.statusFilter;
            const matchesNationality = filters.nationalityFilter === 'all' || person.uyruk.includes(filters.nationalityFilter as Uyruk);
            const matchesYardimTuru = filters.yardimTuruFilter === 'all' || person.aldigiYardimTuru?.includes(filters.yardimTuruFilter as YardimTuruDetay);

            return matchesSearch && matchesStatus && matchesNationality && matchesYardimTuru;
        });
    }, [people, filters, smartSearchResults]);
    
    const handleSavePerson = async (personToSave: Partial<Person>) => {
        const isNew = !personToSave.id;
        const promise = new Promise<void>(async (resolve, reject) => {
            try {
                if (personToSave.id) { // Editing
                    await updatePerson(personToSave.id, personToSave);
                } else { // Creating
                    const payload = {
                        ...personToSave,
                        kayitTarihi: new Date().toISOString(),
                        kaydiAcanBirim: "Panel",
                        dosyaBaglantisi: DosyaBaglantisi.DERNEK,
                        isKaydiSil: false,
                        uyruk: personToSave.uyruk || [Uyruk.TC],
                        kimlikTuru: personToSave.kimlikTuru || KimlikTuru.TC,
                        dogumTarihi: personToSave.dogumTarihi || '1900-01-01',
                        ulke: personToSave.ulke || 'Türkiye',
                        sehir: personToSave.sehir || '',
                        yerlesim: personToSave.yerlesim || '',
                        mahalle: personToSave.mahalle || '',
                        dosyaNumarasi: personToSave.dosyaNumarasi || `DN${Date.now()}`,
                        sponsorlukTipi: personToSave.sponsorlukTipi || SponsorlukTipi.YOK,
                        kayitDurumu: personToSave.kayitDurumu || 'Kaydedildi',
                        rizaBeyani: personToSave.rizaBeyani || RizaBeyaniStatus.ALINDI
                    } as Omit<Person, 'id'>;
                    await createPerson(payload);
                }
                setIsFormModalOpen(false);
                setEditingPerson(null);
                refresh(); // Refresh list
                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });

        toast.promise(promise, {
            loading: 'Kaydediliyor...',
            success: isNew ? 'Kişi başarıyla eklendi!' : 'Kişi başarıyla güncellendi!',
            error: 'Kişi kaydedilirken bir hata oluştu.',
        });
    };
    
    const handleDeletePerson = async (id: number) => {
        if (id === 9999) {
            toast.error("Bu özel test kaydı silinemez.");
            return;
        }
        if (window.confirm("Bu kişiyi silmek istediğinizden emin misiniz?")) {
            const promise = deletePerson(id);
            
            toast.promise(promise, {
                loading: 'Kişi siliniyor...',
                success: () => {
                    refresh(); // Refresh list
                    return 'Kişi başarıyla silindi!';
                },
                error: 'Kişi silinirken bir hata oluştu.',
            });
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearAllFilters = () => {
        setFilters({
            searchTerm: '', statusFilter: 'all', nationalityFilter: 'all', yardimTuruFilter: 'all'
        });
        setSmartSearchResults(null);
    };

    if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;

    return (
        <>
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700">
                 <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-4">
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Kişi Yönetimi</h2>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => setIsChatModalOpen(true)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2"
                        >
                            <span>Akıllı Sohbet Filtresi</span>
                        </button>
                        <button onClick={() => { setEditingPerson({}); setIsFormModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                             <span>Yeni Kişi Ekle</span>
                        </button>
                    </div>
                </div>

                 {smartSearchResults !== null && (
                    <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-sm text-purple-800 dark:text-purple-200">
                           Akıllı sohbet sonuçları gösteriliyor ({smartSearchResults.length} kayıt).
                        </span>
                        <button onClick={clearAllFilters} className="text-sm font-semibold text-purple-700 dark:text-purple-300 hover:underline">
                            Tüm Filtreleri Temizle
                        </button>
                    </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <input type="text" name="searchTerm" placeholder="Ad, Soyad, Kimlik No..." value={filters.searchTerm} onChange={handleFilterChange} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700" />
                    <select name="statusFilter" value={filters.statusFilter} onChange={handleFilterChange} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700">
                        <option value="all">Tüm Durumlar</option>
                        {Object.values(PersonStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select name="nationalityFilter" value={filters.nationalityFilter} onChange={handleFilterChange} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700">
                        <option value="all">Tüm Uyruklar</option>
                         {Object.values(Uyruk).map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                     <select name="yardimTuruFilter" value={filters.yardimTuruFilter} onChange={handleFilterChange} className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700">
                        <option value="all">Tüm Yardım Türleri</option>
                         {Object.values(YardimTuruDetay).map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
                        <thead className="text-xs text-zinc-700 dark:text-zinc-400 uppercase bg-zinc-50 dark:bg-zinc-700/50">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Ad Soyad</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Kimlik No</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Uyruk</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Şehir</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Durum</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                            </tr>
                        </thead>
                         <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {displayedData.map((person) => (
                                <tr key={person.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50">
                                    <td className="px-6 py-4 font-medium text-zinc-900 dark:text-zinc-100 whitespace-nowrap">{person.ad} {person.soyad}</td>
                                    <td className="px-6 py-4">{person.kimlikNo}</td>
                                    <td className="px-6 py-4">{person.uyruk.join(', ')}</td>
                                    <td className="px-6 py-4">{person.sehir}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(person.durum)}`}>{person.durum}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-4">
                                            <ReactRouterDOM.Link to={`/kisiler/${person.id}`} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold">Detay</ReactRouterDOM.Link>
                                            <button onClick={() => { setEditingPerson(person); setIsFormModalOpen(true); }} className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300 font-semibold">Düzenle</button>
                                            <button onClick={() => handleDeletePerson(person.id)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-semibold">Sil</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                 {displayedData.length === 0 && (
                    <div className="text-center py-10 text-zinc-500">
                        <p>Arama kriterlerine uygun kişi bulunamadı.</p>
                    </div>
                )}
            </div>

            {isFormModalOpen && (
                <KisiFormModal
                    person={editingPerson}
                    onClose={() => { setIsFormModalOpen(false); setEditingPerson(null); }}
                    onSave={handleSavePerson}
                />
            )}
             {isChatModalOpen && (
                <SmartChatModal<Person>
                    isOpen={isChatModalOpen}
                    onClose={() => setIsChatModalOpen(false)}
                    fullDataset={people}
                    onResults={(results) => setSmartSearchResults(results)}
                    entityName="kişi"
                    exampleQuery="Ankara'da yaşayan aktif Suriyeliler"
                />
            )}
        </>
    );
};
export default KisiYonetimi;