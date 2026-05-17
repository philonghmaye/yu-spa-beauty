'use client';

import { useState } from 'react';
import { FiTrendingUp, FiCalendar, FiUsers, FiFilter } from 'react-icons/fi';

interface StatsData {
  dailyData: { date: string; value: number; count: number }[];
  monthlyData: { month: string; value: number; count: number }[];
  yearlyData: { year: string; value: number; count: number }[];
  topServices: { name: string; count: number; revenue: number }[];
  topStaff: { name: string; appointments: number; revenue: number }[];
  totalRevenue: number;
  totalAppointments: number;
  totalCustomers: number;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
}

export default function StatsClient({ data }: { data: StatsData }) {
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('month');

  const chartData = viewMode === 'day' ? data.dailyData.map(d => ({ label: d.date, value: d.value, count: d.count }))
    : viewMode === 'year' ? data.yearlyData.map(d => ({ label: d.year, value: d.value, count: d.count }))
    : data.monthlyData.map(d => ({ label: d.month, value: d.value, count: d.count }));

  const maxValue = Math.max(...chartData.map(m => m.value), 1);

  const filteredRevenue = chartData.reduce((s, d) => s + d.value, 0);
  const filteredCount = chartData.reduce((s, d) => s + d.count, 0);

  return (
    <>
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1 className="admin-title">Thống kê doanh thu</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['day', 'month', 'year'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                background: viewMode === mode ? 'var(--primary)' : 'var(--neutral-100)',
                color: viewMode === mode ? '#fff' : 'var(--neutral-600)',
              }}
            >
              {mode === 'day' ? '📅 Ngày' : mode === 'month' ? '📆 Tháng' : '📊 Năm'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon green"><FiTrendingUp /></div>
          <div><div className="stat-value">{formatCurrency(data.totalRevenue)}</div><div className="stat-label">Tổng doanh thu</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><FiCalendar /></div>
          <div><div className="stat-value">{data.totalAppointments}</div><div className="stat-label">Tổng lịch hẹn</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pink"><FiUsers /></div>
          <div><div className="stat-value">{data.totalCustomers}</div><div className="stat-label">Tổng khách hàng</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon gold"><FiTrendingUp /></div>
          <div>
            <div className="stat-value">{data.totalAppointments > 0 ? formatCurrency(data.totalRevenue / data.totalAppointments) : '0 ₫'}</div>
            <div className="stat-label">TB/lịch hẹn</div>
          </div>
        </div>
      </div>

      {/* Filtered Summary */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 20, padding: '14px 20px',
        background: 'linear-gradient(135deg, #f3e8ff, #fce7f3)', borderRadius: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.78rem', color: '#888' }}>
            Doanh thu {viewMode === 'day' ? '30 ngày' : viewMode === 'month' ? '6 tháng' : 'theo năm'}
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#7c3aed' }}>{formatCurrency(filteredRevenue)}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.78rem', color: '#888' }}>Số lượt hoàn thành</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{filteredCount}</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="card" style={{ border: '1px solid var(--neutral-100)', marginBottom: '24px' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--neutral-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.1rem' }}>
            <FiTrendingUp style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Doanh thu theo {viewMode === 'day' ? 'ngày' : viewMode === 'month' ? 'tháng' : 'năm'}
          </h2>
        </div>
        <div style={{ padding: '24px', overflowX: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: viewMode === 'day' ? '6px' : '16px', height: '280px', minWidth: viewMode === 'day' ? '800px' : 'auto' }}>
            {chartData.map((m) => (
              <div key={m.label} style={{ flex: viewMode === 'day' ? '0 0 24px' : 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                {viewMode !== 'day' && (
                  <>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--primary)', textAlign: 'center' }}>{formatCurrency(m.value)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--neutral-400)' }}>{m.count} đơn</span>
                  </>
                )}
                <div
                  title={`${m.label}: ${formatCurrency(m.value)} (${m.count} đơn)`}
                  style={{
                    width: '100%', maxWidth: viewMode === 'day' ? '20px' : '60px',
                    height: `${maxValue > 0 ? (m.value / maxValue) * 180 : 0}px`,
                    minHeight: m.value > 0 ? '4px' : '2px',
                    background: m.value > 0 ? 'linear-gradient(to top, var(--primary), var(--accent))' : 'var(--neutral-200)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.5s ease',
                    cursor: 'pointer',
                  }}
                />
                <span style={{
                  fontSize: viewMode === 'day' ? '0.6rem' : '0.85rem',
                  fontWeight: 500, color: 'var(--neutral-600)',
                  writingMode: viewMode === 'day' ? 'vertical-rl' : undefined,
                  transform: viewMode === 'day' ? 'rotate(180deg)' : undefined,
                  height: viewMode === 'day' ? '40px' : undefined,
                }}>
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        {/* Top Services */}
        <div className="card" style={{ border: '1px solid var(--neutral-100)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--neutral-100)' }}>
            <h2 style={{ fontSize: '1.1rem' }}><FiCalendar style={{ marginRight: '8px', verticalAlign: 'middle' }} />Dịch vụ phổ biến</h2>
          </div>
          <div style={{ padding: '16px 24px' }}>
            {data.topServices.length > 0 ? data.topServices.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < data.topServices.length - 1 ? '1px solid var(--neutral-100)' : 'none' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{s.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>{s.count} lượt đặt</div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCurrency(s.revenue)}</div>
              </div>
            )) : <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu</p>}
          </div>
        </div>

        {/* Top Staff */}
        <div className="card" style={{ border: '1px solid var(--neutral-100)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--neutral-100)' }}>
            <h2 style={{ fontSize: '1.1rem' }}><FiUsers style={{ marginRight: '8px', verticalAlign: 'middle' }} />Nhân viên xuất sắc</h2>
          </div>
          <div style={{ padding: '16px 24px' }}>
            {data.topStaff.length > 0 ? data.topStaff.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: i < data.topStaff.length - 1 ? '1px solid var(--neutral-100)' : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem' }}>
                    {i + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>{s.appointments} lịch hẹn</div>
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCurrency(s.revenue)}</div>
              </div>
            )) : <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '20px' }}>Chưa có dữ liệu</p>}
          </div>
        </div>
      </div>
    </>
  );
}
