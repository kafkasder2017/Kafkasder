import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

import {
  getGonulluler,
  getPeople,
  createGonullu,
  updateGonullu
} from '../services/apiService';
import type { Gonullu, Person } from '../types';
import { Beceri, GonulluDurum } from '../types';

import Modal from './Modal';

const GonulluYonetimi: React.FC = () => {
  const [gonulluler, setGonulluler] = useState<Gonullu[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<Beceri | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<GonulluDurum | 'all'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGonullu, setEditingGonullu] = useState<Partial<Gonullu> | null>(
    null
  );

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    try {
      const [gonullulerData, peopleData] = await Promise.all([
        getGonulluler(),
        getPeople()
      ]);
      setGonulluler(gonullulerData);
      setPeople(peopleData);
    } catch (err: any) {
      setError(err.message || 'Veriler yüklenemedi.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSaveGonullu = async (gonulluToSave: Gonullu) => {
    try {
      if (gonulluToSave.id) {
        const updated = await updateGonullu(gonulluToSave.id, gonulluToSave);
        setGonulluler(prev =>
          prev.map(g => (g.id === updated.id ? updated : g))
        );
      } else {
        const created = await createGonullu(
          gonulluToSave as Omit<Gonullu, 'id'>
        );
        setGonulluler(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
      setEditingGonullu(null);
    } catch (err) {
      alert('Gönüllü kaydedilirken bir hata oluştu.');
    }
  };

  const peopleMap = useMemo(
    () => new Map(people.map(p => [p.id, p])),
    [people]
  );

  const enrichedGonulluler = useMemo(() => {
    return gonulluler
      .map(g => ({
        ...g,
        person: peopleMap.get(g.personId)
      }))
      .filter(g => g.person);
  }, [gonulluler, peopleMap]);

  const filteredGonulluler = useMemo(() => {
    return enrichedGonulluler.filter(g => {
      const person = g.person!;
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = `${person.ad} ${person.soyad}`
        .toLowerCase()
        .includes(lowerSearch);
      const matchesSkill =
        skillFilter === 'all' || g.beceriler.includes(skillFilter);
      const matchesStatus = statusFilter === 'all' || g.durum === statusFilter;
      return matchesSearch && matchesSkill && matchesStatus;
    });
  }, [enrichedGonulluler, searchTerm, skillFilter, statusFilter]);

  const handleAddNewClick = () => {
    setEditingGonullu({});
    setIsModalOpen(true);
  };

  const handleEditClick = (gonullu: Gonullu) => {
    setEditingGonullu(gonullu);
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
        <div className='flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6'>
          <div className='w-full md:w-1/3'>
            <input
              type='text'
              placeholder='Gönüllü adı ara...'
              className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex items-center space-x-4'>
            <select
              className='px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
              value={skillFilter}
              onChange={e => setSkillFilter(e.target.value as Beceri | 'all')}
            >
              <option value='all'>Tüm Beceriler</option>
              {Object.values(Beceri).map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              className='px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as GonulluDurum | 'all')
              }
            >
              <option value='all'>Tüm Durumlar</option>
              {Object.values(GonulluDurum).map(s => (
                <option key={s} value={s}>
                  {s}
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
              <span>Yeni Gönüllü</span>
            </button>
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left text-slate-500'>
            <thead className='text-xs text-slate-700 uppercase bg-slate-50'>
              <tr>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Ad Soyad
                </th>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Beceriler
                </th>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Müsaitlik
                </th>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Toplam Katkı
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
              {filteredGonulluler.map(({ person, ...gonullu }) => (
                <tr key={gonullu.id} className='hover:bg-slate-50'>
                  <td className='px-6 py-4 font-medium text-slate-900'>
                    {person!.ad} {person!.soyad}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex flex-wrap gap-1'>
                      {gonullu.beceriler.slice(0, 2).map(b => (
                        <span
                          key={b}
                          className='text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full'
                        >
                          {b}
                        </span>
                      ))}
                      {gonullu.beceriler.length > 2 && (
                        <span className='text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full'>
                          +{gonullu.beceriler.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4'>{gonullu.musaitlik}</td>
                  <td className='px-6 py-4'>{gonullu.toplamSaat || 0} saat</td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${gonullu.durum === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {gonullu.durum}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <div className='flex items-center justify-end space-x-4'>
                      <ReactRouterDOM.Link
                        to={`/gonulluler/${gonullu.id}`}
                        className='text-blue-600 hover:text-blue-800 font-semibold'
                      >
                        Detay
                      </ReactRouterDOM.Link>
                      <button
                        onClick={() => handleEditClick(gonullu)}
                        className='text-yellow-600 hover:text-yellow-800 font-semibold'
                      >
                        Düzenle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredGonulluler.length === 0 && (
          <div className='text-center py-10 text-slate-500'>
            <p>Arama kriterlerine uygun gönüllü bulunamadı.</p>
          </div>
        )}
      </div>
      {isModalOpen && (
        <GonulluFormModal
          gonullu={editingGonullu}
          onClose={() => setIsModalOpen(false)}
          onSave={onSaveGonullu}
          allPeople={people}
          existingVolunteerIds={gonulluler.map(g => g.personId)}
        />
      )}
    </>
  );
};

interface GonulluFormModalProps {
  gonullu: Partial<Gonullu> | null;
  onClose: () => void;
  onSave: (gonullu: Gonullu) => void;
  allPeople: Person[];
  existingVolunteerIds: number[];
}

const GonulluFormModal: React.FC<GonulluFormModalProps> = ({
  gonullu,
  onClose,
  onSave,
  allPeople,
  existingVolunteerIds
}) => {
  const [formData, setFormData] = useState<Partial<Gonullu>>(gonullu || {});
  const [selectedSkills, setSelectedSkills] = useState<Beceri[]>(
    gonullu?.beceriler || []
  );

  const availablePeople = useMemo(() => {
    return allPeople.filter(p => !existingVolunteerIds.includes(p.id));
  }, [allPeople, existingVolunteerIds]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill: Beceri) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData, beceriler: selectedSkills };
    onSave(finalData as Gonullu);
  };

  const isNew = !gonullu?.id;

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isNew ? 'Yeni Gönüllü Ekle' : 'Gönüllü Bilgilerini Düzenle'}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        {isNew && (
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Kişi Seç
            </label>
            <select
              name='personId'
              value={formData.personId || ''}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  personId: Number(e.target.value)
                }))
              }
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg bg-white'
              required
            >
              <option value='' disabled>
                Lütfen bir kişi seçin...
              </option>
              {availablePeople.map(p => (
                <option key={p.id} value={p.id}>
                  {p.ad} {p.soyad}
                </option>
              ))}
            </select>
            <p className='text-xs text-slate-500 mt-1'>
              Listede olmayan birini eklemek için önce Kişi Yönetimi'nden
              ekleyin.
            </p>
          </div>
        )}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Başlangıç Tarihi
            </label>
            <input
              type='date'
              name='baslangicTarihi'
              value={
                formData.baslangicTarihi ||
                new Date().toISOString().split('T')[0]
              }
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
              required
            />
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
              {Object.values(GonulluDurum).map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-slate-700'>
              Müsaitlik Durumu
            </label>
            <input
              type='text'
              name='musaitlik'
              value={formData.musaitlik || ''}
              onChange={handleChange}
              className='mt-1 block w-full p-2 border border-slate-300 rounded-lg'
              placeholder='örn: Hafta sonları'
            />
          </div>
        </div>
        <div>
          <label className='block text-sm font-medium text-slate-700'>
            Beceriler
          </label>
          <div className='mt-2 grid grid-cols-2 md:grid-cols-3 gap-2'>
            {Object.values(Beceri).map(skill => (
              <label
                key={skill}
                className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer ${selectedSkills.includes(skill) ? 'bg-blue-100 border-blue-300' : 'border-slate-200'}`}
              >
                <input
                  type='checkbox'
                  checked={selectedSkills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className='rounded'
                />
                <span className='text-sm'>{skill}</span>
              </label>
            ))}
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

export default GonulluYonetimi;
