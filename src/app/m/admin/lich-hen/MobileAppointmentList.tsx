'use client';

import { useState, useMemo } from 'react';
import { formatCurrency, getStatusLabel } from '@/lib/utils';
import AppointmentActions from './AppointmentActions';

interface Appointment {
  id: string; status: string;
  appointmentDate: string; startTime: string; endTime: string;
  finalAmount: number;
  customer: { user: { name: string; phone: string | null } };
  employee: { user: { name: string } } | null;
  services: { service: { name: string } }[];
}

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b', CONFIRMED: '#3b82f6', IN_PROGRESS: '#8b5cf6',
  COMPLETED: '#22c55e', CANCELLED: '#ef4444',
};

export default function MobileAppointmentList({ appointments, today }: { appointments: Appointment[]; today: string }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');

  const employees = useMemo(() => {
    const names = new Set<string>();
    appointments.forEach(a => { if (a.employee) names.add(a.employee.user.name); });
    return Array.from(names).sort();
  }, [appointments]);

  const filtered = useMemo(() => {
    let result = appointments;
    if (filterStatus !== 'all') result = result.filter(a => a.status === filterStatus);
    if (filterEmployee !== 'all') result = result.filter(a => a.employee?.user.name === filterEmployee);
    return result;
  }, [appointments, filterStatus, filterEmployee]);

  return (
    <>
      {/* Filters */}
      <div style={{ padding: '0 16px 8px', display: 'flex', gap: 8 }}>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{
            flex: 1, padding: '8px 10px', borderRadius: 10,
            border: '1px solid #e5e7eb', fontSize: '0.8rem', background: '#fff',
          }}
        >
          <option value="all">Trạng thái</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <select
          value={filterEmployee}
          onChange={e => setFilterEmployee(e.target.value)}
          style={{
            flex: 1, padding: '8px 10px', borderRadius: 10,
            border: '1px solid #e5e7eb', fontSize: '0.8rem', background: '#fff',
          }}
        >
          <option value="all">Nhân viên</option>
          {employees.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>

      {/* Status chips */}
      <div style={{ padding: '0 16px 12px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(status => {
          const count = appointments.filter(a => a.status === status).length;
          if (count === 0) return null;
          const isActive = filterStatus === status;
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(isActive ? 'all' : status)}
              style={{
                padding: '4px 10px', borderRadius: 8, border: 'none', whiteSpace: 'nowrap',
                background: isActive ? statusColors[status] : `${statusColors[status]}15`,
                color: isActive ? '#fff' : statusColors[status],
                fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {getStatusLabel(status)} ({count})
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div style={{ padding: '0 16px 8px', fontSize: '0.75rem', color: '#999' }}>
        {filtered.length}/{appointments.length} lịch hẹn
      </div>

      {/* Appointment cards */}
      <div style={{ padding: '0 16px' }}>
        {filtered.map((appt) => {
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

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Không có lịch hẹn phù hợp
          </div>
        )}
      </div>
    </>
  );
}
