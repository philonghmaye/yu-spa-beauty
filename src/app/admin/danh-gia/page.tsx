export const dynamic = 'force-dynamic';

import { getReviews, getReviewStats } from '@/actions/reviews';
import { FiStar } from 'react-icons/fi';
import ReviewAdminActions from './ReviewAdminActions';

export default async function AdminReviewsPage() {
  const [reviews, stats] = await Promise.all([
    getReviews(),
    getReviewStats(),
  ]);

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Quản lý đánh giá</h1>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon purple"><FiStar /></div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng đánh giá</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><FiStar /></div>
          <div>
            <div className="stat-value">{stats.avgRating.toFixed(1)}/5</div>
            <div className="stat-label">Điểm trung bình</div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {stats.byRating.map((r) => (
              <span key={r.rating} className="badge badge-accent" style={{ fontSize: '0.75rem' }}>
                {r.rating}★ ({r._count})
              </span>
            ))}
            {stats.byRating.length === 0 && <span style={{ color: 'var(--neutral-400)', fontSize: '0.85rem' }}>Chưa có</span>}
          </div>
        </div>
      </div>

      {/* Reviews table */}
      <div className="card" style={{ border: '1px solid var(--neutral-100)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Dịch vụ</th>
                <th>Nhân viên</th>
                <th>Ngày</th>
                <th>Đánh giá</th>
                <th style={{ minWidth: '200px' }}>Nhận xét</th>
                <th style={{ width: '70px' }}>Xóa</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.customer.user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>{r.customer.user.phone}</div>
                  </td>
                  <td>{r.appointment.services.map((s) => s.service.name).join(', ')}</td>
                  <td>{r.appointment.employee?.user.name || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <div>{r.appointment.appointmentDate}</div>
                    <div style={{ color: 'var(--neutral-400)', fontSize: '0.8rem' }}>
                      {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--gold)', fontSize: '1.1rem', letterSpacing: '1px' }}>
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </td>
                  <td>
                    {r.comment ? (
                      <div style={{
                        fontSize: '0.85rem', color: 'var(--neutral-600)',
                        maxWidth: '250px', lineHeight: '1.5',
                      }}>
                        &ldquo;{r.comment}&rdquo;
                      </div>
                    ) : (
                      <span style={{ color: 'var(--neutral-300)', fontSize: '0.85rem' }}>Không có nhận xét</span>
                    )}
                  </td>
                  <td>
                    <ReviewAdminActions reviewId={r.id} />
                  </td>
                </tr>
              ))}
              {reviews.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>
                    Chưa có đánh giá nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
