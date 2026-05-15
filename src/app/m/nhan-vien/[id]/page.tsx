import { getStaffDetail } from '@/actions/mobile';
import { notFound } from 'next/navigation';
import StaffBooking from './StaffBooking';
import Link from 'next/link';
import { FiArrowLeft, FiHeart, FiShare2, FiCheckCircle, FiStar } from 'react-icons/fi';

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaffDetail(id);
  if (!staff) notFound();

  return (
    <>
      {/* Hero Image */}
      <div className="m-staff-hero">
        {staff.avatar ? (
          <img src={staff.avatar} alt={staff.name} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', color: 'var(--primary)' }}>
            {staff.name.charAt(0)}
          </div>
        )}
        <div className="m-staff-hero-overlay">
          <Link href="/m" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <FiArrowLeft />
          </Link>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <FiHeart />
            </span>
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <FiShare2 />
            </span>
          </div>
        </div>
        <span className="m-staff-hero-badge">Chất lượng</span>
      </div>

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
        staffAvatar={staff.avatar}
        staffRating={staff.rating}
        staffReviewCount={staff.reviewCount}
        services={staff.services}
      />
    </>
  );
}
