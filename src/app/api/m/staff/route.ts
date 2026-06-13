import { NextResponse } from 'next/server';
import { getStaffForMobile } from '@/actions/mobile';

// Cache 2 phút trên Vercel Edge
export const revalidate = 120;

/**
 * API trả về danh sách staff cho mobile — cached.
 * Thay vì server component gọi trực tiếp getStaffForMobile(),
 * client fetch từ edge cache → không bị cold start.
 */
export async function GET() {
  try {
    const staff = await getStaffForMobile();
    return NextResponse.json(staff, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.error('Staff API error:', error);
    return NextResponse.json([], { status: 500 });
  }
}
