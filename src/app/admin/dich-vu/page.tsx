export const revalidate = 30;

import { getServices, getCategories } from '@/actions/services';
import { formatCurrency } from '@/lib/utils';
import ServiceActions from './ServiceActions';

export default async function ServicesAdminPage() {
  const [services, categories] = await Promise.all([getServices(), getCategories()]);

  return (
    <>
      <div className="admin-header">
        <h1 className="admin-title">Quản lý dịch vụ</h1>
        <ServiceActions services={services} categories={categories} mode="header" />
      </div>

      {/* Category summary */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {categories.map(c => (
          <span key={c.id} className="badge badge-primary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
            {c.icon} {c.name} ({c.services.length})
          </span>
        ))}
      </div>

      <div className="card" style={{ border: '1px solid var(--neutral-100)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tên dịch vụ</th><th>Danh mục</th><th>Giá</th><th>Thời gian</th>
                <th>Trạng thái</th><th>Nổi bật</th><th style={{ width: '180px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.id} style={{ opacity: s.isActive ? 1 : 0.5 }}>
                  <td style={{ fontWeight: 500 }}>
                    <div>{s.name}</div>
                    {s.description && <div style={{ fontSize: '0.8rem', color: 'var(--neutral-400)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description}</div>}
                  </td>
                  <td><span className="badge badge-primary">{s.category.name}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--primary)' }}>{formatCurrency(s.price)}</div>
                    {s.discountPrice && <div style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: 'var(--neutral-400)' }}>{formatCurrency(s.price)}</div>}
                  </td>
                  <td>{s.duration} phút</td>
                  <td>
                    <ServiceActions services={services} categories={categories} mode="toggle-active" serviceId={s.id} isActive={s.isActive} />
                  </td>
                  <td>
                    <ServiceActions services={services} categories={categories} mode="toggle-featured" serviceId={s.id} isFeatured={s.isFeatured} />
                  </td>
                  <td>
                    <ServiceActions services={services} categories={categories} mode="row-actions" service={s} />
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>Chưa có dịch vụ nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
