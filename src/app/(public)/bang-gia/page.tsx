export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { FiClock } from 'react-icons/fi';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

const defaultPricing = [
  { category: 'Chăm sóc da', items: [
    { name: 'Chăm sóc da cơ bản', duration: 60, price: 350000 },
    { name: 'Chăm sóc da chuyên sâu', duration: 90, price: 550000 },
    { name: 'Trị mụn chuyên sâu', duration: 75, price: 450000 },
    { name: 'Trẻ hóa da collagen', duration: 90, price: 650000 },
  ]},
  { category: 'Làm móng', items: [
    { name: 'Sơn móng thường', duration: 30, price: 80000 },
    { name: 'Sơn gel', duration: 45, price: 150000 },
    { name: 'Làm móng gel cao cấp', duration: 90, price: 250000 },
    { name: 'Sơn Ombre', duration: 60, price: 200000 },
    { name: 'Vẽ nail nghệ thuật', duration: 120, price: 350000 },
  ]},
  { category: 'Nối mi', items: [
    { name: 'Nối mi Classic', duration: 75, price: 300000 },
    { name: 'Nối mi Volume', duration: 90, price: 450000 },
    { name: 'Nối mi Mega Volume', duration: 120, price: 600000 },
    { name: 'Tháo mi', duration: 30, price: 50000 },
  ]},
  { category: 'Massage & Spa', items: [
    { name: 'Massage body thư giãn', duration: 90, price: 400000 },
    { name: 'Massage đá nóng', duration: 90, price: 500000 },
    { name: 'Massage chân', duration: 60, price: 200000 },
  ]},
  { category: 'Gội đầu', items: [
    { name: 'Gội đầu dưỡng sinh', duration: 45, price: 150000 },
    { name: 'Gội đầu + massage vai cổ', duration: 60, price: 200000 },
  ]},
];

async function getPricing() {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: { services: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } },
      orderBy: { sortOrder: 'asc' },
    });
    if (categories.length === 0) return defaultPricing;
    return categories.map(c => ({
      category: c.name,
      items: c.services.map(s => ({ name: s.name, duration: s.duration, price: s.price })),
    }));
  } catch { return defaultPricing; }
}

export default async function PricingPage() {
  const pricing = await getPricing();

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Bảng giá dịch vụ</h1>
          <p>Giá dịch vụ minh bạch, phù hợp mọi ngân sách</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          {pricing.map((group) => (
            <div key={group.category} style={{ marginBottom: '48px' }}>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '16px', color: 'var(--primary-dark)' }}>{group.category}</h2>
              <div style={{ overflowX: 'auto' }}>
                <table className="price-table">
                  <thead>
                    <tr><th>Dịch vụ</th><th>Thời gian</th><th>Giá</th><th></th></tr>
                  </thead>
                  <tbody>
                    {group.items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td><FiClock style={{ marginRight: '4px', verticalAlign: 'middle' }} />{item.duration} phút</td>
                        <td className="price-highlight">{formatCurrency(item.price)}</td>
                        <td><Link href="/dat-lich" className="btn btn-primary btn-sm">Đặt lịch</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          <div style={{ textAlign: 'center', padding: '32px', background: 'var(--primary-50)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--neutral-600)', marginBottom: '16px' }}>💡 Liên hệ trực tiếp để nhận ưu đãi combo và giá đặc biệt cho nhóm!</p>
            <Link href="/lien-he" className="btn btn-outline">Liên hệ tư vấn</Link>
          </div>
        </div>
      </section>
    </>
  );
}
