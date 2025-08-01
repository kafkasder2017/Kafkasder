import React, { useState, useMemo, useEffect } from 'react';

import {
  getHastaneSevkler,
  createHastaneSevk,
  updateHastaneSevk,
  deleteHastaneSevk,
  getPeople
} from '../services/apiService';
import type { HastaneSevk, Person } from '../types';
import { SevkDurumu } from '../types';

import Modal from './Modal';

// Helper functions for styling
const getStatusClass = (status: SevkDurumu) => {
  switch (status) {
    case SevkDurumu.GIDILDI:
      return 'bg-green-100 text-green-800';
    case SevkDurumu.PLANLANDI:
      return 'bg-yellow-100 text-yellow-800';
    case SevkDurumu.RANDEVU_ALINDI:
      return 'bg-blue-100 text-blue-800';
    case SevkDurumu.IPTAL_EDILDI:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const HastaneSevkYonetimi: React.FC = () => {
  const [sevkler, setSevkler] = useState<HastaneSevk[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SevkDurumu | 'all'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSevk, setEditingSevk] = useState<Partial<HastaneSevk> | null>(
    null
  );

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [sevklerData, peopleData] = await Promise.all([
        getHastaneSevkler(),
        getPeople()
      ]);
      setSevkler(sevklerData);
      setPeople(peopleData);
    } catch (err: any) {
      setError(err.message || 'Sevk verileri yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const peopleMap = useMemo(
    () => new Map(people.map(p => [p.id, `${p.ad} ${p.soyad}`])),
    [people]
  );

  const filteredSevkler = useMemo(() => {
    return sevkler.filter(sevk => {
      const kisiAdi = peopleMap.get(sevk.kisiId)?.toLowerCase() || '';
      const matchesSearch =
        kisiAdi.includes(searchTerm.toLowerCase()) ||
        sevk.hastaneAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sevk.bolum.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || sevk.durum === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sevkler, peopleMap, searchTerm, statusFilter]);

  const handleAddNewClick = () => {
    setEditingSevk({
      durum: SevkDurumu.PLANLANDI,
      sevkTarihi: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleEditClick = (sevk: HastaneSevk) => {
    setEditingSevk(sevk);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Bu sevk kaydını silmek istediğinizden emin misiniz?')) {
      try {
        await deleteHastaneSevk(id);
        setSevkler(prev => prev.filter(h => h.id !== id));
      } catch (err) {
        alert('Sevk kaydı silinirken hata oluştu.');
      }
    }
  };

  const handleSaveSevk = async (sevkToSave: Partial<HastaneSevk>) => {
    try {
      if (sevkToSave.id) {
        const updated = await updateHastaneSevk(sevkToSave.id, sevkToSave);
        setSevkler(prev => prev.map(h => (h.id === updated.id ? updated : h)));
      } else {
        const created = await createHastaneSevk(
          sevkToSave as Omit<HastaneSevk, 'id'>
        );
        setSevkler(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
      setEditingSevk(null);
    } catch (err) {
      alert('Sevk kaydedilirken bir hata oluştu.');
    }
  };

  if (isLoading)
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600'></div>
      </div>
    );
  if (error)
    return (
      <div className='p-4 bg-red-100 text-red-700 rounded-lg'>{error}</div>
    );

  return (
    <>
      <div className='bg-white p-6 rounded-xl shadow-sm'>
        <div className='flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6'>
          <div className='w-full md:w-1/3'>
            <input
              type='text'
              placeholder='Kişi, hastane veya bölüm ara...'
              className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex items-center space-x-4'>
            <select
              className='px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as SevkDurumu | 'all')
              }
            >
              <option value='all'>Tüm Durumlar</option>
              {Object.values(SevkDurumu).map(durum => (
                <option key={durum} value={durum}>
                  {durum}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddNewClick}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-2'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='20'
                height='20'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <path d='M5 12h14' />
                <path d='M12 5v14' />
              </svg>
              <span>Yeni Sevk Kaydı</span>
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left text-slate-500'>
            <thead className='text-xs text-slate-700 uppercase bg-slate-50'>
              <tr>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Sevk Edilen Kişi
                </th>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Hastane / Bölüm
                </th>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Randevu Tarihi
                </th>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Sevk Nedeni
                </th>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Durum
                </th>
                <th scope='col' className='px-6 py-4 font-semibold text-right'>
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-200'>
              {filteredSevkler.map(sevk => (
                <tr key={sevk.id} className='hover:bg-slate-50'>
                  <td className='px-6 py-4 font-medium text-slate-900 whitespace-nowrap'>
                    {peopleMap.get(sevk.kisiId) || 'Bilinmeyen Kişi'}
                  </td>
                  <td className='px-6 py-4'>
                    <div>{sevk.hastaneAdi}</div>
                    <div className='text-xs text-slate-500'>{sevk.bolum}</div>
                  </td>
                  <td className='px-6 py-4'>
                    {sevk.randevuTarihi
                      ? new Date(sevk.randevuTarihi).toLocaleDateString('tr-TR')
                      : 'Belirtilmemiş'}
                  </td>
                  <td className='px-6 py-4 text-slate-600 max-w-xs truncate'>
                    {sevk.sevkNedeni}
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(sevk.durum)}`}
                    >
                      {sevk.durum}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='flex items-center justify-end space-x-4'>
                      <button
                        onClick={() => handleEditClick(sevk)}
                        className='text-yellow-600 hover:text-yellow-800 font-semibold'
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleDeleteClick(sevk.id)}
                        className='text-red-600 hover:text-red-800 font-semibold'
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredSevkler.length === 0 && (
          <div className='text-center py-10 text-slate-500'>
            <p>Arama kriterlerine uygun sevk kaydı bulunamadı.</p>
          </div>
        )}
      </div>
      {isModalOpen && editingSevk && (
        <SevkFormModal
          sevk={editingSevk}
          people={people}
          onClose={() => {
            setIsModalOpen(false);
            setEditingSevk(null);
          }}
          onSave={handleSaveSevk}
        />
      )}
    </>
  );
};

const SevkFormModal: React.FC<{
  sevk: Partial<HastaneSevk>;
  people: Person[];
  onClose: () => void;
  onSave: (sevk: Partial<HastaneSevk>) => void;
}> = ({ sevk, people, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<HastaneSevk>>(sevk);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maliyet' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isNew = !sevk.id;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isNew ? 'Yeni Hastane Sevk Kaydı' : 'Sevk Kaydını Düzenle'}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-slate-700'>
              Sevk Edilen Kişi
            </label>
            <select
              name='kisiId'
              value={formData.kisiId || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white'
              required
            >
              <option value='' disabled>
                Kişi Seçin...
              </option>
              {people.map(p => (
                <option key={p.id} value={p.id}>
                  {p.ad} {p.soyad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Hastane Adı
            </label>
            <input
              type='text'
              name='hastaneAdi'
              value={formData.hastaneAdi || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Bölüm
            </label>
            <input
              type='text'
              name='bolum'
              value={formData.bolum || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
              placeholder='örn. Kardiyoloji'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Doktor Adı (İsteğe bağlı)
            </label>
            <input
              type='text'
              name='doktorAdi'
              value={formData.doktorAdi || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Randevu Tarihi (İsteğe bağlı)
            </label>
            <input
              type='date'
              name='randevuTarihi'
              value={formData.randevuTarihi || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-slate-700'>
              Sevk Nedeni
            </label>
            <textarea
              name='sevkNedeni'
              value={formData.sevkNedeni || ''}
              onChange={handleChange}
              rows={2}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
              placeholder='Sevk nedenini kısaca açıklayın...'
              required
            ></textarea>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Durum
            </label>
            <select
              name='durum'
              value={formData.durum || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white'
              required
            >
              <option value='' disabled>
                Seçiniz...
              </option>
              {Object.values(SevkDurumu).map(durum => (
                <option key={durum} value={durum}>
                  {durum}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Maliyet (TL, İsteğe bağlı)
            </label>
            <input
              type='number'
              step='0.01'
              name='maliyet'
              value={formData.maliyet || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-slate-700'>
              Sonuç Notları (İsteğe bağlı)
            </label>
            <textarea
              name='sonuc'
              value={formData.sonuc || ''}
              onChange={handleChange}
              rows={3}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
              placeholder='Randevu sonrası doktorun notları, sonuçlar vb.'
            ></textarea>
          </div>
        </div>
        <div className='pt-4 flex justify-end space-x-3'>
          <button
            type='button'
            onClick={onClose}
            className='bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50'
          >
            İptal
          </button>
          <button
            type='submit'
            className='bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700'
          >
            Kaydet
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default HastaneSevkYonetimi;
