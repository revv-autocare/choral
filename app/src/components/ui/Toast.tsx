import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface ToastState {
  show: (message: string) => void;
}

const ToastContext = createContext<ToastState | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((m: string) => {
    setMessage(m);
    setTimeout(() => setMessage(null), 2200);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {message && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-dark text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-lg"
          style={{ animation: 'fadeUp .2s ease-out' }}
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastState {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
