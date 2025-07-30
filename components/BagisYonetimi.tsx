

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Bagis, BagisTuru, Person, Proje } from '../types';
import { getBagislar, createBagis, updateBagis, deleteBagis, getPeople, getProjeler } from '../services/apiService';
import Modal from './Modal';

const StatCard: React.FC<{ title: string; value: string; color: string; icon: React.ReactNode }> = ({ title, value, color, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    </div>
);

interface BagisYonetimiProps {
    initialFilter?: BagisTuru | 'all';
}

const BagisYonetimi: React.FC<BagisYonetimiProps> = ({ initialFilter = 'all' }) => {
    const [donations, setDonations] = useState<Bagis[]>([]);
    const [people, setPeople] = useState<Person[]>([]);
    const [projects, setProjects] = useState<Proje[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<BagisTuru | 'all'>(initialFilter);
    
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [editingDonation, setEditingDonation] = useState<Partial<Bagis> | null>(null);
    const [receiptDonation, setReceiptDonation] = useState<Bagis | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        setError('');
        try {
            const [donationsData, peopleData, projectsData] = await Promise.all([
                getBagislar(),
                getPeople(),
                getProjeler()
            ]);
            setDonations(donationsData);
            setPeople(peopleData);
            setProjects(projectsData);
        } catch(err: any) {
            setError(err.message || 'Veriler yüklenemedi.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
    
    const peopleMap = useMemo(() => new Map(people.map(p => [p.id, `${p.ad} ${p.soyad}`])), [people]);
    const projectsMap = useMemo(() => new Map(projects.map(p => [p.id, p.name])), [projects]);

    const { filteredDonations, monthlyTotal, donorCount, averageDonation } = useMemo(() => {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        let currentMonthlyTotal = 0;
        const monthlyDonors = new Set<number>();
        
        donations.forEach(d => {
            if (new Date(d.tarih) >= firstDayOfMonth) {
                currentMonthlyTotal += d.tutar;
                monthlyDonors.add(d.bagisciId);
            }
        });

        const allDonors = new Set(donations.map(d => d.bagisciId));
        
        const filtered = donations.filter(d => {
            const donorName = peopleMap.get(d.bagisciId)?.toLowerCase() || '';
            const matchesSearch = donorName.includes(searchTerm.toLowerCase()) || d.makbuzNo.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = typeFilter === 'all' || d.bagisTuru === typeFilter;
            return matchesSearch && matchesType;
        });

        return {
            filteredDonations: filtered,
            monthlyTotal: currentMonthlyTotal,
            donorCount: allDonors.size,
            averageDonation: donations.length > 0 ? (donations.reduce((acc, curr) => acc + curr.tutar, 0) / donations.length) : 0
        };
    }, [donations, searchTerm, typeFilter, peopleMap]);

    const handleSaveDonation = async (donationToSave: Partial<Bagis>) => {
        try {
            if(donationToSave.id) {
                const updated = await updateBagis(donationToSave.id, donationToSave);
                setDonations(prev => prev.map(d => d.id === updated.id ? updated : d));
            } else {
                const created = await createBagis(donationToSave as Omit<Bagis, 'id'>);
                setDonations(prev => [created, ...prev]);
            }
            setIsFormModalOpen(false);
            setEditingDonation(null);
        } catch(err) {
            alert("Bağış kaydedilirken bir hata oluştu.");
        }
    };
    
    const handleDeleteClick = async (id: number) => {
        if(window.confirm('Bu bağış kaydını silmek istediğinizden emin misiniz?')) {
            try {
                await deleteBagis(id);
                setDonations(prev => prev.filter(d => d.id !== id));
            } catch (err) {
                alert("Bağış silinirken bir hata oluştu.");
            }
        }
    };

    if (isLoading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div></div>;
    if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;

    return (
        <>
            <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard 
                        title="Bu Ayki Toplam Bağış" 
                        value={monthlyTotal.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        color="bg-green-100 text-green-600"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>}
                    />
                    <StatCard 
                        title="Toplam Bağışçı Sayısı" 
                        value={donorCount.toString()}
                        color="bg-blue-100 text-blue-600"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                    />
                     <StatCard 
                        title="Ortalama Bağış Miktarı" 
                        value={averageDonation.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        color="bg-purple-100 text-purple-600"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.9 1.9a2.5 2.5 0 0 0 0 3.5L12 10l1.9-1.9a2.5 2.5 0 0 0 0-3.5L12 3z"/><path d="M19.4 21.4 12 14l-7.4 7.4"/><path d="m14 12-7.4 7.4"/><path d="M3 12h18"/></svg>}
                    />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6">
                        <div className="w-full md:w-1/3">
                            <input
                                type="text"
                                placeholder="Bağışçı adı veya makbuz no..."
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-4">
                            <select 
                                className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value as BagisTuru | 'all')}
                            >
                                <option value="all">Tüm Bağış Türleri</option>
                                {Object.values(BagisTuru).map(tur => <option key={tur} value={tur}>{tur}</option>)}
                            </select>
                            <button onClick={() => { setEditingDonation({}); setIsFormModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                                <span>Yeni Bağış Ekle</span>
                            </button>
                        </div>
                    </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 font-semibold">Bağışçı</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Tutar</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Tür</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">Tarih</th>
                                    <th scope="col" className="px-6 py-4 font-semibold">İlişkili Proje</th>
                                    <th scope="col" className="px-6 py-4 font-semibold text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredDonations.map(d => (
                                    <tr key={d.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 font-medium text-slate-900">{peopleMap.get(d.bagisciId) || 'Bilinmeyen Kişi'}</td>
                                        <td className="px-6 py-4 font-semibold text-green-600">{d.tutar.toLocaleString('tr-TR', { style: 'currency', currency: d.paraBirimi })}</td>
                                        <td className="px-6 py-4">{d.bagisTuru}</td>
                                        <td className="px-6 py-4">{new Date(d.tarih).toLocaleDateString('tr-TR')}</td>
                                        <td className="px-6 py-4">{d.projeId ? projectsMap.get(d.projeId) : '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-4">
                                                <button onClick={() => { setReceiptDonation(d); setIsReceiptModalOpen(true); }} className="text-purple-600 hover:text-purple-800 font-semibold">Makbuz</button>
                                                <button onClick={() => { setEditingDonation(d); setIsFormModalOpen(true); }} className="text-yellow-600 hover:text-yellow-800 font-semibold">Düzenle</button>
                                                <button onClick={() => handleDeleteClick(d.id)} className="text-red-600 hover:text-red-800 font-semibold">Sil</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {isFormModalOpen && editingDonation && (
                <BagisFormModal
                    donation={editingDonation}
                    people={people}
                    projects={projects}
                    onClose={() => setIsFormModalOpen(false)}
                    onSave={handleSaveDonation}
                />
            )}

            {isReceiptModalOpen && receiptDonation && (
                <MakbuzModal
                    donation={receiptDonation}
                    donorName={peopleMap.get(receiptDonation.bagisciId) || 'Bilinmeyen Kişi'}
                    onClose={() => setIsReceiptModalOpen(false)}
                />
            )}
        </>
    );
};

// --- Modals ---

const BagisFormModal: React.FC<{ donation: Partial<Bagis>, people: Person[], projects: Proje[], onClose: () => void, onSave: (d: Partial<Bagis>) => void }> = ({ donation, people, projects, onClose, onSave }) => {
    const [formData, setFormData] = useState<Partial<Bagis>>(donation);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: name === 'tutar' || name === 'bagisciId' || name === 'projeId' ? parseFloat(value) || value : value}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={donation.id ? 'Bağış Düzenle' : 'Yeni Bağış Ekle'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Bağışçı</label>
                        <select name="bagisciId" value={formData.bagisciId || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                            <option value="" disabled>Kişi seçin...</option>
                            {people.map(p => <option key={p.id} value={p.id}>{p.ad} {p.soyad}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tutar</label>
                        <input type="number" step="0.01" name="tutar" value={formData.tutar || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Para Birimi</label>
                        <select name="paraBirimi" value={formData.paraBirimi || 'TRY'} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white">
                            <option value="TRY">TRY</option><option value="USD">USD</option><option value="EUR">EUR</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Bağış Türü</label>
                        <select name="bagisTuru" value={formData.bagisTuru || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white" required>
                            <option value="" disabled>Seçiniz...</option>
                            {Object.values(BagisTuru).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tarih</label>
                        <input type="date" name="tarih" value={formData.tarih || new Date().toISOString().split('T')[0]} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" required />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">İlişkili Proje (İsteğe Bağlı)</label>
                        <select name="projeId" value={formData.projeId || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white">
                            <option value="">Yok</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Makbuz No</label>
                        <input type="text" name="makbuzNo" value={formData.makbuzNo || ''} onChange={handleChange} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Açıklama</label>
                        <textarea name="aciklama" value={formData.aciklama || ''} onChange={handleChange} rows={3} className="mt-1 block w-full p-2 border border-slate-300 rounded-lg"></textarea>
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

const MakbuzModal: React.FC<{ donation: Bagis, donorName: string, onClose: () => void }> = ({ donation, donorName, onClose }) => {
    const printAreaRef = useRef<HTMLDivElement>(null);
    const handlePrint = () => {
        const printContent = printAreaRef.current?.innerHTML;
        if(printContent) {
            const printWindow = window.open('', '_blank');
            if(printWindow) {
                printWindow.document.write(`<html><head><title>Makbuz</title><style>body { font-family: sans-serif; margin: 2rem; } .receipt { border: 1px solid #ccc; padding: 2rem; max-width: 600px; margin: auto; } h1 { text-align: center; } table { width: 100%; border-collapse: collapse; margin-top: 2rem; } th, td { border: 1px solid #eee; padding: 0.75rem; text-align: left; } th { background-color: #f8f8f8; } .footer { margin-top: 2rem; text-align: center; font-size: 0.9rem; color: #777; }</style></head><body>${printContent}<script>window.onload=function(){window.print();window.close();}</script></body></html>`);
                printWindow.document.close();
            }
        }
    };
    return (
        <Modal isOpen={true} onClose={onClose} title="Bağış Makbuzu">
            <div ref={printAreaRef} className="receipt">
                <h1 className="text-2xl font-bold text-center">KAFKASDER BAĞIŞ MAKBUZU</h1>
                <p className="text-center text-sm text-slate-500">Makbuz No: {donation.makbuzNo}</p>
                <table className="mt-6 w-full">
                    <tbody>
                        <tr><th className="w-1/3 p-2 bg-slate-50">Tarih</th><td className="p-2">{new Date(donation.tarih).toLocaleDateString('tr-TR')}</td></tr>
                        <tr><th className="p-2 bg-slate-50">Bağışçı</th><td className="p-2 font-semibold">{donorName}</td></tr>
                        <tr><th className="p-2 bg-slate-50">Tutar</th><td className="p-2 font-bold text-xl">{donation.tutar.toLocaleString('tr-TR', { style: 'currency', currency: donation.paraBirimi })}</td></tr>
                        <tr><th className="p-2 bg-slate-50">Açıklama</th><td className="p-2">{donation.aciklama || donation.bagisTuru}</td></tr>
                    </tbody>
                </table>
                <div className="footer mt-8 text-center text-slate-600">
                    <p>Yaptığınız bu değerli bağış için KAFKASDER adına teşekkür ederiz.</p>
                </div>
            </div>
            <div className="pt-6 mt-6 border-t flex justify-end space-x-3">
                <button type="button" onClick={onClose} className="bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50">Kapat</button>
                <button type="button" onClick={handlePrint} className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700">Yazdır</button>
            </div>
        </Modal>
    );
};

export default BagisYonetimi;