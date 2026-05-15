import { getStaffDetail } from '@/actions/mobile';
import { notFound } from 'next/navigation';
import StaffBooking from './StaffBooking';
import StaffGallery from './StaffGallery';
import Link from 'next/link';
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
      <StaffBooking
        staffId={staff.id}
        staffName={staff.name}
        staffAvatar={allImages[0] || staff.avatar}
        staffRating={staff.rating}
        staffReviewCount={staff.reviewCount}
        services={staff.services}
      />
    </>
  );
}
