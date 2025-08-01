import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

import {
  getProjeler,
  createProje,
  updateProje,
  deleteProje
} from '../services/apiService';
import type { Proje } from '../types';
import { ProjeStatus } from '../types';

import Modal from './Modal';



const getStatusClass = (status: ProjeStatus) => {
  switch (status) {
    case ProjeStatus._PLANLAMA:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    case ProjeStatus._DEVAM_EDIYOR:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    case ProjeStatus._TAMAMLANDI:
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case ProjeStatus._IPTAL_EDILDI:
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    default:
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300';
  }
};

const getProgressClass = (status: ProjeStatus) => {
  switch (status) {
    case ProjeStatus._PLANLAMA:
      return 'bg-blue-500';
    case ProjeStatus._DEVAM_EDIYOR:
      return 'bg-yellow-500';
    case ProjeStatus._TAMAMLANDI:
      return 'bg-green-500';
    case ProjeStatus._IPTAL_EDILDI:
      return 'bg-red-500';
    default:
      return 'bg-zinc-500';
  }
};

const ProjeCard: React.FC<{
  proje: Proje;
  onEdit: (proje: Proje) => void;
  onDelete: (id: number) => void;
}> = ({ proje, onEdit, onDelete }) => (
  <div className='bg-white dark:bg-zinc-800 p-5 rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all duration-200 group border border-zinc-200 dark:border-zinc-700'>
    <div>
      <div className='flex justify-between items-start'>
        <h3 className='text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1'>
          {proje.name}
        </h3>
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(proje.status)}`}
        >
          {proje.status}
        </span>
      </div>
      <p className='text-sm text-zinc-500 dark:text-zinc-400 mb-3'>
        Yönetici: {proje.manager}
      </p>
      <p className='text-sm text-zinc-600 dark:text-zinc-300 mb-4 h-10 overflow-hidden'>
        {proje.description}
      </p>
    </div>
    <div>
      <div className='mb-2'>
        <div className='flex justify-between text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1'>
          <span>İlerleme</span>
          <span>{proje.progress}%</span>
        </div>
        <div className='w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2.5'>
          <div
            className={`h-2.5 rounded-full ${getProgressClass(proje.status)}`}
            style={{ width: `${proje.progress}%` }}
          ></div>
        </div>
      </div>
      <div className='flex justify-between text-sm text-zinc-500 dark:text-zinc-400'>
        <span>Bütçe:</span>
        <span className='font-semibold text-zinc-800 dark:text-zinc-200'>
          {proje.spent.toLocaleString('tr-TR')} /{' '}
          {proje.budget.toLocaleString('tr-TR')} TL
        </span>
      </div>
      <div className='flex justify-between text-xs text-zinc-400 dark:text-zinc-500 mt-1'>
        <span>{new Date(proje.startDate).toLocaleDateString('tr-TR')}</span>
        <span>{new Date(proje.endDate).toLocaleDateString('tr-TR')}</span>
      </div>
      <div className='border-t border-zinc-200 dark:border-zinc-700 mt-4 pt-4 flex justify-end space-x-4'>
        <ReactRouterDOM.Link
          to={`/projeler/${proje.id}`}
          className='text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
        >
          Detaylar
        </ReactRouterDOM.Link>
        <button
          onClick={() => onEdit(proje)}
          className='text-sm font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300'
        >
          Düzenle
        </button>
        <button
          onClick={() => onDelete(proje.id)}
          className='text-sm font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300'
        >
          Sil
        </button>
      </div>
    </div>
  </div>
);

const ProjeYonetimi: React.FC = () => {
  const [projects, setProjects] = useState<Proje[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [statusFilter, setStatusFilter] = useState<ProjeStatus | 'all'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProje, setEditingProje] = useState<Partial<Proje> | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getProjeler();
      setProjects(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Projeler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjeler = useMemo(() => {
    if (statusFilter === 'all') return projects;
    return projects.filter(proje => proje.status === statusFilter);
  }, [projects, statusFilter]);

  const handleAddNewClick = () => {
    setEditingProje({});
    setIsModalOpen(true);
  };

  const handleEditClick = (proje: Proje) => {
    setEditingProje(proje);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      try {
        await deleteProje(id);
        setProjects(projects.filter(p => p.id !== id));
      } catch (err) {
        alert('Proje silinirken bir hata oluştu.');
      }
    }
  };

  const handleSaveProje = async (projeToSave: Partial<Proje>) => {
    try {
      if (projeToSave.id) {
        const updated = await updateProje(projeToSave.id, projeToSave);
        setProjects(projects.map(p => (p.id === updated.id ? updated : p)));
      } else {
        const created = await createProje(projeToSave as Omit<Proje, 'id'>);
        setProjects([created, ...projects]);
      }
      setIsModalOpen(false);
      setEditingProje(null);
    } catch (err) {
      alert('Proje kaydedilirken bir hata oluştu.');
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-red-100 text-red-700 rounded-lg'>{error}</div>
    );
  }

  return (
    <>
      <div className='space-y-6'>
        <div className='flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700'>
          <div className='flex items-center space-x-4'>
            <h3 className='text-lg font-semibold text-zinc-800 dark:text-zinc-200'>
              Filtrele:
            </h3>
            <select
              className='px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-700'
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as ProjeStatus | 'all')
              }
            >
              <option value='all'>Tüm Projeler</option>
              {Object.values(ProjeStatus).map(status => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
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
            <span>Yeni Proje Ekle</span>
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
          {filteredProjeler.map(proje => (
            <ProjeCard
              key={proje.id}
              proje={proje}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>

        {filteredProjeler.length === 0 && (
          <div className='text-center py-20 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-500'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <h3 className='mt-2 text-sm font-medium text-zinc-900 dark:text-zinc-200'>
              Proje bulunamadı
            </h3>
            <p className='mt-1 text-sm text-zinc-500 dark:text-zinc-400'>
              Seçili filtreye uygun proje bulunamadı.
            </p>
          </div>
        )}
      </div>
      {isModalOpen && editingProje && (
        <ProjeFormModal
          proje={editingProje}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProje(null);
          }}
          onSave={handleSaveProje}
        />
      )}
    </>
  );
};

const ProjeFormModal: React.FC<{
  proje: Partial<Proje>;
  onClose: () => void;
  onSave: (proje: Partial<Proje>) => void;
}> = ({ proje, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Proje>>(proje);


  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    const isNumeric = ['budget', 'spent', 'progress'].includes(name);
    setFormData(prev => ({
      ...prev,
      [name]: isNumeric ? parseFloat(value) : value
    }));
  };

  // const handleGenerateWithAI = async () => {
  
  //     alert('AI proje planı oluşturma özelliği şu anda kullanılamıyor.');
  // };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={proje.id ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Proje Adı
            </label>
            <input
              type='text'
              name='name'
              value={formData.name || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Proje Yöneticisi
            </label>
            <input
              type='text'
              name='manager'
              value={formData.manager || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Durum
            </label>
            <select
              name='status'
              value={formData.status || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700'
              required
            >
              <option value='' disabled>
                Seçiniz...
              </option>
              {Object.values(ProjeStatus).map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Başlangıç Tarihi
            </label>
            <input
              type='date'
              name='startDate'
              value={formData.startDate || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Bitiş Tarihi
            </label>
            <input
              type='date'
              name='endDate'
              value={formData.endDate || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Toplam Bütçe (TL)
            </label>
            <input
              type='number'
              name='budget'
              value={formData.budget || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Harcanan Tutar (TL)
            </label>
            <input
              type='number'
              name='spent'
              value={formData.spent || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700'
              required
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              İlerleme (%{formData.progress || 0})
            </label>
            <input
              type='range'
              name='progress'
              min='0'
              max='100'
              value={formData.progress || 0}
              onChange={handleChange}
              className='mt-1 block w-full'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
              Açıklama
            </label>
            <textarea
              name='description'
              value={formData.description || ''}
              onChange={handleChange}
              rows={5}
              className='mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700'
              required
            />
          </div>
        </div>
        <div className='pt-4 flex justify-end space-x-3'>
          <button
            type='button'
            onClick={onClose}
            className='bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 px-4 py-2 rounded-lg font-semibold border border-zinc-300 dark:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-600'
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

export default ProjeYonetimi;
