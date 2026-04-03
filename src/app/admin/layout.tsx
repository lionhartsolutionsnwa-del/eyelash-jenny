import { AdminShell } from './AdminShell';
import { ServiceWorkerRegistrar } from './ServiceWorkerRegistrar';
import { InstallPrompt } from '@/components/admin/InstallPrompt';

export const metadata = {
  title: 'Admin | Jenny Professional Eyelash',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Lash Admin',
    'theme-color': '#101B4B',
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      <ServiceWorkerRegistrar />
      <AdminShell>
        {children}
        <InstallPrompt />
      </AdminShell>
    </>
  );
}
