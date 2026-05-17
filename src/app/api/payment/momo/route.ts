import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// MoMo Sandbox credentials (thay bằng production khi go-live)
const MOMO_CONFIG = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO_PARTNER',
  accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
  secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
  redirectUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/m/dat-lich/ket-qua`
    : 'https://yuri-spa-beauty.vercel.app/m/dat-lich/ket-qua',
  ipnUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/momo/callback`
    : 'https://yuri-spa-beauty.vercel.app/api/payment/momo/callback',
};

export async function POST(req: NextRequest) {
  try {
    const { amount, orderId, orderInfo } = await req.json();

    const requestId = `${MOMO_CONFIG.partnerCode}-${Date.now()}`;
    const rawSignature = [
      `accessKey=${MOMO_CONFIG.accessKey}`,
      `amount=${amount}`,
      `extraData=`,
      `ipnUrl=${MOMO_CONFIG.ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${MOMO_CONFIG.partnerCode}`,
      `redirectUrl=${MOMO_CONFIG.redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=payWithMethod`,
    ].join('&');

    const signature = crypto
      .createHmac('sha256', MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest('hex');

    const body = {
      partnerCode: MOMO_CONFIG.partnerCode,
      partnerName: 'YURI SPA BEAUTY',
      storeId: 'YuriSpaBeauty',
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: MOMO_CONFIG.redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      lang: 'vi',
      requestType: 'payWithMethod',
      autoCapture: true,
      extraData: '',
      signature,
    };

    const momoRes = await fetch(MOMO_CONFIG.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await momoRes.json();

    if (data.resultCode === 0) {
      return NextResponse.json({ payUrl: data.payUrl, orderId });
    } else {
      return NextResponse.json(
        { error: data.message || 'Không thể tạo thanh toán MoMo' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('MoMo payment error:', error);
    return NextResponse.json({ error: 'Lỗi hệ thống thanh toán' }, { status: 500 });
  }
}
