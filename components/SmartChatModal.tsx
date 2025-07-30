import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { filterDataConversational } from '../services/geminiService';
import Modal from './Modal';

interface SmartChatModalProps<T> {
    isOpen: boolean;
    onClose: () => void;
    fullDataset: T[];
    onResults: (results: T[]) => void;
    entityName: string; // e.g., 'kişi', 'başvuru'
    exampleQuery: string;
}

const SmartChatModal = <T extends {}>({ isOpen, onClose, fullDataset, onResults, entityName, exampleQuery }: SmartChatModalProps<T>) => {
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [currentFilteredData, setCurrentFilteredData] = useState<T[] | null>(null);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setHistory([{
                role: 'model',
                text: `Merhaba! Filtrelemek istediğiniz ${entityName} özelliklerini yazabilirsiniz.\nÖrneğin: "${exampleQuery}"`
            }]);
            setCurrentFilteredData(null); // Reset on open
        }
    }, [isOpen, entityName, exampleQuery]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: userInput };
        const newHistory = [...history, userMessage];
        setHistory(newHistory);
        const textToProcess = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            const results = await filterDataConversational(
                fullDataset,
                currentFilteredData,
                newHistory,
                textToProcess
            );
            
            setCurrentFilteredData(results);
            onResults(results);

            const modelResponse: ChatMessage = {
                role: 'model',
                text: `Elbette, isteğinize uyan ${results.length} ${entityName} bulundu. Sonuçları tabloda görebilirsiniz. Başka bir kriter eklemek ister misiniz?`
            };
            setHistory(prev => [...prev, modelResponse]);
        } catch (error: any) {
            const errorMessage: ChatMessage = {
                role: 'model',
                text: `Üzgünüm, bir hata oluştu: ${error.message}`
            };
            setHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Akıllı ${entityName.charAt(0).toUpperCase() + entityName.slice(1)} Filtreleme Sohbeti`}>
            <div className="flex flex-col h-[60vh] bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {history.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.role === 'model' && <div className="w-8 h-8 bg-zinc-700 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold dark:bg-zinc-600">AI</div>}
                            <div className={`max-w-md p-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-bl-none border dark:border-zinc-700'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                            <div className="w-8 h-8 bg-zinc-700 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold dark:bg-zinc-600">AI</div>
                            <div className="max-w-md p-3 rounded-2xl bg-white dark:bg-zinc-800 rounded-bl-none shadow-sm border dark:border-zinc-700">
                                <div className="flex items-center space-x-1">
                                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 rounded-b-lg">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Filtre kriteri girin..."
                            className="w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-700"
                            disabled={isLoading}
                        />
                        <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300" disabled={isLoading || !userInput.trim()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        </button>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

export default SmartChatModal;