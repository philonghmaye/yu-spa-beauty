import Image from 'next/image';
import Link from 'next/link';
import { FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';
import { notFound } from 'next/navigation';

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let service;
  try {
    service = await prisma.service.findUnique({
      where: { slug },
      include: { category: true },
    });
  } catch {
    service = null;
  }

  // Fallback for when DB is empty
  const fallbacks: Record<string, { name: string; description: string; price: number; duration: number; image: string; category: string }> = {
    'cham-soc-da-mat': { name: 'Chăm sóc da mặt cơ bản', description: 'Liệu trình chăm sóc da mặt cơ bản bao gồm làm sạch sâu, tẩy tế bào chết nhẹ nhàng, massage mặt thư giãn và đắp mặt nạ dưỡng ẩm cao cấp. Phù hợp cho mọi loại da, giúp da sáng mịn và tươi trẻ.', price: 350000, duration: 60, image: '/images/service-spa.png', category: 'Chăm sóc da' },
    'lam-mong-gel': { name: 'Làm móng gel cao cấp', description: 'Dịch vụ làm móng gel với đa dạng mẫu mã từ đơn giản đến phức tạp. Sử dụng gel cao cấp, bền màu lên đến 3-4 tuần. Bao gồm chăm sóc da tay và dưỡng móng.', price: 250000, duration: 90, image: '/images/service-nail.png', category: 'Làm móng' },
    'noi-mi-classic': { name: 'Nối mi Classic', description: 'Nối mi classic 1:1, tạo hiệu ứng tự nhiên và thanh lịch. Sử dụng mi lụa Hàn Quốc cao cấp, nhẹ nhàng không gây hại cho mi thật. Bền đẹp 3-4 tuần.', price: 300000, duration: 75, image: '/images/service-eyelash.png', category: 'Nối mi' },
    'massage-body': { name: 'Massage body thư giãn', description: 'Massage toàn thân kết hợp tinh dầu thiên nhiên, giúp thư giãn cơ bắp, giảm stress và cải thiện tuần hoàn máu. Trải nghiệm thư giãn tuyệt đối.', price: 400000, duration: 90, image: '/images/service-massage.png', category: 'Massage' },
  };

  const data = service ? {
    name: service.name, description: service.description || '', price: service.price,
    duration: service.duration, image: service.image || '/images/service-spa.png', category: service.category.name,
  } : fallbacks[slug];

  if (!data) notFound();

  return (
    <>
      <div className="page-header">
        <div className="container">
          <p style={{ marginBottom: '8px' }}><Link href="/dich-vu" style={{ color: 'var(--primary)' }}>← Tất cả dịch vụ</Link></p>
          <h1>{data.name}</h1>
          <p><span className="badge badge-primary">{data.category}</span></p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'start' }}>
            <Image src={data.image} alt={data.name} width={600} height={400} style={{ borderRadius: 'var(--radius-lg)', objectFit: 'cover', width: '100%' }} />
            <div>
              <h2 style={{ marginBottom: '16px' }}>Chi tiết dịch vụ</h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--neutral-600)', marginBottom: '24px' }}>{data.description}</p>
              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
                  <FiDollarSign style={{ color: 'var(--primary)' }} />
                  <strong style={{ color: 'var(--primary)', fontSize: '1.3rem' }}>{formatCurrency(data.price)}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--neutral-500)' }}>
                  <FiClock /> {data.duration} phút
                </div>
              </div>
              <Link href="/dat-lich" className="btn btn-primary btn-lg">
                <FiCalendar /> Đặt lịch ngay
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
