import { auth } from '@/lib/auth';

/**
 * Require authenticated session. Throws if not logged in.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Vui lòng đăng nhập để tiếp tục');
  }
  return session;
}

/**
 * Require ADMIN role. Throws if not admin.
 */
export async function requireAdmin() {
  const session = await requireAuth();
  if ((session.user as { role: string }).role !== 'ADMIN') {
    throw new Error('Bạn không có quyền truy cập chức năng này');
  }
  return session;
}

/**
 * Require STAFF or ADMIN role.
 */
export async function requireStaffOrAdmin() {
  const session = await requireAuth();
  const role = (session.user as { role: string }).role;
  if (role !== 'ADMIN' && role !== 'STAFF') {
    throw new Error('Bạn không có quyền truy cập chức năng này');
  }
  return session;
}
