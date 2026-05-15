'use client';

import { useState } from 'react';
import { getStatusLabel, getStatusColor } from '@/lib/utils';

interface Activity {
  id: string; date: string; startTime: string; endTime: string;
  status: string; services: string[]; employeeName: string | null; totalAmount: number;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN').format(n) + ' đ';
}

export default function ActivityList({ initialData }: { initialData: Activity[] }) {
  const [filter, setFilter] = useState('all');

  const filtered = initialData.filter(a => {
    if (filter === 'upcoming') return ['PENDING', 'CONFIRMED'].includes(a.status);
    if (filter === 'completed') return a.status === 'COMPLETED';
    return true;
  });

  return (
    <>
      <div className="m-topbar">
        <span className="m-topbar-title" style={{ marginRight: 0 }}>Hoạt động</span>
      </div>

      <div className="m-filter-tabs">
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'upcoming', label: 'Sắp tới' },
          { key: 'completed', label: 'Hoàn thành' },
        ].map(f => (
          <button key={f.key} className={`m-filter-tab ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? filtered.map(a => (
        <div key={a.id} className="m-activity-card">
          <div className="top">
            <span className="service-name">{a.services.join(', ')}</span>
            <span className={`badge badge-${getStatusColor(a.status)}`} style={{ fontSize: '0.72rem' }}>
              {getStatusLabel(a.status)}
            </span>
          </div>
          <div className="details">
            <div>📅 {a.date} | 🕐 {a.startTime} — {a.endTime}</div>
            {a.employeeName && <div>👤 {a.employeeName}</div>}
          </div>
          <div className="bottom">
            <span className="price">{formatCurrency(a.totalAmount)}</span>
          </div>
        </div>
      )) : (
        <div className="m-empty">
          <div className="icon">📋</div>
          <p>Chưa có hoạt động nào</p>
        </div>
      )}
    </>
  );
}
