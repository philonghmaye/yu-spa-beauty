import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { FiMessageCircle, FiArrowRight, FiStar } from 'react-icons/fi';

export default async function MobileHomePage() {
  const session = await auth();

  // Get user info if logged in
  let userName = '';
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, avatar: true },
    });
    if (user) userName = user.name;
  }

  // Get service categories for cards
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: { services: { where: { isActive: true }, take: 1 } },
    orderBy: { sortOrder: 'asc' },
  });

  // Get top staff for quick preview
  const topStaff = await prisma.employee.findMany({
    where: { isAvailable: true, user: { isActive: true } },
    include: {
      user: { select: { name: true, avatar: true } },
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      appointments: {
        where: { status: 'COMPLETED' },
        select: { review: { select: { rating: true } } },
      },
    },
    take: 5,
  });

  const staffWithRating = topStaff.map((s) => {
    const reviews = s.appointments.map((a) => a.review).filter(Boolean);
    const avg = reviews.length > 0
      ? Math.round((reviews.reduce((sum, r) => sum + (r?.rating || 0), 0) / reviews.length) * 10) / 10
      : 5.0;
    return { ...s, rating: avg, reviewCount: reviews.length };
  });

  return (
    <>
      {/* Header */}
      <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--white)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--neutral-200)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-400)', fontSize: '1.1rem' }}>
            👤
          </div>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>
              {userName ? `Xin chào, ${userName}` : 'Xin chào!'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--neutral-400)' }}>YURI SPA BEAUTY ✨</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/m/hoat-dong" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-600)' }}>
            <FiMessageCircle />
          </Link>
        </div>
      </div>

      {/* Welcome Banner */}
      <div style={{ margin: '0 16px 16px', padding: '16px 20px', background: 'linear-gradient(135deg, var(--primary-50), var(--accent-light))', borderRadius: 'var(--radius)', border: '1px solid var(--primary-light)' }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--primary-dark)', fontWeight: 500 }}>🎉 Ưu đãi đặc biệt</div>
        <div style={{ fontSize: '0.9rem', color: 'var(--neutral-700)', marginTop: 4 }}>Giảm <strong>20%</strong> cho lần đặt lịch đầu tiên!</div>
      </div>

      {/* Hero Service Cards */}
      <div style={{ padding: '0 16px' }}>
        {/* Main Card - Đặt lịch Spa */}
        <Link href="/m/kham-pha" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            background: 'linear-gradient(135deg, #c084fc, #a855f7)',
            padding: '28px 24px', marginBottom: 14,
            position: 'relative', minHeight: 180,
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: 6, lineHeight: 1.3 }}>
                Đặt lịch Spa
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', marginBottom: 20 }}>
                Xem & chọn kỹ thuật viên
              </p>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <FiArrowRight />
              </div>
            </div>
            <div style={{ position: 'absolute', right: -10, bottom: -10, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', right: 30, top: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          </div>
        </Link>

        {/* Secondary Card - Dịch vụ */}
        <Link href="/dich-vu" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            background: 'linear-gradient(135deg, #f472b6, #ec4899)',
            padding: '28px 24px', marginBottom: 14,
            position: 'relative', minHeight: 160,
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: 6, lineHeight: 1.3 }}>
                Dịch vụ làm đẹp
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', marginBottom: 16 }}>
                {categories.length}+ dịch vụ đa dạng
              </p>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <FiArrowRight />
              </div>
            </div>
            <div style={{ position: 'absolute', right: -10, bottom: -10, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          </div>
        </Link>
      </div>

      {/* Service Category Chips */}
      <div style={{ padding: '20px 16px 8px' }}>
        <h3 style={{ fontSize: '1.05rem', marginBottom: 12 }}>Dịch vụ nổi bật</h3>
        <div className="m-filters" style={{ padding: 0 }}>
          {categories.map(cat => (
            <Link key={cat.id} href="/m/kham-pha" className="m-chip" style={{ textDecoration: 'none' }}>
              {cat.icon} {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Top Staff */}
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: '1.05rem' }}>Kỹ thuật viên hàng đầu</h3>
          <Link href="/m/kham-pha" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>Xem tất cả →</Link>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 4 }}>
          {staffWithRating.map((s) => (
            <Link key={s.id} href={`/m/nhan-vien/${s.id}`} style={{ textDecoration: 'none', color: 'inherit', flexShrink: 0 }}>
              <div style={{ width: 130, textAlign: 'center' }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%', margin: '0 auto 8px',
                  overflow: 'hidden', background: 'var(--primary-light)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '3px solid var(--primary-50)',
                }}>
                  {(s.images[0]?.url || s.user.avatar) ? (
                    <img src={s.images[0]?.url || s.user.avatar || ''} alt={s.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{s.user.name.charAt(0)}</span>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 2 }}>{s.user.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--neutral-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span style={{ color: 'var(--gold)' }}>★</span> {s.rating} ({s.reviewCount})
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Support FAB */}
      <Link
        href="/lien-he"
        style={{
          position: 'fixed', bottom: 80, right: 16, width: 48, height: 48,
          borderRadius: '50%', background: 'var(--primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-md)', fontSize: '1.2rem', zIndex: 50,
        }}
      >
        💬
      </Link>
    </>
  );
}
