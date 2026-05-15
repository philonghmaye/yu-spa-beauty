import Image from 'next/image';
import { FiAward, FiHeart, FiStar, FiUsers } from 'react-icons/fi';

export default function AboutPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Về YURI SPA BEAUTY</h1>
          <p>Nơi vẻ đẹp được chăm chút từ trái tim</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center', gap: '60px', marginBottom: '60px' }}>
            <Image src="/images/hero-banner.png" alt="YURI SPA BEAUTY" width={560} height={400} style={{ borderRadius: 'var(--radius-xl)', objectFit: 'cover', width: '100%' }} />
            <div>
              <h2 style={{ marginBottom: '16px' }}>Câu chuyện của chúng tôi</h2>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--neutral-600)', marginBottom: '16px' }}>
                YURI SPA BEAUTY được thành lập với sứ mệnh mang đến trải nghiệm làm đẹp đẳng cấp, chuyên nghiệp và tận tâm nhất cho phụ nữ Việt Nam.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--neutral-600)', marginBottom: '16px' }}>
                Với đội ngũ chuyên gia được đào tạo bài bản, không gian thiết kế sang trọng và sản phẩm chính hãng từ các thương hiệu uy tín, 
                chúng tôi cam kết mỗi lần đến với YURI SPA BEAUTY là một trải nghiệm đáng nhớ.
              </p>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: 'var(--neutral-600)' }}>
                Chúng tôi tin rằng mỗi người phụ nữ đều xứng đáng được chăm sóc và tỏa sáng với vẻ đẹp tự nhiên nhất.
              </p>
            </div>
          </div>

          <div className="grid grid-4" style={{ marginTop: '40px' }}>
            {[
              { icon: <FiAward />, number: '5+', label: 'Năm kinh nghiệm', color: 'purple' },
              { icon: <FiUsers />, number: '2,000+', label: 'Khách hàng tin tưởng', color: 'pink' },
              { icon: <FiStar />, number: '4.9/5', label: 'Đánh giá trung bình', color: 'gold' },
              { icon: <FiHeart />, number: '15+', label: 'Dịch vụ đa dạng', color: 'green' },
            ].map((s, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', border: 'none' }}>
                <div className="card-body">
                  <div className={`stat-icon ${s.color}`} style={{ margin: '0 auto 12px', fontSize: '1.3rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--neutral-900)', fontFamily: 'var(--font-display)' }}>{s.number}</div>
                  <div style={{ color: 'var(--neutral-500)', fontSize: '0.9rem' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
