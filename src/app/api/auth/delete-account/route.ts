import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * DELETE /api/auth/delete-account
 * Apple App Store Guideline 5.1.1 — User must be able to delete their account
 * Deletes all personal data: user, customer, reviews, appointments
 */
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get customer record
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (customer) {
      // Delete reviews by this customer
      await prisma.review.deleteMany({
        where: { customerId: customer.id },
      });

      // Delete notifications for customer's appointments
      await prisma.notification.deleteMany({
        where: { appointment: { customerId: customer.id } },
      });

      // Delete payments for customer's appointments
      await prisma.payment.deleteMany({
        where: { appointment: { customerId: customer.id } },
      });

      // Delete appointment services
      await prisma.appointmentService.deleteMany({
        where: { appointment: { customerId: customer.id } },
      });

      // Delete appointments
      await prisma.appointment.deleteMany({
        where: { customerId: customer.id },
      });

      // Delete customer record
      await prisma.customer.delete({
        where: { id: customer.id },
      });
    }

    // Delete the user (cascades to employee if applicable)
    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
