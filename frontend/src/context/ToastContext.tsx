import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Toast } from '../components/ui/Toast';

type ToastTone = 'success' | 'error';

interface ToastPayload {
  title: string;
  message: string;
  tone?: ToastTone;
}

interface ToastContextType {
  showToast: (payload: ToastPayload) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<(ToastPayload & { id: number }) | null>(null);

  const showToast = useCallback((payload: ToastPayload) => {
    setToast({ ...payload, tone: payload.tone ?? 'success', id: Date.now() });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          title={toast.title}
          message={toast.message}
          tone={toast.tone}
          onClose={() => setToast(null)}
        />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
