export const dynamic = 'force-dynamic';

import prisma from '@/lib/prisma';
import { formatCurrency, getVietnamNow } from '@/lib/utils';

export default async function AdminRevenuePage() {
  const vn = getVietnamNow();
  const year = vn.getFullYear();
  const month = vn.getMonth();

  // This month
  const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
  const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];

  // Last month
  const lastMonthStart = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const lastMonthEnd = new Date(year, month, 0).toISOString().split('T')[0];

  const [thisMonthAppts, lastMonthAppts, topServices] = await Promise.all([
    prisma.appointment.findMany({
      where: { status: 'COMPLETED', appointmentDate: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.appointment.findMany({
      where: { status: 'COMPLETED', appointmentDate: { gte: lastMonthStart, lte: lastMonthEnd } },
    }),
    prisma.appointmentService.groupBy({
      by: ['serviceId'],
      _count: { serviceId: true },
      orderBy: { _count: { serviceId: 'desc' } },
      take: 5,
    }),
  ]);

  const thisRevenue = thisMonthAppts.reduce((s, a) => s + a.finalAmount, 0);
  const lastRevenue = lastMonthAppts.reduce((s, a) => s + a.finalAmount, 0);
  const growth = lastRevenue > 0 ? Math.round(((thisRevenue - lastRevenue) / lastRevenue) * 100) : 0;

  // Get service names
  const serviceIds = topServices.map(t => t.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true, price: true },
  });
  const serviceMap = Object.fromEntries(services.map(s => [s.id, s]));

  return (
    <>
      <div style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)', padding: '20px 16px', color: '#fff' }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700 }}>📊 Doanh thu</h1>
        <div style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: 2 }}>Thống kê tài chính</div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Revenue Card */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '24px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 4 }}>Doanh thu tháng {month + 1}/{year}</div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7c3aed' }}>{formatCurrency(thisRevenue)}</div>
          <div style={{
            fontSize: '0.8rem', marginTop: 8,
            color: growth >= 0 ? '#22c55e' : '#ef4444',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span>{growth >= 0 ? '📈' : '📉'} {growth >= 0 ? '+' : ''}{growth}%</span>
            <span style={{ color: '#aaa' }}>so với tháng trước</span>
          </div>
        </div>

        {/* Comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 6 }}>Tháng này</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{thisMonthAppts.length}</div>
            <div style={{ fontSize: '0.72rem', color: '#aaa' }}>lượt hoàn thành</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 6 }}>Tháng trước</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{lastMonthAppts.length}</div>
            <div style={{ fontSize: '0.72rem', color: '#aaa' }}>lượt hoàn thành</div>
          </div>
        </div>

        {/* Average */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.82rem', color: '#888', marginBottom: 6 }}>Giá trị trung bình / lượt</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            {thisMonthAppts.length > 0 ? formatCurrency(Math.round(thisRevenue / thisMonthAppts.length)) : '—'}
          </div>
        </div>

        {/* Top Services */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: 12 }}>🏆 Dịch vụ phổ biến nhất</div>
          {topServices.map((t, i) => {
            const svc = serviceMap[t.serviceId];
            if (!svc) return null;
            return (
              <div key={t.serviceId} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 0', borderBottom: i < topServices.length - 1 ? '1px solid #f5f5f5' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: i === 0 ? '#fef3c7' : i === 1 ? '#f1f5f9' : i === 2 ? '#fef3c7' : '#f9fafb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: 700, color: '#888',
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{svc.name}</span>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#7c3aed' }}>{t._count.serviceId} lượt</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
