import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Kumbara, KumbaraStatus, KumbaraType, FinansalIslemTuru, HesapKategorisi, FinansalKayit } from '../types';
import Modal from './Modal';
import { createKumbara, updateKumbara, deleteKumbara, createFinansalKayit } from '../services/apiService';
import { useSupabaseQuery } from '../hooks/useData';
import toast from 'react-hot-toast';


const getStatusClass = (status: KumbaraStatus) => {
    return status === KumbaraStatus.AKTIF ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
};

const KumbaraYonetimi: React.FC = () => {
    const { data: kumbaralar, isLoading, error, refresh } = useSupabaseQuery<Kumbara>('kumbaralar');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<KumbaraStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<KumbaraType | 'all'>('all');

    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isBosaltModalOpen, setIsBosaltModalOpen] = useState(false);
    const [editingKumbara, setEditingKumbara] = useState<Partial<Kumbara> | null>(null);
    const [bosaltmaKumbara, setBosaltmaKumbara] = useState<Kumbara | null>(null);
    const [qrModalKumbara, setQrModalKumbara] = useState<Kumbara | null>(null);
    
    const filteredKumbaralar = useMemo(() => {
        return (kumbaralar || []).filter(kumbara => {
            const matchesSearch = kumbara.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  kumbara.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || kumbara.status === statusFilter;
            const matchesType = typeFilter === 'all' || kumbara.type === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        }).sort((a,b) => (a.id < b.id ? 1 : -1));
    }, [kumbaralar, searchTerm, statusFilter, typeFilter]);

    const handleAddNewClick = () => {
        setEditingKumbara({});
        setIsFormModalOpen(true);
    };
    
    const handleEditClick = (kumbara: Kumbara) => {
        setEditingKumbara(kumbara);
        setIsFormModalOpen(true);
    };

    const handleDeleteClick = async (id: number) => {
        if(window.confirm('Bu kumbarayı silmek istediğinizden emin misiniz?')) {
            const promise = deleteKumbara(id);
            toast.promise(promise, {
                loading: 'Kumbara siliniyor...',
                success: 'Kumbara başarıyla silindi!',
                error: 'Kumbara silinirken bir hata oluştu.',
            });
        }
    };

    const handleSaveKumbara = async (kumbaraToSave: Partial<Kumbara>) => {
        const isNew = !kumbaraToSave.id;
        const promise = new Promise<void>(async (resolve, reject) => {
            try {
                if (kumbaraToSave.id) { // Editing
                    await updateKumbara(kumbaraToSave.id, kumbaraToSave);
                } else { // Adding
                    const newKumbaraPayload = {
                        ...kumbaraToSave,
                        balance: 0,
                        lastEmptied: null,
                        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(kumbaraToSave.code!)}`
                    };
                    await createKumbara(newKumbaraPayload as Omit<Kumbara, 'id'>);
                }
                setIsFormModalOpen(false);
                setEditingKumbara(null);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
        
        toast.promise(promise, {
            loading: 'Kaydediliyor...',
            success: isNew ? 'Kumbara başarıyla eklendi!' : 'Kumbara başarıyla güncellendi!',
            error: 'Kumbara kaydedilirken bir hata oluştu.',
        });
    };

    const handleBosaltClick = (kumbara: Kumbara) => {
        setBosaltmaKumbara(kumbara);
        setIsBosaltModalOpen(true);
    };
    
    const handleSaveBosaltma = async (kumbaraId: number, toplananTutar: number) => {
        const kumbara = kumbaralar.find(k => k.id === kumbaraId);
        if(!kumbara) return;

        const promise = new Promise<void>(async (resolve, reject) => {
             try {
                const newFinansalKayit: Omit<FinansalKayit, 'id'> = {
                    tarih: new Date().toISOString().split('T')[0],
                    aciklama: `Kumbara Boşaltma: ${kumbara.code} - ${kumbara.location}`,
                    tur: FinansalIslemTuru.GELIR,
                    kategori: HesapKategorisi.BAGIS,
                    tutar: toplananTutar,
                };
                await createFinansalKayit(newFinansalKayit);
                await updateKumbara(kumbaraId, { balance: 0, lastEmptied: new Date().toISOString() });
                
                setIsBosaltModalOpen(false);
                setBosaltmaKumbara(null);
                resolve();
            } catch(err) {
                reject(err);
            }
        });

         toast.promise(promise, {
            loading: 'İşlem yapılıyor...',
            success: 'Kumbara boşaltıldı ve gelir olarak kaydedildi!',
            error: 'Kumbara boşaltma işlemi sırasında bir hata oluştu.',
        });
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
                        placeholder="Kod veya konuma göre ara..."
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center space-x-4">
                     <select 
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as KumbaraType | 'all')}
                     >
                        <option value="all">Tüm Tipler</option>
                        <option value={KumbaraType.BAGIS}>Bağış</option>
                        <option value={KumbaraType.OZEL_AMAC}>Özel Amaç</option>
                    </select>
                    <select 
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as KumbaraStatus | 'all')}
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value={KumbaraStatus.AKTIF}>Aktif</option>
                        <option value={KumbaraStatus.PASIF}>Pasif</option>
                    </select>
                    <button onClick={handleAddNewClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        <span>Yeni Kumbara Ekle</span>
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-500">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 font-semibold">Kod</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Konum</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Türü</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Bakiye</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Son Boşaltma</th>
                            <th scope="col" className="px-6 py-4 font-semibold">Durum</th>
                            <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {filteredKumbaralar.map((kumbara) => (
                            <tr key={kumbara.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{kumbara.code}</td>
                                <td className="px-6 py-4">
                                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(kumbara.location)}`}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-blue-600 hover:underline">
                                        {kumbara.location}
                                    </a>
                                </td>
                                <td className="px-6 py-4">{kumbara.type}</td>
                                <td className="px-6 py-4 font-semibold">{kumbara.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                <td className="px-6 py-4">{kumbara.lastEmptied ? new Date(kumbara.lastEmptied).toLocaleDateString('tr-TR') : 'Hiç'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(kumbara.status)}`}>
                                        {kumbara.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                        <button onClick={() => setQrModalKumbara(kumbara)} className="text-purple-600 hover:text-purple-800 font-semibold">QR Kod</button>
                                        <button onClick={() => handleBosaltClick(kumbara)} className="text-blue-600 hover:text-blue-800 font-semibold">Boşalt</button>
                                        <button onClick={() => handleEditClick(kumbara)} className="text-yellow-600 hover:text-yellow-800 font-semibold">Düzenle</button>
                                        <button onClick={() => handleDeleteClick(kumbara.id)} className="text-red-600 hover:text-red-800 font-semibold">Sil</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {filteredKumbaralar.length === 0 && (
                <div className="text-center py-10 text-slate-500">
                    <p>Arama kriterlerine uygun kumbara bulunamadı.</p>
                </div>
            )}
        </div>

        {isFormModalOpen && editingKumbara && (
            <KumbaraFormModal
                kumbara={editingKumbara}
                onClose={() => setIsFormModalOpen(false)}
                onSave={handleSaveKumbara}
            />
        )}
        
        {isBosaltModalOpen && bosaltmaKumbara && (
            <BosaltModal
                kumbara={bosaltmaKumbara}
                onClose={() => setIsBosaltModalOpen(false)}
                onSave={handleSaveBosaltma}
            />
        )}

        {qrModalKumbara && (
            <QrCodeModal
                kumbara={qrModalKumbara}
                onClose={() => setQrModalKumbara(null)}
            />
        )}
        </>
    );
};

// Modal for Adding/Editing a Kumbara
const KumbaraFormModal: React.FC<{ kumbara: Partial<Kumbara>, onClose: () => void, onSave: (kumbara: Partial<Kumbara>) => void}> = ({ kumbara, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Kumbara>>(kumbara);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!formData.code || !formData.location || !formData.type || !formData.status) {
            alert('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }
        onSave(formData as Kumbara);
    };

    const isNew = !kumbara.id;

    return (
        <Modal isOpen={true} onClose={onClose} title={isNew ? 'Yeni Kumbara Ekle' : 'Kumbara Bilgilerini Düzenle'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Kumbara Kodu</label>
                        <input type="text" name="code" value={formData.code || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Konum</label>
                        <input type="text" name="location" value={formData.location || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Türü</label>
                         <select name="type" value={formData.type || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(KumbaraType).map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Durum</label>
                         <select name="status" value={formData.status || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2 bg-white" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(KumbaraStatus).map(status => <option key={status} value={status}>{status}</option>)}
                        </select>
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

// Modal for the "Boşalt" action
const BosaltModal: React.FC<{ kumbara: Kumbara, onClose: () => void, onSave: (kumbaraId: number, toplananTutar: number) => void }> = ({ kumbara, onClose, onSave }) => {
    const [toplananTutar, setToplananTutar] = useState<number>(kumbara.balance);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(kumbara.id, toplananTutar);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`Kumbara Boşalt: ${kumbara.code}`}>
             <form onSubmit={handleSubmit} className="space-y-4">
                <p><strong>Konum:</strong> {kumbara.location}</p>
                <p>Mevcut Bakiye: <span className="font-bold">{kumbara.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span></p>
                 <div>
                    <label className="block text-sm font-medium text-slate-700">Toplanan Tutar (TL)</label>
                    <input 
                        type="number" 
                        value={toplananTutar} 
                        onChange={(e) => setToplananTutar(Number(e.target.value))} 
                        className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" 
                        step="0.01"
                        required 
                    />
                    <p className="text-xs text-slate-500 mt-1">Bu tutar yeni bir gelir kaydı olarak işlenecek ve kumbara bakiyesi sıfırlanacaktır.</p>
                </div>
                 <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50">İptal</button>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">Boşaltma İşlemini Onayla</button>
                 </div>
             </form>
        </Modal>
    );
};

// Modal for displaying QR code
const QrCodeModal: React.FC<{ kumbara: Kumbara, onClose: () => void }> = ({ kumbara, onClose }) => {
    const printAreaRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printAreaRef.current?.innerHTML;
        if (printContent) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>QR Kod Yazdır - ${kumbara.code}</title>
                            <style>
                                body { font-family: sans-serif; text-align: center; padding-top: 50px; }
                                img { max-width: 80%; }
                                h3 { font-size: 1.5rem; margin-bottom: 1rem; }
                                p { font-family: monospace; font-size: 1.2rem; }
                            </style>
                        </head>
                        <body>
                            ${printContent}
                            <script>
                                window.onload = function() {
                                    window.print();
                                    window.close();
                                }
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`QR Kod: ${kumbara.code}`}>
            <div className="text-center">
                <div ref={printAreaRef}>
                    <h3 className="text-xl font-bold mb-2">{kumbara.location}</h3>
                    <img src={kumbara.qrCodeUrl} alt={`QR Code for ${kumbara.code}`} className="mx-auto w-64 h-64 rounded-lg" />
                    <p className="font-mono mt-2 text-lg">{kumbara.code}</p>
                </div>
                 <div className="pt-4 mt-4 border-t flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50">Kapat</button>
                    <button type="button" onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2">
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        <span>Yazdır</span>
                    </button>
                 </div>
            </div>
        </Modal>
    );
};

export default KumbaraYonetimi;