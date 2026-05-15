import { getBookingData } from '@/actions/booking';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import BookingForm from './BookingForm';

export default async function BookingPage() {
  const [{ services, staff }, session] = await Promise.all([
    getBookingData(),
    auth(),
  ]);

  // Fetch user info for auto-fill if logged in
  let userInfo: { name: string; phone: string; email: string } | undefined;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, phone: true, email: true },
    });
    if (user) {
      userInfo = {
        name: user.name,
        phone: user.phone || '',
        email: user.email || '',
      };
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Đặt lịch hẹn</h1>
          <p>Chọn dịch vụ và thời gian phù hợp với bạn</p>
        </div>
      </div>
      <section className="section">
        <BookingForm
          services={services.map((s) => ({
            id: s.id,
            name: s.name,
            price: s.price,
            discountPrice: s.discountPrice,
            duration: s.duration,
            image: s.image,
            category: {
              id: s.category.id,
              name: s.category.name,
              slug: s.category.slug,
              icon: s.category.icon,
            },
          }))}
          staff={staff.map((s) => ({
            id: s.id,
            user: { name: s.user.name, avatar: s.user.avatar },
            skills: s.skills.map((sk) => ({
              service: { id: sk.service.id, name: sk.service.name },
            })),
            schedules: s.schedules.map((sc) => ({
              dayOfWeek: sc.dayOfWeek,
              startTime: sc.startTime,
              endTime: sc.endTime,
              isActive: sc.isActive,
            })),
          }))}
          userId={session?.user?.id}
          userInfo={userInfo}
        />
      </section>
    </>
  );
}
