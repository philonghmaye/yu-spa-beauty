import crypto from 'crypto';

const VNPAY_TMN_CODE = process.env.VNPAY_TMN_CODE || '';
const VNPAY_HASH_SECRET = process.env.VNPAY_HASH_SECRET || '';
const VNPAY_URL = process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key];
  }
  return sorted;
}

export function createPaymentUrl(
  orderId: string,
  amount: number,
  returnUrl: string,
  ipAddr: string,
  orderInfo?: string
): string {
  if (!VNPAY_TMN_CODE || !VNPAY_HASH_SECRET) {
    throw new Error('VNPay chưa được cấu hình. Vui lòng thêm VNPAY_TMN_CODE và VNPAY_HASH_SECRET.');
  }

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const createDate = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

  const params: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: VNPAY_TMN_CODE,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
    vnp_OrderType: 'other',
    vnp_Amount: (amount * 100).toString(), // VNPay uses amount * 100
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  const sortedParams = sortObject(params);
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  sortedParams['vnp_SecureHash'] = signed;

  return `${VNPAY_URL}?${new URLSearchParams(sortedParams).toString()}`;
}

export function verifyReturnUrl(query: Record<string, string>): {
  isValid: boolean;
  orderId: string;
  amount: number;
  responseCode: string;
  transactionNo: string;
} {
  const secureHash = query['vnp_SecureHash'];
  const queryParams = { ...query };
  delete queryParams['vnp_SecureHash'];
  delete queryParams['vnp_SecureHashType'];

  const sortedParams = sortObject(queryParams);
  const signData = new URLSearchParams(sortedParams).toString();
  const hmac = crypto.createHmac('sha512', VNPAY_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return {
    isValid: secureHash === signed,
    orderId: query['vnp_TxnRef'] || '',
    amount: parseInt(query['vnp_Amount'] || '0') / 100,
    responseCode: query['vnp_ResponseCode'] || '',
    transactionNo: query['vnp_TransactionNo'] || '',
  };
}

export function isVnpayConfigured(): boolean {
  return !!(VNPAY_TMN_CODE && VNPAY_HASH_SECRET);
}
