import React from 'react';
import { WifiOff, Wifi, Cloud, CloudOff } from 'lucide-react';
import { usePWA, useOfflineData } from '../../src/hooks/usePWA';

const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWA();
  const { offlineQueue } = useOfflineData();

  if (isOnline && offlineQueue.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-40">
      <div className={`rounded-lg shadow-lg border p-3 transition-all duration-300 ${
        isOnline 
          ? 'bg-yellow-50 border-yellow-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center">
          <div className={`rounded-full p-1.5 mr-3 ${
            isOnline 
              ? 'bg-yellow-100' 
              : 'bg-red-100'
          }`}>
            {isOnline ? (
              <Cloud className={`h-4 w-4 ${
                offlineQueue.length > 0 ? 'text-yellow-600' : 'text-green-600'
              }`} />
            ) : (
              <CloudOff className="h-4 w-4 text-red-600" />
            )}
          </div>
          
          <div className="flex-1">
            {isOnline ? (
              offlineQueue.length > 0 ? (
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Senkronizasyon Bekleniyor
                  </p>
                  <p className="text-xs text-yellow-600">
                    {offlineQueue.length} öğe senkronize edilecek
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Çevrimiçi
                  </p>
                  <p className="text-xs text-green-600">
                    Tüm veriler senkronize
                  </p>
                </div>
              )
            ) : (
              <div>
                <p className="text-sm font-medium text-red-800">
                  Çevrimdışı Mod
                </p>
                <p className="text-xs text-red-600">
                  {offlineQueue.length > 0 
                    ? `${offlineQueue.length} öğe beklemede` 
                    : 'Sınırlı özellikler mevcut'
                  }
                </p>
              </div>
            )}
          </div>
          
          <div className={`w-2 h-2 rounded-full ${
            isOnline 
              ? (offlineQueue.length > 0 ? 'bg-yellow-400' : 'bg-green-400')
              : 'bg-red-400'
          } animate-pulse`}></div>
        </div>
        
        {offlineQueue.length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-600">
              <div className="flex justify-between items-center">
                <span>Bekleyen işlemler:</span>
                <span className="font-medium">{offlineQueue.length}</span>
              </div>
              
              <div className="mt-1 space-y-1">
                {offlineQueue.slice(0, 3).map((item, index) => (
                  <div key={item.id} className="flex justify-between text-xs">
                    <span className="truncate">
                      {item.type === 'donation' ? 'Bağış' : 
                       item.type === 'application' ? 'Başvuru' : 
                       item.type}
                    </span>
                    <span className="text-gray-400 ml-2">
                      {new Date(item.timestamp).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
                
                {offlineQueue.length > 3 && (
                  <div className="text-center text-gray-400">
                    +{offlineQueue.length - 3} daha
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;