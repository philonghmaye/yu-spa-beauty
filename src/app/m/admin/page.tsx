export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { formatCurrency, getVietnamToday, getVietnamNow, getStatusLabel } from '@/lib/utils';
import Link from 'next/link';
import { FiCalendar, FiUsers, FiClock, FiChevronRight, FiHome } from 'react-icons/fi';
import AdminNotificationBell from '../AdminNotificationBell';


async function getStats() {
  const today = getVietnamToday();
  const vn = getVietnamNow();
  const monthStart = new Date(vn.getFullYear(), vn.getMonth(), 1).toISOString().split('T')[0];

  const [todayCount, pendingCount, totalCustomers, monthCompleted, activeStaff] = await Promise.all([
    prisma.appointment.count({ where: { appointmentDate: today } }),
    prisma.appointment.count({ where: { status: 'PENDING' } }),
    prisma.customer.count(),
    prisma.appointment.count({ where: { status: 'COMPLETED', appointmentDate: { gte: monthStart } } }),
    prisma.employee.count({ where: { isAvailable: true, user: { isActive: true } } }),
  ]);

  return { todayCount, pendingCount, totalCustomers, monthCount: monthCompleted, activeStaff };
}

async function getTodayAppointments() {
  const today = getVietnamToday();
  return prisma.appointment.findMany({
    where: { appointmentDate: today },
    include: {
      customer: { include: { user: { select: { name: true, phone: true } } } },
      employee: { include: { user: { select: { name: true } } } },
      services: { include: { service: { select: { name: true } } } },
    },
    orderBy: { startTime: 'asc' },
  });
}

export default async function AdminMobileDashboard() {
  const stats = await getStats();
  const todayAppts = await getTodayAppointments();

  const statusColors: Record<string, string> = {
    PENDING: '#f59e0b',
    CONFIRMED: '#3b82f6',
    IN_PROGRESS: '#8b5cf6',
    COMPLETED: '#22c55e',
    CANCELLED: '#ef4444',
  };

  return (
    <>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', padding: '20px 16px 24px', color: '#fff', position: 'relative' }}>
        <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>Xin chào, Admin 👋</div>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '4px 0 0', letterSpacing: '0.5px', color: '#fbcfe8' }}>✨ YURI SPA BEAUTY</h1>
        <div style={{ fontSize: '0.78rem', opacity: 0.7, marginTop: 2 }}>Bảng điều khiển quản lý</div>
        <div style={{ position: 'absolute', top: 18, right: 16, display: 'flex', gap: 8 }}>
          <AdminNotificationBell />
          <Link
            href="/m"
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '1.15rem',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
            title="Trang chủ"
          >
            <FiHome />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '16px', marginTop: -12 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}><FiCalendar /></div>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>Hôm nay</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.todayCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#999' }}>lịch hẹn</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}><FiClock /></div>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>Chờ xác nhận</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>{stats.pendingCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#999' }}>chờ xác nhận</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}><FiCalendar /></div>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>Hoàn thành</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.monthCount}</div>
          <div style={{ fontSize: '0.72rem', color: '#999' }}>tháng này</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}><FiUsers /></div>
            <span style={{ fontSize: '0.75rem', color: '#888' }}>Khách hàng</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.totalCustomers}</div>
          <div style={{ fontSize: '0.72rem', color: '#999' }}>tổng cộng</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '4px 16px 16px' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/m/admin/lich-hen" style={{
            flex: 1, padding: '12px', borderRadius: 10, background: '#7c3aed', color: '#fff',
            textDecoration: 'none', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600,
          }}>
            📅 Quản lý lịch hẹn
          </Link>
          <Link href="/m/admin/nhan-vien" style={{
            flex: 1, padding: '12px', borderRadius: 10, background: '#fff', color: '#7c3aed',
            textDecoration: 'none', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600,
            border: '1px solid #e9d5ff',
          }}>
            👥 Nhân viên ({stats.activeStaff})
          </Link>
        </div>

      </div>

      {/* Today's Appointments */}
      <div style={{ padding: '0 16px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1.05rem' }}>Lịch hẹn hôm nay</h3>
          <Link href="/m/admin/lich-hen" style={{ fontSize: '0.82rem', color: '#7c3aed', fontWeight: 500 }}>Xem tất cả →</Link>
        </div>

        {todayAppts.length > 0 ? todayAppts.map((appt) => (
          <div key={appt.id} style={{
            background: '#fff', borderRadius: 12, padding: '14px 16px',
            marginBottom: 10, boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            borderLeft: `3px solid ${statusColors[appt.status] || '#ccc'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{appt.customer.user.name}</span>
              <span style={{
                fontSize: '0.7rem', padding: '2px 8px', borderRadius: 10,
                background: `${statusColors[appt.status]}15`, color: statusColors[appt.status],
                fontWeight: 600,
              }}>
                {getStatusLabel(appt.status)}
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: 4 }}>
              🕐 {appt.startTime} - {appt.endTime}
              {appt.employee && <span> • 👤 {appt.employee.user.name}</span>}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#888' }}>
              {appt.services.map(s => s.service.name).join(', ')}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#7c3aed', marginTop: 6 }}>
              {formatCurrency(appt.finalAmount)}
            </div>
          </div>
        )) : (
          <div style={{ background: '#fff', borderRadius: 12, padding: '32px 16px', textAlign: 'center', color: '#999' }}>
            📅 Chưa có lịch hẹn hôm nay
          </div>
        )}
      </div>
    </>
  );
}
