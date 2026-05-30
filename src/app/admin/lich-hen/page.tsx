export const revalidate = 30;

import { getAppointments } from '@/actions/appointments';
import AppointmentList from './AppointmentList';

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

      <AppointmentList appointments={appointments} />
    </>
  );
}
