import { NextRequest, NextResponse } from 'next/server';
import { verifyReturnUrl } from '@/lib/vnpay';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const query: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => { query[key] = value; });

    const result = verifyReturnUrl(query);

    if (result.isValid && result.responseCode === '00') {
      // Payment successful
      await prisma.payment.update({
        where: { appointmentId: result.orderId },
        data: {
          status: 'SUCCESS',
          transactionId: result.transactionNo,
          paidAt: new Date(),
          rawResponse: JSON.stringify(query),
        },
      });

      // Also confirm the appointment
      await prisma.appointment.update({
        where: { id: result.orderId },
        data: { status: 'CONFIRMED' },
      });

      return NextResponse.redirect(new URL(`/m/dat-lich/ket-qua?payment=success`, req.nextUrl.origin));
    } else {
      // Payment failed
      if (result.orderId) {
        await prisma.payment.update({
          where: { appointmentId: result.orderId },
          data: {
            status: 'FAILED',
            rawResponse: JSON.stringify(query),
          },
        });
      }
      return NextResponse.redirect(new URL(`/m/dat-lich/ket-qua?payment=failed`, req.nextUrl.origin));
    }
  } catch (err) {
    console.error('VNPay return error:', err);
    return NextResponse.redirect(new URL('/m/dat-lich/ket-qua?payment=error', req.nextUrl.origin));
  }
}
