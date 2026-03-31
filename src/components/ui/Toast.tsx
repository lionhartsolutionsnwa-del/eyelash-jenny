'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  dismissing?: boolean;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null);

function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Accent colors                                                      */
/* ------------------------------------------------------------------ */

const accentMap: Record<ToastType, { border: string; icon: string; bg: string }> = {
  success: { border: 'border-l-gold', icon: 'text-gold-dark', bg: 'bg-white' },
  error: { border: 'border-l-rose-400', icon: 'text-rose-500', bg: 'bg-white' },
  info: { border: 'border-l-navy', icon: 'text-navy', bg: 'bg-white' },
};

const icons: Record<ToastType, ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10l3 3 5-6" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 7v3M10 13h.01" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="10" cy="10" r="7" />
      <path d="M10 9v4M10 7h.01" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, dismissing: true } : t)));
    // Remove after exit animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      const timer = setTimeout(() => dismiss(id), 4000);
      timers.current.set(id, timer);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed bottom-6 right-6 z-[100] flex flex-col-reverse gap-3 pointer-events-none"
      >
        {toasts.map((t) => {
          const accent = accentMap[t.type];
          return (
            <div
              key={t.id}
              className={[
                'pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 w-80',
                'shadow-[0_4px_16px_rgba(16,27,75,0.08)]',
                accent.bg,
                accent.border,
              ].join(' ')}
              style={{
                animation: t.dismissing
                  ? 'toast-out 300ms ease-in forwards'
                  : 'toast-in 300ms ease-out forwards',
              }}
            >
              <span className={`flex-shrink-0 mt-0.5 ${accent.icon}`}>{icons[t.type]}</span>
              <p className="flex-1 text-sm text-navy font-body">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                className="flex-shrink-0 text-gray hover:text-navy transition-opacity duration-150 cursor-pointer"
                aria-label="Dismiss"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M3 3l8 8M11 3l-8 8" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export { ToastProvider, useToast };
export type { ToastType, ToastItem };
