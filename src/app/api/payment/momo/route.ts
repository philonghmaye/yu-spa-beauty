import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// MoMo credentials — MUST be set in environment variables
function getMomoConfig() {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;
  const endpoint = process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yuri-spa-beauty.vercel.app';

  if (!partnerCode || !accessKey || !secretKey) {
    throw new Error('MoMo payment credentials not configured. Set MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY in .env');
  }

  return {
    partnerCode,
    accessKey,
    secretKey,
    endpoint,
    redirectUrl: `${baseUrl}/m/dat-lich/ket-qua`,
    ipnUrl: `${baseUrl}/api/payment/momo/callback`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const MOMO_CONFIG = getMomoConfig();
    const { amount, orderId, orderInfo } = await req.json();

    // Basic validation
    if (!amount || !orderId || !orderInfo || amount <= 0) {
      return NextResponse.json({ error: 'Dữ liệu thanh toán không hợp lệ' }, { status: 400 });
    }

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
