import type { Metadata } from 'next';
import './admin.css';

export const metadata: Metadata = {
  title: 'Управление сайтом · IPEC Energy Kazakhstan',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="ipec-admin" lang="ru">{children}</div>;
}
