import React, { useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants';
import { NavItem } from '../types';

const PlaceholderPage: React.FC = () => {
    const location = ReactRouterDOM.useLocation();
    
    const pageTitle = useMemo(() => {
        const findNavItem = (items: NavItem[], path: string): NavItem | undefined => {
            for(const item of items) {
                if (item.path === path) return item;
                if (item.subItems) {
                    const found = findNavItem(item.subItems, path);
                    if (found) return found;
                }
            }
            return undefined;
        };
        const navItem = findNavItem(NAVIGATION_ITEMS, location.pathname);
        return navItem ? navItem.name : "Sayfa";
    }, [location.pathname]);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center bg-white dark:bg-zinc-800 p-8 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 dark:text-zinc-500">
                <path d="M12.5 2.016a2.5 2.5 0 0 0-5 0"/><path d="M2.498 14.032a2.5 2.5 0 0 0 4.33-2.5L4.17 7.5a2.5 2.5 0 0 0-4.33 2.5l2.658 4.032Z"/><path d="M21.502 14.032a2.5 2.5 0 0 1-4.33-2.5l2.658-4.034a2.5 2.5 0 0 1 4.33 2.5l-2.658 4.034Z"/><path d="m7.886 21.92-1.732-1a2.5 2.5 0 0 1 0-4.33l1.732-1"/><path d="m16.114 21.92 1.732-1a2.5 2.5 0 0 0 0-4.33l-1.732-1"/><path d="M9 17.028h6"/>
            </svg>
            <h1 className="mt-6 text-3xl font-bold text-zinc-800 dark:text-zinc-200">{pageTitle}</h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-300">Bu sayfa şu anda yapım aşamasındadır.</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Çok yakında hizmetinizde olacak. Anlayışınız için teşekkür ederiz.</p>
            <ReactRouterDOM.Link 
                to="/"
                className="mt-8 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
                Ana Sayfaya Dön
            </ReactRouterDOM.Link>
        </div>
    );
};

export default PlaceholderPage;