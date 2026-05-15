export const revalidate = 60;

import Link from 'next/link';
import Image from 'next/image';
import { FiCalendar, FiStar, FiUsers, FiAward, FiArrowRight, FiClock, FiHeart } from 'react-icons/fi';
import prisma from '@/lib/prisma';
import { formatCurrency } from '@/lib/utils';

async function getFeaturedServices() {
  try {
    return await prisma.service.findMany({
      where: { isActive: true, isFeatured: true },
      include: { category: true },
      take: 6,
      orderBy: { sortOrder: 'asc' },
    });
  } catch {
    return [];
  }
}

async function getReviews() {
  try {
    return await prisma.review.findMany({
      where: { isVisible: true, rating: { gte: 4 } },
      include: { customer: { include: { user: true } } },
      take: 3,
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const services = await getFeaturedServices();
  const reviews = await getReviews();

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="hero-inner">
          <div className="animate-in">
            <div className="hero-badge">
              <FiStar /> Chất lượng hàng đầu
            </div>
            <h1 className="hero-title">
              Tỏa sáng vẻ đẹp <em>tự nhiên</em> của bạn
            </h1>
            <p className="hero-text">
              YURI SPA BEAUTY mang đến trải nghiệm làm đẹp đẳng cấp với đội ngũ chuyên gia giàu kinh nghiệm, 
              không gian thư giãn sang trọng và sản phẩm cao cấp.
            </p>
            <div className="hero-actions">
              <Link href="/dat-lich" className="btn btn-primary btn-lg">
                <FiCalendar /> Đặt lịch ngay
              </Link>
              <Link href="/dich-vu" className="btn btn-outline btn-lg">
                Xem dịch vụ <FiArrowRight />
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-number">5+</div>
                <div className="hero-stat-label">Năm kinh nghiệm</div>
              </div>
              <div>
                <div className="hero-stat-number">2K+</div>
                <div className="hero-stat-label">Khách hàng</div>
              </div>
              <div>
                <div className="hero-stat-number">4.9</div>
                <div className="hero-stat-label">Đánh giá</div>
              </div>
            </div>
          </div>
          <div className="hero-image animate-in animate-delay-2">
            <Image
              src="/images/hero-banner.png"
              alt="YURI SPA BEAUTY"
              width={560}
              height={480}
              priority
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </section>

      {/* ===== SERVICES SECTION ===== */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <h2 className="section-title">Dịch vụ nổi bật</h2>
          <p className="section-subtitle">
            Khám phá các dịch vụ làm đẹp chuyên nghiệp được yêu thích nhất tại YURI SPA BEAUTY
          </p>
          <div className="grid grid-3">
            {services.length > 0 ? services.map((service, i) => (
              <Link href={`/dich-vu/${service.slug}`} key={service.id} className={`card service-card animate-in animate-delay-${i % 3 + 1}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Image
                  src={service.image || '/images/service-spa.png'}
                  alt={service.name}
                  width={400}
                  height={220}
                  className="card-img"
                  style={{ objectFit: 'cover' }}
                />
                <div className="card-body">
                  <span className="badge badge-primary" style={{ marginBottom: '8px' }}>{service.category.name}</span>
                  <h3 className="card-title">{service.name}</h3>
                  <p className="card-text">{service.description}</p>
                  <div className="service-meta">
                    <span className="service-price">
                      {service.discountPrice ? (
                        <>
                          <span style={{ textDecoration: 'line-through', color: 'var(--neutral-400)', fontSize: '0.85rem', marginRight: '8px' }}>
                            {formatCurrency(service.price)}
                          </span>
                          {formatCurrency(service.discountPrice)}
                        </>
                      ) : formatCurrency(service.price)}
                    </span>
                    <span className="service-duration"><FiClock style={{ marginRight: '4px' }} />{service.duration} phút</span>
                  </div>
                </div>
              </Link>
            )) : (
              /* Default cards when no DB data */
              [
                { name: 'Chăm sóc da mặt', desc: 'Liệu trình chăm sóc da chuyên sâu với sản phẩm cao cấp', price: 350000, duration: 60, img: '/images/service-spa.png', cat: 'Chăm sóc da' },
                { name: 'Làm móng gel cao cấp', desc: 'Thiết kế móng nghệ thuật với gel bền đẹp', price: 250000, duration: 90, img: '/images/service-nail.png', cat: 'Làm móng' },
                { name: 'Nối mi classic', desc: 'Nối mi tự nhiên, nhẹ nhàng, bền đẹp', price: 300000, duration: 75, img: '/images/service-eyelash.png', cat: 'Nối mi' },
              ].map((s, i) => (
                <div key={i} className={`card service-card animate-in animate-delay-${i + 1}`}>
                  <Image src={s.img} alt={s.name} width={400} height={220} className="card-img" style={{ objectFit: 'cover' }} />
                  <div className="card-body">
                    <span className="badge badge-primary" style={{ marginBottom: '8px' }}>{s.cat}</span>
                    <h3 className="card-title">{s.name}</h3>
                    <p className="card-text">{s.desc}</p>
                    <div className="service-meta">
                      <span className="service-price">{formatCurrency(s.price)}</span>
                      <span className="service-duration"><FiClock style={{ marginRight: '4px' }} />{s.duration} phút</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link href="/dich-vu" className="btn btn-outline">Xem tất cả dịch vụ <FiArrowRight /></Link>
          </div>
        </div>
      </section>

      {/* ===== WHY CHOOSE US ===== */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Tại sao chọn chúng tôi?</h2>
          <p className="section-subtitle">Cam kết mang đến dịch vụ tốt nhất cho bạn</p>
          <div className="grid grid-4">
            {[
              { icon: <FiAward />, title: 'Chuyên gia hàng đầu', desc: 'Đội ngũ nhân viên được đào tạo bài bản, giàu kinh nghiệm', color: 'purple' },
              { icon: <FiHeart />, title: 'Sản phẩm cao cấp', desc: 'Sử dụng sản phẩm chính hãng, an toàn cho da', color: 'pink' },
              { icon: <FiCalendar />, title: 'Đặt lịch dễ dàng', desc: 'Đặt lịch online 24/7, xác nhận nhanh chóng', color: 'green' },
              { icon: <FiUsers />, title: 'Chăm sóc tận tâm', desc: 'Lắng nghe và phục vụ theo yêu cầu riêng của bạn', color: 'gold' },
            ].map((item, i) => (
              <div key={i} className={`card animate-in animate-delay-${i + 1}`} style={{ textAlign: 'center', border: 'none' }}>
                <div className="card-body" style={{ padding: '32px' }}>
                  <div className={`stat-icon ${item.color}`} style={{ margin: '0 auto 16px', fontSize: '1.5rem' }}>
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{item.title}</h3>
                  <p className="card-text">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <h2 className="section-title">Khách hàng nói gì?</h2>
          <p className="section-subtitle">Những đánh giá chân thực từ khách hàng của chúng tôi</p>
          <div className="grid grid-3">
            {(reviews.length > 0 ? reviews.map((r) => ({
              name: r.customer.user.name,
              text: r.comment || 'Dịch vụ tuyệt vời!',
              rating: r.rating,
            })) : [
              { name: 'Nguyễn Thị Mai', text: 'Dịch vụ chăm sóc da tuyệt vời! Da mình cải thiện rõ rệt sau 3 lần. Nhân viên rất nhiệt tình và chuyên nghiệp.', rating: 5 },
              { name: 'Trần Hồng Nhung', text: 'Không gian rất đẹp và thư giãn. Mình rất thích dịch vụ làm móng ở đây, mẫu mã đa dạng, tay nghề cao.', rating: 5 },
              { name: 'Lê Minh Anh', text: 'Đặt lịch online rất tiện lợi. Đến đúng giờ là được phục vụ ngay, không phải chờ đợi. Sẽ quay lại nhiều lần nữa!', rating: 5 },
            ]).map((t, i) => (
              <div key={i} className={`card testimonial-card animate-in animate-delay-${i + 1}`}>
                <div className="testimonial-stars">
                  {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                </div>
                <p className="card-text">&ldquo;{t.text}&rdquo;</p>
                <div style={{ marginTop: '16px' }}>
                  <div className="testimonial-author">{t.name}</div>
                  <div className="testimonial-role">Khách hàng</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="section" style={{
        background: 'linear-gradient(135deg, var(--primary), var(--accent))',
        color: 'var(--white)', textAlign: 'center',
      }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--white)', marginBottom: '16px' }}>
            Sẵn sàng tỏa sáng?
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: '500px', margin: '0 auto 32px' }}>
            Đặt lịch ngay hôm nay để trải nghiệm dịch vụ làm đẹp chuyên nghiệp tại YURI SPA BEAUTY
          </p>
          <Link href="/dat-lich" className="btn btn-lg" style={{
            background: 'var(--white)', color: 'var(--primary)', fontWeight: 700,
          }}>
            <FiCalendar /> Đặt lịch ngay
          </Link>
        </div>
      </section>
    </>
  );
}
