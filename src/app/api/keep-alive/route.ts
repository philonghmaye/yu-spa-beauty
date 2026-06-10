import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * API Keep-Alive: Ping database mỗi 4 phút để tránh Neon cold start
 * Được gọi tự động bởi Vercel Cron Job
 */
export async function GET(request: Request) {
  // Xác thực cron job bằng Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Cho phép truy cập không có secret trong development
    if (process.env.NODE_ENV === 'production' && !process.env.CRON_SECRET) {
      // Nếu chưa set CRON_SECRET, vẫn cho phép
    } else if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    const start = Date.now();
    
    // Query nhẹ nhất có thể — chỉ cần giữ connection sống
    await prisma.$queryRaw`SELECT 1`;
    
    const duration = Date.now() - start;
    
    return NextResponse.json({
      status: 'ok',
      db: 'connected',
      latency: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Keep-alive ping failed:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Database ping failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
