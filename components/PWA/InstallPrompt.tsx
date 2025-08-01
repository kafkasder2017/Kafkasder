import React from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWA } from '../../src/hooks/usePWA';

interface InstallPromptProps {
  onClose?: () => void;
}

const InstallPrompt: React.FC<InstallPromptProps> = ({ onClose }) => {
  const { installApp, dismissInstallPrompt, showInstallPrompt } = usePWA();

  if (!showInstallPrompt) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await installApp();
      onClose?.();
    } catch (error) {
      console.error('Installation failed:', error);
    }
  };

  const handleDismiss = () => {
    dismissInstallPrompt();
    onClose?.();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-full p-2 mr-3">
              <Smartphone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Uygulamayı Yükle</h3>
              <p className="text-sm text-gray-600">Daha hızlı erişim için</p>
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
          YED Yönetim uygulamasını cihazınıza yükleyerek çevrimdışı erişim ve daha hızlı performans elde edin.
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Yükle
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
          >
            Şimdi Değil
          </button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-xs text-gray-500">
            <div className="flex items-center mr-4">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
              Çevrimdışı Çalışır
            </div>
            <div className="flex items-center mr-4">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-1"></div>
              Hızlı Başlatma
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full mr-1"></div>
              Ana Ekran
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;