import L from 'leaflet';
import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import type { Person } from '../types';
import type { Kumbara } from '../types';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  type: 'recipients' | 'volunteers' | 'kumbaralar';
  data: Person | Kumbara;
}

const getMarkerIcon = (type: string): L.Icon => {
  const iconSize: [number, number] = [25, 41];
  const iconAnchor: [number, number] = [12, 41];
  const popupAnchor: [number, number] = [1, -34];

  switch (type) {
    case 'recipients':
      return L.icon({
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-red.png',
        iconSize,
        iconAnchor,
        popupAnchor
      });
    case 'volunteers':
      return L.icon({
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-green.png',
        iconSize,
        iconAnchor,
        popupAnchor
      });
    case 'kumbaralar':
      return L.icon({
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-blue.png',
        iconSize,
        iconAnchor,
        popupAnchor
      });
    default:
      return L.icon({
        iconUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconSize,
        iconAnchor,
        popupAnchor
      });
  }
};

const PersonPopup: React.FC<{ person: Person }> = ({ person }) => (
  <div className='p-2'>
    <h3 className='font-semibold text-sm'>
      {person.ad} {person.soyad}
    </h3>
    <p className='text-xs text-gray-600'>{person.cepTelefonu}</p>
    <p className='text-xs text-gray-600'>{person.adres}</p>
  </div>
);

const KumbaraPopup: React.FC<{ kumbara: Kumbara }> = ({ kumbara }) => (
  <div className='p-2'>
    <h3 className='font-semibold text-sm'>{kumbara.code}</h3>
    <p className='text-xs text-gray-600'>{kumbara.location}</p>
    <p className='text-xs text-gray-600'>
      Toplam: {kumbara.balance?.toLocaleString('tr-TR')} TL
    </p>
  </div>
);

const MapUpdater: React.FC<{ center: [number, number] }> = ({
  center
}: {
  center: [number, number];
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
};

const HaritaModulu: React.FC = () => {
  const [selectedType, setSelectedType] = useState<
    'all' | 'recipients' | 'volunteers' | 'kumbaralar'
  >('all');
  const [center, setCenter] = useState<[number, number]>([41.0082, 28.9784]); // Istanbul

  const mapPoints = useMemo((): MapPoint[] => {
    const points: MapPoint[] = [];

    // Mock data kaldırıldı - artık boş array kullanılıyor
    // Gerçek veri API'den gelecek

    return points;
  }, []);

  const filteredPoints = useMemo(() => {
    if (selectedType === 'all') return mapPoints;
    return mapPoints.filter(point => point.type === selectedType);
  }, [mapPoints, selectedType]);

  const handleTypeChange = (
    type: 'all' | 'recipients' | 'volunteers' | 'kumbaralar'
  ) => {
    setSelectedType(type);
  };

  return (
    <div className='h-full flex flex-col'>
      <div className='bg-white dark:bg-zinc-800 p-4 border-b border-zinc-200 dark:border-zinc-700'>
        <h1 className='text-2xl font-bold text-zinc-800 dark:text-white mb-4'>
          Harita Modülü
        </h1>

        <div className='flex flex-wrap gap-2 mb-4'>
          <button
            onClick={() => handleTypeChange('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
            }`}
          >
            Tümü ({mapPoints.length})
          </button>
          <button
            onClick={() => handleTypeChange('recipients')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === 'recipients'
                ? 'bg-red-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
            }`}
          >
            Yardım Alanlar (
            {mapPoints.filter(p => p.type === 'recipients').length})
          </button>
          <button
            onClick={() => handleTypeChange('volunteers')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === 'volunteers'
                ? 'bg-green-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
            }`}
          >
            Gönüllüler ({mapPoints.filter(p => p.type === 'volunteers').length})
          </button>
          <button
            onClick={() => handleTypeChange('kumbaralar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === 'kumbaralar'
                ? 'bg-blue-500 text-white'
                : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
            }`}
          >
            Kumbaralar ({mapPoints.filter(p => p.type === 'kumbaralar').length})
          </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm'>
          <div className='bg-red-50 dark:bg-red-900/20 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
              <span className='font-medium'>Yardım Alanlar</span>
            </div>
            <p className='text-red-600 dark:text-red-400 mt-1'>
              {mapPoints.filter(p => p.type === 'recipients').length} kişi
            </p>
          </div>
          <div className='bg-green-50 dark:bg-green-900/20 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-green-500 rounded-full'></div>
              <span className='font-medium'>Gönüllüler</span>
            </div>
            <p className='text-green-600 dark:text-green-400 mt-1'>
              {mapPoints.filter(p => p.type === 'volunteers').length} kişi
            </p>
          </div>
          <div className='bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 bg-blue-500 rounded-full'></div>
              <span className='font-medium'>Kumbaralar</span>
            </div>
            <p className='text-blue-600 dark:text-blue-400 mt-1'>
              {mapPoints.filter(p => p.type === 'kumbaralar').length} adet
            </p>
          </div>
        </div>
      </div>

      <div className='flex-1 relative'>
        <MapContainer
          center={center}
          zoom={10}
          className='h-full w-full'
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {filteredPoints.map(point => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={getMarkerIcon(point.type)}
            >
              <Popup>
                {point.type === 'recipients' || point.type === 'volunteers' ? (
                  <PersonPopup person={point.data as Person} />
                ) : (
                  <KumbaraPopup kumbara={point.data as Kumbara} />
                )}
              </Popup>
            </Marker>
          ))}

          <MapUpdater center={center} />
        </MapContainer>
      </div>
    </div>
  );
};

export default HaritaModulu;
