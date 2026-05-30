export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { getVietnamToday } from '@/lib/utils';
import MobileAppointmentList from './MobileAppointmentList';

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

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', padding: '20px 16px', color: '#fff' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>📅 Quản lý lịch hẹn</h1>
        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 2 }}>{appointments.length} lịch hẹn</div>
      </div>

      <div style={{ paddingTop: 12 }}>
        <MobileAppointmentList appointments={appointments} today={today} />
      </div>
    </>
  );
}
