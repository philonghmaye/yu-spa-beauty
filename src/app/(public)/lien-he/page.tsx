import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';

export default function ContactPage() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Liên hệ</h1>
          <p>Chúng tôi luôn sẵn sàng lắng nghe bạn</p>
        </div>
      </div>
      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ gap: '48px' }}>
            <div>
              <h2 style={{ marginBottom: '24px' }}>Thông tin liên hệ</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { icon: <FiMapPin />, title: 'Địa chỉ', text: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh' },
                  { icon: <FiPhone />, title: 'Điện thoại', text: '0123 456 789' },
                  { icon: <FiMail />, title: 'Email', text: 'info@yuspabeauty.vn' },
                  { icon: <FiClock />, title: 'Giờ mở cửa', text: 'Thứ 2 - Chủ nhật: 9:00 - 20:00' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div className="stat-icon purple" style={{ width: '44px', height: '44px', flexShrink: 0, fontSize: '1.1rem' }}>{item.icon}</div>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{item.title}</div>
                      <div style={{ color: 'var(--neutral-500)' }}>{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 style={{ marginBottom: '24px' }}>Gửi tin nhắn</h2>
              <form>
                <div className="form-group">
                  <label className="form-label">Họ tên</label>
                  <input type="text" className="form-input" placeholder="Nhập họ tên của bạn" />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input type="tel" className="form-input" placeholder="Nhập số điện thoại" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-input" placeholder="Nhập email" />
                </div>
                <div className="form-group">
                  <label className="form-label">Nội dung</label>
                  <textarea className="form-textarea" placeholder="Nhập nội dung tin nhắn..." rows={4}></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Gửi tin nhắn</button>
              </form>
            </div>
          </div>
          <div style={{ marginTop: '48px', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '350px' }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4946681007846!2d106.70142!3d10.7758!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ2JzMzLjAiTiAxMDbCsDQyJzA1LjEiRQ!5e0!3m2!1svi!2svn!4v1234567890"
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"
            ></iframe>
          </div>
        </div>
      </section>
    </>
  );
}
