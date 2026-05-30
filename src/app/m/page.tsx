import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FiMessageCircle, FiArrowRight, FiStar, FiSettings } from 'react-icons/fi';

export default async function MobileHomePage() {
  const session = await auth();

  // Get user info if logged in
  let userName = '';
  let isAdmin = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, avatar: true, role: true },
    });
    if (user) {
      userName = user.name;
      isAdmin = user.role === 'ADMIN';
    }
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
            <div style={{ fontSize: '0.95rem', fontWeight: 700, background: 'linear-gradient(90deg, #7c3aed, #a855f7, #ec4899, #a855f7)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'shimmer 3s linear infinite' }}>YURI SPA BEAUTY ✨</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <Link href="/m/admin" style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.95rem' }} title="Quản lý lịch hẹn">
              <FiSettings />
            </Link>
          )}
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
        {/* Main Card - Dịch vụ làm đẹp & Spa → Chọn nhân viên trước */}
        <Link href="/m/dich-vu" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{
            borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            position: 'relative', height: 220, marginBottom: 14,
          }}>
            <img src="/uploads/banner-beauty.png" alt="Dịch vụ làm đẹp & Spa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%', background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.15) 50%, transparent 100%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '20px 24px', zIndex: 1 }}>
              <h2 style={{ color: '#fff', fontSize: '1.35rem', marginBottom: 4, lineHeight: 1.3, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                Dịch vụ làm đẹp & Spa
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', marginBottom: 14, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
                Chọn kỹ thuật viên yêu thích của bạn
              </p>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', backdropFilter: 'blur(4px)' }}>
                <FiArrowRight />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Service Category Chips */}
      <div style={{ padding: '20px 16px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.05rem' }}>Dịch vụ nổi bật</h3>
          <Link href="/m/dich-vu" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>Xem tất cả →</Link>
        </div>
        <div className="m-filters" style={{ padding: 0 }}>
          {categories.map(cat => (
            <Link key={cat.id} href={`/m/dich-vu/${cat.slug}`} className="m-chip" style={{ textDecoration: 'none' }}>
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
