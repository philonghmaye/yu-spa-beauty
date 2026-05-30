'use client';

import { useState, useMemo } from 'react';
import { formatCurrency } from '@/lib/utils';
import ServiceActions from './ServiceActions';
import { FiSearch } from 'react-icons/fi';

interface Category {
  id: string;
  name: string;
  icon: string;
  services: { id: string }[];
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountPrice: number | null;
  duration: number;
  isActive: boolean;
  isFeatured: boolean;
  category: { id: string; name: string; icon: string };
  [key: string]: unknown;
}

export default function ServiceList({ services, categories }: { services: Service[]; categories: Category[] }) {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = services;
    if (selectedCat) {
      result = result.filter(s => s.category.id === selectedCat);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [services, selectedCat, search]);

  return (
    <>
      {/* Category chips */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button
          onClick={() => setSelectedCat(null)}
          style={{
            padding: '6px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)',
            border: !selectedCat ? '2px solid var(--primary)' : '1px solid var(--neutral-200)',
            background: !selectedCat ? 'var(--primary-light)' : '#fff',
            color: !selectedCat ? 'var(--primary)' : 'var(--neutral-600)',
            fontWeight: !selectedCat ? 700 : 500, cursor: 'pointer',
          }}
        >
          Tất cả ({services.length})
        </button>
        {categories.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(selectedCat === c.id ? null : c.id)}
            style={{
              padding: '6px 16px', fontSize: '0.85rem', borderRadius: 'var(--radius-full)',
              border: selectedCat === c.id ? '2px solid var(--primary)' : '1px solid var(--neutral-200)',
              background: selectedCat === c.id ? 'var(--primary-light)' : '#fff',
              color: selectedCat === c.id ? 'var(--primary)' : 'var(--neutral-600)',
              fontWeight: selectedCat === c.id ? 700 : 500, cursor: 'pointer',
            }}
          >
            {c.icon} {c.name} ({c.services.length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '20px' }}>
        <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--neutral-400)' }} />
        <input
          type="text"
          className="form-input"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm tên dịch vụ..."
          style={{ paddingLeft: '40px' }}
        />
      </div>

      {/* Table */}
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
              {filtered.map((s) => (
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
              {filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--neutral-400)' }}>
                  {search ? `Không tìm thấy dịch vụ "${search}"` : 'Không có dịch vụ trong danh mục này'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
