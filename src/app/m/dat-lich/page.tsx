import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import MobileBookingForm from './MobileBookingForm';

export default async function MobileBookingPage() {
  const session = await auth();
  let userInfo: { name: string; phone: string; email: string } | undefined;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, phone: true, email: true },
    });
    if (user) {
      userInfo = { name: user.name, phone: user.phone || '', email: user.email || '' };
    }
  }

  return <MobileBookingForm userId={session?.user?.id} userInfo={userInfo} />;
}
