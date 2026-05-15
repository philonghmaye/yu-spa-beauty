import { auth } from '@/lib/auth';
import { getMyAppointments } from '@/actions/account';
import { formatCurrency, getStatusLabel, getStatusColor } from '@/lib/utils';
import { FiClock } from 'react-icons/fi';
import ReviewForm from './ReviewForm';

export default async function BookingHistoryPage() {
  const session = await auth();
  if (!session?.user) return null;

  const appointments = await getMyAppointments(session.user.id);

  return (
    <>
      <h2 style={{ marginBottom: '24px' }}>Lịch sử đặt lịch</h2>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => {
          const count = appointments.filter((a) => a.status === status).length;
          return count > 0 ? (
            <span key={status} className={`badge badge-${getStatusColor(status)}`} style={{ padding: '6px 14px' }}>
              {getStatusLabel(status)}: {count}
            </span>
          ) : null;
        })}
      </div>

      <div className="card" style={{ border: '1px solid var(--neutral-100)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Dịch vụ</th>
                <th>Nhân viên</th>
                <th>Ngày</th>
                <th>Giờ</th>
                <th>Trạng thái</th>
                <th>Số tiền</th>
                <th>Đánh giá</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ maxWidth: '200px' }}>
                      {a.services.map((s) => s.service.name).join(', ')}
                    </div>
                    {a.promotion && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent)' }}>🎁 {a.promotion.code}</div>
                    )}
                  </td>
                  <td>{a.employee?.user.name || '—'}</td>
                  <td>{a.appointmentDate}</td>
                  <td><FiClock style={{ marginRight: '4px', verticalAlign: 'middle' }} />{a.startTime}</td>
                  <td><span className={`badge badge-${getStatusColor(a.status)}`}>{getStatusLabel(a.status)}</span></td>
                  <td>
                    {a.discountAmount > 0 && (
                      <div style={{ fontSize: '0.75rem', textDecoration: 'line-through', color: 'var(--neutral-400)' }}>
                        {formatCurrency(a.totalAmount)}
                      </div>
                    )}
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCurrency(a.finalAmount)}</div>
                  </td>
                  <td>
                    {a.status === 'COMPLETED' && !a.review ? (
                      <ReviewForm
                        appointmentId={a.id}
                        userId={session.user.id}
                        serviceName={a.services.map((s) => s.service.name).join(', ')}
                      />
                    ) : a.review ? (
                      <span style={{ color: 'var(--gold)', fontSize: '0.9rem' }}>
                        {'★'.repeat(a.review.rating)}{'☆'.repeat(5 - a.review.rating)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--neutral-300)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>
                    Chưa có lịch hẹn nào
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
