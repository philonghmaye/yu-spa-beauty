import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@yuspabeauty.vn' },
    update: {},
    create: {
      email: 'admin@yuspabeauty.vn',
      phone: '0900000000',
      name: 'Admin YU SPA',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created');

  // Create staff
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staffData = [
    { name: 'Nguyễn Thị Lan', phone: '0901111222', email: 'lan@yuspabeauty.vn', position: 'Chuyên viên da liễu', bio: 'Chuyên gia chăm sóc da 5 năm kinh nghiệm', experience: 5 },
    { name: 'Trần Minh Thư', phone: '0902222333', email: 'thu@yuspabeauty.vn', position: 'Nail Artist', bio: 'Nail artist sáng tạo, tay nghề cao', experience: 3 },
    { name: 'Phạm Hồng Nhung', phone: '0903333444', email: 'nhung@yuspabeauty.vn', position: 'Chuyên viên Spa', bio: 'Chuyên gia massage và spa thư giãn', experience: 4 },
  ];

  const employees = [];
  for (const s of staffData) {
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email, phone: s.phone, name: s.name,
        password: staffPassword, role: 'STAFF',
        employee: { create: { position: s.position, bio: s.bio, experience: s.experience } },
      },
      include: { employee: true },
    });
    employees.push(user.employee!);
  }
  console.log('✅ Staff created');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'cham-soc-da' }, update: {}, create: { name: 'Chăm sóc da', slug: 'cham-soc-da', description: 'Các dịch vụ chăm sóc và điều trị da mặt', icon: '✨', sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: 'lam-mong' }, update: {}, create: { name: 'Làm móng', slug: 'lam-mong', description: 'Dịch vụ làm nail nghệ thuật', icon: '💅', sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: 'noi-mi' }, update: {}, create: { name: 'Nối mi', slug: 'noi-mi', description: 'Nối mi chuyên nghiệp', icon: '👁️', sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: 'massage' }, update: {}, create: { name: 'Massage & Spa', slug: 'massage', description: 'Massage thư giãn toàn thân', icon: '💆', sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: 'goi-dau' }, update: {}, create: { name: 'Gội đầu', slug: 'goi-dau', description: 'Gội đầu dưỡng sinh', icon: '🧴', sortOrder: 5 } }),
  ]);
  console.log('✅ Categories created');

  // Create services
  const servicesData = [
    { name: 'Chăm sóc da mặt cơ bản', slug: 'cham-soc-da-mat', description: 'Làm sạch sâu, tẩy tế bào chết, đắp mặt nạ dưỡng ẩm cao cấp', price: 350000, duration: 60, categorySlug: 'cham-soc-da', isFeatured: true, image: '/images/service-spa.png' },
    { name: 'Chăm sóc da chuyên sâu', slug: 'cham-soc-da-chuyen-sau', description: 'Liệu trình trẻ hóa da với công nghệ hiện đại và sản phẩm cao cấp', price: 550000, duration: 90, categorySlug: 'cham-soc-da', isFeatured: true, image: '/images/service-spa.png' },
    { name: 'Trị mụn chuyên sâu', slug: 'tri-mun-chuyen-sau', description: 'Điều trị mụn hiệu quả, phục hồi da sạch khỏe', price: 450000, duration: 75, categorySlug: 'cham-soc-da', isFeatured: false, image: '/images/service-spa.png' },
    { name: 'Làm móng gel cao cấp', slug: 'lam-mong-gel', description: 'Thiết kế móng nghệ thuật với gel bền đẹp lên đến 3-4 tuần', price: 250000, duration: 90, categorySlug: 'lam-mong', isFeatured: true, image: '/images/service-nail.png' },
    { name: 'Sơn móng Ombre', slug: 'son-mong-ombre', description: 'Kỹ thuật sơn chuyển màu gradient thời thượng', price: 200000, duration: 60, categorySlug: 'lam-mong', isFeatured: false, image: '/images/service-nail.png' },
    { name: 'Nối mi Classic', slug: 'noi-mi-classic', description: 'Nối mi 1:1 tự nhiên, nhẹ nhàng, bền đẹp 3-4 tuần', price: 300000, duration: 75, categorySlug: 'noi-mi', isFeatured: true, image: '/images/service-eyelash.png' },
    { name: 'Nối mi Volume', slug: 'noi-mi-volume', description: 'Nối mi bung dày, quyến rũ cho đôi mắt cuốn hút', price: 450000, duration: 90, categorySlug: 'noi-mi', isFeatured: false, image: '/images/service-eyelash.png' },
    { name: 'Massage body thư giãn', slug: 'massage-body', description: 'Massage toàn thân kết hợp tinh dầu, giảm stress hiệu quả', price: 400000, duration: 90, categorySlug: 'massage', isFeatured: true, image: '/images/service-massage.png' },
    { name: 'Massage đá nóng', slug: 'massage-da-nong', description: 'Liệu pháp đá nóng giúp thư giãn sâu, giảm đau nhức', price: 500000, duration: 90, categorySlug: 'massage', isFeatured: false, image: '/images/service-massage.png' },
    { name: 'Gội đầu dưỡng sinh', slug: 'goi-dau-duong-sinh', description: 'Gội đầu kết hợp massage đầu, vai, cổ thư giãn', price: 150000, duration: 45, categorySlug: 'goi-dau', isFeatured: true, image: '/images/service-massage.png' },
  ];

  for (const s of servicesData) {
    const cat = categories.find(c => c.slug === s.categorySlug)!;
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        name: s.name, slug: s.slug, description: s.description,
        price: s.price, duration: s.duration, categoryId: cat.id,
        isFeatured: s.isFeatured, image: s.image, sortOrder: 0,
      },
    });
  }
  console.log('✅ Services created');

  // Create work schedules (Mon-Sat, 9:00-19:00)
  for (const emp of employees) {
    for (let day = 1; day <= 6; day++) {
      await prisma.workSchedule.upsert({
        where: { employeeId_dayOfWeek: { employeeId: emp.id, dayOfWeek: day } },
        update: {},
        create: { employeeId: emp.id, dayOfWeek: day, startTime: '09:00', endTime: '19:00' },
      });
    }
  }
  console.log('✅ Work schedules created');

  // Create sample customer
  const custPassword = await bcrypt.hash('customer123', 10);
  await prisma.user.upsert({
    where: { email: 'khach@email.com' },
    update: {},
    create: {
      email: 'khach@email.com', phone: '0901234567', name: 'Nguyễn Thị Mai',
      password: custPassword, role: 'CUSTOMER',
      customer: { create: { totalVisits: 5, totalSpent: 1500000, memberLevel: 'SILVER' } },
    },
  });
  console.log('✅ Sample customer created');

  console.log('\n🎉 Seeding completed!');
  console.log('📧 Admin: admin@yuspabeauty.vn / admin123');
  console.log('📧 Staff: lan@yuspabeauty.vn / staff123');
  console.log('📧 Customer: khach@email.com / customer123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
