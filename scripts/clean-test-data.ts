import prisma from '../src/lib/prisma';

async function cleanTestData() {
  console.log('🧹 Bắt đầu xóa dữ liệu test...\n');

  // 1. Xóa Reviews
  const reviews = await prisma.review.deleteMany();
  console.log(`✓ Đã xóa ${reviews.count} đánh giá`);

  // 2. Xóa Notifications
  const notifications = await prisma.notification.deleteMany();
  console.log(`✓ Đã xóa ${notifications.count} thông báo`);

  // 3. Xóa Payments
  const payments = await prisma.payment.deleteMany();
  console.log(`✓ Đã xóa ${payments.count} thanh toán`);

  // 4. Xóa Appointment Services
  const apptServices = await prisma.appointmentService.deleteMany();
  console.log(`✓ Đã xóa ${apptServices.count} dịch vụ trong lịch hẹn`);

  // 5. Xóa Appointments
  const appointments = await prisma.appointment.deleteMany();
  console.log(`✓ Đã xóa ${appointments.count} lịch hẹn`);

  // 6. Xóa Customers
  const customers = await prisma.customer.deleteMany();
  console.log(`✓ Đã xóa ${customers.count} khách hàng`);

  // 7. Xóa Customer Users (role = CUSTOMER)
  const customerUsers = await prisma.user.deleteMany({
    where: { role: 'CUSTOMER' },
  });
  console.log(`✓ Đã xóa ${customerUsers.count} tài khoản khách hàng`);

  // 8. Xóa Promotions
  const promotions = await prisma.promotion.deleteMany();
  console.log(`✓ Đã xóa ${promotions.count} khuyến mãi`);

  // --- GIỮ LẠI ---
  const staffCount = await prisma.employee.count();
  const serviceCount = await prisma.service.count();
  const categoryCount = await prisma.category.count();
  const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });

  console.log('\n📌 Dữ liệu được giữ lại:');
  console.log(`  • ${adminCount} tài khoản admin`);
  console.log(`  • ${staffCount} nhân viên (với kỹ năng, lịch làm, ảnh)`);
  console.log(`  • ${categoryCount} danh mục dịch vụ`);
  console.log(`  • ${serviceCount} dịch vụ`);

  console.log('\n✅ Hoàn tất! Đã xóa sạch dữ liệu test.');

  await prisma.$disconnect();
}

cleanTestData().catch(console.error);
