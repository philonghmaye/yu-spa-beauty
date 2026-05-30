import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role || 'USER';
  return NextResponse.json({ role });
}
