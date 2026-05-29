# ✨ YURI SPA BEAUTY

**Hệ thống quản lý và đặt lịch dịch vụ Spa & Làm đẹp trực tuyến**

> Nền tảng full-stack giúp chủ spa quản lý toàn bộ hoạt động kinh doanh và khách hàng đặt lịch online 24/7.

🌐 **Live Demo**: [yuri-spa-beauty.vercel.app](https://yuri-spa-beauty.vercel.app)

---

## 📋 Tổng quan

YURI SPA BEAUTY là một ứng dụng web toàn diện dành cho ngành Spa & Làm đẹp, bao gồm 3 phần chính:

| Phần | Mô tả | Đường dẫn |
|------|--------|-----------|
| 🌸 **Website khách hàng** | Trang công khai cho khách duyệt dịch vụ & đặt lịch | `/` |
| 🔐 **Tài khoản khách hàng** | Quản lý lịch hẹn, đánh giá cá nhân | `/tai-khoan` |
| 🛡️ **Admin Dashboard** | Bảng điều khiển quản trị toàn bộ hệ thống | `/admin` |
| 📱 **Giao diện Mobile (PWA)** | Phiên bản tối ưu cho điện thoại | `/m` |

---

## 🌸 Chức năng phía Khách hàng

### Trang công khai
- **Trang chủ** — Hero banner, dịch vụ nổi bật, đánh giá khách hàng, CTA đặt lịch
- **Dịch vụ** (`/dich-vu`) — Danh sách dịch vụ theo danh mục (chăm sóc da, làm móng, nối mi, massage, gội đầu), xem chi tiết từng dịch vụ
- **Bảng giá** (`/bang-gia`) — Bảng giá đầy đủ theo từng nhóm dịch vụ
- **Giới thiệu** (`/gioi-thieu`) — Câu chuyện thương hiệu, thống kê thành tựu
- **Liên hệ** (`/lien-he`) — Form liên hệ, bản đồ Google Maps, thông tin cửa hàng

### Đặt lịch online (`/dat-lich`)
- Quy trình đặt lịch **4 bước**: Chọn dịch vụ → Chọn nhân viên → Chọn ngày giờ → Xác nhận
- Hỗ trợ chọn **nhiều dịch vụ** cùng lúc
- Chọn nhân viên cụ thể hoặc để hệ thống **tự phân công**
- Kiểm tra **slot khả dụng** realtime (tránh trùng lịch)
- Áp dụng **mã khuyến mãi** (giảm % hoặc giảm cố định)
- Tự động tạo tài khoản cho khách mới (theo SĐT)
- Tự động điền thông tin nếu đã đăng nhập

### Tài khoản khách hàng (`/tai-khoan`)
- **Dashboard cá nhân** — Thống kê: tổng đặt lịch, hoàn thành, chi tiêu, hạng thành viên
- **Lịch sử lịch hẹn** (`/tai-khoan/lich-su`) — Xem toàn bộ lịch hẹn đã đặt
- **Đánh giá** (`/tai-khoan/danh-gia`) — Xem lại các đánh giá đã gửi
- **Hệ thống hạng thành viên**: Thường → Bạc → Vàng → VIP

### Xác thực
- **Đăng ký** (`/dang-ky`) — Tạo tài khoản mới
- **Đăng nhập** (`/dang-nhap`) — Xác thực bằng email/SĐT + mật khẩu
- **Quên mật khẩu** (`/quen-mat-khau`) — Đặt lại mật khẩu qua email

---

## 🛡️ Chức năng Admin Dashboard

### Tổng quan (`/admin`)
- **Dashboard realtime** — 4 KPI chính: lịch hẹn hôm nay, tổng khách hàng, doanh thu tháng, lượt đặt tháng
- **Lịch hẹn gần đây** — Bảng 8 lịch hẹn mới nhất
- **🔔 Thông báo đặt lịch** — Chuông thông báo realtime khi có khách đặt lịch mới (polling 15s, âm thanh, badge đếm số)

### Quản lý lịch hẹn (`/admin/lich-hen`)
- Danh sách toàn bộ lịch hẹn kèm bộ lọc trạng thái
- Cập nhật trạng thái: Chờ xác nhận → Đã xác nhận → Đang thực hiện → Hoàn thành / Đã hủy / Không đến
- Ghi chú nội bộ cho từng lịch hẹn
- Gửi **email tự động** thông báo cập nhật trạng thái cho khách
- Tự động cập nhật thống kê khách hàng khi hoàn thành

### Quản lý dịch vụ (`/admin/dich-vu`)
- CRUD đầy đủ: thêm, sửa, xóa dịch vụ
- Phân loại theo **danh mục** (Category)
- Bật/tắt **trạng thái** hoạt động & **nổi bật** (Featured)
- Quản lý giá gốc & giá khuyến mãi

### Quản lý nhân viên (`/admin/nhan-vien`)
- CRUD nhân viên kèm thông tin: vị trí, kinh nghiệm, tiểu sử
- Upload & quản lý **ảnh nhân viên** (nhiều ảnh/nhân viên)
- Gán **kỹ năng** (liên kết với dịch vụ)
- Thiết lập **lịch làm việc** theo tuần
- Bật/tắt trạng thái hoạt động

### Quản lý khách hàng (`/admin/khach-hang`)
- Danh sách khách hàng kèm thống kê: lượt đến, tổng chi tiêu
- Quản lý **hạng thành viên** (Standard, Silver, Gold, VIP)
- Ghi chú nội bộ cho từng khách hàng
- Thống kê khách mới theo tháng

### Quản lý khuyến mãi (`/admin/khuyen-mai`)
- Tạo mã giảm giá: **phần trăm (%)** hoặc **cố định (VNĐ)**
- Cấu hình: đơn tối thiểu, giảm tối đa, giới hạn lượt dùng
- Thời gian hiệu lực (ngày bắt đầu → kết thúc)
- Theo dõi số lượt đã sử dụng

### Quản lý đánh giá (`/admin/danh-gia`)
- Xem toàn bộ đánh giá từ khách hàng (1-5 sao)
- Thống kê: tổng đánh giá, điểm trung bình, phân bổ theo sao
- Xóa đánh giá không phù hợp

### Thống kê & Báo cáo (`/admin/thong-ke`)
- **Biểu đồ doanh thu** theo ngày / tháng / năm
- **Top 5 dịch vụ** phổ biến nhất
- **Top 5 nhân viên** xuất sắc nhất
- Tổng doanh thu, tổng lượt đặt, tổng khách hàng

### Cài đặt (`/admin/cai-dat`)
- Cấu hình **giờ mở cửa / đóng cửa**
- Cấu hình **khoảng cách slot** đặt lịch (30 phút, 60 phút,...)

---

## 📱 Giao diện Mobile (PWA)

Phiên bản di động tối ưu tại `/m` với giao diện kiểu **native app**:

- **Trang chủ mobile** — Banner, danh mục dịch vụ, kỹ thuật viên hàng đầu
- **Khám phá** (`/m/kham-pha`) — Duyệt dịch vụ theo danh mục
- **Đặt lịch** (`/m/dat-lich`) — Quy trình đặt lịch mobile-first
- **Hoạt động** (`/m/hoat-dong`) — Lịch sử hoạt động cá nhân
- **Tài khoản** (`/m/tai-khoan`) — Quản lý thông tin cá nhân
- **Hồ sơ nhân viên** (`/m/nhan-vien/[id]`) — Xem chi tiết nhân viên
- **Admin mobile** (`/m/admin`) — Dashboard admin dành cho mobile
  - Tổng quan, quản lý lịch hẹn, nhân viên, doanh thu, cài đặt
- **Tab bar điều hướng** kiểu iOS/Android
- Hỗ trợ **PWA** — có thể cài lên màn hình chính

---

## 🔔 Hệ thống Thông báo

| Kênh | Chức năng |
|------|-----------|
| **Email** (Nodemailer) | Xác nhận đặt lịch, cập nhật trạng thái lịch hẹn |
| **Zalo OA** (stub) | Nhắc lịch 24h và 2h trước hẹn |
| **In-app** | Thông báo realtime trên admin dashboard khi có booking mới |

---

## 💳 Thanh toán

- **VNPay** — Tích hợp cổng thanh toán VNPay (sandbox/production)
- **Tiền mặt** — Thanh toán tại quầy

---

## 🔐 Bảo mật

- **NextAuth v5** — Xác thực JWT với role-based access control
- **Middleware** — Bảo vệ route admin (chỉ ADMIN) và tài khoản (yêu cầu đăng nhập)
- **Server Actions** — Guard `requireAdmin()` cho mọi thao tác admin
- **Security Headers** — X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- **Password hashing** — bcryptjs

---

## 🛠️ Công nghệ sử dụng

| Công nghệ | Mô tả |
|-----------|--------|
| **Next.js 16** | Framework React full-stack (App Router, Server Components) |
| **React 19** | UI library |
| **TypeScript** | Type-safe development |
| **Prisma ORM** | Database toolkit |
| **PostgreSQL** | Database (Supabase) |
| **NextAuth v5** | Authentication |
| **Nodemailer** | Email service |
| **VNPay SDK** | Payment gateway |
| **date-fns** | Date utilities |
| **react-hot-toast** | Toast notifications |
| **react-icons** | Icon library |
| **Zod** | Schema validation |
| **Be Vietnam Pro** | Vietnamese-optimized font (Google Fonts) |
| **Vercel** | Hosting & deployment |

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- Node.js 18+
- PostgreSQL database (khuyến nghị [Supabase](https://supabase.com))

### Các bước

```bash
# 1. Clone repository
git clone <repo-url>
cd yu-spa-beauty

# 2. Cài dependencies
npm install

# 3. Cấu hình biến môi trường
cp .env.example .env
# Sửa file .env với thông tin database và auth

# 4. Khởi tạo database
npx prisma db push
npx prisma db seed

# 5. Chạy development server
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

### Biến môi trường

| Biến | Bắt buộc | Mô tả |
|------|----------|-------|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL (pooled) |
| `DIRECT_URL` | ✅ | Connection string trực tiếp (cho Prisma migrate) |
| `NEXTAUTH_SECRET` | ✅ | Secret key cho NextAuth |
| `NEXTAUTH_URL` | ✅ | URL ứng dụng |
| `SMTP_HOST` | ❌ | SMTP host cho email |
| `SMTP_PORT` | ❌ | SMTP port |
| `SMTP_USER` | ❌ | SMTP username |
| `SMTP_PASS` | ❌ | SMTP password |
| `VNPAY_TMN_CODE` | ❌ | VNPay terminal code |
| `VNPAY_HASH_SECRET` | ❌ | VNPay hash secret |

---

## 📁 Cấu trúc dự án

```
src/
├── actions/          # Server Actions (business logic)
│   ├── booking.ts        # Đặt lịch, kiểm tra slot
│   ├── appointments.ts   # Quản lý lịch hẹn (admin)
│   ├── services.ts       # Quản lý dịch vụ
│   ├── staff.ts          # Quản lý nhân viên
│   ├── customers.ts      # Quản lý khách hàng
│   ├── promotions.ts     # Quản lý khuyến mãi
│   ├── reviews.ts        # Quản lý đánh giá
│   ├── notifications.ts  # Nhắc lịch Zalo/Email
│   ├── account.ts        # Tài khoản khách hàng
│   ├── settings.ts       # Cài đặt hệ thống
│   └── auth.ts           # Đăng nhập/đăng ký
├── app/
│   ├── (public)/     # Trang công khai (khách hàng)
│   ├── (auth)/       # Đăng nhập, đăng ký
│   ├── admin/        # Admin dashboard
│   ├── api/          # API routes
│   └── m/            # Giao diện mobile (PWA)
├── components/       # Shared components
├── lib/              # Utilities & configs
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client
│   ├── email.ts          # Email templates
│   ├── vnpay.ts          # VNPay integration
│   ├── zalo.ts           # Zalo OA integration
│   └── utils.ts          # Helpers (format, timezone)
└── types/            # TypeScript types
```

---

## 🌐 Triển khai (Deploy)

### Vercel (khuyến nghị)

```bash
# Push code lên GitHub
git add . && git commit -m "deploy" && git push

# Vercel sẽ tự động build & deploy
# Cấu hình biến môi trường trên Vercel Dashboard
```

### Build production

```bash
npm run build   # Prisma generate + Next.js build
npm start       # Chạy production server
```

---

## 📄 License

Private project — All rights reserved.

---

<p align="center">
  Made with 💜 by <strong>YURI SPA BEAUTY</strong>
</p>
