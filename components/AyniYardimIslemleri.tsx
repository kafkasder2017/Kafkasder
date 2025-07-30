
import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AyniYardimIslemi, Person, DepoUrunu } from '../types';
import { getAyniYardimIslemleri, createAyniYardimIslemi, getPeople, getDepoUrunleri } from '../services/apiService';
import Modal from './Modal';


const AyniYardimIslemleri: React.FC = () => {
    const [islemler, setIslemler] = useState<AyniYardimIslemi[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [products, setProducts] = useState<DepoUrunu[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [islemlerData, peopleData, productsData] = await Promise.all([
                getAyniYardimIslemleri(),
                getPeople(),
                getDepoUrunleri()
            ]);
            setIslemler(islemlerData);
            setPeople(peopleData);
            setProducts(productsData);
        } catch (err: any) {
            setError(err.message || "Veri yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const peopleMap = useMemo(() => new Map(people.map(p => [p.id, `${p.ad} ${p.soyad}`])), [people]);
    const productsMap = useMemo(() => new Map(products.map(p => [p.id, p.name])), [products]);
    
    const handleSaveIslem = async (newIslem: Omit<AyniYardimIslemi, 'id'>) => {
        try {
            const created = await createAyniYardimIslemi(newIslem);
            // Refetch data to ensure stock levels and lists are up-to-date
            await fetchData();
            setIsModalOpen(false);
        } catch(err: any) {
            alert("Ayni Yardım İşlemi kaydedilirken bir hata oluştu: " + err.message);
        }
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    }

    if (error) {
        return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
    }

    return (
        <>
            <div className="bg-white p-6 rounded-xl shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Ayni Yardım İşlemleri</h2>
                    <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        <span>Yeni Yardım Çıkışı</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 font-semibold">Tarih</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Yardım Alan Kişi</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Verilen Ürün</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Miktar</th>
                                <th scope="col" className="px-6 py-3 font-semibold">Notlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {islemler.map((islem) => (
                                <tr key={islem.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">{new Date(islem.tarih).toLocaleDateString('tr-TR')}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{peopleMap.get(islem.kisiId) || 'Bilinmeyen Kişi'}</td>
                                    <td className="px-6 py-4">{productsMap.get(islem.urunId) || 'Bilinmeyen Ürün'}</td>
                                    <td className="px-6 py-4 font-semibold">{islem.miktar} {islem.birim}</td>
                                    <td className="px-6 py-4 text-slate-600">{islem.notlar || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {islemler.length === 0 && (
                    <div className="text-center py-10 text-slate-500">
                        <p>Henüz ayni yardım işlemi kaydedilmemiş.</p>
                    </div>
                )}
            </div>
            {isModalOpen && (
                <AyniYardimFormModal
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveIslem}
                    people={people}
                    products={products}
                />
            )}
        </>
    );
};


const AyniYardimFormModal: React.FC<{
    onClose: () => void;
    onSave: (islem: Omit<AyniYardimIslemi, 'id'>) => Promise<void>;
    people: Person[];
    products: DepoUrunu[];
}> = ({ onClose, onSave, people, products }) => {
    
    const [formData, setFormData] = useState({
        kisiId: '',
        urunId: '',
        miktar: 1,
        notlar: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    
    const selectedProduct = useMemo(() => {
        return products.find(p => p.id === Number(formData.urunId));
    }, [formData.urunId, products]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!selectedProduct) {
            setError('Lütfen geçerli bir ürün seçin.');
            return;
        }
        
        if (formData.miktar > selectedProduct.quantity) {
            setError(`Yetersiz stok! Mevcut: ${selectedProduct.quantity} ${selectedProduct.unit}.`);
            return;
        }

        setIsSaving(true);
        try {
            await onSave({
                kisiId: Number(formData.kisiId),
                urunId: Number(formData.urunId),
                miktar: Number(formData.miktar),
                birim: selectedProduct.unit,
                tarih: new Date().toISOString().split('T')[0],
                notlar: formData.notlar,
            });
        } catch (err: any) {
            setError(err.message || 'Kayıt sırasında bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title="Yeni Ayni Yardım Çıkışı">
            <form onSubmit={handleSubmit} className="space-y-4">
                <fieldset disabled={isSaving}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Yardım Yapılacak Kişi</label>
                        <select name="kisiId" value={formData.kisiId} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                            <option value="" disabled>Kişi Seçin...</option>
                            {people.map(p => <option key={p.id} value={p.id}>{p.ad} {p.soyad}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Depodan Verilecek Ürün</label>
                        <select name="urunId" value={formData.urunId} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                             <option value="" disabled>Ürün Seçin...</option>
                            {products.filter(p => p.quantity > 0).map(p => (
                                <option key={p.id} value={p.id}>{p.name} (Stok: {p.quantity} {p.unit})</option>
                            ))}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Miktar</label>
                        <input 
                            type="number" 
                            name="miktar" 
                            value={formData.miktar} 
                            onChange={handleChange} 
                            min="1"
                            max={selectedProduct?.quantity || 1}
                            className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" 
                            required 
                        />
                        {selectedProduct && <span className="text-sm text-slate-500">Birim: {selectedProduct.unit}</span>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Notlar</label>
                        <textarea name="notlar" value={formData.notlar} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" placeholder="Teslimat notu, özel durum vb."></textarea>
                    </div>
                    {error && <p className="text-sm text-red-600 p-2 bg-red-50 rounded-md">{error}</p>}
                </fieldset>
                <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={onClose} disabled={isSaving} className="bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50 disabled:bg-slate-100">İptal</button>
                    <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300">
                        {isSaving ? 'Kaydediliyor...' : 'Yardım Çıkışını Kaydet'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AyniYardimIslemleri;
