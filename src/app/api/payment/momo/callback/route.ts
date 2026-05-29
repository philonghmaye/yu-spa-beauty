import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      partnerCode, orderId, requestId, amount, orderInfo,
      orderType, transId, resultCode, message, payType,
      responseTime, extraData, signature,
    } = body;

    // Verify MoMo credentials exist
    const secretKey = process.env.MOMO_SECRET_KEY;
    const accessKey = process.env.MOMO_ACCESS_KEY;
    if (!secretKey || !accessKey) {
      console.error('MoMo credentials not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Verify HMAC-SHA256 signature
    const rawSignature = [
      `accessKey=${accessKey}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `message=${message}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `orderType=${orderType}`,
      `partnerCode=${partnerCode}`,
      `payType=${payType}`,
      `requestId=${requestId}`,
      `responseTime=${responseTime}`,
      `resultCode=${resultCode}`,
      `transId=${transId}`,
    ].join('&');

    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('MoMo callback: Invalid signature', { orderId, received: signature, expected: expectedSignature });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // Signature verified — process payment
    if (resultCode === 0) {
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
