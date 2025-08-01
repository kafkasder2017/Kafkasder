import React, { useState, useMemo, useEffect } from 'react';

import {
  getPeople,
  getAidatlarByUyeId,
  createAidat,
  updateAidat
} from '../services/apiService';
import type { Person, Aidat } from '../types';
import { PersonStatus, MembershipType, AidatDurumu } from '../types';


import Modal from './Modal';

const getStatusClass = (status: PersonStatus) => {
  switch (status) {
    case PersonStatus.AKTIF:
      return 'bg-green-100 text-green-800';
    case PersonStatus.PASIF:
      return 'bg-red-100 text-red-800';
    case PersonStatus.BEKLEMEDE:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-slate-100 text-slate-800';
  }
};

const UyeYonetimi: React.FC = () => {
  const [uyeler, setUyeler] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PersonStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<MembershipType | 'all'>('all');

  const [selectedUye, setSelectedUye] = useState<Person | null>(null);

  useEffect(() => {
    const fetchUyeler = async () => {
      setIsLoading(true);
      try {
        const allPeople = await getPeople();
        const memberList = allPeople.filter(
          p => p.membershipType && p.membershipType !== MembershipType.GONULLU
        );
        setUyeler(memberList);
      } catch (err: any) {
        setError(err.message || 'Üye listesi yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUyeler();
  }, []);

  const filteredUyeler = useMemo(() => {
    return uyeler.filter(uye => {
      const fullName = `${uye.ad} ${uye.soyad}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || uye.durum === statusFilter;
      const matchesType =
        typeFilter === 'all' || uye.membershipType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [uyeler, searchTerm, statusFilter, typeFilter]);

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
      <div className='bg-white p-6 rounded-xl shadow-sm'>
        <div className='flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 mb-6'>
          <div className='w-full md:w-1/3'>
            <input
              type='text'
              placeholder='Üye adı ile ara...'
              className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className='flex items-center space-x-4'>
            <select
              className='px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
              value={typeFilter}
              onChange={e =>
                setTypeFilter(e.target.value as MembershipType | 'all')
              }
            >
              <option value='all'>Tüm Üyelik Tipleri</option>
              <option value={MembershipType.STANDART}>Standart</option>
              <option value={MembershipType.ONURSAL}>Onursal</option>
            </select>
            <select
              className='px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
              value={statusFilter}
              onChange={e =>
                setStatusFilter(e.target.value as PersonStatus | 'all')
              }
            >
              <option value='all'>Tüm Durumlar</option>
              {Object.values(PersonStatus).map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
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
                  Üyelik Tipi
                </th>
                <th scope='col' className='px-6 py-4 font-semibold'>
                  Kayıt Tarihi
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
              {filteredUyeler.map(uye => (
                <tr key={uye.id} className='hover:bg-slate-50'>
                  <td className='px-6 py-4 font-medium text-slate-900'>
                    {uye.ad} {uye.soyad}
                  </td>
                  <td className='px-6 py-4'>{uye.membershipType}</td>
                  <td className='px-6 py-4'>
                    {new Date(uye.kayitTarihi).toLocaleDateString('tr-TR')}
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(uye.durum)}`}
                    >
                      {uye.durum}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-right'>
                    <button
                      onClick={() => setSelectedUye(uye)}
                      className='text-blue-600 hover:text-blue-800 font-semibold'
                    >
                      Aidat Takibi
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUyeler.length === 0 && (
          <div className='text-center py-10 text-slate-500'>
            <p>Arama kriterlerine uygun üye bulunamadı.</p>
          </div>
        )}
      </div>
      {selectedUye && (
        <AidatTakipModal
          uye={selectedUye}
          onClose={() => setSelectedUye(null)}
        />
      )}
    </>
  );
};

const AidatTakipModal: React.FC<{ uye: Person; onClose: () => void }> = ({
  uye,
  onClose
}) => {
  const [aidatlar, setAidatlar] = useState<Aidat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [newAidat, setNewAidat] = useState<{ donem: string; tutar: string }>({
    donem: `${new Date().getFullYear()}-01`,
    tutar: '100'
  });



  const fetchAidatlar = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAidatlarByUyeId(uye.id);
      setAidatlar(data);
    } catch (err: any) {
      if (
        err.message &&
        err.message.includes('relation "public.aidatlar" does not exist')
      ) {
        setError(
          "Aidat takip modülü şu anda aktif değil. Lütfen sistem yöneticinizle iletişime geçin. (Veritabanı hatası: 'aidatlar' tablosu bulunamadı)"
        );
      } else {
        setError(err.message || 'Aidat bilgileri yüklenemedi.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAidatlar();
  }, [uye.id]);

  const handleMarkAsPaid = async (aidat: Aidat) => {
    try {
      const updated = await updateAidat(aidat.id, {
        durum: AidatDurumu.ODENDI,
        odemeTarihi: new Date().toISOString().split('T')[0]
      });
      setAidatlar(prev => prev.map(a => (a.id === updated.id ? updated : a)));
    } catch (err) {
      alert('Aidat durumu güncellenirken bir hata oluştu.');
    }
  };

  const handleCreateAidat = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Omit<Aidat, 'id'> = {
        uyeId: uye.id,
        donem: new Date(newAidat.donem).toLocaleString('tr-TR', {
          month: 'long',
          year: 'numeric'
        }),
        tutar: parseFloat(newAidat.tutar),
        durum: AidatDurumu.BEKLEMEDE
      };
      const created = await createAidat(payload);
      setAidatlar(prev => [created, ...prev]);
      setNewAidat({ donem: `${new Date().getFullYear()}-01`, tutar: '100' });
    } catch (err) {
      alert('Yeni aidat oluşturulurken bir hata oluştu.');
    }
  };

  // const handleGenerateReminder = async (aidat: Aidat) => {
  
  //     alert('AI hatırlatma oluşturma özelliği şu anda kullanılamıyor.');
  // };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`${uye.ad} ${uye.soyad} - Aidat Takibi`}
    >
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Aidat Geçmişi */}
        <div className='space-y-3'>
          <h4 className='font-semibold text-slate-800'>Aidat Geçmişi</h4>
          {isLoading && <p>Yükleniyor...</p>}
          {error && (
            <div className='p-4 bg-red-50 text-red-700 rounded-md text-sm'>
              {error}
            </div>
          )}
          <div className='space-y-2 max-h-80 overflow-y-auto pr-2'>
            {!isLoading &&
              !error &&
              aidatlar.map(aidat => (
                <div key={aidat.id} className='p-3 bg-slate-50 rounded-md'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <p className='font-semibold text-slate-700'>
                        {aidat.donem}
                      </p>
                      <p className='text-sm font-bold text-slate-800'>
                        {aidat.tutar.toLocaleString('tr-TR', {
                          style: 'currency',
                          currency: 'TRY'
                        })}
                      </p>
                    </div>
                    {aidat.durum === AidatDurumu.ODENDI ? (
                      <span className='text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                        ÖDENDİ
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkAsPaid(aidat)}
                        className='text-xs bg-yellow-100 text-yellow-800 font-bold px-2 py-1 rounded-full hover:bg-yellow-200'
                      >
                        ÖDENDİ İŞARETLE
                      </button>
                    )}
                  </div>
                  {aidat.durum === AidatDurumu.BEKLEMEDE && (
                    <div className='mt-2 pt-2 border-t'>
              
                    </div>
                  )}
                </div>
              ))}
            {!isLoading && !error && aidatlar.length === 0 && (
              <p className='text-sm text-slate-500'>Aidat kaydı bulunamadı.</p>
            )}
          </div>
        </div>
        {/* Yeni Aidat Ekle */}
        <form
          onSubmit={handleCreateAidat}
          className='space-y-3 p-4 bg-slate-50 rounded-lg self-start'
        >
          <fieldset disabled={!!error}>
            <h4 className='font-semibold text-slate-800'>Yeni Aidat Oluştur</h4>
            <div>
              <label className='text-sm font-medium text-slate-600'>
                Dönem
              </label>
              <input
                type='month'
                value={newAidat.donem}
                onChange={e =>
                  setNewAidat(p => ({ ...p, donem: e.target.value }))
                }
                className='w-full mt-1 p-2 border border-slate-300 rounded-lg'
                required
              />
            </div>
            <div>
              <label className='text-sm font-medium text-slate-600'>
                Tutar (TL)
              </label>
              <input
                type='number'
                step='0.01'
                value={newAidat.tutar}
                onChange={e =>
                  setNewAidat(p => ({ ...p, tutar: e.target.value }))
                }
                className='w-full mt-1 p-2 border border-slate-300 rounded-lg'
                required
              />
            </div>
            <button
              type='submit'
              disabled={!!error}
              className='w-full bg-blue-600 text-white p-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed'
            >
              Oluştur
            </button>
          </fieldset>
        </form>
      </div>
      <div className='pt-4 flex justify-end'>
        <button
          type='button'
          onClick={onClose}
          className='bg-white text-slate-700 px-4 py-2 rounded-lg font-semibold border border-slate-300 hover:bg-slate-50'
        >
          Kapat
        </button>
      </div>
    </Modal>
  );
};

export default UyeYonetimi;
