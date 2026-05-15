import { auth } from '@/lib/auth';
import { getMyProfile, getMyAppointments } from '@/actions/account';
import { formatCurrency } from '@/lib/utils';
import { FiCalendar, FiDollarSign, FiAward, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [profile, appointments] = await Promise.all([
    getMyProfile(session.user.id),
    getMyAppointments(session.user.id),
  ]);

  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const totalSpent = profile?.totalSpent || 0;
  const memberLevel = profile?.memberLevel || 'STANDARD';

  const levelLabels: Record<string, { label: string; color: string }> = {
    STANDARD: { label: 'Thường', color: 'var(--neutral-500)' },
    SILVER: { label: '🥈 Bạc', color: '#94a3b8' },
    GOLD: { label: '🥇 Vàng', color: '#f59e0b' },
    VIP: { label: '💎 VIP', color: '#a855f7' },
  };

  const level = levelLabels[memberLevel] || levelLabels.STANDARD;

  return (
    <>
      <h2 style={{ marginBottom: '24px' }}>Xin chào, {session.user.name}! 👋</h2>

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon purple"><FiCalendar /></div>
          <div>
            <div className="stat-value">{appointments.length}</div>
            <div className="stat-label">Tổng đặt lịch</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiTrendingUp /></div>
          <div>
            <div className="stat-value">{completedCount}</div>
            <div className="stat-label">Đã hoàn thành</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink"><FiDollarSign /></div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>{formatCurrency(totalSpent)}</div>
            <div className="stat-label">Tổng chi tiêu</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><FiAward /></div>
          <div>
            <div className="stat-value" style={{ fontSize: '1.2rem', color: level.color }}>{level.label}</div>
            <div className="stat-label">Hạng thành viên</div>
          </div>
        </div>
      </div>

      {/* Recent appointments */}
      <div className="card" style={{ border: '1px solid var(--neutral-100)', marginTop: '24px' }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--neutral-100)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontSize: '1.1rem' }}>Lịch hẹn gần đây</h3>
          <Link href="/tai-khoan/lich-su" className="btn btn-ghost btn-sm">Xem tất cả →</Link>
        </div>
        <div style={{ padding: '16px 24px' }}>
          {appointments.slice(0, 5).map((a) => (
            <div key={a.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 0', borderBottom: '1px solid var(--neutral-100)',
            }}>
              <div>
                <div style={{ fontWeight: 500 }}>{a.services.map((s) => s.service.name).join(', ')}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--neutral-400)' }}>
                  📅 {a.appointmentDate} • 🕐 {a.startTime}
                  {a.employee && ` • 👤 ${a.employee.user.name}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`badge ${a.status === 'COMPLETED' ? 'badge-success' : a.status === 'CANCELLED' ? 'badge-error' : a.status === 'PENDING' ? 'badge-warning' : 'badge-primary'}`}>
                  {a.status === 'PENDING' ? 'Chờ xác nhận' :
                   a.status === 'CONFIRMED' ? 'Đã xác nhận' :
                   a.status === 'IN_PROGRESS' ? 'Đang thực hiện' :
                   a.status === 'COMPLETED' ? 'Hoàn thành' :
                   a.status === 'CANCELLED' ? 'Đã hủy' : a.status}
                </span>
                <div style={{ fontWeight: 600, color: 'var(--primary)', marginTop: '4px', fontSize: '0.9rem' }}>
                  {formatCurrency(a.finalAmount)}
                </div>
              </div>
            </div>
          ))}
          {appointments.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--neutral-400)' }}>
              <p>Bạn chưa có lịch hẹn nào</p>
              <Link href="/dat-lich" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>Đặt lịch ngay</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
