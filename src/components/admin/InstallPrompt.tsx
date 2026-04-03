'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'jenny-lash-install-dismissed';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [dismissed, setDismissed] = useState(true); // default true to avoid flash

  useEffect(() => {
    // Check if already installed as standalone
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check dismissal
    const wasDismissed = localStorage.getItem(DISMISS_KEY);
    setDismissed(!!wasDismissed);

    // Detect iOS
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(ios);

    // Listen for install prompt (Android/Chrome/Edge)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Don't show if already standalone or dismissed
  if (isStandalone || dismissed) return null;

  // Don't show if not installable and not iOS
  if (!deferredPrompt && !isIOS) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 lg:left-auto lg:right-8 lg:bottom-8 lg:max-w-sm z-50">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-light p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-navy flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <ellipse cx="10" cy="10.5" rx="7" ry="4" stroke="white" strokeWidth="1.5"/>
              <circle cx="10" cy="10.5" r="2" fill="white"/>
              <line x1="4" y1="7.5" x2="2.5" y2="3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="7" y1="6.5" x2="6" y2="2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="10" y1="6" x2="10" y2="2" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="13" y1="6.5" x2="14" y2="2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="16" y1="7.5" x2="17.5" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body font-medium text-navy">
              Install Lash Admin on your phone for quick access
            </p>
            {isIOS && !deferredPrompt && (
              <p className="text-xs font-body text-gray mt-1">
                Tap <span className="font-semibold">Share</span> (the square with arrow) then <span className="font-semibold">Add to Home Screen</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 text-xs font-body font-medium text-gray hover:text-navy rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 cursor-pointer"
          >
            Dismiss
          </button>
          {deferredPrompt && (
            <button
              onClick={handleInstall}
              className="px-4 py-1.5 text-xs font-body font-semibold text-navy bg-gold hover:bg-gold-dark rounded-lg transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 cursor-pointer"
            >
              Install
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
