import React, { useState, useEffect, useRef } from 'react';

import { ICONS } from '../constants';
import type { ChatMessage } from '../types';

const faqData = [
  {
    question: 'Giriş yapamıyorum, ne yapmalıyım?',
    answer:
      'E-posta ve şifrenizi doğru yazdığınızdan emin olun. Caps Lock tuşunun kapalı olduğunu kontrol edin. Sorun devam ederse, giriş sayfasındaki "Şifremi Unuttum" linkini kullanarak şifrenizi sıfırlayabilirsiniz.'
  },
  {
    question: 'Kaydettiğim veriler görünmüyor.',
    answer:
      'Öncelikle internet bağlantınızı kontrol edin ve sayfayı yenileyin (Ctrl+R veya Cmd+R). Sorun devam ederse, tarayıcınızın önbelleğini temizlemeyi deneyin. Bu adımlar işe yaramazsa sistem yöneticinize başvurun.'
  },
  {
    question: 'Rapor oluştururken hata alıyorum.',
    answer:
      'Seçtiğiniz tarih aralığını ve filtreleri kontrol edin. Çok geniş bir tarih aralığı veya çok fazla veri içeren karmaşık filtreler performansı etkileyebilir ve hataya neden olabilir. Daha küçük aralıklarla deneme yapın. Sorun devam ederse sistem yöneticisine bildirin.'
  },
  {
    question: 'Dosya yükleyemiyorum.',
    answer:
      "Yüklemeye çalıştığınız dosyanın boyutunu ve formatını kontrol edin. Sistem genellikle 10MB'den büyük dosyalara veya belirli formatlar (örn. .exe) dışındaki dosyalara izin vermeyebilir. İzin verilen formatlar genellikle PDF, JPG, PNG, DOCX, XLSX'dir. Dosya boyutu limitini aşıp aşmadığınızı kontrol edin."
  }
];

const FaqItem: React.FC<{
  item: (typeof faqData)[0];
  isOpen: boolean;
  onClick: () => void;
}> = ({ item, isOpen, onClick }) => {
  return (
    <div className='border-b border-slate-200'>
      <button
        onClick={onClick}
        className='w-full flex justify-between items-center text-left py-4 px-2 hover:bg-slate-50'
      >
        <span className='font-semibold text-slate-800'>{item.question}</span>
        <span
          className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          {ICONS.CHEVRON_DOWN}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className='p-4 bg-slate-50 text-slate-600'>
          <p>{item.answer}</p>
        </div>
      </div>
    </div>
  );
};

const Chatbot: React.FC = () => {
  const [history, setHistory] = useState<ChatMessage[]>([
    {
      sender: 'AI Assistant',
      content:
        'Merhaba! Ben KAFKASDER Panel Asistanı. Panel kullanımıyla ilgili size nasıl yardımcı olabilirim?',
      role: 'model',
      text: 'Merhaba! Ben KAFKASDER Panel Asistanı. Panel kullanımıyla ilgili size nasıl yardımcı olabilirim?'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      sender: 'User',
      content: userInput,
      role: 'user',
      text: userInput
    };
    setHistory(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError('');

    try {
      // Simulate AI response for demo purposes
      setTimeout(() => {
        const modelMessage: ChatMessage = {
          sender: 'AI Assistant',
          content: 'Bu özellik şu anda geliştirme aşamasındadır. Lütfen SSS bölümünü kontrol edin veya destek ekibiyle iletişime geçin.',
          role: 'model',
          text: 'Bu özellik şu anda geliştirme aşamasındadır. Lütfen SSS bölümünü kontrol edin veya destek ekibiyle iletişime geçin.'
        };
        setHistory(prev => [...prev, modelMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (e: any) {
      setError(`Mesaj gönderilirken bir hata oluştu: ${e.message}`);
      console.error(e);
      setHistory(prev => [
        ...prev,
        {
          sender: 'AI Assistant',
          content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.',
          role: 'model',
          text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
        }
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-white p-6 rounded-lg shadow-sm'>
      <h3 className='text-xl font-semibold text-slate-800 mb-4'>
        Etkileşimli Panel Asistanı
      </h3>
      <div className='border border-slate-200 rounded-lg flex flex-col h-[60vh] bg-slate-50'>
        <div className='flex-1 p-4 overflow-y-auto space-y-4'>
          {history.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'model' && (
                <div className='w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold'>
                  AI
                </div>
              )}
              <div
                className={`max-w-md p-3 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}
              >
                <p className='text-sm' style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className='flex items-end gap-2 justify-start'>
              <div className='w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold'>
                AI
              </div>
              <div className='max-w-md p-3 rounded-2xl bg-white text-slate-800 rounded-bl-none shadow-sm'>
                <div className='flex items-center space-x-1'>
                  <div className='w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]'></div>
                  <div className='w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]'></div>
                  <div className='w-2 h-2 bg-slate-500 rounded-full animate-bounce'></div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        {error && (
          <div className='p-2 text-center text-sm text-red-600 bg-red-50 border-t'>
            {error}
          </div>
        )}

        <div className='p-4 border-t border-slate-200 bg-white'>
          <form
            onSubmit={handleSendMessage}
            className='flex items-center gap-3'
          >
            <input
              type='text'
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder='Panel kullanımı hakkında bir soru sorun...'
              className='w-full p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              disabled={isLoading}
            />
            <button
              type='submit'
              className='bg-blue-600 text-white p-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-blue-300'
              disabled={isLoading || !userInput.trim()}
            >
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
                <path d='M5 12h14' />
                <path d='m12 5 7 7-7 7' />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Destek: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='max-w-4xl mx-auto space-y-8'>
      <div className='bg-white p-6 rounded-lg shadow-sm'>
        <h2 className='text-2xl font-bold text-slate-800 mb-2'>
          Yardım & Destek
        </h2>
        <p className='text-slate-600'>
          Sıkça karşılaşılan sorunlara çözümler ve destek iletişim bilgileri.
        </p>
      </div>

      <Chatbot />

      <div className='bg-white p-6 rounded-lg shadow-sm'>
        <h3 className='text-xl font-semibold text-slate-800 mb-4'>
          Sıkça Sorulan Sorular (SSS)
        </h3>
        <div className='space-y-2'>
          {faqData.map((item, index) => (
            <FaqItem
              key={index}
              item={item}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>
      </div>

      <div className='bg-white p-6 rounded-lg shadow-sm'>
        <h3 className='text-xl font-semibold text-slate-800 mb-4'>
          Teknik Destek
        </h3>
        <div className='flex items-start space-x-4'>
          <div className='p-3 bg-blue-100 text-blue-600 rounded-full'>
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
              <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'></path>
              <polyline points='22,6 12,13 2,6'></polyline>
            </svg>
          </div>
          <div>
            <p className='text-slate-700'>
              Yukarıdaki çözümler sorununuzu gidermediyse, lütfen sistem
              yöneticinizle iletişime geçin veya aşağıdaki e-posta adresine bir
              bildirim gönderin.
            </p>
            <a
              href='mailto:destek@kafkasyadernegi.org'
              className='mt-2 inline-block text-lg font-semibold text-blue-600 hover:text-blue-800'
            >
              destek@kafkasyadernegi.org
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Destek;
