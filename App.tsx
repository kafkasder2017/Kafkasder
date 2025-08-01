import React, { useState, useEffect, Suspense, lazy } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import * as ReactRouterDOM from 'react-router-dom';

// Core Components (loaded immediately)
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AccessDenied from './components/AccessDenied';

// Lazy-loaded Components for better performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const BagisYonetimi = lazy(() => import('./components/BagisYonetimi'));
const KisiYonetimi = lazy(() => import('./components/KisiYonetimi'));
const KisiDetay = lazy(() => import('./components/KisiDetay'));
const KurumYonetimi = lazy(() => import('./components/KurumYonetimi'));
const YardimBasvurulari = lazy(() => import('./components/YardimBasvurulari'));
const YardimBasvurusuDetay = lazy(() => import('./components/YardimBasvurusuDetay'));
const YardimAlanlar = lazy(() => import('./components/YardimAlanlar'));
const AyniYardimIslemleri = lazy(() => import('./components/AyniYardimIslemleri'));
const TumYardimlarListesi = lazy(() => import('./components/TumYardimlarListesi'));
const VefaDestekYonetimi = lazy(() => import('./components/VefaDestekYonetimi'));
const VefaDestekDetay = lazy(() => import('./components/VefaDestekDetay'));
const YetimYonetimi = lazy(() => import('./components/YetimYonetimi'));
const YetimDetay = lazy(() => import('./components/YetimDetay'));
const OgrenciBurslari = lazy(() => import('./components/OgrenciBurslari'));
const OgrenciBursDetay = lazy(() => import('./components/OgrenciBursDetay'));
const KumbaraYonetimi = lazy(() => import('./components/KumbaraYonetimi'));
const HukukiYardim = lazy(() => import('./components/HukukiYardim'));
const DavaDetay = lazy(() => import('./components/DavaDetay'));
const StokYonetimi = lazy(() => import('./components/StokYonetimi'));
const FinansalKayitlar = lazy(() => import('./components/FinansalKayitlar'));
const ProjeYonetimi = lazy(() => import('./components/ProjeYonetimi'));
const ProjeDetay = lazy(() => import('./components/ProjeDetay'));
const EtkinlikYonetimi = lazy(() => import('./components/EtkinlikYonetimi'));
const EtkinlikDetay = lazy(() => import('./components/EtkinlikDetay'));
const Takvim = lazy(() => import('./components/Takvim'));
const GonulluYonetimi = lazy(() => import('./components/GonulluYonetimi'));
const GonulluDetay = lazy(() => import('./components/GonulluDetay'));
const UyeYonetimi = lazy(() => import('./components/UyeYonetimi'));
const HastaneSevkYonetimi = lazy(() => import('./components/HastaneSevkYonetimi'));
const HizmetTakipYonetimi = lazy(() => import('./components/HizmetTakipYonetimi'));
const OdemeYonetimi = lazy(() => import('./components/OdemeYonetimi'));
const TopluIletisim = lazy(() => import('./components/TopluIletisim'));
const MesajRaporlari = lazy(() => import('./components/MesajRaporlari'));
const HaritaModulu = lazy(() => import('./components/HaritaModulu'));
const BulkImport = lazy(() => import('./components/BulkImport'));
const KullaniciYonetimi = lazy(() => import('./components/KullaniciYonetimi'));
const DenetimKayitlari = lazy(() => import('./components/DenetimKayitlari'));
const Ayarlar = lazy(() => import('./components/Ayarlar'));
const ApiEntegrasyonu = lazy(() => import('./components/ApiEntegrasyonu'));
const Bildirimler = lazy(() => import('./components/Bildirimler'));
const Profil = lazy(() => import('./components/Profil'));
const RaporlamaAnalitik = lazy(() => import('./components/Raporlar'));
const DokumanArsivi = lazy(() => import('./components/DosyaYonetimi'));
const Destek = lazy(() => import('./components/Destek'));
const BaskanOnayi = lazy(() => import('./components/BaskanOnayi').then(module => ({ default: module.BaskanOnayi })));

// Integration Components
const EntegrasyonAyarlari = lazy(() => import('./components/EntegrasyonAyarlari'));
const MuhasebeEntegrasyonu = lazy(() => import('./components/MuhasebeEntegrasyonu'));
const OtomatikBagisTakibi = lazy(() => import('./components/OtomatikBagisTakibi'));
const EDevletEntegrasyonu = lazy(() => import('./components/EDevletEntegrasyonu'));
const WhatsAppEntegrasyonu = lazy(() => import('./components/WhatsAppEntegrasyonu'));

// PWA Components
import InstallPrompt from './components/PWA/InstallPrompt';
import UpdatePrompt from './components/PWA/UpdatePrompt';
import OfflineIndicator from './components/PWA/OfflineIndicator';
import ErrorBoundary from './components/ErrorBoundary';

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Yükleniyor...</span>
  </div>
);
import { NAVIGATION_ITEMS, ICONS } from './constants';
import { useSupabaseQuery } from './hooks/useData';
import {
  updateUser,
  login,
  signOut,
  createDenetimKaydi,
  getProfileForUser
} from './services/apiService';
import { supabase } from './services/supabaseClient';
import {
  BildirimDurumu,
  KullaniciRol,
  LogAction,
  LogEntityType,
  BagisTuru
} from './types';
import type {
  NavItem,
  Bildirim,
  Profil as ProfilData,
  Kullanici
} from './types';

// #region Layout Components
interface SidebarProps {
  user: ProfilData;
  onSignOut: () => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = React.memo(({ user, onSignOut, isOpen }) => {
  const hasAccess = (item: NavItem) => {
    if (user.rol === KullaniciRol.YONETICI) {
      return true; // Yönetici her şeyi görür
    }
    if (!item.roles || item.roles.length === 0) {
      return true; // Rol tanımlanmamışsa herkese açık
    }
    return item.roles.includes(user.rol as KullaniciRol);
  };

  const visibleNavItems = NAVIGATION_ITEMS.map(item => {
    if (!item.subItems) {
      return hasAccess(item) ? item : null;
    }

    const visibleSubItems = item.subItems.filter(hasAccess);

    if (visibleSubItems.length > 0) {
      return { ...item, subItems: visibleSubItems };
    }

    return hasAccess(item) && item.path !== '#' && visibleSubItems.length === 0
      ? item
      : visibleSubItems.length > 0
        ? { ...item, subItems: visibleSubItems }
        : null;
  }).filter(Boolean) as NavItem[];

  return (
    <aside
      className={`w-64 flex-shrink-0 bg-white dark:bg-zinc-900 flex flex-col fixed inset-y-0 left-0 z-50 border-r border-zinc-200 dark:border-zinc-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className='h-16 flex items-center justify-center border-b border-zinc-200 dark:border-zinc-800'>
        <h1 className='text-xl font-bold text-zinc-800 dark:text-white tracking-wider'>
          KAFKASDER
        </h1>
      </div>
      <nav className='flex-1 px-4 py-6 space-y-1.5 overflow-y-auto'>
        {visibleNavItems.map(item => (
          <CollapsibleNavItem key={item.path} item={item} />
        ))}
      </nav>
      <div className='p-4 border-t border-zinc-200 dark:border-zinc-800'>
        <button
          onClick={onSignOut}
          className='w-full flex items-center px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors'
        >
          {ICONS.LOGOUT}
          <span className='ml-3'>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
});

const Header: React.FC<{
  unreadCount: number;
  title: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onMenuClick: () => void;
}> = React.memo(({ unreadCount, title, theme, toggleTheme, onMenuClick }) => {
  return (
    <header className='fixed top-0 left-0 right-0 lg:left-64 h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-40 flex items-center justify-between px-4 lg:px-6'>
      <div className='flex items-center'>
        <button
          onClick={onMenuClick}
          className='lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        >
          {ICONS.HAMBURGER}
        </button>
        <h1 className='ml-2 lg:ml-0 text-lg font-semibold text-zinc-800 dark:text-white'>
          {title}
        </h1>
      </div>
      <div className='flex items-center space-x-4'>
        <button
          onClick={toggleTheme}
          className='p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        >
          {theme === 'dark' ? ICONS.SUN : ICONS.MOON}
        </button>
        <ReactRouterDOM.Link
          to='/bildirimler'
          className='relative p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        >
          {ICONS.BELL}
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </ReactRouterDOM.Link>
      </div>
    </header>
  );
});

const PageTitle: React.FC<{ children: (title: string) => React.ReactNode }> = ({
  children
}) => {
  const location = ReactRouterDOM.useLocation();

  const findNavItem = (items: NavItem[], path: string): NavItem | undefined => {
    for (const item of items) {
      if (item.path === path) return item;
      if (item.subItems) {
        const found = findNavItem(item.subItems, path);
        if (found) return found;
      }
    }
    return items.find(item => path.startsWith(item.path) && item.path !== '/');
  };

  const navItem =
    findNavItem(NAVIGATION_ITEMS, location.pathname) ||
    NAVIGATION_ITEMS.find(item => item.path === location.pathname);
  const title = navItem?.name || 'Sayfa Bulunamadı';

  return <>{children(title)}</>;
};

const CollapsibleNavItem: React.FC<{ item: NavItem }> = React.memo(({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = ReactRouterDOM.useLocation();
  const isActive =
    location.pathname === item.path ||
    (item.subItems &&
      item.subItems.some(sub => location.pathname === sub.path));

  if (!item.subItems || item.subItems.length === 0) {
    return <NavItemLink item={item} />;
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        <div className='flex items-center'>
          {item.icon && <span className='mr-3'>{item.icon}</span>}
          <span>{item.name}</span>
        </div>
        <span
          className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          {ICONS.CHEVRON_DOWN}
        </span>
      </button>
      {isOpen && (
        <div className='ml-6 mt-1 space-y-1'>
          {item.subItems.map(subItem => (
            <NavItemLink key={subItem.path} item={subItem} isSubItem />
          ))}
        </div>
      )}
      </div>
  );
});

const NavItemLink: React.FC<{ item: NavItem; isSubItem?: boolean }> = React.memo(({
  item,
  isSubItem
}) => {
  const location = ReactRouterDOM.useLocation();
  const isActive = location.pathname === item.path;

  return (
    <ReactRouterDOM.Link
      to={item.path}
      className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
          : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      } ${isSubItem ? 'ml-4' : ''}`}
    >
      {}
      <div className='flex items-center'>
        {item.icon && !isSubItem && <span className='mr-3'>{item.icon}</span>}
        {}
        <span>{item.name}</span>
      </div>
    </ReactRouterDOM.Link>
  );
});

// Main Layout Component with Outlet for nested routing
const MainLayout: React.FC<{ user: ProfilData; onSignOut: () => void }> = ({
  user,
  onSignOut
}) => {
  const [profileState, setProfileState] = useState<ProfilData>(user);
  const { data: notifications } = useSupabaseQuery<Bildirim>('bildirimler');
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as any) || 'light'
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const unreadCount = React.useMemo(
    () =>
      (notifications || []).filter(n => n.durum === BildirimDurumu.OKUNMADI)
        .length,
    [notifications]
  );

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    setProfileState(user);
  }, [user]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const handleProfileSave = async (updatedProfile: ProfilData) => {
    const promise = new Promise<ProfilData>(async (resolve, reject) => {
      try {
        const payload: Partial<Kullanici> = {
          kullaniciAdi: updatedProfile.adSoyad,
          email: updatedProfile.email
        };

        const savedUser = await updateUser(updatedProfile.id, payload);

        const updatedProfilData: ProfilData = {
          ...updatedProfile,
          id: savedUser.id,
          adSoyad: savedUser.kullaniciAdi,
          email: savedUser.email,
          rol: savedUser.rol
        };

        setProfileState(updatedProfilData);
        resolve(updatedProfilData);
      } catch (err) {
        console.error('Profil kaydedilirken hata:', err);
        reject(err);
      }
    });

    toast.promise(promise, {
      loading: 'Profil güncelleniyor...',
      success: 'Profil başarıyla güncellendi!',
      error: 'Profil güncellenirken bir hata oluştu.'
    });
  };

  const getRouteElement = (path: string, element: React.ReactElement) => {
    const findNavItemByPath = (
      items: NavItem[],
      path: string
    ): NavItem | undefined => {
      for (const item of items) {
        if (item.path === path) return item;
        if (item.subItems) {
          const found = findNavItemByPath(item.subItems, path);
          if (found) return found;
        }
      }
      return items.find(
        item => path.startsWith(item.path) && item.path !== '/'
      );
    };
    const navItem =
      findNavItemByPath(NAVIGATION_ITEMS, path) ||
      NAVIGATION_ITEMS.find(item => item.path === path);

    return (
      <ProtectedRoute
        userRole={user.rol as KullaniciRol}
        allowedRoles={navItem?.roles || []}
      >
        {element}
      </ProtectedRoute>
    );
  };

  return (
    <div className='flex h-screen text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900'>
      {isSidebarOpen && (
        <div
          className='fixed inset-0 bg-black/60 z-40 lg:hidden'
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden='true'
        ></div>
      )}
      <Sidebar
        user={profileState}
        onSignOut={onSignOut}
        isOpen={isSidebarOpen}
      />
      <main className='flex-1 flex flex-col lg:pl-64'>
        <PageTitle>
          {title => (
            <Header
              unreadCount={unreadCount}
              title={title}
              theme={theme}
              toggleTheme={toggleTheme}
              onMenuClick={() => setIsSidebarOpen(true)}
            />
          )}
        </PageTitle>
        <div className='flex-1 p-4 pt-20 sm:p-6 lg:p-8 lg:pt-24 overflow-y-auto'>
          <Suspense fallback={<LoadingSpinner />}>
            <ReactRouterDOM.Routes>
            {/* Dashboard */}
            <ReactRouterDOM.Route
              path='/'
              element={getRouteElement('/', <Dashboard />)}
            />

            {/* Bağış Yönetimi Routes */}
            <ReactRouterDOM.Route path='/bagis-yonetimi'>
              <ReactRouterDOM.Route
                path='tum-bagislar'
                element={getRouteElement(
                  '/bagis-yonetimi/tum-bagislar',
                  <BagisYonetimi key='tum-bagislar' initialFilter='all' />
                )}
              />
              <ReactRouterDOM.Route
                path='nakit'
                element={getRouteElement(
                  '/bagis-yonetimi/nakit',
                  <BagisYonetimi
                    key='nakit-bagislar'
                    initialFilter={BagisTuru.NAKIT}
                  />
                )}
              />
              <ReactRouterDOM.Route
                path='ayni'
                element={getRouteElement(
                  '/bagis-yonetimi/ayni',
                  <BagisYonetimi
                    key='ayni-bagislar'
                    initialFilter={BagisTuru.AYNI}
                  />
                )}
              />
            </ReactRouterDOM.Route>
            <ReactRouterDOM.Route
              path='/kumbaralar'
              element={getRouteElement('/kumbaralar', <KumbaraYonetimi />)}
            />

            {/* Kişiler & Kurumlar Routes */}
            <ReactRouterDOM.Route path='/kisiler'>
              <ReactRouterDOM.Route
                index
                element={getRouteElement('/kisiler', <KisiYonetimi />)}
              />
              <ReactRouterDOM.Route
                path=':kisiId'
                element={getRouteElement('/kisiler', <KisiDetay />)}
              />
            </ReactRouterDOM.Route>
            <ReactRouterDOM.Route path='/gonulluler'>
              <ReactRouterDOM.Route
                index
                element={getRouteElement('/gonulluler', <GonulluYonetimi />)}
              />
              <ReactRouterDOM.Route
                path=':gonulluId'
                element={getRouteElement('/gonulluler', <GonulluDetay />)}
              />
            </ReactRouterDOM.Route>
            <ReactRouterDOM.Route
              path='/kurumlar'
              element={getRouteElement('/kurumlar', <KurumYonetimi />)}
            />

            {/* Yardım Yönetimi Routes */}
            <ReactRouterDOM.Route
              path='/ihtiyac-sahipleri'
              element={getRouteElement('/ihtiyac-sahipleri', <YardimAlanlar />)}
            />
            <ReactRouterDOM.Route path='/yardimlar'>
              <ReactRouterDOM.Route
                index
                element={getRouteElement('/yardimlar', <YardimBasvurulari />)}
              />
              <ReactRouterDOM.Route
                path=':basvuruId'
                element={getRouteElement(
                  '/yardimlar',
                  <YardimBasvurusuDetay />
                )}
              />
            </ReactRouterDOM.Route>
            <ReactRouterDOM.Route path='/yardim-yonetimi'>
              <ReactRouterDOM.Route
                path='nakdi-yardimlar'
                element={getRouteElement(
                  '/yardim-yonetimi/nakdi-yardimlar',
                  <OdemeYonetimi />
                )}
              />
              <ReactRouterDOM.Route
                path='ayni-yardimlar'
                element={getRouteElement(
                  '/yardim-yonetimi/ayni-yardimlar',
                  <AyniYardimIslemleri />
                )}
              />
              <ReactRouterDOM.Route
                path='tum-yardimlar'
                element={getRouteElement(
                  '/yardim-yonetimi/tum-yardimlar',
                  <TumYardimlarListesi />
                )}
              />
              <ReactRouterDOM.Route
                path='hizmet-takip'
                element={getRouteElement(
                  '/yardim-yonetimi/hizmet-takip',
                  <HizmetTakipYonetimi />
                )}
              />
              <ReactRouterDOM.Route
                path='hastane-sevk'
                element={getRouteElement(
                  '/yardim-yonetimi/hastane-sevk',
                  <HastaneSevkYonetimi />
                )}
              />
            </ReactRouterDOM.Route>
            <ReactRouterDOM.Route
              path='/depo-yonetimi'
              element={getRouteElement('/depo-yonetimi', <StokYonetimi />)}
            />
            <ReactRouterDOM.Route path='/vefa-destek'>
              <ReactRouterDOM.Route
                index
                element={getRouteElement(
                  '/vefa-destek',
                  <VefaDestekYonetimi />
                )}
              />
              <ReactRouterDOM.Route
                path=':vefaId'
                element={getRouteElement('/vefa-destek', <VefaDestekDetay />)}
              />
            </ReactRouterDOM.Route>
            <ReactRouterDOM.Route
              path='/odemeler'
              element={getRouteElement('/odemeler', <OdemeYonetimi />)}
            />
            <ReactRouterDOM.Route
              path='/baskan-onayi'
              element={getRouteElement('/baskan-onayi', <BaskanOnayi />)}
            />

            {/* Diğer Ana Menüler */}
            <ReactRouterDOM.Route
              path='/harita'
              element={getRouteElement('/harita', <HaritaModulu />)}
            />
            <ReactRouterDOM.Route
              path='/dokuman-arsivi'
              element={getRouteElement('/dokuman-arsivi', <DokumanArsivi />)}
            />
            <ReactRouterDOM.Route
              path='/uyeler'
              element={getRouteElement('/uyeler', <UyeYonetimi />)}
            />
            <ReactRouterDOM.Route
              path='/takvim'
              element={getRouteElement('/takvim', <Takvim />)}
            />
            <ReactRouterDOM.Route
              path='/finansal-kayitlar'
              element={getRouteElement(
                '/finansal-kayitlar',
                <FinansalKayitlar />
              )}
            />
            <ReactRouterDOM.Route
              path='/toplu-iletisim'
              element={getRouteElement('/toplu-iletisim', <TopluIletisim />)}
            />
            <ReactRouterDOM.Route
              path='/mesajlasma/raporlar'
              element={getRouteElement(
                '/mesajlasma/raporlar',
                <MesajRaporlari />
              )}
            />
            <ReactRouterDOM.Route path='/projeler'>
              <ReactRouterDOM.Route
                index
                element={getRouteElement('/projeler', <ProjeYonetimi />)}
              />
              <ReactRouterDOM.Route
                path=':projeId'
                element={getRouteElement('/projeler', <ProjeDetay />)}
              />
            </ReactRouterDOM.Route>
            <ReactRouterDOM.Route
              path='/raporlama-analitik'
              element={getRouteElement(
                '/raporlama-analitik',
                <RaporlamaAnalitik />
              )}
            />
            <ReactRouterDOM.Route path='/etkinlikler'>
              <ReactRouterDOM.Route
                index
                element={getRouteElement('/etkinlikler', <EtkinlikYonetimi />)}
              />
              <ReactRouterDOM.Route
                path=':etkinlikId'
                element={getRouteElement('/etkinlikler', <EtkinlikDetay />)}
              />
            </ReactRouterDOM.Route>
            <ReactRouterDOM.Route path='/burslar'>
              <ReactRouterDOM.Route
                index
                element={getRouteElement('/burslar', <OgrenciBurslari />)}
              />
              <ReactRouterDOM.Route
                path=':bursId'
                element={getRouteElement('/burslar', <OgrenciBursDetay />)}
              />
            </ReactRouterDOM.Route>
            <ReactRouterDOM.Route path='/yetimler'>
              <ReactRouterDOM.Route
                index
                element={getRouteElement('/yetimler', <YetimYonetimi />)}
              />
              <ReactRouterDOM.Route
                path=':yetimId'
                element={getRouteElement('/yetimler', <YetimDetay />)}
              />
            </ReactRouterDOM.Route>
            <ReactRouterDOM.Route path='/hukuki-yardim'>
              <ReactRouterDOM.Route
                index
                element={getRouteElement('/hukuki-yardim', <HukukiYardim />)}
              />
              <ReactRouterDOM.Route
                path=':davaId'
                element={getRouteElement('/hukuki-yardim', <DavaDetay />)}
              />
            </ReactRouterDOM.Route>
            <ReactRouterDOM.Route
              path='/destek'
              element={getRouteElement('/destek', <Destek />)}
            />

            {/* Toplu Veri Yükleme */}
            <ReactRouterDOM.Route
              path='/toplu-veri-yukleme'
              element={getRouteElement('/toplu-veri-yukleme', <BulkImport />)}
            />

            {/* Parametreler Routes */}
            <ReactRouterDOM.Route
              path='/kullanicilar'
              element={getRouteElement('/kullanicilar', <KullaniciYonetimi />)}
            />
            <ReactRouterDOM.Route
              path='/denetim-kayitlari'
              element={getRouteElement(
                '/denetim-kayitlari',
                <DenetimKayitlari />
              )}
            />
            <ReactRouterDOM.Route path='/ayarlar'>
              <ReactRouterDOM.Route
                path='genel'
                element={getRouteElement('/ayarlar/genel', <Ayarlar />)}
              />
              <ReactRouterDOM.Route
                path='api-entegrasyonlari'
                element={getRouteElement(
                  '/ayarlar/api-entegrasyonlari',
                  <ApiEntegrasyonu />
                )}
              />
            </ReactRouterDOM.Route>

            {/* Entegrasyon Routes */}
            <ReactRouterDOM.Route path='/entegrasyonlar'>
              <ReactRouterDOM.Route
                path='ayarlar'
                element={getRouteElement(
                  '/entegrasyonlar/ayarlar',
                  <EntegrasyonAyarlari />
                )}
              />
              <ReactRouterDOM.Route
                path='muhasebe'
                element={getRouteElement(
                  '/entegrasyonlar/muhasebe',
                  <MuhasebeEntegrasyonu />
                )}
              />
              <ReactRouterDOM.Route
                path='otomatik-bagis-takibi'
                element={getRouteElement(
                  '/entegrasyonlar/otomatik-bagis-takibi',
                  <OtomatikBagisTakibi />
                )}
              />
              <ReactRouterDOM.Route
                path='e-devlet'
                element={getRouteElement(
                  '/entegrasyonlar/e-devlet',
                  <EDevletEntegrasyonu />
                )}
              />
              <ReactRouterDOM.Route
                path='whatsapp'
                element={getRouteElement(
                  '/entegrasyonlar/whatsapp',
                  <WhatsAppEntegrasyonu />
                )}
              />
            </ReactRouterDOM.Route>

            {/* App-level Routes */}
            <ReactRouterDOM.Route
              path='/bildirimler'
              element={<Bildirimler />}
            />
            <ReactRouterDOM.Route
              path='/profil'
              element={
                <Profil profile={profileState} onSave={handleProfileSave} />
              }
            />
            <ReactRouterDOM.Route
              path='/access-denied'
              element={<AccessDenied />}
            />

            {/* Catch-all route */}
            <ReactRouterDOM.Route
              path='*'
              element={<ReactRouterDOM.Navigate to='/' replace />}
            />
            </ReactRouterDOM.Routes>
          </Suspense>
        </div>
      </main>
      
      {/* PWA Components */}
      <InstallPrompt />
      <UpdatePrompt />
      <OfflineIndicator />
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<ProfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const profile = await getProfileForUser(session.user);
          if (profile) {
            setCurrentUser(profile);
            setAuthError(null);
          } else {
            // Fallback for when table exists but user is not in it
            console.warn(
              'User profile not found in "kullanicilar" table. Creating a mock admin profile as a fallback.'
            );
            const mockProfile: ProfilData = {
              id: 999, // A mock ID
              adSoyad: session.user.email?.split('@')[0] || 'Yönetici',
              email: session.user.email || 'admin@kafkader.org',
              rol: KullaniciRol.YONETICI,
              telefon: '0000000000',
              profilFotoUrl: `https://i.pravatar.cc/100?u=${session.user.email}`
            };
            setCurrentUser(mockProfile);
            setAuthError(null);
          }
        } catch (error: any) {
          console.error('Error fetching user profile:', error);
          const errorMsg = String(error.message || '').toLowerCase();

          // Check for common, non-critical database setup issues and fall back to a mock profile.
          const isDbSetupError =
            errorMsg.includes(
              'relation "public.kullanicilar" does not exist'
            ) ||
            errorMsg.includes(
              'relation \\"public.kullanicilar\\" does not exist'
            ) ||
            errorMsg.includes('infinite recursion detected');

          if (isDbSetupError) {
            console.warn(
              `Database setup issue detected (${errorMsg}). Creating a mock admin profile as a fallback.`
            );
            const mockProfile: ProfilData = {
              id: 999, // A mock ID
              adSoyad: session.user.email?.split('@')[0] || 'Yönetici',
              email: session.user.email || 'admin@kafkader.org',
              rol: KullaniciRol.YONETICI,
              telefon: '0000000000',
              profilFotoUrl: `https://i.pravatar.cc/100?u=${session.user.email}`
            };
            setCurrentUser(mockProfile);
            setAuthError(null);
          } else {
            setAuthError(
              `Profil yüklenirken bir hata oluştu: ${error.message}`
            );
            await signOut();
            setCurrentUser(null);
          }
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    if (currentUser) {
      try {
        await createDenetimKaydi({
          timestamp: new Date().toISOString(),
          kullaniciId: currentUser.id,
          kullaniciAdi: currentUser.adSoyad,
          eylem: LogAction.LOGOUT,
          entityTipi: LogEntityType._SYSTEM,
          aciklama: `${currentUser.adSoyad} sistemden çıkış yaptı.`
        });
      } catch (error: any) {
        console.error('Error creating audit log on sign out:', error);
      }
    }
    await signOut();
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='flex flex-col items-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600'></div>
          <p className='text-zinc-600 dark:text-zinc-300 mt-4'>
            Oturum kontrol ediliyor...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={login} />;
  }

  if (authError) {
    return (
      <div className='flex items-center justify-center h-screen bg-zinc-50 dark:bg-zinc-900'>
        <div className='w-full max-w-md p-8 space-y-4 bg-white dark:bg-zinc-800 rounded-2xl shadow-lg text-center'>
          <h2 className='text-xl font-bold text-red-600'>Kritik Hata</h2>
          <p className='text-zinc-600 dark:text-zinc-300'>{authError}</p>
          <button
            onClick={handleSignOut}
            className='mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700'
          >
            Giriş Ekranına Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <ReactRouterDOM.HashRouter>
        <Toaster position='top-center' reverseOrder={false} />
        <MainLayout user={currentUser} onSignOut={handleSignOut} />
      </ReactRouterDOM.HashRouter>
    </ErrorBoundary>
  );
};

export default App;
