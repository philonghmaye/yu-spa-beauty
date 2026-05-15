import nodemailer from 'nodemailer';

// Create transporter - uses Ethereal in dev, real SMTP in production
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    // Return null if SMTP not configured - emails will be skipped
    console.log('📧 SMTP not configured. Emails will be skipped.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const transporter = createTransporter();

function formatCurrencyEmail(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function getEmailTemplate(content: string, title: string): string {
  return `
  <!DOCTYPE html>
  <html lang="vi">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#faf5ff;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <div style="max-width:600px;margin:0 auto;padding:20px;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#a855f7,#ec4899);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;letter-spacing:1px;">✨ YURI SPA BEAUTY</h1>
        <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Tỏa sáng vẻ đẹp tự nhiên</p>
      </div>
      
      <!-- Content -->
      <div style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 6px rgba(0,0,0,0.05);">
        ${content}
        
        <!-- Footer -->
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid #e5e5e5;text-align:center;">
          <p style="color:#737373;font-size:12px;margin:0;">
            YURI SPA BEAUTY — Dịch vụ Spa & Làm đẹp chuyên nghiệp<br/>
            📞 Hotline: 0900 000 000 | 📧 info@yuspabeauty.vn
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendBookingConfirmation(appointment: any) {
  if (!transporter) return;

  const email = appointment.customer?.user?.email;
  if (!email) return;

  const serviceNames = appointment.services?.map((s: { service: { name: string } }) => s.service.name).join(', ') || '';
  const employeeName = appointment.employee?.user?.name || 'Bất kỳ nhân viên';
  const bookingCode = appointment.id.slice(-6).toUpperCase();

  const content = `
    <h2 style="color:#a855f7;margin:0 0 8px;">Xác nhận đặt lịch</h2>
    <p style="color:#525252;margin:0 0 24px;">Cảm ơn bạn đã đặt lịch tại YURI SPA BEAUTY!</p>
    
    <div style="background:#faf5ff;border-radius:12px;padding:20px;margin-bottom:24px;">
      <p style="margin:0 0 4px;color:#737373;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Mã đặt lịch</p>
      <p style="margin:0;font-size:24px;font-weight:bold;color:#a855f7;letter-spacing:2px;">#${bookingCode}</p>
    </div>
    
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;color:#737373;width:130px;">📋 Dịch vụ</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;font-weight:500;">${serviceNames}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;color:#737373;">👤 Nhân viên</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;font-weight:500;">${employeeName}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;color:#737373;">📅 Ngày</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;font-weight:500;">${appointment.appointmentDate}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;color:#737373;">🕐 Giờ</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;font-weight:500;">${appointment.startTime} — ${appointment.endTime}</td>
      </tr>
      ${appointment.discountAmount > 0 ? `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;color:#737373;">💰 Tạm tính</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;">${formatCurrencyEmail(appointment.totalAmount)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;color:#737373;">🎁 Giảm giá</td>
        <td style="padding:10px 0;border-bottom:1px solid #f5f5f5;color:#ec4899;">-${formatCurrencyEmail(appointment.discountAmount)}</td>
      </tr>` : ''}
      <tr>
        <td style="padding:10px 0;color:#737373;font-weight:600;">💳 Tổng tiền</td>
        <td style="padding:10px 0;font-weight:700;font-size:18px;color:#a855f7;">${formatCurrencyEmail(appointment.finalAmount)}</td>
      </tr>
    </table>
    
    <div style="background:#fef3c7;border-radius:8px;padding:16px;margin-top:24px;">
      <p style="margin:0;color:#92400e;font-size:14px;">
        ⏳ <strong>Trạng thái:</strong> Chờ xác nhận<br/>
        Chúng tôi sẽ liên hệ xác nhận lịch hẹn trong thời gian sớm nhất.
      </p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"YURI SPA BEAUTY" <noreply@yuspabeauty.vn>',
      to: email,
      subject: `✨ Xác nhận đặt lịch #${bookingCode} — YURI SPA BEAUTY`,
      html: getEmailTemplate(content, 'Xác nhận đặt lịch'),
    });
    console.log(`📧 Booking confirmation sent to ${email}`);
  } catch (err) {
    console.error('Failed to send booking confirmation email:', err);
  }
}

export async function sendStatusUpdateEmail(
  email: string,
  customerName: string,
  bookingCode: string,
  status: string,
  appointmentDate: string,
  startTime: string
) {
  if (!transporter) return;

  const statusLabels: Record<string, { label: string; color: string; emoji: string }> = {
    CONFIRMED: { label: 'Đã xác nhận', color: '#a855f7', emoji: '✅' },
    IN_PROGRESS: { label: 'Đang thực hiện', color: '#ec4899', emoji: '💆' },
    COMPLETED: { label: 'Hoàn thành', color: '#10b981', emoji: '🎉' },
    CANCELLED: { label: 'Đã hủy', color: '#ef4444', emoji: '❌' },
  };

  const s = statusLabels[status] || { label: status, color: '#737373', emoji: '📋' };

  const content = `
    <h2 style="color:${s.color};margin:0 0 8px;">${s.emoji} Cập nhật lịch hẹn</h2>
    <p style="color:#525252;margin:0 0 24px;">Xin chào ${customerName},</p>
    
    <div style="background:#faf5ff;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;color:#737373;font-size:12px;">Mã đặt lịch #${bookingCode}</p>
      <p style="margin:8px 0 0;font-size:20px;font-weight:bold;color:${s.color};">${s.label}</p>
    </div>
    
    <p style="color:#525252;">
      📅 Ngày: <strong>${appointmentDate}</strong> | 🕐 Giờ: <strong>${startTime}</strong>
    </p>
    
    ${status === 'CONFIRMED' ? `
    <div style="background:#d1fae5;border-radius:8px;padding:16px;margin-top:16px;">
      <p style="margin:0;color:#065f46;font-size:14px;">
        Lịch hẹn đã được xác nhận! Vui lòng đến đúng giờ để được phục vụ tốt nhất.
      </p>
    </div>` : ''}
    
    ${status === 'COMPLETED' ? `
    <div style="background:#d1fae5;border-radius:8px;padding:16px;margin-top:16px;">
      <p style="margin:0;color:#065f46;font-size:14px;">
        Cảm ơn bạn đã sử dụng dịch vụ! Hãy đánh giá trải nghiệm tại website.
      </p>
    </div>` : ''}
    
    ${status === 'CANCELLED' ? `
    <div style="background:#fee2e2;border-radius:8px;padding:16px;margin-top:16px;">
      <p style="margin:0;color:#991b1b;font-size:14px;">
        Lịch hẹn đã được hủy. Liên hệ hotline nếu cần hỗ trợ.
      </p>
    </div>` : ''}
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"YURI SPA BEAUTY" <noreply@yuspabeauty.vn>',
      to: email,
      subject: `${s.emoji} Lịch hẹn #${bookingCode} — ${s.label}`,
      html: getEmailTemplate(content, `Cập nhật lịch hẹn — ${s.label}`),
    });
    console.log(`📧 Status update email sent to ${email}`);
  } catch (err) {
    console.error('Failed to send status update email:', err);
  }
}
