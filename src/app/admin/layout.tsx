import { AdminShell } from './AdminShell';

export const metadata = {
  title: 'Admin | Jenny Professional Eyelash',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
