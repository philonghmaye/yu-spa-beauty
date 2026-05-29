const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('123456', 10);
  const result = await prisma.user.updateMany({
    where: { email: 'admin@yuspabeauty.vn' },
    data: { email: 'admin@yuri.com', password: hash }
  });
  console.log('Updated:', result.count, 'user(s)');
  console.log('New email: admin@yuri.com');
  console.log('New password: 123456');
  await prisma.$disconnect();
}

main().catch(console.error);
