const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Delete any existing user with admin@yuri.com
  const existing = await prisma.user.findUnique({ where: { email: 'admin@yuri.com' } });
  if (existing) {
    // Delete related customer if exists
    const cust = await prisma.customer.findUnique({ where: { userId: existing.id } });
    if (cust) {
      // Delete appointments related to this customer
      await prisma.appointmentService.deleteMany({ where: { appointment: { customerId: cust.id } } });
      await prisma.appointment.deleteMany({ where: { customerId: cust.id } });
      await prisma.customer.delete({ where: { id: cust.id } });
      console.log('Deleted customer record and appointments');
    }
    await prisma.user.delete({ where: { id: existing.id } });
    console.log('Deleted old user: admin@yuri.com');
  }

  // Create fresh admin account (no customer record)
  const hash = await bcrypt.hash('123456', 10);
  const newAdmin = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@yuri.com',
      phone: null,
      password: hash,
      role: 'ADMIN',
      isActive: true,
    },
  });
  console.log('\n✅ Created new admin account:');
  console.log('   Name:', newAdmin.name);
  console.log('   Email: admin@yuri.com');
  console.log('   Password: 123456');

  // Verify no customer record
  const check = await prisma.customer.findUnique({ where: { userId: newAdmin.id } });
  console.log('   Has customer record:', check ? 'YES' : 'NO (clean admin)');

  await prisma.$disconnect();
}

main().catch(console.error);
