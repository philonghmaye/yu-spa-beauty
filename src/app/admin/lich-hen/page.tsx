import { getAppointments } from '@/actions/appointments';
import { formatCurrency, getStatusLabel, getStatusColor } from '@/lib/utils';
import { FiClock } from 'react-icons/fi';
import AppointmentActions from './AppointmentActions';

export default async function AppointmentsPage() {
  const appointments = await getAppointments();

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Quản lý lịch hẹn</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="badge badge-primary" style={{ padding: '6px 14px' }}>Tổng: {appointments.length}</span>
        </div>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => {
          const count = appointments.filter(a => a.status === status).length;
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
                <th>Khách hàng</th><th>SĐT</th><th>Dịch vụ</th>
                <th>Nhân viên</th><th>Ngày</th><th>Giờ</th>
                <th>Trạng thái</th><th>Số tiền</th><th style={{ width: '200px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.customer.user.name}</td>
                  <td style={{ color: 'var(--neutral-500)', fontSize: '0.85rem' }}>{a.customer.user.phone}</td>
                  <td>
                    <div style={{ maxWidth: '200px' }}>
                      {a.services.map(s => s.service.name).join(', ')}
                    </div>
                  </td>
                  <td>{a.employee?.user.name || '—'}</td>
                  <td>{a.appointmentDate}</td>
                  <td><FiClock style={{ marginRight: '4px', verticalAlign: 'middle' }} />{a.startTime} - {a.endTime}</td>
                  <td><span className={`badge badge-${getStatusColor(a.status)}`}>{getStatusLabel(a.status)}</span></td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(a.finalAmount)}</td>
                  <td>
                    <AppointmentActions appointment={{ id: a.id, status: a.status, staffNote: a.staffNote }} />
                  </td>
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>Chưa có lịch hẹn nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
