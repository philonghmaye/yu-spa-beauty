export const dynamic = 'force-dynamic';

import { getCustomers, getCustomerStats } from '@/actions/customers';
import { formatCurrency } from '@/lib/utils';
import { FiUser, FiPhone, FiMail, FiUsers } from 'react-icons/fi';
import CustomerActions from './CustomerActions';

const levelColors: Record<string, string> = { STANDARD: 'primary', SILVER: 'warning', GOLD: 'accent', VIP: 'error' };
const levelLabels: Record<string, string> = { STANDARD: 'Thường', SILVER: 'Bạc', GOLD: 'Vàng', VIP: 'VIP' };

export default async function CustomersAdminPage() {
  const [customers, stats] = await Promise.all([getCustomers(), getCustomerStats()]);

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Quản lý khách hàng</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div className="stat-card" style={{ flex: 1, minWidth: '150px' }}>
          <div className="stat-icon purple"><FiUsers /></div>
          <div><div className="stat-value">{stats.total}</div><div className="stat-label">Tổng khách hàng</div></div>
        </div>
        <div className="stat-card" style={{ flex: 1, minWidth: '150px' }}>
          <div className="stat-icon green"><FiUser /></div>
          <div><div className="stat-value">{stats.thisMonth}</div><div className="stat-label">Mới tháng này</div></div>
        </div>
        {stats.levels.map(l => (
          <div key={l.memberLevel} className="stat-card" style={{ flex: 1, minWidth: '120px' }}>
            <div><div className="stat-value">{l._count}</div><div className="stat-label">{levelLabels[l.memberLevel] || l.memberLevel}</div></div>
          </div>
        ))}
      </div>

      <CustomerActions />

      <div className="card" style={{ border: '1px solid var(--neutral-100)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr><th>Khách hàng</th><th>Liên hệ</th><th>Lượt đến</th><th>Tổng chi tiêu</th><th>Hạng</th><th>Lần cuối</th><th>Ghi chú</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className="stat-icon purple" style={{ width: '36px', height: '36px', borderRadius: '50%', fontSize: '0.9rem', flexShrink: 0 }}><FiUser /></div>
                      {c.user.name}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem' }}>
                      <div><FiPhone style={{ marginRight: '4px', verticalAlign: 'middle' }} />{c.user.phone}</div>
                      {c.user.email && <div style={{ color: 'var(--neutral-400)' }}><FiMail style={{ marginRight: '4px', verticalAlign: 'middle' }} />{c.user.email}</div>}
                    </div>
                  </td>
                  <td>{c.totalVisits} lần</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(c.totalSpent)}</td>
                  <td>
                    <CustomerActions
                      mode="level"
                      customerId={c.id}
                      currentLevel={c.memberLevel}
                    />
                  </td>
                  <td style={{ color: 'var(--neutral-500)', fontSize: '0.85rem' }}>
                    {c.appointments[0]?.appointmentDate || '—'}
                  </td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--neutral-400)' }}>
                    {c.notes || '—'}
                  </td>
                  <td>
                    <CustomerActions
                      mode="actions"
                      customerId={c.id}
                      currentNotes={c.notes || ''}
                      customerName={c.user.name}
                    />
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>Chưa có khách hàng</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
