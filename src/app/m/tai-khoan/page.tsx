import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { FiClock, FiUser, FiInfo, FiLogOut, FiChevronRight } from 'react-icons/fi';
import LogoutButton from '@/components/LogoutButton';

export default async function MobileAccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/m/dang-nhap');

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { customer: true },
  });

  if (!user) redirect('/m/dang-nhap');

  const memberLevel = user.customer?.memberLevel || 'STANDARD';
  const levelLabels: Record<string, string> = {
    STANDARD: 'Thường', SILVER: 'Bạc', GOLD: 'Vàng', VIP: 'VIP',
  };

  return (
    <>
      {/* Account Header */}
      <div className="m-account-header">
        <div className="m-account-avatar">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <FiUser />
          )}
        </div>
        <div>
          <div className="m-account-name">{user.name}</div>
          <div className="m-account-phone">{user.phone || user.email}</div>
        </div>
      </div>

      {/* VIP Banner */}
      <div className="m-vip-banner">
        <span>Hạng thành viên: {levelLabels[memberLevel]}</span>
        <span className="m-vip-badge">{memberLevel}</span>
      </div>

      {/* Promo Cards */}
      <div className="m-promo-cards">
        <div className="m-promo-card purple">
          <div style={{ marginBottom: 4 }}>✨ Ưu đãi</div>
          <div>Giảm 20% dịch vụ đầu tiên</div>
        </div>
        <div className="m-promo-card pink">
          <div style={{ marginBottom: 4 }}>🎁 Giới thiệu</div>
          <div>+100K cho bạn bè mới</div>
        </div>
      </div>

      {/* Menu List */}
      <div className="m-menu-list">
        <Link href="/m/hoat-dong" className="m-menu-item">
          <span className="icon"><FiClock /></span>
          Lịch sử hoạt động
          <span className="arrow"><FiChevronRight /></span>
        </Link>
        <Link href="/m/tai-khoan/thong-tin" className="m-menu-item">
          <span className="icon"><FiUser /></span>
          Thông tin cá nhân
          <span className="arrow"><FiChevronRight /></span>
        </Link>
        <Link href="/" className="m-menu-item">
          <span className="icon"><FiInfo /></span>
          Về chúng tôi
          <span className="arrow"><FiChevronRight /></span>
        </Link>
        <div className="m-menu-item danger" style={{ cursor: 'pointer' }}>
          <span className="icon"><FiLogOut /></span>
          <LogoutButton />
        </div>
      </div>
    </>
  );
}
