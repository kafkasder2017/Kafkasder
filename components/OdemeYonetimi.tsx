import React, { useState, useMemo, useEffect } from 'react';

import {
  getOdemeler,
  createOdeme,
  updateOdeme,
  deleteOdeme
} from '../services/apiService';
import type { Odeme } from '../types';
import { OdemeDurumu, OdemeTuru, OdemeYontemi } from '../types';

import Modal from './Modal';

const getStatusClass = (status: OdemeDurumu) => {
  switch (status) {
    case OdemeDurumu.TAMAMLANAN:
      return 'bg-green-100 text-green-800';
    case OdemeDurumu.BEKLEYEN:
      return 'bg-yellow-100 text-yellow-800';
    case OdemeDurumu.IPTAL:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const OdemeYonetimi: React.FC = () => {
  const [payments, setPayments] = useState<Odeme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OdemeDurumu | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<OdemeTuru | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<OdemeYontemi | 'all'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Partial<Odeme> | null>(
    null
  );

  const fetchPayments = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getOdemeler();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Ödeme kayıtları yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filteredOdemeler = useMemo(() => {
    return payments
      .filter(odeme => {
        const matchesSearch =
          odeme.kisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
          odeme.aciklama.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === 'all' || odeme.durum === statusFilter;
        const matchesType =
          typeFilter === 'all' || odeme.odemeTuru === typeFilter;
        const matchesMethod =
          methodFilter === 'all' || odeme.odemeYontemi === methodFilter;
        return matchesSearch && matchesStatus && matchesType && matchesMethod;
      })
      .sort(
        (a, b) =>
          new Date(b.odemeTarihi).getTime() - new Date(a.odemeTarihi).getTime()
      );
  }, [payments, searchTerm, statusFilter, typeFilter, methodFilter]);

  const handleStatusChange = async (id: number, newStatus: OdemeDurumu) => {
    try {
      const updated = await updateOdeme(id, { durum: newStatus });
      setPayments(payments.map(o => (o.id === id ? updated : o)));
    } catch (err) {
      alert('Ödeme durumu güncellenirken bir hata oluştu.');
    }
  };

  const handleSavePayment = async (paymentData: Partial<Odeme>) => {
    try {
      if (paymentData.id) {
        const updated = await updateOdeme(paymentData.id, paymentData);
        setPayments(prev => prev.map(p => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createOdeme(paymentData as Omit<Odeme, 'id'>);
        setPayments(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
      setEditingPayment(null);
    } catch (err) {
      alert('Ödeme kaydedilirken bir hata oluştu.');
    }
  };

  const handleAddNew = () => {
    setEditingPayment({});
    setIsModalOpen(true);
  };

  const handleEdit = (payment: Odeme) => {
    setEditingPayment(payment);
    setIsModalOpen(true);
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
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6'>
          <input
            type='text'
            placeholder='Kişi veya açıklama ara...'
            className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 lg:col-span-1'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select
            className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as OdemeTuru | 'all')}
          >
            <option value='all'>Tüm İşlem Türleri</option>
            {Object.values(OdemeTuru).map(tur => (
              <option key={tur} value={tur}>
                {tur}
              </option>
            ))}
          </select>
          <select
            className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
            value={methodFilter}
            onChange={e =>
              setMethodFilter(e.target.value as OdemeYontemi | 'all')
            }
          >
            <option value='all'>Tüm Yöntemler</option>
            {Object.values(OdemeYontemi).map(yontem => (
              <option key={yontem} value={yontem}>
                {yontem}
              </option>
            ))}
          </select>
          <select
            className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
            value={statusFilter}
            onChange={e =>
              setStatusFilter(e.target.value as OdemeDurumu | 'all')
            }
          >
            <option value='all'>Tüm Durumlar</option>
            {Object.values(OdemeDurumu).map(durum => (
              <option key={durum} value={durum}>
                {durum}
              </option>
            ))}
          </select>
        </div>
        <div className='flex justify-end mb-6'>
          <button
            onClick={handleAddNew}
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
            <span>Yeni Ödeme Kaydı</span>
          </button>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left text-slate-500'>
            <thead className='text-xs text-slate-700 uppercase bg-slate-50'>
              <tr>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  İşlem Türü / Kişi
                </th>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Tutar
                </th>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Yöntem
                </th>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Tarih
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
              {filteredOdemeler.map(odeme => (
                <tr key={odeme.id} className='hover:bg-slate-50'>
                  <td className='px-6 py-4'>
                    <div className='font-medium text-slate-900'>
                      {odeme.kisi}
                    </div>
                    <div className='text-xs text-slate-500'>
                      {odeme.odemeTuru}
                    </div>
                  </td>
                  <td
                    className={`px-6 py-4 font-semibold ${odeme.odemeTuru === OdemeTuru.BAGIS_GIRISI ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {odeme.odemeTuru === OdemeTuru.BAGIS_GIRISI ? '+' : '-'}{' '}
                    {odeme.tutar.toLocaleString('tr-TR', {
                      style: 'currency',
                      currency: odeme.paraBirimi
                    })}
                  </td>
                  <td className='px-6 py-4'>{odeme.odemeYontemi}</td>
                  <td className='px-6 py-4'>
                    {new Date(odeme.odemeTarihi).toLocaleDateString('tr-TR')}
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(odeme.durum)}`}
                    >
                      {odeme.durum}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='flex items-center justify-end space-x-4'>
                      {odeme.durum === OdemeDurumu.BEKLEYEN && (
                        <button
                          onClick={() =>
                            handleStatusChange(odeme.id, OdemeDurumu.TAMAMLANAN)
                          }
                          className='text-green-600 hover:text-green-800 font-semibold'
                        >
                          Onayla
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(odeme)}
                        className='text-yellow-600 hover:text-yellow-800 font-semibold'
                      >
                        Düzenle
                      </button>
                      {odeme.durum !== OdemeDurumu.IPTAL && (
                        <button
                          onClick={() =>
                            handleStatusChange(odeme.id, OdemeDurumu.IPTAL)
                          }
                          className='text-red-600 hover:text-red-800 font-semibold'
                        >
                          İptal
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOdemeler.length === 0 && (
          <div className='text-center py-10 text-slate-500'>
            <p>Arama kriterlerine uygun ödeme kaydı bulunamadı.</p>
          </div>
        )}
      </div>
      {isModalOpen && (
        <OdemeFormModal
          payment={editingPayment}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSavePayment}
        />
      )}
    </>
  );
};

const OdemeFormModal: React.FC<{
  payment: Partial<Odeme> | null;
  onClose: () => void;
  onSave: (payment: Partial<Odeme>) => void;
}> = ({ payment, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Odeme>>(payment || {});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'tutar' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={payment?.id ? 'Ödeme Kaydını Düzenle' : 'Yeni Ödeme Kaydı'}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-slate-700'>
              Kişi / Kurum
            </label>
            <input
              type='text'
              name='kisi'
              value={formData.kisi || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              İşlem Türü
            </label>
            <select
              name='odemeTuru'
              value={formData.odemeTuru || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white'
              required
            >
              <option value='' disabled>
                Seçiniz...
              </option>
              {Object.values(OdemeTuru).map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Tutar
            </label>
            <input
              type='number'
              step='0.01'
              name='tutar'
              value={formData.tutar || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Ödeme Yöntemi
            </label>
            <select
              name='odemeYontemi'
              value={formData.odemeYontemi || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white'
              required
            >
              <option value='' disabled>
                Seçiniz...
              </option>
              {Object.values(OdemeYontemi).map(y => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Ödeme Tarihi
            </label>
            <input
              type='date'
              name='odemeTarihi'
              value={
                formData.odemeTarihi || new Date().toISOString().split('T')[0]
              }
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
              required
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-slate-700'>
              Açıklama
            </label>
            <textarea
              name='aciklama'
              value={formData.aciklama || ''}
              onChange={handleChange}
              rows={3}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
              required
            />
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

export default OdemeYonetimi;
