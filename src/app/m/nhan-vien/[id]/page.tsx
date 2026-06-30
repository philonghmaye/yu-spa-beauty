import { getStaffDetail } from '@/actions/mobile';
import { notFound } from 'next/navigation';
import StaffBooking from './StaffBooking';
import StaffGallery from './StaffGallery';
import Link from 'next/link';
import { Suspense } from 'react';
import { FiArrowLeft, FiHeart, FiShare2, FiCheckCircle } from 'react-icons/fi';

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaffDetail(id);
  if (!staff) notFound();

  // Build image list: employee images first, then avatar as fallback
  const allImages = staff.images.length > 0
    ? staff.images.map(img => img.url)
    : staff.avatar ? [staff.avatar] : [];

  return (
    <>
      {/* Hero Image Gallery */}
      {allImages.length > 0 ? (
        <StaffGallery images={allImages} name={staff.name} />
      ) : (
        <div className="m-staff-hero">
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', color: 'var(--primary)' }}>
            {staff.name.charAt(0)}
          </div>
          <div className="m-staff-hero-overlay">
            <Link href="/m/kham-pha" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <FiArrowLeft />
            </Link>
          </div>
        </div>
      )}

      {/* Staff Info */}
      <div className="m-staff-detail">
        <h1>{staff.name}</h1>
        <div className="m-staff-rating">
          <span className="star" style={{ color: 'var(--gold)' }}>★</span>
          <strong>{staff.rating}</strong>
          <span className="count">({staff.reviewCount} đánh giá)</span>
        </div>

        {/* Guarantee Card */}
        <div className="m-guarantee-card">
          <div style={{ fontSize: '1.8rem' }}>✨</div>
          <div className="checks">
            <div><span className="check-icon"><FiCheckCircle style={{ verticalAlign: 'middle' }} /></span> Dịch vụ chất lượng cao</div>
            <div><span className="check-icon"><FiCheckCircle style={{ verticalAlign: 'middle' }} /></span> Đảm bảo hài lòng 100%</div>
          </div>
        </div>

        {/* Bio */}
        {staff.bio && <p className="m-staff-bio">{staff.bio}</p>}
        {staff.experience && (
          <p className="m-staff-bio" style={{ marginTop: 0 }}>
            🏆 {staff.experience} năm kinh nghiệm {staff.position && `— ${staff.position}`}
          </p>
        )}
      </div>

      {/* Services */}
      <Suspense fallback={<div style={{ padding: 20, textAlign: 'center' }}>Đang tải dịch vụ...</div>}>
        <StaffBooking
          staffId={staff.id}
          staffName={staff.name}
          staffAvatar={allImages[0] || staff.avatar}
          staffRating={staff.rating}
          staffReviewCount={staff.reviewCount}
          services={staff.services}
        />
      </Suspense>

      {/* Reviews Section */}
      <div style={{ padding: '16px 16px 100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Đánh giá</h2>
          {staff.reviewCount > 0 && (
            <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>Xem tất cả →</span>
          )}
        </div>

        {/* Rating Summary Card */}
        <div style={{
          background: 'var(--neutral-50)', borderRadius: 12, padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {/* Left: Score */}
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1 }}>{staff.rating}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--neutral-400)', marginTop: 2 }}>/ 5</div>
              <div style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: 4 }}>
                {'★'.repeat(Math.round(staff.rating))}{'☆'.repeat(5 - Math.round(staff.rating))}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)', marginTop: 2 }}>
                ({staff.reviewCount} đánh giá)
              </div>
            </div>
            {/* Right: Distribution Bars */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = staff.ratingDistribution[star - 1];
                const pct = staff.reviewCount > 0 ? (count / staff.reviewCount) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, width: 12 }}>{star}</span>
                    <span style={{ color: '#f59e0b', fontSize: '0.78rem' }}>★</span>
                    <div style={{ flex: 1, height: 8, background: 'var(--neutral-200)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: 4, transition: 'width 0.5s' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--neutral-400)', width: 28, textAlign: 'right' }}>{pct > 0 ? `${Math.round(pct)}%` : '0%'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Individual Reviews */}
        {staff.reviews.length > 0 ? staff.reviews.map((review, i) => (
          <div key={i} style={{
            borderBottom: i < staff.reviews.length - 1 ? '1px solid var(--neutral-100)' : 'none',
            paddingBottom: 16, marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-light)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary)',
              }}>
                {review.customerAvatar ? (
                  <img src={review.customerAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : review.customerName.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{review.customerName}</div>
                <div style={{ color: '#f59e0b', fontSize: '0.75rem' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>
                {new Date(review.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </div>
            </div>
            {review.comment && (
              <p style={{ fontSize: '0.88rem', color: 'var(--neutral-600)', lineHeight: 1.6, margin: 0 }}>
                {review.comment}
              </p>
            )}
          </div>
        )) : (
          <p style={{ textAlign: 'center', color: 'var(--neutral-400)', fontSize: '0.88rem', padding: '20px 0' }}>
            Chưa có đánh giá nào
          </p>
        )}
      </div>
    </>
  );
}
