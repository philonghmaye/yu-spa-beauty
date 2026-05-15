export const revalidate = 30;

import { getPromotions } from '@/actions/promotions';
import { formatCurrency, getVietnamNow } from '@/lib/utils';
import PromotionActions from './PromotionActions';

export default async function PromotionsPage() {
  const promotions = await getPromotions();

  const getPromoStatus = (promo: { isActive: boolean; startDate: Date; endDate: Date; usageLimit: number | null; usedCount: number }) => {
    if (!promo.isActive) return { label: 'Đã tắt', badge: 'badge-error' };
    const now = getVietnamNow();
    if (now < promo.startDate) return { label: 'Chưa bắt đầu', badge: 'badge-warning' };
    if (now > promo.endDate) return { label: 'Hết hạn', badge: 'badge-error' };
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return { label: 'Hết lượt', badge: 'badge-error' };
    return { label: 'Đang hoạt động', badge: 'badge-success' };
  };

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Quản lý khuyến mãi</h1>
        <PromotionActions mode="header" />
      </div>

      {/* Quick stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <span className="badge badge-success" style={{ padding: '6px 14px' }}>
          Đang hoạt động: {promotions.filter((p) => {
            const now = getVietnamNow();
            return p.isActive && now >= p.startDate && now <= p.endDate && (!p.usageLimit || p.usedCount < p.usageLimit);
          }).length}
        </span>
        <span className="badge badge-primary" style={{ padding: '6px 14px' }}>
          Tổng: {promotions.length}
        </span>
      </div>

      <div className="card" style={{ border: '1px solid var(--neutral-100)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên</th>
                <th>Mã</th>
                <th>Loại</th>
                <th>Giá trị</th>
                <th>Đơn tối thiểu</th>
                <th>Đã dùng</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Bật/Tắt</th>
                <th style={{ width: '100px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => {
                const status = getPromoStatus(p);
                return (
                  <tr key={p.id} style={{ opacity: p.isActive ? 1 : 0.5 }}>
                    <td style={{ fontWeight: 500 }}>
                      <div>{p.name}</div>
                      {p.description && <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)' }}>{p.description}</div>}
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem',
                        background: 'var(--primary-50)', color: 'var(--primary)',
                        padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                      }}>
                        {p.code}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-accent">
                        {p.type === 'PERCENTAGE' ? 'Phần trăm' : 'Cố định'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {p.type === 'PERCENTAGE' ? `${p.value}%` : formatCurrency(p.value)}
                      {p.maxDiscount && <div style={{ fontSize: '0.75rem', color: 'var(--neutral-400)' }}>Tối đa: {formatCurrency(p.maxDiscount)}</div>}
                    </td>
                    <td>{p.minOrderValue ? formatCurrency(p.minOrderValue) : '—'}</td>
                    <td>
                      <span style={{ fontWeight: 500 }}>
                        {p.usedCount}{p.usageLimit ? `/${p.usageLimit}` : ''}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>
                      <div>{new Date(p.startDate).toLocaleDateString('vi-VN')}</div>
                      <div style={{ color: 'var(--neutral-400)' }}>→ {new Date(p.endDate).toLocaleDateString('vi-VN')}</div>
                    </td>
                    <td><span className={`badge ${status.badge}`}>{status.label}</span></td>
                    <td>
                      <PromotionActions
                        mode="toggle"
                        promotion={{
                          ...p,
                          startDate: p.startDate.toISOString(),
                          endDate: p.endDate.toISOString(),
                        }}
                      />
                    </td>
                    <td>
                      <PromotionActions
                        mode="row-actions"
                        promotion={{
                          ...p,
                          startDate: p.startDate.toISOString(),
                          endDate: p.endDate.toISOString(),
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
              {promotions.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>Chưa có khuyến mãi nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
