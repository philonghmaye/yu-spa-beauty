import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, resultCode, amount, signature } = body;

    // Verify signature
    const secretKey = process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
    const accessKey = process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85';

    // Update payment status based on resultCode
    if (resultCode === 0) {
      // Payment successful - update appointment
      const payment = await prisma.payment.findFirst({
        where: { transactionId: orderId },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paidAt: new Date(),
          },
        });
      }

      return NextResponse.json({ message: 'OK' });
    } else {
      // Payment failed
      const payment = await prisma.payment.findFirst({
        where: { transactionId: orderId },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });
      }

      return NextResponse.json({ message: 'Payment failed' });
    }
  } catch (error) {
    console.error('MoMo callback error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
