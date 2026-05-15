import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import ProfileForm from './ProfileForm';

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/m/dang-nhap');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, phone: true, email: true },
  });

  if (!user) redirect('/m/dang-nhap');

  return <ProfileForm user={user} />;
}
