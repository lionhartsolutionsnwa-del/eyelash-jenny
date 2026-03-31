'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const notifications = [
  { name: 'Sarah', service: 'Classic Lashes', time: '2 hours ago' },
  { name: 'Michelle', service: 'Volume Set', time: '3 hours ago' },
  { name: 'Amanda', service: 'Lash Lift', time: '5 hours ago' },
  { name: 'Jessica', service: 'Mega Volume', time: '6 hours ago' },
  { name: 'Emily', service: 'Classic Fill', time: '8 hours ago' },
  { name: 'Nicole', service: 'Volume Fill', time: '1 day ago' },
];

function shuffled<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function BookingTicker() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [current, setCurrent] = useState(0);
  const orderRef = useRef<number[]>([]);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize shuffled order
  useEffect(() => {
    orderRef.current = shuffled(notifications.map((_, i) => i));
  }, []);

  // Check sessionStorage for permanent dismiss
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('booking-ticker-dismissed') === '1') {
      setDismissed(true);
    }
  }, []);

  const showNotification = useCallback(() => {
    setVisible(true);
    // Hide after 4 seconds
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 4000);
  }, []);

  // Cycle notifications
  useEffect(() => {
    if (dismissed) return;

    // Initial delay of 5 seconds
    const initialTimer = setTimeout(() => {
      showNotification();
    }, 5000);

    // Repeat every 15 seconds (after the initial 5s)
    const interval = setInterval(() => {
      setCurrent((prev) => {
        const next = (prev + 1) % notifications.length;
        return next;
      });
      showNotification();
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [dismissed, showNotification]);

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('booking-ticker-dismissed', '1');
    }
  };

  if (dismissed) return null;

  const idx = orderRef.current.length > 0 ? orderRef.current[current % orderRef.current.length] : 0;
  const notification = notifications[idx];

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-4 z-40 transition-transform duration-500 ease-out"
      style={{
        transform: visible ? 'translateX(0)' : 'translateX(calc(-100% - 1rem))',
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-[0_4px_24px_rgba(16,27,75,0.1)] max-w-xs border border-gray-light/50">
        {/* Avatar placeholder */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold-dark font-body text-xs font-semibold">
          {notification.name[0]}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-navy font-body text-xs leading-snug">
            <span className="font-semibold">{notification.name}</span>{' '}
            just booked{' '}
            <span className="font-semibold">{notification.service}</span>
          </p>
          <p className="text-gray text-[11px] font-body mt-0.5">
            {notification.time}
          </p>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 w-5 h-5 flex items-center justify-center text-gray hover:text-navy transition-transform transition-opacity duration-200 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
