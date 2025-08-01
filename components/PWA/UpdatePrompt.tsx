import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '../../src/hooks/usePWA';

interface UpdatePromptProps {
  onClose?: () => void;
}

const UpdatePrompt: React.FC<UpdatePromptProps> = ({ onClose }) => {
  const { updateAvailable, updateApp } = usePWA();

  if (!updateAvailable) {
    return null;
  }

  const handleUpdate = () => {
    updateApp();
    onClose?.();
  };

  const handleDismiss = () => {
    onClose?.();
  };

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-full p-2 mr-3">
              <RefreshCw className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Güncelleme Mevcut</h3>
              <p className="text-sm text-gray-600">Yeni özellikler hazır</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Uygulamanın yeni bir sürümü mevcut. Güncellemek için sayfayı yenileyin.
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Güncelle
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
          >
            Sonra
          </button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Güncelleme otomatik olarak uygulanacak ve sayfa yenilenecektir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UpdatePrompt;