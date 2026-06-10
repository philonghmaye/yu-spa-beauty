import MobileBookingForm from './MobileBookingForm';

/**
 * Trang đặt lịch mobile — Static Shell.
 * Trước đây: Server Component gọi auth() + DB → chờ cold start.
 * Bây giờ: Render static, fetch user info ở client.
 */
export default function MobileBookingPage() {
  return <MobileBookingForm />;
}
