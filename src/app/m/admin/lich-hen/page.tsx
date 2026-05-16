export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { formatCurrency, getStatusLabel, getVietnamToday } from '@/lib/utils';
import AppointmentActions from './AppointmentActions';

export default async function AdminAppointmentsPage() {
  const today = getVietnamToday();
  const appointments = await prisma.appointment.findMany({
    include: {
      customer: { include: { user: { select: { name: true, phone: true } } } },
      employee: { include: { user: { select: { name: true } } } },
      services: { include: { service: { select: { name: true } } } },
    },
    orderBy: [{ appointmentDate: 'desc' }, { startTime: 'asc' }],
    take: 50,
  });

  const statusColors: Record<string, string> = {
    PENDING: '#f59e0b', CONFIRMED: '#3b82f6', IN_PROGRESS: '#8b5cf6',
    COMPLETED: '#22c55e', CANCELLED: '#ef4444',
  };

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', padding: '20px 16px', color: '#fff' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>📅 Quản lý lịch hẹn</h1>
        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 2 }}>{appointments.length} lịch hẹn</div>
      </div>

      <div style={{ padding: '16px' }}>
        {appointments.map((appt) => {
          const isToday = appt.appointmentDate === today;
          return (
            <div key={appt.id} style={{
              background: '#fff', borderRadius: 12, padding: '14px 16px',
              marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              borderLeft: `3px solid ${statusColors[appt.status] || '#ccc'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{appt.customer.user.name}</span>
                  {appt.customer.user.phone && (
                    <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: 6 }}>{appt.customer.user.phone}</span>
                  )}
                </div>
                <span style={{
                  fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10,
                  background: `${statusColors[appt.status]}15`, color: statusColors[appt.status],
                  fontWeight: 600,
                }}>
                  {getStatusLabel(appt.status)}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>
                📆 {isToday ? 'Hôm nay' : appt.appointmentDate} • 🕐 {appt.startTime} - {appt.endTime}
              </div>
              {appt.employee && (
                <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 4 }}>
                  👤 KTV: {appt.employee.user.name}
                </div>
              )}
              <div style={{ fontSize: '0.78rem', color: '#888', marginBottom: 8 }}>
                💆 {appt.services.map(s => s.service.name).join(', ')}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#7c3aed' }}>
                  {formatCurrency(appt.finalAmount)}
                </span>
                <AppointmentActions appointmentId={appt.id} currentStatus={appt.status} />
              </div>
            </div>
          );
        })}

        {appointments.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Chưa có lịch hẹn nào
          </div>
        )}
      </div>
    </>
  );
}
