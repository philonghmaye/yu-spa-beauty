const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const p = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await p.user.upsert({
    where: { phone: '123456789' },
    update: { name: 'TRINH_SPA', role: 'ADMIN', password: hashedPassword },
    create: {
      name: 'TRINH_SPA',
      phone: '123456789',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Tài khoản ADMIN đã tạo/cập nhật:');
  console.log(`   Tên: ${user.name}`);
  console.log(`   SĐT: ${user.phone}`);
  console.log(`   Role: ${user.role}`);
}

main().catch(console.error).finally(() => p.$disconnect());
