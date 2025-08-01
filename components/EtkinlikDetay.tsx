import React, { useState, useMemo, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';

import {
  getEtkinlikById,
  getGonulluler,
  getPeople,
  updateEtkinlik
} from '../services/apiService';
import { suggestVolunteersForEvent } from '../services/huggingfaceService';
import type {
  Etkinlik,
  EtkinlikKatilimcisi,
  Person,
  Gonullu,
  VolunteerSuggestion
} from '../types';
import { Beceri, EtkinlikStatus } from '../types';

type EnrichedGonullu = Gonullu & { person: Person };
import Modal from './Modal';

import { ICONS } from '../constants';

const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className='bg-white dark:bg-zinc-800 p-4 rounded-xl shadow-sm flex items-center space-x-4 border border-zinc-200 dark:border-zinc-700'>
    <div className='p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400'>
      {icon}
    </div>
    <div>
      <p className='text-sm text-zinc-500 dark:text-zinc-400'>{label}</p>
      <p className='text-lg font-bold text-zinc-800 dark:text-zinc-200'>
        {value}
      </p>
    </div>
  </div>
);

const getStatusClass = (status: EtkinlikStatus) => {
  switch (status) {
    case EtkinlikStatus.PLANLAMA:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
    case EtkinlikStatus.YAYINDA:
      return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    case EtkinlikStatus.TAMAMLANDI:
      return 'bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300';
    case EtkinlikStatus.IPTAL_EDILDI:
      return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
    default:
      return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-300';
  }
};

const EtkinlikDetay: React.FC = () => {
  const { etkinlikId } = ReactRouterDOM.useParams<{ etkinlikId: string }>();
  const [etkinlik, setEtkinlik] = useState<Etkinlik | null>(null);
  const [gonulluler, setGonulluler] = useState<EnrichedGonullu[]>([]);
  const [peopleMap, setPeopleMap] = useState<Map<number, Person>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<VolunteerSuggestion[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!etkinlikId) {
        setError("Etkinlik ID'si bulunamadı.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');
      try {
        const [eventData, volunteersData, peopleData] = await Promise.all([
          getEtkinlikById(parseInt(etkinlikId, 10)),
          getGonulluler(),
          getPeople()
        ]);

        const localPeopleMap = new Map(peopleData.map(p => [p.id, p]));
        const enrichedVolunteers = volunteersData
          .map(g => ({ ...g, person: localPeopleMap.get(g.personId) }))
          .filter(g => g.person) as EnrichedGonullu[];

        setEtkinlik(eventData);
        setGonulluler(enrichedVolunteers);
        setPeopleMap(localPeopleMap);
      } catch (err: any) {
        setError(err.message || 'Etkinlik detayları yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [etkinlikId]);

  const handleGetAiSuggestions = async () => {
    if (!etkinlik) return;
    setIsAiModalOpen(true);
    setIsAiLoading(true);
    setAiError('');
    setAiSuggestions([]);

    try {
      const alreadyParticipatingIds = new Set(
        etkinlik.katilimcilar?.map(p => p.personId) || []
      );
      const availableVolunteers = gonulluler.filter(
        g => !alreadyParticipatingIds.has(g.personId)
      );

      const suggestions = await suggestVolunteersForEvent(
        etkinlik,
        availableVolunteers
      );
      setAiSuggestions(suggestions);
    } catch (err: any) {
      setAiError(err.message || 'Öneriler alınamadı.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddParticipant = async (personId: number) => {
    if (!etkinlik) return;

    const isAlreadyParticipant = etkinlik.katilimcilar?.some(
      p => p.personId === personId
    );
    if (isAlreadyParticipant) {
      alert('Bu gönüllü zaten etkinliğe katılıyor.');
      return;
    }

    const newParticipant: EtkinlikKatilimcisi = {
      personId,
      kayitTarihi: new Date().toISOString()
    };

    const updatedEtkinlik: Etkinlik = {
      ...etkinlik,
      katilimcilar: [...(etkinlik.katilimcilar || []), newParticipant]
    };

    try {
      const savedEtkinlik = await updateEtkinlik(etkinlik.id, updatedEtkinlik);
      setEtkinlik(savedEtkinlik);
      setAiSuggestions(prev => prev.filter(s => s.personId !== personId));
    } catch (err) {
      alert('Katılımcı eklenirken bir hata oluştu.');
    }
  };

  const handleRemoveParticipant = async (personId: number) => {
    if (
      !etkinlik ||
      !window.confirm(
        'Bu katılımcıyı etkinlikten çıkarmak istediğinizden emin misiniz?'
      )
    )
      return;

    const updatedParticipants =
      etkinlik.katilimcilar?.filter(p => p.personId !== personId) || [];
    const updatedEtkinlik: Etkinlik = {
      ...etkinlik,
      katilimcilar: updatedParticipants
    };

    try {
      const savedEtkinlik = await updateEtkinlik(etkinlik.id, updatedEtkinlik);
      setEtkinlik(savedEtkinlik);
    } catch (err) {
      alert('Katılımcı çıkarılırken bir hata oluştu.');
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

  if (!etkinlik) {
    return (
      <div className='text-center py-20 text-zinc-500'>
        <h2 className='text-2xl font-bold'>Etkinlik Bulunamadı</h2>
        <ReactRouterDOM.Link
          to='/etkinlikler'
          className='mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700'
        >
          Etkinlik Listesine Geri Dön
        </ReactRouterDOM.Link>
      </div>
    );
  }
  const sorumlu = peopleMap.get(etkinlik.sorumluId);

  return (
    <div className='space-y-6'>
      <div className='bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700'>
        <div className='flex justify-between items-start'>
          <div>
            <h2 className='text-2xl font-bold text-zinc-800 dark:text-zinc-200'>
              {etkinlik.ad}
            </h2>
            <p className='text-zinc-600 dark:text-zinc-300 mt-1'>
              {etkinlik.aciklama}
            </p>
          </div>
          <span
            className={`px-3 py-1.5 text-sm font-semibold rounded-full whitespace-nowrap ${getStatusClass(etkinlik.status)}`}
          >
            {etkinlik.status}
          </span>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          label='Sorumlu'
          value={sorumlu ? `${sorumlu.ad} ${sorumlu.soyad}` : 'Belirtilmemiş'}
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <circle cx='12' cy='7' r='4'></circle>
              <path d='M12 14s-7 4-7 7h14c0-3-7-7-7-7z'></path>
            </svg>
          }
        />
        <StatCard
          label='Tarih & Saat'
          value={`${new Date(etkinlik.tarih).toLocaleDateString('tr-TR')} - ${etkinlik.saat}`}
          icon={ICONS.CALENDAR}
        />
        <StatCard
          label='Konum'
          value={etkinlik.konum}
          icon={
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'></path>
              <circle cx='12' cy='10' r='3'></circle>
            </svg>
          }
        />
        <StatCard
          label='Katılımcı Sayısı'
          value={etkinlik.katilimcilar?.length || 0}
          icon={ICONS.PEOPLE}
        />
      </div>

      <div className='bg-white dark:bg-zinc-800 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-lg font-semibold text-zinc-800 dark:text-zinc-200'>
            Katılımcı Gönüllüler
          </h3>
          <button
            onClick={handleGetAiSuggestions}
            className='bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='m12 3-1.9 1.9a2.5 2.5 0 0 0 0 3.5L12 10l1.9-1.9a2.5 2.5 0 0 0 0-3.5L12 3z' />
              <path d='m3 12 1.9 1.9a2.5 2.5 0 0 0 3.5 0L10 12l-1.9-1.9a2.5 2.5 0 0 0-3.5 0L3 12z' />
            </svg>
            <span>AI ile Gönüllü Önerileri Al</span>
          </button>
        </div>
        {etkinlik.katilimcilar && etkinlik.katilimcilar.length > 0 ? (
          <ul className='divide-y divide-zinc-200 dark:divide-zinc-700'>
            {etkinlik.katilimcilar.map(katilimci => {
              const person = peopleMap.get(katilimci.personId);
              if (!person) return null;
              return (
                <li
                  key={katilimci.personId}
                  className='flex items-center justify-between py-3'
                >
                  <div className='flex items-center gap-3'>
                    <img
                      src={
                        person.fotograflar?.[0]?.url ||
                        `https://i.pravatar.cc/100?u=${person.id}`
                      }
                      alt={person.ad}
                      className='w-10 h-10 rounded-full'
                    />
                    <div>
                      <p className='font-semibold text-zinc-800 dark:text-zinc-200'>
                        {person.ad} {person.soyad}
                      </p>
                      <p className='text-sm text-zinc-500 dark:text-zinc-400'>
                        Kayıt:{' '}
                        {new Date(katilimci.kayitTarihi).toLocaleDateString(
                          'tr-TR'
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveParticipant(katilimci.personId)}
                    className='text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1 rounded-md'
                  >
                    Çıkar
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className='text-sm text-center text-zinc-500 py-4'>
            Bu etkinliğe henüz katılımcı eklenmemiş.
          </p>
        )}
      </div>

      {isAiModalOpen && (
        <AiSuggestionsModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          isLoading={isAiLoading}
          error={aiError}
          suggestions={aiSuggestions}
          onAddParticipant={handleAddParticipant}
        />
      )}
    </div>
  );
};

const AiSuggestionsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string;
  suggestions: VolunteerSuggestion[];
  onAddParticipant: (personId: number) => void;
}> = ({ isOpen, onClose, isLoading, error, suggestions, onAddParticipant }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='AI Destekli Gönüllü Önerileri'
    >
      <div className='min-h-[20rem]'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center h-full'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
            <p className='mt-4 text-zinc-500'>
              Gönüllüler etkinlik detaylarına göre analiz ediliyor...
            </p>
          </div>
        ) : error ? (
          <div className='p-4 bg-red-100 text-red-700 rounded-lg'>{error}</div>
        ) : suggestions.length > 0 ? (
          <ul className='space-y-3'>
            {suggestions.map(s => (
              <li
                key={s.personId}
                className='p-3 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg flex items-center justify-between'
              >
                <div>
                  <p className='font-bold text-zinc-800 dark:text-zinc-200'>
                    {s.volunteerName}
                  </p>
                  <p className='text-sm text-zinc-600 dark:text-zinc-300 italic mt-1'>
                    "{s.reasoning}"
                  </p>
                  <div className='flex flex-wrap gap-1 mt-2'>
                    {s.relevantSkills.map(skill => (
                      <span
                        key={skill}
                        className='text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 font-medium px-1.5 py-0.5 rounded'
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => onAddParticipant(s.personId)}
                  className='bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 px-3 py-1 rounded-full text-sm font-bold hover:bg-green-200 dark:hover:bg-green-900 ml-4'
                >
                  Ekle
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className='text-center text-zinc-500 py-10'>
            Uygun gönüllü önerisi bulunamadı.
          </p>
        )}
      </div>
      <div className='pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end'>
        <button
          type='button'
          onClick={onClose}
          className='bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 px-4 py-2 rounded-lg font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600'
        >
          Kapat
        </button>
      </div>
    </Modal>
  );
};

export default EtkinlikDetay;
