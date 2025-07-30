import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DepoUrunu, DepoUrunKategorisi, DepoUrunBirimi, StokTahmini } from '../types';
import Modal from './Modal';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { predictStockNeeds } from '../services/geminiService';
import { getDepoUrunleri, createDepoUrunu, updateDepoUrunu } from '../services/apiService';

declare var JsBarcode: any;

const getRowClass = (urun: DepoUrunu) => {
    if (urun.quantity <= urun.minStockLevel) return 'bg-red-50 hover:bg-red-100';
    if (urun.quantity <= urun.minStockLevel * 1.2) return 'bg-yellow-50 hover:bg-yellow-100';
    return 'hover:bg-slate-50';
};

const getExpirationInfo = (expirationDate?: string) => {
    if (!expirationDate) return { text: 'Yok', className: 'text-slate-500' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const formattedDate = expDate.toLocaleDateString('tr-TR');

    if (diffDays < 0) {
        return { text: `${formattedDate}`, className: 'text-red-600 font-bold', expired: true };
    }
    if (diffDays <= 30) {
        return { text: `${formattedDate}`, className: 'text-yellow-600 font-bold', expired: false };
    }
    return { text: formattedDate, className: 'text-slate-700', expired: false };
};

const StokYonetimi: React.FC = () => {
    const [depo, setDepo] = useState<DepoUrunu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<DepoUrunKategorisi | 'all'>('all');
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingUrun, setEditingUrun] = useState<Partial<DepoUrunu> | null>(null);
    const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
    const [isBarcodePrintModalOpen, setIsBarcodePrintModalOpen] = useState(false);
    const [printingUrun, setPrintingUrun] = useState<DepoUrunu | null>(null);
    const [isPredictionModalOpen, setIsPredictionModalOpen] = useState(false);

    const fetchDepoData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const data = await getDepoUrunleri();
            setDepo(data);
        } catch (err: any) {
            setError(err.message || 'Depo ürünleri yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchDepoData();
    }, []);

    const filteredDepo = useMemo(() => {
        return depo.filter(urun => {
            const lowerSearchTerm = searchTerm.toLowerCase();
            const matchesSearch = urun.name.toLowerCase().includes(lowerSearchTerm) ||
                                  urun.code.toLowerCase().includes(lowerSearchTerm) ||
                                  (urun.barcode && urun.barcode.includes(lowerSearchTerm));
            const matchesCategory = categoryFilter === 'all' || urun.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [depo, searchTerm, categoryFilter]);
    
    const handleAddNewClick = () => {
        setEditingUrun({} as DepoUrunu);
        setIsFormModalOpen(true);
    };

    const handleEditClick = (urun: DepoUrunu) => {
        setEditingUrun(urun);
        setIsFormModalOpen(true);
    };

    const handlePrintBarcodeClick = (urun: DepoUrunu) => {
        setPrintingUrun(urun);
        setIsBarcodePrintModalOpen(true);
    };

    const handleBarcodeScan = (code: string) => {
        setSearchTerm(code);
        setIsScannerModalOpen(false);
    };

    const handleSaveUrun = async (urunToSave: Partial<DepoUrunu>) => {
        try {
            if (urunToSave.id) { 
                const updated = await updateDepoUrunu(urunToSave.id, urunToSave);
                setDepo(depo.map(u => u.id === updated.id ? updated : u));
            } else {
                const payload = { ...urunToSave, lastUpdated: new Date().toISOString().split('T')[0] };
                const created = await createDepoUrunu(payload as Omit<DepoUrunu, 'id'>);
                setDepo([created, ...depo]);
            }
            setIsFormModalOpen(false);
            setEditingUrun(null);
        } catch(err) {
            alert('Ürün kaydedilirken bir hata oluştu.');
        }
    };
    
    if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6">
                    <div className="w-full md:w-1/3 flex space-x-2">
                        <input
                            type="text"
                            placeholder="Kod, ürün adı veya barkod ile ara..."
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         <button onClick={() => setIsScannerModalOpen(true)} className="p-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100" title="Barkod Tara">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></svg>
                        </button>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => setIsPredictionModalOpen(true)} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 1.9a2.5 2.5 0 0 0 0 3.5L12 10l1.9-1.9a2.5 2.5 0 0 0 0-3.5L12 3z"/><path d="m3 12 1.9 1.9a2.5 2.5 0 0 0 3.5 0L10 12l-1.9-1.9a2.5 2.5 0 0 0-3.5 0L3 12z"/><path d="m12 21 1.9-1.9a2.5 2.5 0 0 0 0-3.5L12 14l-1.9 1.9a2.5 2.5 0 0 0 0 3.5L12 21z"/></svg>
                            <span>AI Stok Öngörüleri</span>
                        </button>
                        <button onClick={handleAddNewClick} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            <span>Yeni Ürün Ekle</span>
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold">Ürün Adı / Kodu</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Barkod</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Kategori</th>
                                <th scope="col" className="px-6 py-4 font-semibold">Miktar</th>
                                <th scope="col" className="px-6 py-4 font-semibold">SKT</th>
                                <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredDepo.map((urun) => {
                                const expInfo = getExpirationInfo(urun.expirationDate);
                                return (
                                <tr key={urun.id} className={`${getRowClass(urun)} transition-colors duration-200`}>
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        <div>{urun.name}</div>
                                        <div className="text-xs text-slate-500">{urun.code}</div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{urun.barcode || '-'}</td>
                                    <td className="px-6 py-4">{urun.category}</td>
                                    <td className="px-6 py-4 font-semibold">{urun.quantity} {urun.unit}</td>
                                    <td className={`px-6 py-4 ${expInfo.className}`}>
                                        {expInfo.text}
                                        {expInfo.expired && <div className="text-xs font-normal">SKT GEÇMİŞ</div>}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-3">
                                            <button onClick={() => handlePrintBarcodeClick(urun)} className="text-purple-600 hover:text-purple-800 font-semibold">Barkod</button>
                                            <button onClick={() => handleEditClick(urun)} className="text-yellow-600 hover:text-yellow-800 font-semibold">Düzenle</button>
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                {filteredDepo.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>Arama kriterlerine uygun ürün bulunamadı.</p>
                    </div>
                )}
            </div>
            
            {isFormModalOpen && editingUrun && (
                <UrunFormModal
                    urun={editingUrun}
                    onClose={() => { setIsFormModalOpen(false); setEditingUrun(null); }}
                    onSave={handleSaveUrun}
                />
            )}

            {isScannerModalOpen && (
                <BarcodeScannerModal 
                    onClose={() => setIsScannerModalOpen(false)}
                    onScan={handleBarcodeScan}
                />
            )}
            {isBarcodePrintModalOpen && printingUrun && (
                 <BarcodePrintModal
                    urun={printingUrun}
                    onClose={() => { setIsBarcodePrintModalOpen(false); setPrintingUrun(null); }}
                />
            )}
            {isPredictionModalOpen && (
                <StokTahminModal
                    isOpen={isPredictionModalOpen}
                    onClose={() => setIsPredictionModalOpen(false)}
                    depoData={depo}
                />
            )}
        </>
    );
};

// Modals
const UrunFormModal: React.FC<{ urun: Partial<DepoUrunu>; onClose: () => void; onSave: (urun: Partial<DepoUrunu>) => void; }> = ({ urun, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<DepoUrunu>>(urun);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as DepoUrunu);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={urun.id ? "Ürünü Düzenle" : "Yeni Ürün Ekle"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Ürün Adı</label>
                        <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Ürün Kodu</label>
                        <input type="text" name="code" value={formData.code || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Barkod</label>
                        <input type="text" name="barcode" value={formData.barcode || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Kategori</label>
                        <select name="category" value={formData.category || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required>
                             <option value="" disabled>Seçiniz...</option>
                             {Object.values(DepoUrunKategorisi).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Birim</label>
                        <select name="unit" value={formData.unit || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required>
                            <option value="" disabled>Seçiniz...</option>
                             {Object.values(DepoUrunBirimi).map(unit => <option key={unit} value={unit}>{unit}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Mevcut Miktar</label>
                        <input type="number" name="quantity" value={formData.quantity || 0} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Minimum Stok Seviyesi</label>
                        <input type="number" name="minStockLevel" value={formData.minStockLevel || 0} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Son Kullanma Tarihi</label>
                        <input type="date" name="expirationDate" value={formData.expirationDate || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Raf Konumu</label>
                        <input type="text" name="shelfLocation" value={formData.shelfLocation || ''} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-lg shadow-sm p-2" />
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

const BarcodeScannerModal: React.FC<{ onClose: () => void; onScan: (code: string) => void; }> = ({ onClose, onScan }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReaderRef = useRef(new BrowserMultiFormatReader());
    const [scanError, setScanError] = useState('');

    useEffect(() => {
        const codeReader = codeReaderRef.current;
        (codeReader as any).listVideoInputDevices()
            .then((videoInputDevices: any) => {
                if (videoInputDevices.length > 0) {
                    const selectedDeviceId = videoInputDevices[0].deviceId;
                    if (videoRef.current) {
                        try {
                            codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result: any, err: any) => {
                                if (result) {
                                    onScan(result.getText());
                                    (codeReader as any).reset();
                                }
                                if (err && err.name !== 'NotFoundException') {
                                    console.error(err);
                                    setScanError('Barkod okuma sırasında bir hata oluştu.');
                                }
                            });
                        } catch (err) {
                             console.error(err);
                             setScanError("Tarama başlatılamadı. Kamera izinlerini kontrol edin.");
                        }
                    }
                } else {
                    setScanError("Kamera bulunamadı.");
                }
            })
            .catch((err: any) => {
                console.error(err);
                setScanError("Kamera erişiminde hata oluştu. Lütfen sayfa izinlerini kontrol edin.");
            });
        
        return () => {
            (codeReader as any).reset();
        };
    }, [onScan]);
    
    return (
         <Modal isOpen={true} onClose={onClose} title="Barkod Tara">
            <div>
                <video ref={videoRef} className="w-full h-auto bg-slate-900 rounded-md"></video>
                {scanError && <p className="text-red-500 text-sm mt-2">{scanError}</p>}
                <p className="text-sm text-slate-500 mt-2 text-center">Barkodu kamera önüne getirin.</p>
            </div>
             <div className="pt-4 mt-4 border-t flex justify-end">
                <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300">Kapat</button>
            </div>
        </Modal>
    );
};

const BarcodePrintModal: React.FC<{ urun: DepoUrunu, onClose: () => void; }> = ({ urun, onClose }) => {
     useEffect(() => {
        if (urun.barcode) {
            try {
                JsBarcode("#barcode", urun.barcode, {
                    lineColor: "#000",
                    width: 2,
                    height: 80,
                    displayValue: true
                });
            } catch(e) {
                console.error("Barkod oluşturulurken hata:", e);
            }
        }
    }, [urun]);
    
    const handlePrint = () => {
        const printContent = document.getElementById('print-area')?.innerHTML;
        const printWindow = window.open('', '_blank');
        if(printWindow && printContent){
            printWindow.document.write('<html><head><title>Barkod Yazdır</title><style>body { text-align: center; margin-top: 2rem; }</style></head><body>');
            printWindow.document.write(printContent);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    }

    return (
        <Modal isOpen={true} onClose={onClose} title="Barkod Yazdır">
            <div id="print-area" className="text-center p-4 flex flex-col items-center">
                <h3 className="text-lg font-bold">{urun.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{urun.code}</p>
                {urun.barcode ? <svg id="barcode"></svg> : <p className="text-red-500 my-8">Bu ürün için barkod tanımlanmamış.</p>}
            </div>
            <div className="pt-4 mt-4 border-t flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50">Kapat</button>
                <button type="button" onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 flex items-center space-x-2" disabled={!urun.barcode}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    <span>Yazdır</span>
                </button>
            </div>
        </Modal>
    )
}

const StokTahminModal: React.FC<{isOpen: boolean; onClose: () => void; depoData: DepoUrunu[]}> = ({isOpen, onClose, depoData}) => {
    const [predictions, setPredictions] = useState<StokTahmini[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPredictions = async () => {
            setIsLoading(true);
            setError('');
            try {
                const results = await predictStockNeeds(depoData);
                setPredictions(results);
            } catch (e: any) {
                setError(e.message || 'Tahminler alınırken bir hata oluştu.');
            } finally {
                setIsLoading(false);
            }
        };

        if(isOpen) {
            fetchPredictions();
        }
    }, [isOpen, depoData]);
    
    const getPriorityClass = (priority: 'Yüksek' | 'Orta' | 'Düşük') => {
        switch(priority) {
            case 'Yüksek': return 'border-l-4 border-red-500 bg-red-50';
            case 'Orta': return 'border-l-4 border-yellow-500 bg-yellow-50';
            case 'Düşük': return 'border-l-4 border-blue-500 bg-blue-50';
            default: return 'border-l-4 border-slate-500 bg-slate-50';
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Stok Öngörüleri">
            <div className="min-h-[20rem]">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                        <p className="mt-4 text-slate-500">Stok durumu analiz ediliyor...</p>
                    </div>
                )}
                {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                {!isLoading && !error && (
                     <ul className="space-y-3">
                        {predictions.length > 0 ? predictions.map((p, index) => (
                            <li key={index} className={`p-4 rounded-md ${getPriorityClass(p.oncelik)}`}>
                                <p className="font-bold text-slate-800">{p.urunAdi}</p>
                                <p className="text-slate-600">{p.oneri}</p>
                                <p className="text-xs font-semibold text-slate-500 mt-1">Öncelik: {p.oncelik}</p>
                            </li>
                        )) : <p className="text-center text-slate-500 py-10">AI tarafından belirtilecek önemli bir durum bulunamadı.</p>}
                    </ul>
                )}
            </div>
             <div className="pt-4 mt-4 border-t flex justify-end">
                <button type="button" onClick={onClose} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300">Kapat</button>
            </div>
        </Modal>
    )
}

export default StokYonetimi;