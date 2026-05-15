import { NextRequest, NextResponse } from 'next/server';
import { createPaymentUrl, isVnpayConfigured } from '@/lib/vnpay';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    if (!isVnpayConfigured()) {
      return NextResponse.json({ error: 'VNPay chưa được cấu hình' }, { status: 503 });
    }

    const { appointmentId } = await req.json();
    if (!appointmentId) {
      return NextResponse.json({ error: 'Missing appointmentId' }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: 'Không tìm thấy lịch hẹn' }, { status: 404 });
    }

    // Create payment record
    await prisma.payment.upsert({
      where: { appointmentId },
      create: {
        appointmentId,
        method: 'VNPAY',
        amount: appointment.finalAmount,
        status: 'PENDING',
      },
      update: {
        status: 'PENDING',
      },
    });

    const ipAddr = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const origin = req.headers.get('origin') || req.nextUrl.origin;
    const returnUrl = `${origin}/api/payment/vnpay/return`;

    const paymentUrl = createPaymentUrl(
      appointmentId,
      appointment.finalAmount,
      returnUrl,
      ipAddr,
      `YURI SPA - Thanh toan lich hen #${appointmentId.slice(-6).toUpperCase()}`,
    );

    return NextResponse.json({ paymentUrl });
  } catch (err) {
    console.error('VNPay create error:', err);
    return NextResponse.json({ error: 'Lỗi tạo thanh toán' }, { status: 500 });
  }
}
