import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminMobileTabBar from './AdminTabBar';

export default async function AdminMobileLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== 'ADMIN') {
    redirect('/m/dang-nhap');
  }

  return (
    <>
      <div style={{ paddingBottom: 70, minHeight: '100vh', background: 'var(--neutral-50)' }}>
        {children}
      </div>
      <AdminMobileTabBar />
    </>
  );
}
