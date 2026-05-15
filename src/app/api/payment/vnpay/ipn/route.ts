import { NextRequest, NextResponse } from 'next/server';
import { verifyReturnUrl } from '@/lib/vnpay';
import prisma from '@/lib/prisma';

// VNPay IPN (Instant Payment Notification) - server-to-server
export async function GET(req: NextRequest) {
  try {
    const query: Record<string, string> = {};
    req.nextUrl.searchParams.forEach((value, key) => { query[key] = value; });

    const result = verifyReturnUrl(query);

    if (!result.isValid) {
      return NextResponse.json({ RspCode: '97', Message: 'Invalid Checksum' });
    }

    const payment = await prisma.payment.findUnique({
      where: { appointmentId: result.orderId },
    });

    if (!payment) {
      return NextResponse.json({ RspCode: '01', Message: 'Order not found' });
    }

    if (payment.status === 'SUCCESS') {
      return NextResponse.json({ RspCode: '02', Message: 'Order already confirmed' });
    }

    if (result.responseCode === '00') {
      await prisma.payment.update({
        where: { appointmentId: result.orderId },
        data: { status: 'SUCCESS', transactionId: result.transactionNo, paidAt: new Date(), rawResponse: JSON.stringify(query) },
      });
      await prisma.appointment.update({
        where: { id: result.orderId },
        data: { status: 'CONFIRMED' },
      });
    } else {
      await prisma.payment.update({
        where: { appointmentId: result.orderId },
        data: { status: 'FAILED', rawResponse: JSON.stringify(query) },
      });
    }

    return NextResponse.json({ RspCode: '00', Message: 'Confirm Success' });
  } catch {
    return NextResponse.json({ RspCode: '99', Message: 'Unknown error' });
  }
}
