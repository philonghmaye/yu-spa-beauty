import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getCustomerActivity } from '@/actions/mobile';
import ActivityList from './ActivityList';

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/m/dang-nhap');

  const activities = await getCustomerActivity(session.user.id);
  return <ActivityList initialData={activities} userId={session.user.id} />;
}
