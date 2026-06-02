export const metadata = {
  title: 'Chính sách quyền riêng tư — YURI SPA BEAUTY',
  description: 'Chính sách bảo mật và quyền riêng tư của Yuri Spa Beauty',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: 8 }}>Chính sách quyền riêng tư</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>Cập nhật lần cuối: 01/06/2026</p>

      <h2 style={{ fontSize: '1.2rem', marginTop: 28, marginBottom: 8 }}>1. Thông tin chúng tôi thu thập</h2>
      <p>Khi bạn sử dụng ứng dụng <strong>Yuri Spa Beauty</strong>, chúng tôi có thể thu thập:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li><strong>Thông tin cá nhân:</strong> Họ tên, số điện thoại, email khi bạn đăng ký tài khoản</li>
        <li><strong>Thông tin đặt lịch:</strong> Dịch vụ, ngày giờ hẹn, nhân viên phục vụ</li>
        <li><strong>Thông tin thanh toán:</strong> Phương thức thanh toán (qua VNPay hoặc tiền mặt)</li>
        <li><strong>Thông tin thiết bị:</strong> Token thiết bị để gửi thông báo đẩy</li>
      </ul>

      <h2 style={{ fontSize: '1.2rem', marginTop: 28, marginBottom: 8 }}>2. Mục đích sử dụng thông tin</h2>
      <ul style={{ paddingLeft: 20 }}>
        <li>Xử lý và quản lý lịch hẹn spa của bạn</li>
        <li>Gửi thông báo xác nhận và nhắc lịch hẹn</li>
        <li>Cải thiện chất lượng dịch vụ</li>
        <li>Liên hệ hỗ trợ khách hàng khi cần</li>
        <li>Gửi khuyến mãi và ưu đãi (nếu bạn đồng ý)</li>
      </ul>

      <h2 style={{ fontSize: '1.2rem', marginTop: 28, marginBottom: 8 }}>3. Chia sẻ thông tin</h2>
      <p>Chúng tôi <strong>không bán, trao đổi hoặc chia sẻ</strong> thông tin cá nhân của bạn với bên thứ ba, ngoại trừ:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>Đối tác thanh toán (VNPay) để xử lý giao dịch</li>
        <li>Khi có yêu cầu từ cơ quan pháp luật</li>
      </ul>

      <h2 style={{ fontSize: '1.2rem', marginTop: 28, marginBottom: 8 }}>4. Bảo mật dữ liệu</h2>
      <p>Chúng tôi sử dụng các biện pháp bảo mật tiêu chuẩn ngành:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>Mã hóa mật khẩu bằng bcrypt</li>
        <li>Xác thực JWT với NextAuth</li>
        <li>Kết nối SSL/TLS cho toàn bộ dữ liệu</li>
        <li>Phân quyền truy cập (Admin/Staff/Customer)</li>
      </ul>

      <h2 style={{ fontSize: '1.2rem', marginTop: 28, marginBottom: 8 }}>5. Quyền của bạn</h2>
      <p>Bạn có quyền:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>Xem và chỉnh sửa thông tin cá nhân trong tài khoản</li>
        <li>Yêu cầu xóa tài khoản và dữ liệu cá nhân</li>
        <li>Từ chối nhận thông báo đẩy (trong Cài đặt thiết bị)</li>
        <li>Liên hệ chúng tôi để được hỗ trợ</li>
      </ul>

      <h2 style={{ fontSize: '1.2rem', marginTop: 28, marginBottom: 8 }}>6. Thông báo đẩy</h2>
      <p>Ứng dụng sử dụng thông báo đẩy để nhắc lịch hẹn. Bạn có thể tắt thông báo bất kỳ lúc nào trong Cài đặt của thiết bị.</p>

      <h2 style={{ fontSize: '1.2rem', marginTop: 28, marginBottom: 8 }}>7. Xóa tài khoản</h2>
      <p>Bạn có thể yêu cầu xóa tài khoản và toàn bộ dữ liệu bằng cách liên hệ:</p>
      <ul style={{ paddingLeft: 20 }}>
        <li>Email: <a href="mailto:support@yurispa.com">support@yurispa.com</a></li>
        <li>Điện thoại: <a href="tel:0123456789">0123 456 789</a></li>
      </ul>

      <h2 style={{ fontSize: '1.2rem', marginTop: 28, marginBottom: 8 }}>8. Liên hệ</h2>
      <p>Nếu bạn có câu hỏi về chính sách này, vui lòng liên hệ:</p>
      <p><strong>Yuri Spa Beauty</strong></p>
      <p>Email: <a href="mailto:support@yurispa.com">support@yurispa.com</a></p>

      <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid #eee' }} />
      <p style={{ fontSize: '0.8rem', color: '#999' }}>
        © 2026 Yuri Spa Beauty. All rights reserved.
      </p>
    </div>
  );
}
