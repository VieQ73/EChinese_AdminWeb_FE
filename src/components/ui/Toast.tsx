import React, { createContext, useCallback, useContext, useState } from 'react';

type Toast = { id: number; message: string; type?: 'info' | 'success' | 'error' | 'warning' };

interface ToastContextValue {
  push: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const t = { id, message, type } as Toast;
    setToasts(s => [t, ...s]);
    setTimeout(() => {
      setToasts(s => s.filter(x => x.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div aria-live="polite" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map(t => (
          <div 
            key={t.id} 
            // Bo góc lớn hơn, bóng đổ rõ ràng và border nhẹ 
            className={`max-w-sm w-full px-4 py-3 rounded-xl shadow-xl text-sm font-semibold transition-opacity duration-300 border ${
              t.type === 'success' ? 'bg-green-600 text-white border-green-700' :
              t.type === 'error' ? 'bg-red-600 text-white border-red-700' :
              t.type === 'warning' ? 'bg-yellow-500 text-white border-yellow-600' :
              'bg-blue-600 text-white border-blue-700'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;
