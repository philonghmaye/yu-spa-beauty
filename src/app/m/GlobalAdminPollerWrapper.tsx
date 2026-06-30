import { auth } from '@/lib/auth';
import AdminNotificationPoller from './admin/AdminNotificationPoller';

export default async function GlobalAdminPollerWrapper() {
  const session = await auth();
  
  if (session?.user && (session.user as { role?: string }).role === 'ADMIN') {
    return <AdminNotificationPoller />;
  }
  
  return null;
}
