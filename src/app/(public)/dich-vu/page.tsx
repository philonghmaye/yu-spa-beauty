export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { FiClock } from 'react-icons/fi';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

const defaultServices = [
  { slug: 'cham-soc-da-mat', name: 'Chăm sóc da mặt cơ bản', description: 'Làm sạch, tẩy tế bào chết, đắp mặt nạ dưỡng ẩm', price: 350000, duration: 60, image: '/images/service-spa.png', category: 'Chăm sóc da' },
  { slug: 'cham-soc-da-chuyen-sau', name: 'Chăm sóc da chuyên sâu', description: 'Liệu trình trẻ hóa da với công nghệ hiện đại', price: 550000, duration: 90, image: '/images/service-spa.png', category: 'Chăm sóc da' },
  { slug: 'lam-mong-gel', name: 'Làm móng gel cao cấp', description: 'Thiết kế móng nghệ thuật với gel bền đẹp', price: 250000, duration: 90, image: '/images/service-nail.png', category: 'Làm móng' },
  { slug: 'son-mong-ombre', name: 'Sơn móng Ombre', description: 'Kỹ thuật sơn chuyển màu gradient thời thượng', price: 200000, duration: 60, image: '/images/service-nail.png', category: 'Làm móng' },
  { slug: 'noi-mi-classic', name: 'Nối mi Classic', description: 'Nối mi 1:1 tự nhiên, nhẹ nhàng', price: 300000, duration: 75, image: '/images/service-eyelash.png', category: 'Nối mi' },
  { slug: 'noi-mi-volume', name: 'Nối mi Volume', description: 'Nối mi bung dày, quyến rũ', price: 450000, duration: 90, image: '/images/service-eyelash.png', category: 'Nối mi' },
  { slug: 'massage-body', name: 'Massage body thư giãn', description: 'Massage toàn thân giảm stress, thư giãn cơ thể', price: 400000, duration: 90, image: '/images/service-massage.png', category: 'Massage' },
  { slug: 'goi-dau-duong-sinh', name: 'Gội đầu dưỡng sinh', description: 'Gội đầu kết hợp massage đầu, vai, cổ', price: 150000, duration: 45, image: '/images/service-massage.png', category: 'Gội đầu' },
];

async function getServices() {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    });
    return services.length > 0 ? services.map(s => ({
      slug: s.slug, name: s.name, description: s.description,
      price: s.price, duration: s.duration, image: s.image,
      category: s.category.name,
    })) : defaultServices;
  } catch {
    return defaultServices;
  }
}

export default async function ServicesPage() {
  const services = await getServices();
  const categories = [...new Set(services.map(s => s.category))];

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Dịch vụ của chúng tôi</h1>
          <p>Đa dạng dịch vụ làm đẹp chuyên nghiệp, phù hợp mọi nhu cầu</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {categories.map((cat) => (
            <div key={cat} style={{ marginBottom: '60px' }}>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '24px', paddingBottom: '12px', borderBottom: '2px solid var(--primary-light)' }}>
                {cat}
              </h2>
              <div className="grid grid-3">
                {services.filter(s => s.category === cat).map((service) => (
                  <Link href={`/dich-vu/${service.slug}`} key={service.slug} className="card service-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Image src={service.image || '/images/service-spa.png'} alt={service.name} width={400} height={200} className="card-img" style={{ objectFit: 'cover' }} />
                    <div className="card-body">
                      <h3 className="card-title">{service.name}</h3>
                      <p className="card-text">{service.description}</p>
                      <div className="service-meta">
                        <span className="service-price">{formatCurrency(service.price)}</span>
                        <span className="service-duration"><FiClock style={{ marginRight: '4px' }} />{service.duration} phút</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
