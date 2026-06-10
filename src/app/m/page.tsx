import HomeContent from './HomeContent';

/**
 * Trang chủ mobile — Static Shell.
 * Trước đây: Server Component gọi 6 DB queries → chậm do Neon cold start.
 * Bây giờ: Render static shell ngay lập tức, HomeContent fetch data ở client.
 */
export default function MobileHomePage() {
  return <HomeContent />;
}
