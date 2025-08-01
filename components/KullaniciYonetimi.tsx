import React, { useState, useMemo, useEffect } from 'react';

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../services/apiService';
import type { Kullanici } from '../types';
import { KullaniciRol, KullaniciDurum } from '../types';

import Modal from './Modal';

const getStatusClass = (status: KullaniciDurum) => {
  return status === KullaniciDurum.AKTIF
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800';
};

const getRoleClass = (role: KullaniciRol) => {
  switch (role) {
    case KullaniciRol.YONETICI:
      return 'bg-indigo-100 text-indigo-800';
    case KullaniciRol.EDITOR:
      return 'bg-blue-100 text-blue-800';
    case KullaniciRol.MUHASEBE:
      return 'bg-amber-100 text-amber-800';
    case KullaniciRol.GONULLU:
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const KullaniciYonetimi: React.FC = () => {
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<KullaniciRol | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<KullaniciDurum | 'all'>(
    'all'
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKullanici, setEditingKullanici] =
    useState<Partial<Kullanici> | null>(null);

  useEffect(() => {
    const fetchKullanicilar = async () => {
      try {
        setIsLoading(true);
        const data = await getUsers();
        setKullanicilar(data);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Kullanıcılar yüklenirken bir hata oluştu.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKullanicilar();
  }, []);

  const filteredKullanicilar = useMemo(() => {
    return kullanicilar.filter(kullanici => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
        kullanici.kullaniciAdi.toLowerCase().includes(lowerSearch) ||
        kullanici.email.toLowerCase().includes(lowerSearch);
      const matchesRole = roleFilter === 'all' || kullanici.rol === roleFilter;
      const matchesStatus =
        statusFilter === 'all' || kullanici.durum === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [kullanicilar, searchTerm, roleFilter, statusFilter]);

  const handleAddNewClick = () => {
    setEditingKullanici({});
    setIsModalOpen(true);
  };

  const handleEditClick = (kullanici: Kullanici) => {
    setEditingKullanici(kullanici);
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      try {
        await deleteUser(id);
        setKullanicilar(kullanicilar.filter(k => k.id !== id));
      } catch (err) {
        alert('Kullanıcı silinirken bir hata oluştu.');
        console.error(err);
      }
    }
  };

  const handleSaveKullanici = async (kullaniciToSave: Partial<Kullanici>) => {
    try {
      if (kullaniciToSave.id) {
        // Editing
        const updatedUser = await updateUser(
          kullaniciToSave.id,
          kullaniciToSave
        );
        setKullanicilar(
          kullanicilar.map(k => (k.id === kullaniciToSave.id ? updatedUser : k))
        );
      } else {
        // Adding new
        const payload = { ...kullaniciToSave, durum: KullaniciDurum.AKTIF };
        const newUser = await createUser(payload as Omit<Kullanici, 'id'>);
        setKullanicilar([newUser, ...kullanicilar]);
      }
      setIsModalOpen(false);
      setEditingKullanici(null);
    } catch (err) {
      alert('Kullanıcı kaydedilirken bir hata oluştu.');
      console.error(err);
    }
  };

  const toggleUserStatus = async (kullanici: Kullanici) => {
    const newStatus =
      kullanici.durum === KullaniciDurum.AKTIF
        ? KullaniciDurum.PASIF
        : KullaniciDurum.AKTIF;
    try {
      const updatedUser = await updateUser(kullanici.id, { durum: newStatus });
      setKullanicilar(
        kullanicilar.map(k => (k.id === kullanici.id ? updatedUser : k))
      );
    } catch (err) {
      alert('Kullanıcı durumu güncellenirken bir hata oluştu.');
      console.error(err);
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
      <div className='p-6 bg-red-50 text-red-700 rounded-lg text-center'>
        {error}
      </div>
    );
  }

  return (
    <>
      <div className='bg-white p-6 rounded-lg shadow-sm'>
        <div className='flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6'>
          <div className='w-full md:w-1/3'>
            <input
              type='text'
              placeholder='Kullanıcı adı veya e-posta...'
              className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex items-center space-x-4'>
            <select
              className='px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
              value={roleFilter}
              onChange={e =>
                setRoleFilter(e.target.value as KullaniciRol | 'all')
              }
            >
              <option value='all'>Tüm Roller</option>
              {Object.values(KullaniciRol).map(rol => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
            <select
              className='px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as KullaniciDurum | 'all')
              }
            >
              <option value='all'>Tüm Durumlar</option>
              <option value={KullaniciDurum.AKTIF}>Aktif</option>
              <option value={KullaniciDurum.PASIF}>Pasif</option>
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
              <span>Yeni Kullanıcı Ekle</span>
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left text-slate-500'>
            <thead className='text-xs text-slate-700 uppercase bg-slate-50'>
              <tr>
                <th scope='col' className='px-6 py-3'>
                  Kullanıcı Adı
                </th>
                <th scope='col' className='px-6 py-3'>
                  E-posta
                </th>
                <th scope='col' className='px-6 py-3'>
                  Rol
                </th>
                <th scope='col' className='px-6 py-3'>
                  Son Giriş
                </th>
                <th scope='col' className='px-6 py-3'>
                  Durum
                </th>
                <th scope='col' className='px-6 py-3 text-right'>
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredKullanicilar.map(kullanici => (
                <tr
                  key={kullanici.id}
                  className='bg-white border-b hover:bg-slate-50'
                >
                  <td className='px-6 py-4 font-medium text-slate-900 whitespace-nowrap'>
                    {kullanici.kullaniciAdi}
                  </td>
                  <td className='px-6 py-4'>{kullanici.email}</td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleClass(kullanici.rol)}`}
                    >
                      {kullanici.rol}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    {kullanici.son_giris
                      ? new Date(kullanici.son_giris).toLocaleString('tr-TR')
                      : 'Hiç'}
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(kullanici.durum)}`}
                    >
                      {kullanici.durum}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='flex items-center justify-end space-x-3'>
                      <button
                        onClick={() => handleEditClick(kullanici)}
                        className='text-yellow-600 hover:text-yellow-800 font-medium'
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => toggleUserStatus(kullanici)}
                        className={`font-medium ${kullanici.durum === KullaniciDurum.AKTIF ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}`}
                      >
                        {kullanici.durum === KullaniciDurum.AKTIF
                          ? 'Pasif Yap'
                          : 'Aktif Yap'}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(kullanici.id)}
                        className='text-red-600 hover:text-red-800 font-medium'
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
        {filteredKullanicilar.length === 0 && (
          <div className='text-center py-10 text-slate-500'>
            <p>Arama kriterlerine uygun kullanıcı bulunamadı.</p>
          </div>
        )}
      </div>
      {isModalOpen && editingKullanici && (
        <KullaniciFormModal
          kullanici={editingKullanici}
          onClose={() => {
            setIsModalOpen(false);
            setEditingKullanici(null);
          }}
          onSave={handleSaveKullanici}
        />
      )}
    </>
  );
};

const KullaniciFormModal: React.FC<{
  kullanici: Partial<Kullanici>;
  onClose: () => void;
  onSave: (kullanici: Partial<Kullanici>) => void;
}> = ({ kullanici, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Kullanici>>(kullanici);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const isNewUser = !kullanici.id;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isNewUser ? 'Yeni Kullanıcı Ekle' : 'Kullanıcıyı Düzenle'}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Kullanıcı Adı
            </label>
            <input
              type='text'
              name='kullaniciAdi'
              value={formData.kullaniciAdi || ''}
              onChange={handleChange}
              className='mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              E-posta
            </label>
            <input
              type='email'
              name='email'
              value={formData.email || ''}
              onChange={handleChange}
              className='mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2'
              required
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Rol
            </label>
            <select
              name='rol'
              value={formData.rol || ''}
              onChange={handleChange}
              className='mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2'
              required
            >
              <option value='' disabled>
                Seçiniz...
              </option>
              {Object.values(KullaniciRol).map(rol => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>
          </div>
          {isNewUser && (
            <div>
              <label className='block text-sm font-medium text-slate-700'>
                Şifre
              </label>
              <input
                type='password'
                name='password'
                placeholder='Yeni şifre belirle'
                className='mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2'
                required
              />
            </div>
          )}
          {!isNewUser && (
            <div>
              <label className='block text-sm font-medium text-slate-700'>
                Durum
              </label>
              <select
                name='durum'
                value={formData.durum || ''}
                onChange={handleChange}
                className='mt-1 block w-full border border-slate-300 rounded-md shadow-sm p-2'
                required
              >
                <option value='' disabled>
                  Seçiniz...
                </option>
                {Object.values(KullaniciDurum).map(durum => (
                  <option key={durum} value={durum}>
                    {durum}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className='pt-4 flex justify-end space-x-3'>
          <button
            type='button'
            onClick={onClose}
            className='bg-slate-200 text-slate-800 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300'
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

export default KullaniciYonetimi;
