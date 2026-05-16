const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const users = await p.user.findMany({
    select: { id: true, name: true, phone: true, email: true, role: true },
  });
  console.table(users);
}

main().catch(console.error).finally(() => p.$disconnect());
