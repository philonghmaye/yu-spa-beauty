'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Reset password using email or phone verification
 * In production, this should send an OTP via email/SMS.
 * For now, it verifies the user exists and resets password directly.
 */
export async function resetPassword(data: {
  login: string;
  newPassword: string;
}) {
  if (!data.login || !data.newPassword) {
    return { success: false, error: 'Vui lòng nhập đầy đủ thông tin' };
  }

  if (data.newPassword.length < 6) {
    return { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }

  // Find user by email or phone
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: data.login }, { phone: data.login }],
      isActive: true,
    },
  });

  if (!user) {
    return { success: false, error: 'Không tìm thấy tài khoản với thông tin này' };
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  return { success: true, message: 'Đặt lại mật khẩu thành công!' };
}
