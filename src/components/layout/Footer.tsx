import Link from 'next/link';
import { FiFacebook, FiInstagram, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <h3 className="footer-title" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>
              <span style={{ background: 'linear-gradient(135deg, var(--primary-light), var(--accent-light))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                YURI SPA BEAUTY
              </span>
            </h3>
            <p className="footer-brand">
              Chúng tôi mang đến trải nghiệm làm đẹp tuyệt vời với dịch vụ chuyên nghiệp, không gian sang trọng và đội ngũ nhân viên tận tâm.
            </p>
            <div className="footer-social">
              <a href="#" aria-label="Facebook"><FiFacebook /></a>
              <a href="#" aria-label="Instagram"><FiInstagram /></a>
            </div>
          </div>

          <div>
            <h4 className="footer-title">Dịch vụ</h4>
            <ul className="footer-links">
              <li><Link href="/dich-vu">Chăm sóc da</Link></li>
              <li><Link href="/dich-vu">Làm móng</Link></li>
              <li><Link href="/dich-vu">Nối mi</Link></li>
              <li><Link href="/dich-vu">Massage</Link></li>
              <li><Link href="/dich-vu">Gội đầu</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Liên kết</h4>
            <ul className="footer-links">
              <li><Link href="/gioi-thieu">Giới thiệu</Link></li>
              <li><Link href="/bang-gia">Bảng giá</Link></li>
              <li><Link href="/dat-lich">Đặt lịch</Link></li>
              <li><Link href="/lien-he">Liên hệ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Liên hệ</h4>
            <ul className="footer-links">
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMapPin style={{ flexShrink: 0 }} /> 123 Nguyễn Huệ, Q.1, TP.HCM
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiPhone style={{ flexShrink: 0 }} /> 0123 456 789
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiMail style={{ flexShrink: 0 }} /> info@yuspabeauty.vn
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © 2026 YURI SPA BEAUTY. Tất cả quyền được bảo lưu.
        </div>
      </div>
    </footer>
  );
}
