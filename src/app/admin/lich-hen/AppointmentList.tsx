'use client';

import { useState, useMemo } from 'react';
import { formatCurrency, getStatusLabel, getStatusColor } from '@/lib/utils';
import { FiClock, FiFilter } from 'react-icons/fi';
import AppointmentActions from './AppointmentActions';

interface Appointment {
  id: string; status: string; staffNote: string | null;
  appointmentDate: string; startTime: string; endTime: string; finalAmount: number;
  customer: { user: { name: string; phone: string | null } };
  employee: { user: { name: string } } | null;
  services: { service: { name: string } }[];
}

export default function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEmployee, setFilterEmployee] = useState('all');

  // Get unique employees
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
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <FiFilter style={{ color: 'var(--neutral-400)' }} />
        <select
          className="form-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', maxWidth: 200 }}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="CONFIRMED">Đã xác nhận</option>
          <option value="COMPLETED">Hoàn thành</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>
        <select
          className="form-select"
          value={filterEmployee}
          onChange={e => setFilterEmployee(e.target.value)}
          style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)', maxWidth: 200 }}
        >
          <option value="all">Tất cả nhân viên</option>
          {employees.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
        {(filterStatus !== 'all' || filterEmployee !== 'all') && (
          <button
            onClick={() => { setFilterStatus('all'); setFilterEmployee('all'); }}
            style={{
              background: 'none', border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-sm)',
              padding: '6px 12px', fontSize: '0.82rem', cursor: 'pointer', color: 'var(--neutral-500)',
            }}
          >
            Xóa bộ lọc
          </button>
        )}
        <span style={{ fontSize: '0.82rem', color: 'var(--neutral-400)', marginLeft: 'auto' }}>
          Hiển thị {filtered.length}/{appointments.length}
        </span>
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => {
          const count = appointments.filter(a => a.status === status).length;
          const isActive = filterStatus === status;
          return count > 0 ? (
            <button
              key={status}
              onClick={() => setFilterStatus(isActive ? 'all' : status)}
              className={`badge badge-${getStatusColor(status)}`}
              style={{
                padding: '6px 14px', cursor: 'pointer', border: 'none',
                outline: isActive ? '2px solid var(--primary)' : 'none',
                outlineOffset: 2,
              }}
            >
              {getStatusLabel(status)}: {count}
            </button>
          ) : null;
        })}
      </div>

      {/* Table */}
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
              {filtered.map((a) => (
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
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>Không có lịch hẹn phù hợp</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
