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
          <div key={t.id} className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
            t.type === 'success' ? 'bg-green-50 text-green-800 border border-green-100' :
            t.type === 'error' ? 'bg-red-50 text-red-800 border border-red-100' :
            t.type === 'warning' ? 'bg-yellow-50 text-yellow-800 border border-yellow-100' :
            'bg-white text-gray-900 border border-gray-100'
          }`}>
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
