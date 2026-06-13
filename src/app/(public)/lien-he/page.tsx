import { auth } from '@/lib/auth';
import ContactPageClient from './ContactPageClient';

export default async function ContactPage() {
  const session = await auth();
  const isAdmin = (session?.user as { role?: string })?.role === 'ADMIN';

  return <ContactPageClient isAdmin={isAdmin} />;
}
